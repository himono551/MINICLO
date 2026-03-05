# OCR Beta

OCR取り込み機能を本体から切り出した実験用ミニアプリです。

## できること
- 画像からOCR実行 (`tesseract.js`)
- OCRテキストの再解析
- 抽出した商品行の手修正
- Apps Script (`action=addItems`) へ送信

## 使い方
1. `beta-ocr/index.html` をブラウザで開く
2. `Apps Script URL` にキャプチャ用GASのWebアプリURLを入力
3. 画像を選んで `OCR実行`
4. 必要ならテキストや商品行を修正
5. `シートに登録`

## 注意
- 本体アプリとは独立動作です（状態は `localStorage` に別保存）。
- ベータなので抽出精度はサイトごとに差があります。
