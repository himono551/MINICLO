# MiniClo / Monodata

持ち物管理と買い物判断をまとめて行う、フロントエンド中心のプロトタイプです。  
在庫、ウィッシュリスト、月予算、行動ログを1つの画面で扱えます。

## 主な機能

- ダッシュボード表示（予算、支出、計画支出、件数サマリ）
- カテゴリ管理（追加・編集・削除、上限/理想/順序の設定）
- 在庫管理
- `すべて / 衣服 / コスメ / ガジェット / 未分類` のスコープ切替
- テーブル表示とギャラリー表示の切替
- 表示項目カスタマイズ（表示/非表示、順序変更、独自項目追加）
- 在庫の追加・編集（画像URL/画像ファイル対応）
- ウィッシュリスト管理と簡易判定（予算/容量/重複）
- 行動ログ表示
- Apps Script経由のスプレッドシート同期（取得/保存）
- Chrome拡張からの手動キャプチャ保存（`manualCaptures` / `inventoryItems`）

## データ保存

- 通常操作は `localStorage` に保存します（キー: `miniclo_state_v1`）。
- `シートへ保存` 実行時は Apps Script に `save` リクエストを送り、以下5シートへ保存します。
- `categories`
- `inventoryItems`
- `wishlistItems`
- `budgetMonths`
- `behaviorEvents`

補足:
- シート保存は追記ではなく、各シートの2行目以降をクリアして全件書き戻す方式です。
- Apps Script URL未設定時はローカル保存のみです。

## ローカル起動

`index.html` を直接開くのではなく、ローカルサーバー経由で起動してください。

```bash
cd /Users/user/Documents/2026年/★personalworks/code/monodata
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/index.html` を開きます。

## スプレッドシート連携（Apps Script）

Apps Scriptの設定手順は以下を参照してください。

- `apps-script/README.md`

## Chrome拡張（任意）

- 拡張コード: `chrome-extension/sheets-capture`
- 使い方: `chrome-extension/sheets-capture/README.md`
- アイコン押下で独立ウィンドウを開く仕様のため、タブ移動しても入力内容は保持されます。

## OCRベータ（任意）

- ベータ版: `beta-ocr`
- 使い方: `beta-ocr/README.md`
- 本体から切り離した実験用OCR画面です（本体データとは独立）。

## GitHub公開の最小手順

```bash
cd /Users/user/Documents/2026年/★personalworks/code/monodata
git init
git add .
git commit -m "chore: prepare project for public release"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## ディレクトリ構成

- `index.html`: 画面レイアウト
- `styles.css`: スタイル定義
- `app.js`: 状態管理、描画、イベント処理、同期処理
- `beta-ocr/`: OCR取り込みのベータ機能（独立ミニアプリ）
- `apps-script/app-sync/Code.gs`: アプリ同期用スクリプト
- `apps-script/capture/Code.gs`: 拡張機能・iOSショートカット捕捉用スクリプト
- `apps-script/README.md`: Apps Scriptデプロイ手順
- `chrome-extension/sheets-capture`: 商品ページ情報を手動保存するChrome拡張
- `assets/csv/`: 初期検証用CSVデータ

## アイコン素材について

- 本プロジェクトではアイコン素材として [Icons8](https://icons8.com/) を使用しています。
- PNG素材を利用する場合は、ライセンス条件（クレジット表記の要否を含む）を Icons8 側の最新規約に従ってください。
