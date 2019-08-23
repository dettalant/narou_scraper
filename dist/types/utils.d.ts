import puppeteer from "puppeteer";
import { InitArgs, NovelData } from "./interfaces";
export declare const sleep: (ms: number) => Promise<Function>;
export declare const roughlyNum: (num: number) => number;
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
/**
 * 共通のログヘッダーをつけて標準出力にログを吐く
 * @param  str 出力する文字列
 */
export declare const print_log: (str: string) => void;
/**
 * 引数に取った二つの数字から連番配列を生成する
 * 10, 15と数字を入れると[10, 11, 12, 13, 14, 15]を返す
 *
 * @param  begin 連番の始まりとなる数字
 * @param  end   連番の終わりとなる数字
 * @return       連番が入った配列
 */
export declare const range: (begin: number, end: number) => number[];
/**
 * 取得するエピソードを小説最大数などに応じて調整し、その範囲が格納された配列を返す
 * @param  args       run()関数の起動引数オブジェクト
 * @param  maxEpisode 小説の取得可能最大話数
 * @param  cacheNData 取得小説キャッシュデータ。これの中に存在する話は取得しない
 * @return            取得する小説話数が含まれた配列
 */
export declare const genRetrieveEpisodes: (args: InitArgs, maxEpisode: number, cacheNData?: NovelData | undefined) => number[];
/**
 * 再帰的にmkdirSyncを行う
 * 要するに`mkdir -p`コマンドと同じ。
 * @param  fullPath  再帰的に作るフォルダーpath
 */
export declare const mkdirSyncAll: (fullPath: string) => void;
