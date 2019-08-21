"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
/**
 * 小説家になろうAPIから小説情報を取り出してobjectとして返す
 * 取得できた情報から、一番初めの小説情報だけを返すことには注意
 *
 * @param  page  pappeteerのpageオブジェクト
 * @param  ncode 取得する小説のNコード
 * @return       Promiseに包まれた取得object
 */
const getNarouApiJson = async (page, ncode) => {
    const url = "https://api.syosetu.com/novelapi/api/?libtype=2&out=json&ncode=" + ncode;
    await page.goto(url);
    const json = await page.evaluate(() => JSON.parse(document.body.textContent || "{}"));
    return json[1];
};
/**
 * 小説各話ページを取得して、その本文をobjectとして返す
 * @param  page pappeteerのpageオブジェクト
 * @param  url  接続するurl
 * @return      小説一話分の情報
 */
const scrapePage = async (page, url) => {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const novelEp = await page.evaluate(() => {
        const novelEp = {};
        const novelSubTitle = document.querySelector(".novel_subtitle");
        if (novelSubTitle) {
            novelEp.subtitle = novelSubTitle.textContent || "";
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
        return novelEp;
    });
    return novelEp;
};
/**
 * Nコードと取得エピソード数から、小説家になろうに投稿された小説の内容を取得する
 * @param page         puppeteerのPageオブジェクト
 * @param ncode        取得する小説のNコード
 * @param beginEpisode 取得し始めるエピソード番号
 * @param endEpisode   最後に取得するエピソード番号（未指定ならばbeginEpisodeだけ取得）
 * @return             取得した小説情報のオブジェクト
 */
const scrapeNovel = async (page, nApiJson, beginEpisode, endEpisode) => {
    const ncode = nApiJson.ncode.toLowerCase();
    const maxEpisode = nApiJson.general_all_no;
    if (beginEpisode > maxEpisode) {
        [beginEpisode, endEpisode] = [maxEpisode, maxEpisode];
    }
    else if (endEpisode === void 0 || beginEpisode > endEpisode) {
        endEpisode = beginEpisode;
    }
    else if (endEpisode > maxEpisode) {
        endEpisode = maxEpisode;
    }
    const data = [];
    for (let i = beginEpisode; i <= endEpisode; i++) {
        const url = `https://ncode.syosetu.com/${ncode}/${i}/`;
        data.push(await scrapePage(page, url));
        // なろうのサーバーへの思いやりウェイトを取る
        await utils_1.sleep(1000);
    }
    return {
        ncode,
        data,
        episodes: utils_1.range(beginEpisode, endEpisode),
    };
};
/**
 * キャッシュファイルを読み取る関数
 * 読み取れた場合はその旨を標準出力に出して、ファイルが存在しなかった場合もそれを出力する
 * @param  path   キャッシュファイルの場所
 * @return        読み取ったstring
 */
const readCache = (path) => {
    let result = "";
    try {
        result = fs_1.default.readFileSync(path, "utf8");
        utils_1.print_log(`キャッシュファイル取得 ${path}`);
    }
    catch (e) {
        if (e.code === "ENOENT") {
            utils_1.print_log("新規読み込み");
        }
        else {
            throw e;
        }
    }
    return result;
};
exports.run = async (ncode, beginEp, endEp) => {
    const page = await utils_1.initPage();
    const nApiJson = await getNarouApiJson(page, ncode);
    // TODO: キャッシュ処理をまた後で作る
    // const cachePath = `${ncode}.json`;
    // const cacheNData = readCache(cachePath);
    // console.log(`ncode: ${ncode}, beginEp: ${beginEp}, endEp: ${endEp}`);
    // console.log(cacheNData);
    const nData = await scrapeNovel(page, nApiJson, beginEp, endEp);
    // TODO: ここもキャッシュ処理用の部分
    // fs.writeFileSync(cachePath, JSON.stringify(nData, null, 1));
    await utils_1.closePage(page);
    return nData;
};
//# sourceMappingURL=index.js.map