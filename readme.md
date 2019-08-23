narou_scraper.js
================

小説家になろうから任意の小説をスクレイピングして、本文データが詰まったオブジェクトを返すライブラリです。

主に自分で使うためのライブラリなので、npmには上げてません。

gitリポジトリを取り込む機能がnpmやyarnには存在するので、それを使うこと前提です。

動作必須環境
* node
* puppeteer

## 使用方法

```javascript
const narouScraper = require("narou_scraper");

(async () => {
  const ncode = "n7682fj";
  const initArgs = {
    // ncodeは省略しても良い
    ncode: ncode,
    // 開始エピソード番号
    beginEp: 1,
    // 終了エピソード番号
    endEp: 3,
    // キャッシュを無視する設定値
    isForce: false,
    // 小説の全話数を読み取る設定値
    isAll: false,
  }
  const nData = await narouScraper.run(ncode, initArgs);
  
  console.log(nData);
  // 標準出力へと1話から3話までの小説データが出されるはず
})()
```

## オブジェクトもろもろ

**NovelData**が`run()`関数の返り値となるオブジェクトで、その小説シリーズをまとめる役割を持っています。

|値|意味合い|
|---|---|
|`ncode`|小説家になろうでの小説管理コード|
|`episodes`|取得した話数の|
|`data`|小説各話情報(`NovelEpisodeData`)が入った配列|

**NovelEpisodeData**は小説各話の本文やらを格納するオブジェクトです。

|値|意味合い|
|---|---|
|`subtitle`|その話のタイトル|
|`episode`|その話の通し番号|
|`content`|その話の本文テキストが詰まった配列|

## License

MIT Licenseを採用しています。
