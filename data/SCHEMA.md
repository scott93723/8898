# 8898 車輛資料規格

`data/cars.js` 是全站唯一的車輛資料來源。所有頁面、篩選、徽章都由這份資料算出來。

檔案格式是 `.js` 而不是 `.json`,原因很單純:`.json` 要用 `fetch()` 讀,而 `fetch()` 在 `file://`
會被瀏覽器的 CORS 政策擋掉 —— 也就是直接雙擊 `index.html` 會整站空白。用 `.js` 賦值檔則本機
與伺服器環境都能跑,內容仍然是純資料陣列。

---

## 設計原則

**缺的欄位不要刪掉,填 `null` 或空字串。**

這站的整個立場就是「藏資訊不可能」。前端看到 `null` 會顯示成灰色刪除線的「未提供」,而不是
把那一列藏起來。如果直接把欄位拿掉,買家就看不出賣家在閃躲什麼 —— 那我們就跟 8891 沒兩樣了。

---

## 車輛欄位

### 基本

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `id` | string | ✔ | 唯一編號,`C0001` 格式。已發布後**永不重用、永不變更**。 |
| `status` | string | ✔ | `available` / `reserved` / `sold` |
| `listedAt` | `YYYY-MM-DD` | ✔ | 首次上架日。**下架重上不得重設** —— 這是擋「洗版裝新鮮」的機制。 |
| `powertrain` | string | ✔ | `gas` 汽油 / `hybrid` 油電 / `phev` 插電式 / `ev` 純電 |
| `brand` `model` `trim` | string | ✔ | 品牌 / 車型 / 車型等級 |
| `year` | number | ✔ | 出廠年份 |
| `regDate` | `YYYY-MM` | ✔ | 首次領牌年月。與出廠年份不同是正常的,但差距大要在 `description` 說明。 |
| `category` | string | ✔ | 轎車 / 休旅車 / 掀背車 / 旅行車 / 貨卡 |
| `mileage` | number \| null | ✔ | 公里數 |
| `mileageSource` | string \| null | ✔ | **里程數字的依據**。填「原廠保養紀錄」「第三方驗車報告」這類可查證的來源。<br>不接受「賣家表示」—— 那等於沒有來源,請填 `null`。 |
| `transmission` | string | ✔ | 自排 / 手排 / 雙離合 / 單速(電車) |
| `displacement` | number \| null | ✔ | 排氣量 cc。純電車填 `null`。 |
| `color` `seats` `location` | | ✔ | 顏色 / 座位數 / 車輛所在地 |
| `description` | string | ✔ | 賣家說明。 |

### `price` —— 一口價與費用明細

```js
price: {
  total: 456000,                  // 買家實際要付的總額
  breakdown: [
    { item: '車價',           amount: 450000 },
    { item: '過戶規費',       amount: 3000, note: '監理站規費,實報實銷' },
    { item: '監理站驗車',     amount: 1500 },
    { item: '強制險(1 年)', amount: 1500 },
    { item: '代辦手續費',     amount: 0,    note: '本站不收代辦費' },
    { item: '保固',           amount: 0,    note: '6 個月 / 1 萬公里,已含在車價內' }
  ],
  negotiable: false,
  note: '無其他隱藏費用。'
}
```

**鐵則:`breakdown` 所有 `amount` 加總必須等於 `total`。**

對不起來的話,詳情頁會直接印出紅色的「費用明細與總價不符」警告,並且「明碼實價」徽章不會亮。
不允許用「其他費用」這種模糊項目湊數 —— 收什麼費就寫什麼名字。

不收的費用請保留該列、填 `amount: 0` 並在 `note` 說明。列出「我們不收這筆」比整列消失有意義得多。

### `priceHistory` —— 價格變動

```js
priceHistory: [
  { date: '2026-06-30', total: 486000 },
  { date: '2026-07-22', total: 456000 }   // 最後一筆必須等於 price.total
]
```

用來擋「先掛低價釣魚、聯絡後才加價」。詳情頁畫成時間軸,漲價會標紅。
最後一筆若和 `price.total` 不符,詳情頁同樣會顯示警告。

### `history` —— 車輛履歷

| 欄位 | 型別 | 說明 |
|---|---|---|
| `accident` | bool \| null | 事故車(有結構性損傷或鈑金大修) |
| `flood` | bool \| null | 泡水車 |
| `commercial` | bool \| null | 曾為營業車 / 租賃車 / 教練車 |
| `owners` | number \| null | 前手數 |
| `importType` | string | 國產 / 原廠進口 / 外匯 |
| `maintenanceRecords` | bool | 是否有可查的保養紀錄 |
| `inspectionReport` | string \| null | 第三方驗車報告檔案路徑 |
| `inspectedBy` | string \| null | 驗車單位 |
| `inspectedAt` | `YYYY-MM-DD` \| null | 驗車日期。**超過 180 天徽章就不亮**,車況會變。 |
| `knownIssues` | string[] | 已知缺陷。**必填欄位**,沒有缺陷就填 `[]`,前端會顯示成「賣家聲明無已知缺陷」。 |

