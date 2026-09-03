# 單字星球 Vocabulary Planet

一套使用 **Google Apps Script + Google Sheets** 建立的開源單字學習網站。  
不需要自行架設伺服器；準備一份 Google Sheet、貼入英文與中文單字，就可以建立自己的單字練習網站。

## 功能

- 英文 → 中文
- 中文 → 英文
- 拼寫練習
- 聽力練習（瀏覽器語音）
- 錯字加強
- 學習進度
- 學習紀錄
- Google Sheets 儲存
- 每 20 個單字為一組、每 5 個單字為一個小階段
- 響應式介面，可於桌機與手機使用

## Google Sheet 格式

建立名為 `Vocabulary` 的工作表，只需要兩欄：

| en | zh |
|---|---|
| morning | 早上 |
| meeting | 會議 |
| project | 專案 |

**列的順序就是學習順序。**

系統執行後會自動建立 `Progress`、`Settings`、`History` 工作表，請勿手動刪除欄位。

## 最簡單的安裝方式

1. 建立一份 Google Sheet。
2. 將工作表命名為 `Vocabulary`，A1/B1 分別填入 `en`、`zh`。
3. 貼入自己的單字。
4. 在 Google Sheet 選擇「擴充功能 → Apps Script」。
5. 將本專案的 `Code.gs` 貼入 Apps Script。
6. 新增 HTML 檔案並命名為 `Index`，貼入 `Index.html`。
7. 選擇「部署 → 新增部署作業 → 網頁應用程式」。
8. 完成授權後開啟部署網址。

使用上述「綁定 Google Sheet」方式時，**不需要填寫 Spreadsheet ID**。

詳細步驟請參閱 [`docs/setup.md`](docs/setup.md)。

## 單字資料

本專案公開的是學習系統本身，不附帶完整私人單字庫。  
`sample/vocabulary-template.csv` 僅提供格式範例；你可以替換成自己的單字內容。

## 資料與隱私

這是單一使用者、自行部署的版本。學習資料儲存在使用者自己的 Google Sheet。  
本專案不包含登入系統、多人帳號管理或集中式資料庫。

## v0.1.0

這是第一個公開版本。公開前已在 Google Apps Script 環境完成實際功能測試；自 v0.1.0 起透過 GitHub 進行版本管理。

## License

MIT License。詳見 [`LICENSE`](LICENSE)。
