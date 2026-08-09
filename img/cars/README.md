# img/cars/

實拍照片放這裡,檔名格式 `{車輛編號}-{序號}.webp`,例如 `C0001-01.webp`。

目前站上還沒有真實照片,`assets/core.js` 的 `placeholderPhoto()` 會依角度名稱
即時產生內嵌 SVG 佔位圖,每張都標了「示範圖・非實車照片」。

要換成真實照片時,把檔案放進來,然後修改 `placeholderPhoto()` 的呼叫端
(`assets/list.js` 與 `assets/detail.js`)改用 `photo.src`,
或在 `core.js` 加一個「檔案存在就用檔案、否則用佔位圖」的判斷。

拍攝角度清單與有效期規則見 [`../../data/SCHEMA.md`](../../data/SCHEMA.md)。
