/**
 * 小説各話の情報を詰め込むオブジェクト
 */
export interface NovelEpisodeData {
  // そのエピソードのサブタイトル
  subtitle: string;
  // そのエピソードの本文を一行ごとに切り分けた配列
  content: string[];
  // そのエピソードの通し番号
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
// export interface NarouApiNovelData {
//   title: string;
//   ncode: string;
//   userid: number;
//   story: string;
//   biggenre: number;
//   gensaku: string;
//   keyword: string;
//   general_firstup: string;
//   general_lastup: string;
//   general_all_no: number;
//   novel_type: number;
//   end: number;
//   length: number;
//   time: number;
//   isstop: boolean;
//   isr15: boolean;
//   isbl: boolean;
//   isgl: boolean;
//   iszankoku: boolean;
//   istensei: boolean;
//   istenni: boolean;
//   pc_or_k: number;
//   global_point: number;
//   fav_novel_cnt: number;
//   review_cnt: number;
//   all_point: number;
//   all_hyoka_cnt: number;
//   sasie_cnt: number;
//   kaiwaritu: number;
//   novelupdated_at: string;
//   updated_at: string;
// }

/**
 * なろうAPIが返す小説個々のデータから
 * 全話数だけ抽出したもの
 */
export interface NarouApiNovelAllEpisodesData {
  general_all_no: number;
}

// narou_scraper.run()関数が要求する起動引数
export interface InitArgs {
  // 小説の管理コード
  // これはCUI側処理の都合上含めてるだけなので無くてもよしとする
  ncode?: string;
  // 開始エピソード番号
  beginEp: number;
  // 終了エピソード番号
  endEp: number;
  // キャッシュを無視する設定値
  isForce: boolean;
  // 小説の全話数を読み取る設定値
  isAll: boolean;
}
