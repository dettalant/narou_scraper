import puppeteer from "puppeteer";
export declare const sleep: (ms: number) => Promise<Function>;
/**
 * Page objectの初期化処理
 * @return promiseで包まれたPage object
 */
export declare const initPage: () => Promise<puppeteer.Page>;
/**
 * スクリプト終了処理
 * @param  page 開いているページ
 */
export declare const closePage: (page: puppeteer.Page) => Promise<void>;
