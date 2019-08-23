/**
 * 小説各話の情報を詰め込むオブジェクト
 */
export interface NovelEpisodeData {
    subtitle: string;
    content: string[];
    episode: number;
}
/**
 * 取得した小説情報を配列として詰め込むオブジェクト
 */
export interface NovelData {
    ncode: string;
    episodes: number[];
    data: NovelEpisodeData[];
}
/**
 * なろうAPIが返す小説個々のデータ
 * NOTE: 現在は使用していないのでコメントアウト
 */
/**
 * なろうAPIが返す小説個々のデータから
 * 全話数だけ抽出したもの
 */
export interface NarouApiNovelAllEpisodesData {
    general_all_no: number;
}
export interface InitArgs {
    ncode?: string;
    beginEp: number;
    endEp: number;
    isForce: boolean;
    isAll: boolean;
}
