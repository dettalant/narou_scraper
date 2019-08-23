import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import {
  initPage,
  closePage,
  sleep,
  print_log,
  roughlyNum,
  genRetrieveEpisodes,
  mkdirSyncAll,
} from "./utils";
import {
  NovelData,
  NovelEpisodeData,
  NarouApiNovelAllEpisodesData,
  InitArgs,
} from "./interfaces";

// ライブラリとして利用する側のために
// interfaceをまとめてexportしておく
export * from "./interfaces";

/**
 * 小説家になろうAPIから小説情報を取り出してobjectとして返す
 * 取得できた情報から、一番初めの小説情報だけを返すことには注意
 *
 * @param  page  pappeteerのpageオブジェクト
 * @param  ncode 取得する小説のNコード
 * @return       Promiseに包まれた取得object
 */
const getNarouApiJson = async (page: puppeteer.Page, ncode: string): Promise<NarouApiNovelAllEpisodesData> => {
  const url = "https://api.syosetu.com/novelapi/api/?libtype=2&out=json&of=ga&ncode=" + ncode;
  await page.goto(url);
  const json = await page.evaluate(() => JSON.parse(document.body.textContent || "{}"));
  return json[1];
}

/**
 * 小説各話ページを取得して、その本文をobjectとして返す
 * @param  page pappeteerのpageオブジェクト
 * @param  url  接続するurl
 * @return      小説一話分の情報
 */
const scrapePage = async (page: puppeteer.Page, url: string): Promise<NovelEpisodeData> => {
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const novelEp = await page.evaluate(() => {
    const novelEp = {} as NovelEpisodeData;

    const novelSubTitle = document.querySelector(".novel_subtitle")
    if (novelSubTitle) {
      novelEp.subtitle = novelSubTitle.textContent || ""
    }

    const novelBody = document.querySelector("#novel_honbun");
    if (novelBody) {
      const pEls = novelBody.getElementsByTagName("p");
      const content = [];
      for (let p of pEls) {
        content.push(p.textContent || "");
      }

      novelEp.content = content;
    }

    const urlPathArray = location.pathname.match(/[\/].+[\/](\d+)[\/]/) || [];

    // エピソード番号を指定
    const episodeStr = urlPathArray[1];
    if (episodeStr !== void 0) {
      const episode = parseInt(episodeStr, 10);
      novelEp.episode = (episode !== NaN) ? episode : 0;
    }

    return novelEp
  });

  return novelEp;
}

/**
 * Nコードと取得エピソード数から、小説家になろうに投稿された小説の内容を取得する
 * @param page       puppeteerのPageオブジェクト
 * @param ncode      取得する小説のNコード
 * @param episodes   取得する小説話数が格納された配列
 * @param cacheNdata 過去に取得した小説情報のキャッシュオブジェクト
 * @return           取得した小説情報のオブジェクト
 */
const scrapeNovel = async (page: puppeteer.Page, ncode: string, episodes: number[], cacheNData?: NovelData): Promise<NovelData> => {
  const result = (cacheNData) ? cacheNData : {
    ncode: ncode,
    data: [],
    episodes: []
  };

  // 小説取得処理
  let cnt = 1;
  const episodesLen = episodes.length;
  for (let i of episodes) {
    print_log(`${i}部分取得開始 ${cnt++}/${episodesLen}`)
    const url = `https://ncode.syosetu.com/${ncode}/${i}/`;
    result.data.push(await scrapePage(page, url));

    // なろうのサーバーへの思いやりウェイトを取る
    const sleepMs = roughlyNum(1000);
    await sleep(sleepMs);
  }

  // つつがなく小説取得が終了したなら、
  // 取得エピソードをresult.episodesへと結合
  Array.prototype.push.apply(result.episodes, episodes);

  // 追加した値のソート
  result.episodes.sort();
  result.data.sort((a, b) => {
    return a.episode - b.episode;
  })

  return result;
}

/**
 * キャッシュファイルを読み取る関数
 * 読み取れた場合はその旨を標準出力に出して、ファイルが存在しなかった場合もそれを出力する
 * @param  path   キャッシュファイルの場所
 * @return        読み取ったstring
 */
const readCache = (path: string): NovelData | undefined => {
  let result;

  try {
    const str = fs.readFileSync(path, "utf8");
    result = JSON.parse(str) as NovelData;
    print_log(`キャッシュファイル取得 ${path}`);
  } catch (e) {
    if (e.code === "ENOENT") {
      print_log("新規読み込み");
    } else {
      throw e;
    }
  }

  return result;
}

/**
 * 外部から呼び出すnarou_scraper起動関数。
 * @param  ncode    取得する小説の管理コード
 * @param  initArgs 起動引数を詰め込んだ設定オブジェクト
 * @return          取得した小説データを返す
 */
export const run = async (ncode: string, initArgs?: InitArgs): Promise<NovelData> => {
  // initArgsの存在確認と初期値設定
  const args = (initArgs) ? initArgs : {
    ncode: ncode,
    // 開始エピソード番号
    beginEp: 1,
    // 終了エピソード番号
    endEp: 1,
    // キャッシュを無視する設定値
    isForce: false,
    // 小説の全話数を読み取る設定値
    isAll: false,
  }

  const page = await initPage();
  const nApiJson = await getNarouApiJson(page, ncode);
  const maxEpisode = nApiJson.general_all_no;

  // キャッシュファイルなどのpathを入れるobject
  const cacheObj = {
    dirPath: "",
    filePath: "",
  };

  // NOTE: windowsなどのフォルダー構造わからんちんなので
  //       linux以外ではキャッシュ処理を動かさない
  if (!args.isForce && process.platform === "linux") {
    // おそらくこれで$HOMEが取れると思われるけれど、
    // もしなんらかの事情で$HOMEが取れなければカレントディレクトリを用いる
    const home = process.env.HOME || path.resolve("");
    cacheObj.dirPath = path.join(home, ".cache", "narou_scraper", ncode.toLowerCase());
    cacheObj.filePath = path.join(cacheObj.dirPath, "novel_cache.json");

    print_log("キャッシュ使用設定を有効化");
  } else if (args.isForce) {
    print_log("起動引数設定値に基づき、キャッシュ使用設定を無効化")
  } else {
    print_log("linux以外のOSでは小説キャッシュ機能は使用されません");
  }

  // キャッシュの取得を試みる
  let cacheNData;
  if (cacheObj.filePath !== "") {
    cacheNData = readCache(cacheObj.filePath);
  }

  // 取得エピソード番号を改めて設定
  const episodes = genRetrieveEpisodes(args, maxEpisode, cacheNData);
  console.log(episodes);
  const nData = await scrapeNovel(page, ncode, episodes, cacheNData);

  // キャッシュファイルを保存する
  if (cacheObj.dirPath !== "" && cacheObj.filePath !== "") {
    // 保存フォルダにアクセスして、
    // 当該フォルダが無ければ再帰的にフォルダ作成する
    try {
      fs.accessSync(cacheObj.dirPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (_) {
      mkdirSyncAll(cacheObj.dirPath);
    }

    fs.writeFileSync(cacheObj.filePath, JSON.stringify(nData, null, 1));
  }

  await closePage(page);
  return nData
}
