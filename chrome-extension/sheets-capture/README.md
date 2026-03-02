# Monodata Sheet Capture Extension

現在のEC商品ページから情報を抽出し、Apps Script経由でGoogleスプレッドシートの `manualCaptures` シートへ1行追加する Chrome 拡張です。

## 保存項目

- `created_at`
- `source` (`manual_extension` 固定)
- `site`
- `url`
- `image_url`
- `name`
- `brand`
- `type`
- `category`
- `category2`
- `color`
- `purchase_date`
- `price`
- `memo`
- `raw_text`

## 使い方

1. `chrome://extensions` を開く
2. 右上の `デベロッパーモード` を ON
3. `パッケージ化されていない拡張機能を読み込む` でこのフォルダを選択
4. 拡張アイコンをクリックしてキャプチャウィンドウを開き、`Apps Script URL` を入力
5. `現在ページから抽出` で内容を確認・編集
6. `Save to Sheet` で追加

## 補足

- この拡張は独立ウィンドウで動作するため、ブラウザタブを切り替えても入力内容は保持されます。

## 前提

- `apps-script/Code.gs` の最新版をデプロイ済みであること
- Webアプリのアクセス権が `全員` になっていること
