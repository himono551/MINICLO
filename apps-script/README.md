# Apps Script連携手順

## 1. スプレッドシートにスクリプトを追加
1. 対象スプレッドシートを開く
2. `拡張機能 > Apps Script`
3. `apps-script/Code.gs` の内容を貼り付けて保存

## 2. Webアプリとしてデプロイ
1. `デプロイ > 新しいデプロイ`
2. 種類: `ウェブアプリ`
3. 実行ユーザー: `自分`
4. アクセス: `全員`
5. デプロイして `.../exec` URL をコピー

## 3. MiniClo側で設定
1. 画面上部 `Apps Script URL` に `.../exec` を貼る
2. `シートへ保存` を押してアップロード
3. `シートから取得` で読み込み

## API仕様
- GET `?action=load`
  - レスポンス: `{ ok: true, data: { categories, inventoryItems, wishlistItems, budgetMonths, behaviorEvents } }`
- POST JSON
  - リクエスト: `{ action: "save", data: { ... } }`
  - レスポンス: `{ ok: true }`
- POST JSON (OCR一括追加)
  - リクエスト: `{ action: "addItems", source, order, items, image_url, raw_text }`
  - レスポンス: `{ ok: true, added: number }`
- POST JSON (手動拡張追加)
  - リクエスト:
    - `action`: `"appendManualItem"`
    - `name`: string (必須)
    - `brand`, `type`, `category`, `category2`, `color`, `purchase_date`, `price`, `url`, `image_url`, `site`, `memo`, `raw_text`: string/number
  - レスポンス: `{ ok: true, appended: 1 }`

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
