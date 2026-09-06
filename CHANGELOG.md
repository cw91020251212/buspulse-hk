# BusPulse HK 修改紀錄

## 2026-09-07 — 修正背景到站提示

### 問題背景

使用者反映：路線卡開啟到站鬧鐘後，當手機切到背景或使用其他 App 時，未能穩定收到「巴士就嚟到站」提示。

### 已完成修改

1. **開啟鬧鐘時主動申請通知權限**
   
   以前撳路線卡上的 `🔔` 只會開啟本地鬧鐘，但不一定會申請瀏覽器系統通知權限。現在使用者開啟鬧鐘時，程式會以這次按鈕操作作為使用者手勢，直接申請系統通知權限。

2. **改用 Service Worker 發出背景通知**
   
   到站時間進入預設提醒範圍後，程式會把通知資料交給已註冊的 Service Worker，再由 Service Worker 呼叫系統通知。這比只由目前頁面直接建立通知，更適合處理切換到背景的情況。

3. **重新開啟鬧鐘時清除舊提醒狀態**
   
   開關鬧鐘時會清除該路線的舊 `alarmSeen` 記錄，避免重新開啟後因為殘留狀態而跳過下一次提醒。

4. **更新 Service Worker 快取版本**
   
   快取名稱由 `buspulse-hk-shell-v3` 更新為 `buspulse-hk-shell-v4`，令瀏覽器在部署後重新下載修正版 `index.html`。

### 測試及驗證

- `index.html` 內嵌 JavaScript 語法檢查：通過。
- `sw.js` Node 語法檢查：通過。
- `git diff --check`：通過，沒有空白格式錯誤。
- GitHub Actions Pages 部署：成功。
- 部署提交：`f96fe6f`（`Fix background arrival notifications`）。
- 線上 Service Worker 快取版本：已確認為 `buspulse-hk-shell-v4`。
- 原始碼遠端版本：已確認包含 `requestNotifications()`、Service Worker `postMessage` 通知通道及 `alarmSeen.delete(id)`。

### 使用者測試步驟

1. 開啟 <https://cw91020251212.github.io/gang-baa-im-si-buspulse-hk/>。
2. 如使用主畫面 App，先完全關閉並重新開啟，讓新的 Service Worker 生效。
3. 在任一路線卡撳右上角 `🔔`。
4. 允許系統通知權限；如果之前按過「不允許」，需要到手機瀏覽器的網站通知設定重新允許。
5. 將網站切到背景，再觀察到站時間進入「提前幾多分鐘」的設定範圍時，是否出現系統通知。

### 已知限制

這個專案是純前端 PWA，ETA 是每 25 秒向官方 API 輪詢一次。手機完全鎖屏、強制停止瀏覽器、作業系統省電模式暫停網頁，仍可能令 JavaScript 輪詢、音效或震動停止。Service Worker 可以改善系統通知的背景顯示，但不能保證在所有手機省電及鎖屏狀態下都運作。

另外，官方 ETA API 提供預計到站時間，不是每架巴士的公開推送事件，因此提醒時間仍以 API 當時回傳資料為準，並非保證精確到秒。

### 回退／追查方法

如果今次測試仍然失敗，請記錄以下資料再交回檢查：

- 使用手機型號及瀏覽器名稱／版本。
- 是否已允許網站通知。
- 是切到背景仍有頁面開啟，還是完全關閉／鎖屏後測試。
- 路線卡上的 `🔔` 是否顯示為開啟狀態。
- 測試時設定的提前分鐘數。
- 當時頁面最後一次更新時間及 ETA 顯示。
- 是否有收到卡片閃爍、聲音、震動其中任何一種提示。

## 部署位置

- Repository：<https://github.com/cw91020251212/gang-baa-im-si-buspulse-hk>
- 網站：<https://cw91020251212.github.io/gang-baa-im-si-buspulse-hk/>
