import fs from "fs";
import puppeteer from "puppeteer";
import {
  initPage,
  closePage,
  sleep,
  print_log,
  range,
} from "./utils";
import {
  NovelData,
  NovelEpisodeData,
  NarouApiNovelData,
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
const getNarouApiJson = async (page: puppeteer.Page, ncode: string): Promise<NarouApiNovelData> => {
  const url = "https://api.syosetu.com/novelapi/api/?libtype=2&out=json&ncode=" + ncode;
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
 * @param page         puppeteerのPageオブジェクト
 * @param ncode        取得する小説のNコード
 * @param beginEpisode 取得し始めるエピソード番号
 * @param endEpisode   最後に取得するエピソード番号（未指定ならばbeginEpisodeだけ取得）
 * @return             取得した小説情報のオブジェクト
 */
const scrapeNovel = async (page: puppeteer.Page, ncode: string, beginEpisode: number, endEpisode?: number): Promise<NovelData> => {
  if (endEpisode === void 0 || beginEpisode > endEpisode) {
    endEpisode = beginEpisode;
  }

  const data: NovelEpisodeData[] = [];
  for (let i = beginEpisode; i <= endEpisode; i++) {
    print_log(`${i}部分取得開始 ${i}/${endEpisode}`)
    const url = `https://ncode.syosetu.com/${ncode}/${i}/`;
    data.push(await scrapePage(page, url));

    // なろうのサーバーへの思いやりウェイトを取る
    await sleep(1000);
  }

  return {
    ncode,
    data,
    episodes: range(beginEpisode, endEpisode),
  }
}

/**
 * キャッシュファイルを読み取る関数
 * 読み取れた場合はその旨を標準出力に出して、ファイルが存在しなかった場合もそれを出力する
 * @param  path   キャッシュファイルの場所
 * @return        読み取ったstring
 */
const readCache = (path: string): string => {
  let result = "";

  try {
    result = fs.readFileSync(path, "utf8");
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
  if (args.isAll) {
    // 全エピソードを読み込む場合
    args.beginEp = 1;
    args.endEp = maxEpisode;
  } else if (args.beginEp > maxEpisode) {
    // beginEpが最大値より大きい場合は最新エピソードのみ読み込む
    [args.beginEp, args.endEp] = [maxEpisode, maxEpisode];
  } else if (args.endEp > maxEpisode) {
    // endEpが最大数より多いならば最大数に合わせる
    args.endEp = maxEpisode;
  }

  // TODO: キャッシュ処理をまた後で作る
  // const cachePath = `${ncode}.json`;
  // const cacheNData = readCache(cachePath);
  // console.log(`ncode: ${ncode}, beginEp: ${beginEp}, endEp: ${endEp}`);
  // console.log(cacheNData);

  const nData = await scrapeNovel(page, ncode, args.beginEp, args.endEp);

  // TODO: ここもキャッシュ処理用の部分
  // fs.writeFileSync(cachePath, JSON.stringify(nData, null, 1));

  await closePage(page);
  return nData
}
