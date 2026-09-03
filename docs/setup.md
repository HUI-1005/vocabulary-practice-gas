# 安裝教學

## 1. 建立 Google Sheet

建立新的 Google 試算表，將第一個工作表命名為：

`Vocabulary`

第一列必須是：

| A | B |
|---|---|
| en | zh |

從第 2 列開始放入單字。

## 2. 建立 Apps Script

在該 Google Sheet 中選擇：

**擴充功能 → Apps Script**

這樣建立的是「綁定試算表」的 Apps Script，也是本專案最推薦的安裝方式。

## 3. 放入 Code.gs

刪除 Apps Script 預設內容，將專案內的 `Code.gs` 全部貼入並儲存。

## 4. 建立 Index.html

在 Apps Script 左側按「＋」→「HTML」，檔名輸入：

`Index`

將 `Index.html` 的全部內容貼入並儲存。

## 5. 部署

選擇：

**部署 → 新增部署作業 → 類型：網頁應用程式**

依自己的使用情境設定存取權限，完成 Google 授權後開啟 Web App 網址。

## 6. 第一次測試

建議依序確認：

1. 首頁可以正常開啟。
2. 英文 → 中文可以出題。
3. 中文 → 英文可以出題。
4. 拼寫練習可以輸入答案。
5. 聽力練習可以播放英文。
6. Google Sheet 自動出現 `Progress`、`Settings`、`History`。
7. 關閉網頁重新開啟後，學習紀錄仍然存在。

## 獨立 Apps Script 專案

如果不是從 Google Sheet 內建立 Apps Script，而是使用獨立 Apps Script 專案，請在：

**專案設定 → 指令碼屬性**

新增：

- 屬性：`SPREADSHEET_ID`
- 值：你的 Google Sheet ID

Google Sheet ID 是試算表網址 `/d/` 與 `/edit` 之間的字串。

## 更新版本

更新 `Code.gs` 或 `Index.html` 後，請重新建立/更新部署版本，再重新整理 Web App。
