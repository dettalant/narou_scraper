"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
    const url = "https://api.syosetu.com/novelapi/api/?libtype=2&out=json&of=ga&ncode=" + ncode;
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
 * @param page       puppeteerのPageオブジェクト
 * @param ncode      取得する小説のNコード
 * @param episodes   取得する小説話数が格納された配列
 * @param cacheNdata 過去に取得した小説情報のキャッシュオブジェクト
 * @return           取得した小説情報のオブジェクト
 */
const scrapeNovel = async (page, ncode, episodes, cacheNData) => {
    const result = (cacheNData) ? cacheNData : {
        ncode: ncode,
        data: [],
        episodes: []
    };
    const endEp = episodes[episodes.length - 1];
    // 小説取得処理
    for (let i of episodes) {
        utils_1.print_log(`${i}部分取得開始 ${i}/${endEp}`);
        const url = `https://ncode.syosetu.com/${ncode}/${i}/`;
        result.data.push(await scrapePage(page, url));
        // なろうのサーバーへの思いやりウェイトを取る
        const sleepMs = utils_1.roughlyNum(1000);
        await utils_1.sleep(sleepMs);
    }
    // つつがなく小説取得が終了したなら、
    // 取得エピソードをresult.episodesへと結合
    Array.prototype.push.apply(result.episodes, episodes);
    // 追加した値のソート
    result.episodes.sort();
    result.data.sort((a, b) => {
        return a.episode - b.episode;
    });
    return result;
};
/**
 * キャッシュファイルを読み取る関数
 * 読み取れた場合はその旨を標準出力に出して、ファイルが存在しなかった場合もそれを出力する
 * @param  path   キャッシュファイルの場所
 * @return        読み取ったstring
 */
const readCache = (path) => {
    let result;
    try {
        const str = fs_1.default.readFileSync(path, "utf8");
        result = JSON.parse(str);
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
exports.run = async (ncode, initArgs) => {
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
    };
    const page = await utils_1.initPage();
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
        const home = process.env.HOME || path_1.default.resolve("");
        cacheObj.dirPath = path_1.default.join(home, ".cache", "narou_scraper", ncode.toLowerCase());
        cacheObj.filePath = path_1.default.join(cacheObj.dirPath, "novel_cache.json");
        utils_1.print_log("キャッシュ使用設定を有効化");
    }
    else if (args.isForce) {
        utils_1.print_log("起動引数設定値に基づき、キャッシュ使用設定を無効化");
    }
    else {
        utils_1.print_log("linux以外のOSでは小説キャッシュ機能は使用されません");
    }
    // キャッシュの取得を試みる
    let cacheNData;
    if (cacheObj.filePath !== "") {
        cacheNData = readCache(cacheObj.filePath);
    }
    // 取得エピソード番号を改めて設定
    const episodes = utils_1.genRetrieveEpisodes(args, maxEpisode, cacheNData);
    const nData = await scrapeNovel(page, ncode, episodes, cacheNData);
    // キャッシュファイルを保存する
    if (cacheObj.dirPath !== "" && cacheObj.filePath !== "") {
        // 保存フォルダにアクセスして、
        // 当該フォルダが無ければ再帰的にフォルダ作成する
        try {
            fs_1.default.accessSync(cacheObj.dirPath, fs_1.default.constants.R_OK | fs_1.default.constants.W_OK);
        }
        catch (_) {
            utils_1.mkdirSyncAll(cacheObj.dirPath);
        }
        fs_1.default.writeFileSync(cacheObj.filePath, JSON.stringify(nData, null, 1));
    }
    await utils_1.closePage(page);
    return nData;
};
//# sourceMappingURL=index.js.map