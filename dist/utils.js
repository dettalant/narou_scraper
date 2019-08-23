"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
// 入力したミリセコンド秒数分ウェイトを取る
exports.sleep = (ms) => new Promise((res) => setTimeout(res, ms));
// 同じ時間のウェイトだとボット臭すぎるので若干揺れ幅をつける関数
exports.roughlyNum = (num) => num + num * Math.random();
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
/**
 * 取得するエピソードを小説最大数などに応じて調整し、その範囲が格納された配列を返す
 * @param  args       run()関数の起動引数オブジェクト
 * @param  maxEpisode 小説の取得可能最大話数
 * @param  cacheNData 取得小説キャッシュデータ。これの中に存在する話は取得しない
 * @return            取得する小説話数が含まれた配列
 */
exports.genRetrieveEpisodes = (args, maxEpisode, cacheNData) => {
    let beginEp = args.beginEp;
    let endEp = (beginEp < args.endEp) ? args.endEp : beginEp;
    if (args.isAll) {
        // 全エピソードを読み込む場合
        beginEp = 1;
        endEp = maxEpisode;
    }
    else if (beginEp > maxEpisode) {
        // beginEpが最大値より大きい場合は最新エピソードのみ読み込む
        [beginEp, endEp] = [maxEpisode, maxEpisode];
    }
    else if (endEp > maxEpisode) {
        // endEpが最大数より多いならば最大数に合わせる
        endEp = maxEpisode;
    }
    const result = (cacheNData)
        ? exports.range(beginEp, endEp).filter(ep => !cacheNData.episodes.includes(ep))
        : exports.range(beginEp, endEp);
    return result;
};
/**
 * 再帰的にmkdirSyncを行う
 * 要するに`mkdir -p`コマンドと同じ。
 * @param  fullPath  再帰的に作るフォルダーpath
 */
exports.mkdirSyncAll = (fullPath) => {
    const mkdir = (path) => {
        try {
            fs_1.default.accessSync(path);
            // 読み取り成功したので処理スキップ
        }
        catch (_) {
            // 読み取り失敗 == 当該フォルダなし
            // そのフォルダを作成する
            fs_1.default.mkdirSync(path);
        }
    };
    let p = "/";
    for (let pathStr of fullPath.split("/")) {
        if (pathStr === "")
            continue;
        p += pathStr + "/";
        mkdir(p);
    }
};
//# sourceMappingURL=utils.js.map