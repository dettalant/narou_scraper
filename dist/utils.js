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
//# sourceMappingURL=utils.js.map