`accident` / `flood` / `commercial` 填 `true` **不會**扣徽章。誠實揭露不該被懲罰 ——
會扣分的是填 `null`(不願回答)。

### `battery` —— 電池(`powertrain !== 'gas'` 才有)

油電車也要填。油電的動力電池換一顆同樣是好幾萬,不是只有純電車該交代。

```js
battery: {
  capacity: 60,                             // kWh
  soh: 93,                                  // 電池健康度 %,null = 未提供
  sohSource: '原廠檢測報告 2026-07-15',     // SOH 這個數字的依據
  realRange: 380,                           // 實測續航 km(冷氣開啟、市區+高速混合)
  officialRange: 430,                       // 原廠公告續航 km
  chargePorts: ['CCS2'],                    // 純電/PHEV 才填
  maxDcCharge: 170,                         // 直流快充峰值 kW
  warrantyUntil: '2029-06',                 // 電池保固到期
  replaced: false                           // 是否更換過電池
}
```

油電車只需填 `capacity` / `soh` / `sohSource` / `warrantyUntil` / `replaced`,其餘留空。

### `photoSet` —— 實拍照

```js
photoSet: { shotAt: '2026-08-02', angles: 'all' }   // 拍齊必拍角度
photoSet: { shotAt: '2026-08-02', count: 8 }        // 只拍了前 8 個角度
photoSet: { shotAt: '2026-03-10', angles: 'all' }   // 拍齊了但照片過期
```

載入時由 `assets/core.js` 展開成 `car.photos = [{ src, label, shotAt }]`。
也可以直接寫完整的 `photos` 陣列,展開程序會跳過。

**必拍 12 角度**(定義在 `assets/core.js` 的 `REQUIRED_ANGLES`):

車頭 45 度 / 車尾 45 度 / 左側車身 / 右側車身 / 內裝前座 / 內裝後座 /
里程表 / 引擎室・電機室 / 底盤 / 輪胎與胎紋 / 鈑件接縫 / 行照(遮碼)

`powertrain` 是 `ev` 或 `phev` 的另外必拍 **充電孔**(共 13 張)。
油電車(`hybrid`)不能外充,沒有充電孔,維持 12 張。

里程表、底盤、鈑件接縫這三張是關鍵 —— 跳表、泡水、事故修復最容易在這裡露餡,
所以型錄圖絕對交不出來。照片超過 60 天算過期,要重拍。

### `seller` —— 賣家

```js
seller: {
  id: 'S001',
  name: '合眾汽車商行',
  type: 'dealer',             // dealer 車商 / owner 個人車主
  taxId: '54318762',          // 統一編號,個人賣家填 null
  idVerified: true,           // 個人賣家的身分驗證
  address: '桃園市中壢區中山路 000 號',
  verified: true,
  verifiedAt: '2026-05-12'
}
```

---

## 透明度徽章判定

六項全部由上面的資料算出來,賣家沒有任何欄位可以「自稱誠信」。
判定程式在 `assets/core.js` 的 `scoreTransparency()`。

| 徽章 | 通過條件 |
|---|---|
| 明碼實價 | `price.total > 0` 且 `breakdown` 加總等於 `total` 且 `negotiable !== true` |
| 第三方驗車 | `inspectionReport` 有值 且 `inspectedAt` 在 180 天內 |
| 里程可查 | `mileage` 有值 且 `mileageSource` 非空 |
| 實拍達標 | 必拍角度全到齊 且 每張 `shotAt` 都在 60 天內 |
| 賣家實名 | `seller.verified` 為 true 且(`taxId` 或 `idVerified`)|
| 電池報告 | **`powertrain !== 'gas'` 才適用**:`battery.soh` 與 `battery.sohSource` 都有值 |

汽油車適用 5 項,油電與電車適用 6 項。首頁「只看透明度滿分」= 通過數等於適用數。

---

## 改完資料要做的事

沒有建置步驟,存檔重整就生效。但存檔前請自己過一遍:

1. `breakdown` 加總 = `total`
2. `priceHistory` 最後一筆 = `price.total`
3. `id` 沒跟別台車撞號
4. `knownIssues` 有寫(沒缺陷就 `[]`,不要留 `null`)
5. 沒有為了讓徽章亮而刪掉欄位 —— 該填 `null` 就填 `null`
