import puppeteer from "puppeteer";
import {
  initPage,
  closePage,
  sleep,
} from "./utils";
import {
  NovelData,
  NovelEpisodeData,
  NarouApiNovelData
} from "./interfaces";

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
const scrapeNovel = async (page: puppeteer.Page, nApiJson: NarouApiNovelData, beginEpisode: number, endEpisode?: number): Promise<NovelData> => {
  const ncode = nApiJson.ncode.toLowerCase();
  const maxEpisode = nApiJson.general_all_no;

  if (beginEpisode > maxEpisode) {
    [beginEpisode, endEpisode] = [maxEpisode, maxEpisode];
  } else if (endEpisode === void 0 || beginEpisode > endEpisode) {
    endEpisode = beginEpisode;
  } else if (endEpisode > maxEpisode) {
    endEpisode = maxEpisode;
  }

  const data: NovelEpisodeData[] = [];
  for (let i = beginEpisode; i <= endEpisode; i++) {
    const url = `https://ncode.syosetu.com/${ncode}/${i}/`;
    data.push(await scrapePage(page, url));

    // なろうのサーバーへの思いやりウェイトを取る
    await sleep(1000);
  }

  return {
    ncode,
    beginEpisode,
    endEpisode,
    data
  }
}

(async () => {
  const page = await initPage();
  const ncode = "n8061es"
  const nApiJson = await getNarouApiJson(page, ncode);
  const nData = await scrapeNovel(page, nApiJson, 190, 192);

  // TODO: ここでnDataを用いた処理を行う

  await closePage(page);
})();
