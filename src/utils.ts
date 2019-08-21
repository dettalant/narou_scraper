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

/**
 * 共通のログヘッダーをつけて標準出力にログを吐く
 * @param  str 出力する文字列
 */
export const print_log = (str: string) => {
  console.log(`NAROU SCRAPER: ${str}`);
}

/**
 * 引数に取った二つの数字から連番配列を生成する
 * 10, 15と数字を入れると[10, 11, 12, 13, 14, 15]を返す
 *
 * @param  begin 連番の始まりとなる数字
 * @param  end   連番の終わりとなる数字
 * @return       連番が入った配列
 */
export const range = (begin: number, end: number): number[] => {
  return [...Array(end - begin + 1)].map((_, i) => begin + i)
} 