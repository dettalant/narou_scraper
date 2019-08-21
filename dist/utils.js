"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
// 入力したミリセコンド秒数分ウェイトを取る
exports.sleep = (ms) => new Promise((res) => setTimeout(res, ms));
/**
 * Page objectの初期化処理
 * @return promiseで包まれたPage object
 */
exports.initPage = async () => {
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    page.on("console", msg => console.log("PAGE LOG:", msg.text()));
    return page;
};
/**
 * スクリプト終了処理
 * @param  page 開いているページ
 */
exports.closePage = async (page) => {
    page.browser().close();
};
/**
 * 共通のログヘッダーをつけて標準出力にログを吐く
 * @param  str 出力する文字列
 */
exports.print_log = (str) => {
    console.log(`NAROU SCRAPER: ${str}`);
};
/**
 * 引数に取った二つの数字から連番配列を生成する
 * 10, 15と数字を入れると[10, 11, 12, 13, 14, 15]を返す
 *
 * @param  begin 連番の始まりとなる数字
 * @param  end   連番の終わりとなる数字
 * @return       連番が入った配列
 */
exports.range = (begin, end) => {
    return [...Array(end - begin + 1)].map((_, i) => begin + i);
};
//# sourceMappingURL=utils.js.map