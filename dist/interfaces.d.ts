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
    beginEpisode: number;
    endEpisode: number;
    data: NovelEpisodeData[];
}
/**
 * なろうAPIが返す小説個々のデータ
 */
export interface NarouApiNovelData {
    title: string;
    ncode: string;
    userid: number;
    story: string;
    biggenre: number;
    gensaku: string;
    keyword: string;
    general_firstup: string;
    general_lastup: string;
    general_all_no: number;
    novel_type: number;
    end: number;
    length: number;
    time: number;
    isstop: boolean;
    isr15: boolean;
    isbl: boolean;
    isgl: boolean;
    iszankoku: boolean;
    istensei: boolean;
    istenni: boolean;
    pc_or_k: number;
    global_point: number;
    fav_novel_cnt: number;
    review_cnt: number;
    all_point: number;
    all_hyoka_cnt: number;
    sasie_cnt: number;
    kaiwaritu: number;
    novelupdated_at: string;
    updated_at: string;
}
