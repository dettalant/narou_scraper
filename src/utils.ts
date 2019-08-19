import puppeteer from "puppeteer";

// 入力したミリセコンド秒数分ウェイトを取る
export const sleep = (ms: number) => new Promise<Function>((res) => setTimeout(res, ms))

/**
 * Page objectの初期化処理
 * @return promiseで包まれたPage object
 */
export const initPage = async (): Promise<puppeteer.Page> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  return page;
}

/**
 * スクリプト終了処理
 * @param  page 開いているページ
 */
export const closePage = async (page: puppeteer.Page) => {
  page.browser().close();
}
