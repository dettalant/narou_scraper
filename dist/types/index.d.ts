import { NovelData, InitArgs } from "./interfaces";
export * from "./interfaces";
/**
 * 外部から呼び出すnarou_scraper起動関数。
 * @param  ncode    取得する小説の管理コード
 * @param  initArgs 起動引数を詰め込んだ設定オブジェクト
 * @return          取得した小説データを返す
 */
export declare const run: (ncode: string, initArgs?: InitArgs | undefined) => Promise<NovelData>;
