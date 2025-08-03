# Stock Quick Opener

Yahoo!ファイナンスの銘柄ページから証券コード・会社名を取得し、設定した複数の外部サイトをワンクリックで一括新規タブ表示できるChrome拡張（Manifest V3対応）。

## 主な特徴
- Yahoo!ファイナンス（日本語対応）の銘柄ページで動作
- ティッカー・会社名を自動抽出
- テンプレートで複数サイトを一括新規タブで開く
- テンプレートはオプション画面で編集・保存可能
- 初回インストール時に主要7サイトのテンプレートが自動登録

## ファイル構成

```
stock-quick-opener/
├─ manifest.json
├─ background.js
├─ content_script.js
├─ popup.html / popup.js
├─ options.html / options.js
├─ README.md
└─ .github/workflows/release.yml
```

## インストール方法
1. Releaseからzipをダウンロードし、SHA256で検証
2. zipを展開し、chrome://extensions で「パッケージ化されていない拡張機能を読み込む」から展開フォルダを指定

## 使い方
1. Yahoo!ファイナンスの銘柄ページ（例: https://finance.yahoo.co.jp/quote/6920.T）を開く
2. 拡張アイコンまたはポップアップの「開く」ボタンをクリック
3. 有効なテンプレート分だけ新規タブが一括で開く
4. テンプレート編集はオプション画面から可能


### テンプレート置換ルール

| プレースホルダ         | 内容・例                                  |
|------------------------|-------------------------------------------|
| {TICKER}               | Yahooページから抽出したティッカー（例: 6920.T, AAPL） |
| {TICKER_NUM}           | 4桁数字のみ（例: 6920）※日本株専用         |
| {TICKER_T}             | 必ず.T付き（例: 6920.T）                   |
| {NAME}                 | 会社名                                    |
| %code                  | {TICKER}と同じ                            |
| %name                  | {NAME}と同じ                              |

※ {TICKER_NUM}や{TICKER_T}は日本株4桁コード専用です。米国株（AAPL等）や他国株は現状未対応です。

---
### デフォルトテンプレート（初回登録時）

| サイト名           | テンプレートURL例                                                        |
|--------------------|--------------------------------------------------------------------------|
| 株探               | https://kabutan.jp/stock/?code={TICKER_NUM}                              |
| バフェット・コード  | https://www.buffett-code.com/company/{TICKER_NUM}/                       |
| IRバンク           | https://irbank.net/{TICKER_NUM}                                          |
| 株予報（レポート） | https://kabuyoho.jp/reportTop?bcode={TICKER_NUM}                         |
| 株予報（IFIS）     | https://kabuyoho.ifis.co.jp/index.php?action=tp1&sa=report_top&bcode={TICKER_NUM} |
| 空売りネット       | https://karauri.net/{TICKER_NUM}/                                        |
| TradingView        | https://jp.tradingview.com/chart/?symbol={TICKER_NUM}                    |

※ {TICKER_NUM} は4桁数字の証券コードに自動変換されます。

## 権限
- activeTab : ユーザーがクリックしたタブのみ一時的に操作
- storage   : テンプレート配列の保存・読み込み

## 開発・運用方針
- デフォルトテンプレートはoptions.jsで初回のみ登録
- バックエンド（background.js）はデフォルト値を一切持たず、chrome.storage.syncの値のみ参照
- コード・テンプレート構成は最小限・シンプルを維持
- 外部通信・トラッキング・不要なファイルは一切なし

## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。
