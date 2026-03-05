# Apps Script連携手順（2プロジェクト分離）

同じスプレッドシートに対して、Apps Scriptを2つに分けてデプロイします。

- `apps-script/app-sync/Code.gs`: アプリ同期用（`load/save/addItems`）
- `apps-script/capture/Code.gs`: 拡張機能 / iOSショートカット用（`appendManualItem` 専用）

## 1. app-sync プロジェクトを作成
1. 対象スプレッドシートを開く
2. `拡張機能 > Apps Script`
3. `apps-script/app-sync/Code.gs` を貼り付けて保存
4. `デプロイ > 新しいデプロイ > ウェブアプリ`
5. 実行ユーザー: `自分` / アクセス: `全員`
6. デプロイしてURLを控える（`APP_SYNC_URL`）

## 2. capture プロジェクトを作成
1. Apps Scriptを新規プロジェクトで作成（同じスプレッドシートに紐づける）
2. `apps-script/capture/Code.gs` を貼り付けて保存
3. `デプロイ > 新しいデプロイ > ウェブアプリ`
4. 実行ユーザー: `自分` / アクセス: `全員`
5. デプロイしてURLを控える（`CAPTURE_URL`）

## 3. URLの使い分け
- MiniCloアプリ本体の `Apps Script URL`: `APP_SYNC_URL`
- Chrome拡張 / iOSショートカット: `CAPTURE_URL`

## API仕様

### app-sync (`APP_SYNC_URL`)
- GET `?action=load`
- GET `?action=debug`
- POST `{ action: "save", data: {...} }`
- POST `{ action: "addItems", ... }`

`appendManualItem` は受け付けません。

### capture (`CAPTURE_URL`)
- GET `?action=debug`
- POST `{ action: "appendManualItem", name, brand, url, ... }`
- POST `{ action: "save", name, brand, url, ... }`（ショートカット互換）

`load` / 全体 `save(data)` / `addItems` は受け付けません。

## `manualCaptures` シート列
`appendManualItem` 実行時に、以下ヘッダーの `manualCaptures` シートを自動作成し1行追加します。

`created_at, source, site, url, image_url, name, brand, type, category, category2, color, purchase_date, price, memo, raw_text`

## 注意
- 共有設定や組織ポリシーで CORS が制限される場合があります。
- その場合は Webアプリのアクセス権を再確認してください。

## 既存シート列への対応
以下ヘッダーのシートが存在する場合、MiniClo標準シートが空でも自動で読み込み変換します。

`id, Product Name, Brand, status, fav, Color, category, category2, Season, remaining, Purchase date, price, Capacity, url, product_image`

また、旧ヘッダーのタイポ版 (`barand`) も互換読み込み/書き戻しに対応しています。

- `status` が `wish/approved/hold/dropped/bought` の行は Wishlist として取り込み
- それ以外は Inventory として取り込み
- `category` からカテゴリを自動生成
- `Purchase date` + `price` がある行は purchase event として取り込み

保存時は MiniClo標準5シートに加えて、上記ヘッダーシートがあればそちらにも投影します。
