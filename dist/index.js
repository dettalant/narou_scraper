"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        // なろうのサーバーを思ったいたわりのウェイトを取る
        await utils_1.sleep(1000);
    }
    return {
        ncode,
        beginEpisode,
        endEpisode,
        data
    };
};
(async () => {
    const page = await utils_1.initPage();
    const ncode = "n8061es";
    const nApiJson = await getNarouApiJson(page, ncode);
    const nData = await scrapeNovel(page, nApiJson, 190, 192);
    console.log(nData);
    // const novelEp = await scrapePage(page, "https://ncode.syosetu.com/n8061es/192/");
    // await sleep(1000);
    // console.log(novelEp);
    await page.screenshot({ path: "example.png" });
    await utils_1.closePage(page);
})();
//# sourceMappingURL=index.js.map