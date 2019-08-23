import {
  initPage,
  range,
  sleep,
  roughlyNum,
  genRetrieveEpisodes,
  mkdirSyncAll,
} from "../utils";
import * as fs from "fs";
import * as path from "path";

describe("utils function test", () => {
  it("initPage test", async () => {
    const page = await initPage();
    expect(page.url()).toBe("about:blank");
  })

  it("sleep test", async () => {
    const beginDate = Date.now();
    await sleep(100);
    const endDate = Date.now();

    expect(endDate - beginDate > 99).toBeTruthy();
  })

  it("range test", () => {
    const result = range(7, 13);
    expect(result).toEqual([7, 8, 9, 10, 11, 12, 13]);
  })

  it("roughlyNum test", () => {
    const result = roughlyNum(1000);
    expect(result > 1000 && result < 2001).toBeTruthy();
  })

  it("genRetrieveEpisodes test", () => {
    const args = {
      ncode: "n7682fj",
      beginEp: 1,
      endEp: 11,
      isForce: false,
      isAll: false,
    };
    const ep0 = genRetrieveEpisodes(args, 7);
    expect(ep0).toEqual([1, 2, 3, 4, 5, 6, 7]);

    const ep1 = genRetrieveEpisodes(args, 12);
    expect(ep1).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])

    args.isAll = true;
    args.endEp = 3;
    const ep2 = genRetrieveEpisodes(args, 5);
    expect(ep2).toEqual([1, 2, 3, 4, 5]);
  })

  it("mkdirSyncAll test", () => {
    let isDirFound = false;
    const base = path.resolve("./.tmp");
    const p = path.join(base, "test/folder");
    const removeTestDir = (callback?: Function) => {
      try {
        fs.accessSync(p);
        // 存在すればそのフォルダーを消去
        // すごくアレな処理だけどこれで十分でしょ
        fs.rmdirSync(p);
        fs.rmdirSync(path.join(base, "test"));
        fs.rmdirSync(base);
      } catch (_) {
        // do nothing
        // エラーを握りつぶす
      } finally {
        if (callback) {
          callback();
        }
      }
    }

    removeTestDir(() => mkdirSyncAll(p));

    try {
      // もう一度ファイル確認を行う
      fs.accessSync(p, fs.constants.R_OK | fs.constants.W_OK);
      isDirFound = true;
    } catch (_) {
      // ファイル確認に失敗すればboolを改めて否定上書き
      isDirFound = false
    }

    // 後始末
    removeTestDir();

    expect(isDirFound).toBeTruthy();

  })
})
