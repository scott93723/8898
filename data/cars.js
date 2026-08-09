/* =============================================================================
 * 8898 — 車輛資料(全站唯一資料來源)
 *
 * ⚠ 目前全部是「示範資料」。以下車輛、賣家名稱、統一編號、地址、驗車報告
 *   一律為虛構,不是實際待售車輛,請勿當真。
 *
 * 欄位定義與徽章判定規則見 data/SCHEMA.md。
 * 這裡刻意留了 5 台資料不完整的車(C0005 / C0007 / C0008 / C0010 / C0015),
 * 不然「透明度徽章」這套機制根本展示不出價值 —— 全部滿分等於沒在檢查。
 *
 * 用 .js 而不是 .json,是因為 fetch() 讀 .json 在 file:// 會被 CORS 擋掉,
 * 直接雙擊 index.html 會整站空白。
 * ========================================================================== */

window.DEMO_DATA_8898 = true;

/* 賣家名冊。車輛用 sellerId 參照,core.js 載入時接上去。 */
window.SELLERS_8898 = {
  S001: {
    id: 'S001', name: '合眾汽車商行', type: 'dealer',
    taxId: '54318762', idVerified: null,
    address: '桃園市中壢區中山路 000 號',
    verified: true, verifiedAt: '2026-05-12'
  },
  S002: {
    id: 'S002', name: '正誠中古車', type: 'dealer',
    taxId: '27661043', idVerified: null,
    address: '台中市西屯區台灣大道三段 000 號',
    verified: true, verifiedAt: '2026-03-08'
  },
  S003: {
    id: 'S003', name: '新莊車庫', type: 'dealer',
    taxId: '83094517', idVerified: null,
    address: '新北市新莊區中正路 000 號',
    verified: true, verifiedAt: '2026-06-19'
  },
  S004: {
    id: 'S004', name: '鴻運汽車', type: 'dealer',
    taxId: '41725860', idVerified: null,
    address: '高雄市三民區建國一路 000 號',
    verified: true, verifiedAt: '2026-04-25'
  },
  /* 未完成實名驗證的個人賣家。我們照樣讓他刊登 ——
     但「賣家實名」徽章不會亮,買家一眼就看得到。 */
  S005: {
    id: 'S005', name: '個人賣家(未完成實名驗證)', type: 'owner',
    taxId: null, idVerified: false,
    address: null,
    verified: false, verifiedAt: null
  },
  S006: {
    id: 'S006', name: '電能中古車', type: 'dealer',
    taxId: '90238164', idVerified: null,
    address: '台北市內湖區瑞光路 000 號',
    verified: true, verifiedAt: '2026-02-14'
  }
};

window.CARS_8898 = [

  /* ---- C0001 ------------------------------------------------ 資料齊全 5/5 */
  {
    id: 'C0001', status: 'available', listedAt: '2026-06-30',
    powertrain: 'gas', brand: 'Toyota', model: 'Altis', trim: '1.8 尊爵版',
    year: 2019, regDate: '2019-05', category: '轎車',
    mileage: 68000, mileageSource: '原廠保養紀錄(共 11 次,末次 2026-05)',
    transmission: '自排', displacement: 1798, color: '珍珠白', seats: 5,
    location: '桃園市中壢區', sellerId: 'S001',
    price: {
      total: 456000,
      breakdown: [
        { item: '車價', amount: 450000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里,已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。上面六項就是你要付的全部。'
    },
    priceHistory: [
      { date: '2026-06-30', total: 486000 },
      { date: '2026-07-22', total: 456000 }
    ],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '國產', maintenanceRecords: true,
      inspectionReport: 'reports/C0001.pdf',
      inspectedBy: '台灣檢驗科技 SGS 二手車檢測', inspectedAt: '2026-06-25',
      knownIssues: ['右後葉子板有補漆(停車擦撞,非結構性損傷,已列於驗車報告第 3 頁)']
    },
    photoSet: { shotAt: '2026-07-28', angles: 'all' },
    description: '一手車主,固定原廠保養。內裝無菸味、無寵物。板金補漆處已在照片與驗車報告標示,看車時可自行帶漆膜儀複驗。'
  },

  /* ---- C0002 ------------------------------------------------ 資料齊全 5/5 */
  {
    id: 'C0002', status: 'available', listedAt: '2026-07-15',
    powertrain: 'gas', brand: 'Toyota', model: 'RAV4', trim: '2.0 旗艦版',
    year: 2020, regDate: '2020-08', category: '休旅車',
    mileage: 82000, mileageSource: '原廠保養紀錄(共 9 次,末次 2026-06)',
    transmission: '自排', displacement: 1987, color: '銀灰', seats: 5,
    location: '桃園市中壢區', sellerId: 'S001',
    price: {
      total: 696000,
      breakdown: [
        { item: '車價', amount: 690000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里,已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [{ date: '2026-07-15', total: 696000 }],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '國產', maintenanceRecords: true,
      inspectionReport: 'reports/C0002.pdf',
      inspectedBy: '台灣檢驗科技 SGS 二手車檢測', inspectedAt: '2026-07-10',
      knownIssues: []
    },
    photoSet: { shotAt: '2026-07-12', angles: 'all' },
    description: '公司主管用車,高速里程佔多數。四輪為 2025 年更換的原廠配胎,胎紋尚餘約 6mm。'
  },

  /* ---- C0003 ---------------------------- 事故車已揭露,徽章仍全亮 5/5 ---- */
  /* 誠實揭露不該被懲罰。會扣徽章的是「不願回答」(填 null),不是「有問題但講清楚」。 */
  {
    id: 'C0003', status: 'available', listedAt: '2026-05-18',
    powertrain: 'gas', brand: 'Honda', model: 'CR-V', trim: '1.5 VTi-S',
    year: 2018, regDate: '2018-03', category: '休旅車',
    mileage: 105000, mileageSource: '第三方驗車報告(行車電腦讀取)',
    transmission: '自排', displacement: 1498, color: '曜石黑', seats: 5,
    location: '台中市西屯區', sellerId: 'S002',
    price: {
      total: 512000,
      breakdown: [
        { item: '車價', amount: 498000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '交車前原廠保養(含四油三水)', amount: 8000, note: '此車里程較高,交車前必做,費用先列出來' },
        { item: '保固', amount: 0, note: '3 個月 / 5 千公里,已含在車價內' }
      ],
      negotiable: false,
      note: '交車前保養是必做項目,不是選配,所以直接算進總價。'
    },
    priceHistory: [
      { date: '2026-05-18', total: 548000 },
      { date: '2026-06-20', total: 528000 },
      { date: '2026-07-30', total: 512000 }
    ],
    history: {
      accident: true, flood: false, commercial: false, owners: 2,
      importType: '國產', maintenanceRecords: true,
      inspectionReport: 'reports/C0003.pdf',
      inspectedBy: '台灣檢驗科技 SGS 二手車檢測', inspectedAt: '2026-07-28',
      knownIssues: [
        '2021 年左前車門與 A 柱下段鈑金修復,有原廠維修單據(驗車報告第 4 頁)',
        '冷氣壓縮機 2025 年更換,非原廠件',
        '四輪胎紋約 4mm,建議一年內更換'
      ]
    },
    photoSet: { shotAt: '2026-07-29', angles: 'all' },
    description: '這台是事故修復車,我們沒有要藏。維修單據、驗車報告、鈑件接縫照全部公開,價格也已經反映車況。看車時歡迎帶自己的技師。'
  },

  /* ---- C0004 ------------------------------------------------ 資料齊全 5/5 */
  {
    id: 'C0004', status: 'available', listedAt: '2026-07-28',
    powertrain: 'gas', brand: 'Mazda', model: 'Mazda3', trim: '4D 旗艦型',
    year: 2021, regDate: '2021-06', category: '轎車',
    mileage: 41000, mileageSource: '原廠保養紀錄(共 6 次,末次 2026-07)',
    transmission: '自排', displacement: 1998, color: '魂動紅', seats: 5,
    location: '新北市新莊區', sellerId: 'S003',
    price: {
      total: 634000,
      breakdown: [
        { item: '車價', amount: 628000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里,已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [{ date: '2026-07-28', total: 634000 }],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '國產', maintenanceRecords: true,
      inspectionReport: 'reports/C0004.pdf',
      inspectedBy: '中華民國汽車鑑定協會', inspectedAt: '2026-07-24',
      knownIssues: []
    },
    photoSet: { shotAt: '2026-07-26', angles: 'all' },
    description: '原廠保固尚在(至 2026-06 已到期,動力系統延長保固至 2026-06 亦已結束)。車況單純,無改裝。'
  },

  /* ---- C0005 -------------------------------- 沒有第三方驗車報告 4/5 ----- */
  {
    id: 'C0005', status: 'available', listedAt: '2026-07-05',
    powertrain: 'gas', brand: 'Ford', model: 'Focus', trim: '4D ST-Line',
    year: 2020, regDate: '2020-11', category: '轎車',
    mileage: 73000, mileageSource: '原廠保養紀錄(共 7 次,末次 2026-04)',
    transmission: '雙離合', displacement: 1497, color: '藍', seats: 5,
    location: '高雄市三民區', sellerId: 'S004',
    price: {
      total: 464000,
      breakdown: [
        { item: '車價', amount: 458000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '本車不提供保固,價格已反映' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。本車不附保固,這點先講清楚。'
    },
    priceHistory: [
      { date: '2026-07-05', total: 478000 },
      { date: '2026-08-01', total: 464000 }
    ],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '國產', maintenanceRecords: true,
      inspectionReport: null,
      inspectedBy: null, inspectedAt: null,
      knownIssues: ['雙離合變速箱低速換檔略有頓挫(原廠認定為此變速箱正常特性,非故障)']
    },
    photoSet: { shotAt: '2026-07-30', angles: 'all' },
    description: '尚未安排第三方驗車。買家若要求,我方可負擔一半檢測費用,報告出來後無條件接受買家依結果議價或取消。'
  },

  /* ---- C0006 ------------------------------------------------ 資料齊全 5/5 */
  {
    id: 'C0006', status: 'available', listedAt: '2026-07-20',
    powertrain: 'gas', brand: 'Volkswagen', model: 'Golf', trim: '280 TSI Comfortline',
    year: 2019, regDate: '2019-09', category: '掀背車',
    mileage: 88000, mileageSource: '原廠保養紀錄(共 8 次,末次 2026-05)',
    transmission: '雙離合', displacement: 1395, color: '白', seats: 5,
    location: '新北市新莊區', sellerId: 'S003',
    price: {
      total: 584000,
      breakdown: [
        { item: '車價', amount: 578000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里,已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [{ date: '2026-07-20', total: 584000 }],
    history: {
      accident: false, flood: false, commercial: false, owners: 2,
      importType: '原廠進口', maintenanceRecords: true,
      inspectionReport: 'reports/C0006.pdf',
      inspectedBy: '中華民國汽車鑑定協會', inspectedAt: '2026-07-16',
      knownIssues: [
        '前擋風玻璃右下角有一處約 5mm 石擊點,已做樹脂修補',
        'DSG 變速箱油於 2025 年 8 萬公里時更換'
      ]
    },
    photoSet: { shotAt: '2026-07-18', angles: 'all' },
    description: '德製原裝進口。二手車,兩位前手皆為個人使用。'
  },

  /* ---- C0007 ------------------- 最該小心的那種車:5 項只過 1 項 1/5 ----- */
  /* 匿名賣家、沒驗車、里程沒來源、照片只有 8 張、事故泡水營業車全部「不願回答」。
     我們照樣讓他刊登 —— 但整台車的空白處全部亮成灰色,買家自己判斷。 */
  {
    id: 'C0007', status: 'available', listedAt: '2026-07-25',
    powertrain: 'gas', brand: 'BMW', model: '320i', trim: 'M Sport',
    year: 2018, regDate: '2018-07', category: '轎車',
    mileage: 96000, mileageSource: null,
    transmission: '自排', displacement: 1998, color: '黑', seats: 5,
    location: '台北市大安區', sellerId: 'S005',
    price: {
      total: 874000,
      breakdown: [
        { item: '車價', amount: 868000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '個人賣家,不提供保固' }
      ],
      negotiable: false,
      note: '個人讓車,總價就是這個數字。'
    },
    priceHistory: [{ date: '2026-07-25', total: 874000 }],
    history: {
      accident: null, flood: null, commercial: null, owners: null,
      importType: '原廠進口', maintenanceRecords: false,
      inspectionReport: null,
      inspectedBy: null, inspectedAt: null,
      knownIssues: []
    },
    photoSet: { shotAt: '2026-07-22', count: 8 },
    description: '車況良好,自用車,可試駕。'
  },

  /* ---- C0008 ---------------- 營業車已揭露,但驗車報告過期 4/5 ---------- */
  {
    id: 'C0008', status: 'available', listedAt: '2026-04-12',
    powertrain: 'gas', brand: 'Mercedes-Benz', model: 'C300', trim: 'AMG Line',
    year: 2017, regDate: '2017-10', category: '轎車',
    mileage: 132000, mileageSource: '第三方驗車報告(行車電腦讀取)',
    transmission: '自排', displacement: 1991, color: '銀', seats: 5,
    location: '台中市西屯區', sellerId: 'S002',
    price: {
      total: 894000,
      breakdown: [
        { item: '車價', amount: 888000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '3 個月 / 5 千公里,已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [
      { date: '2026-04-12', total: 968000 },
      { date: '2026-06-05', total: 928000 },
      { date: '2026-07-18', total: 894000 }
    ],
    history: {
      accident: false, flood: false, commercial: true, owners: 1,
      importType: '原廠進口', maintenanceRecords: true,
      inspectionReport: 'reports/C0008.pdf',
      inspectedBy: '台灣檢驗科技 SGS 二手車檢測', inspectedAt: '2025-11-20',
      knownIssues: [
        '原為租賃公司車輛,前手為多人不特定使用',
        '避震器四支於 2025 年全套更換',
        '方向盤與排檔頭皮革有明顯使用痕跡'
      ]
    },
    photoSet: { shotAt: '2026-07-15', angles: 'all' },
    description: '租賃公司退役車,這件事我們寫在最前面。驗車報告是去年 11 月的,已超過 180 天,買家若要求可重新安排檢測。'
  },

  /* ---- C0009 --------------------------------------- 油電,資料齊全 6/6 -- */
  {
    id: 'C0009', status: 'available', listedAt: '2026-07-30',
    powertrain: 'hybrid', brand: 'Toyota', model: 'Prius', trim: '1.8 Hybrid',
    year: 2019, regDate: '2019-04', category: '掀背車',
    mileage: 74000, mileageSource: '原廠保養紀錄(共 10 次,末次 2026-06)',
    transmission: '自排', displacement: 1798, color: '銀', seats: 5,
    location: '桃園市中壢區', sellerId: 'S001',
    price: {
      total: 524000,
      breakdown: [
        { item: '車價', amount: 518000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里,已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [{ date: '2026-07-30', total: 524000 }],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '國產', maintenanceRecords: true,
      inspectionReport: 'reports/C0009.pdf',
      inspectedBy: '台灣檢驗科技 SGS 二手車檢測', inspectedAt: '2026-07-26',
      knownIssues: []
    },
    battery: {
      capacity: 1.3, soh: 91,
      sohSource: '原廠 Hybrid 動力電池檢測 2026-07-26(模組電壓差 0.04V)',
      realRange: null, officialRange: null,
      chargePorts: [], maxDcCharge: null,
      warrantyUntil: '2029-04', replaced: false
    },
    photoSet: { shotAt: '2026-07-28', angles: 'all' },
    description: '油電車的動力電池換一顆要六位數,所以我們一樣附電池檢測。模組電壓差 0.04V 屬正常範圍。'
  },

  /* ---- C0010 ------------------------------- 油電,電池沒報告 5/6 ------- */
  {
    id: 'C0010', status: 'available', listedAt: '2026-08-02',
    powertrain: 'hybrid', brand: 'Toyota', model: 'Corolla Cross', trim: 'Hybrid 旗艦版',
    year: 2022, regDate: '2022-03', category: '休旅車',
    mileage: 38000, mileageSource: '原廠保養紀錄(共 5 次,末次 2026-07)',
    transmission: '自排', displacement: 1798, color: '白', seats: 5,
    location: '新北市新莊區', sellerId: 'S003',
    price: {
      total: 744000,
      breakdown: [
        { item: '車價', amount: 738000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里,已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [{ date: '2026-08-02', total: 744000 }],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '國產', maintenanceRecords: true,
      inspectionReport: 'reports/C0010.pdf',
      inspectedBy: '中華民國汽車鑑定協會', inspectedAt: '2026-07-31',
      knownIssues: []
    },
    battery: {
      capacity: 1.0, soh: null, sohSource: null,
      realRange: null, officialRange: null,
      chargePorts: [], maxDcCharge: null,
      warrantyUntil: '2030-03', replaced: false
    },
    photoSet: { shotAt: '2026-08-01', angles: 'all' },
    description: '原廠電池保固至 2030-03 仍有效,但尚未做動力電池健康檢測,已預約中,報告出來會補上來。'
  },

  /* ---- C0011 --------------------------------------- 純電,資料齊全 6/6 -- */
  {
    id: 'C0011', status: 'available', listedAt: '2026-07-08',
    powertrain: 'ev', brand: 'Tesla', model: 'Model 3', trim: 'Long Range AWD',
    year: 2021, regDate: '2021-09', category: '轎車',
    mileage: 52000, mileageSource: '車輛系統里程紀錄 + 服務中心維修紀錄',
    transmission: '單速', displacement: null, color: '珍珠白', seats: 5,
    location: '台北市內湖區', sellerId: 'S006',
    price: {
      total: 894000,
      breakdown: [
        { item: '車價', amount: 888000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '隨車充電線與配件', amount: 0, note: '原廠隨車配件齊全,不另計價' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里(不含電池),已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。電池仍在原廠保固內,由特斯拉承保。'
    },
    priceHistory: [
      { date: '2026-07-08', total: 928000 },
      { date: '2026-07-29', total: 894000 }
    ],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '原廠進口', maintenanceRecords: true,
      inspectionReport: 'reports/C0011.pdf',
      inspectedBy: '電池健康檢測中心 + 中華民國汽車鑑定協會', inspectedAt: '2026-07-04',
      knownIssues: [
        '原廠 18 吋圈,未購買增強型自動輔助駕駛(EAP/FSD)',
        '駕駛座座椅左側外緣皮革有輕微磨損'
      ]
    },
    battery: {
      capacity: 78.4, soh: 93,
      sohSource: '第三方電池檢測報告 2026-07-04(滿電估算 + 充放電曲線分析)',
      realRange: 480, officialRange: 614,
      chargePorts: ['TPC(特斯拉規格)', 'CCS2(需轉接頭)'], maxDcCharge: 250,
      warrantyUntil: '2029-09', replaced: false
    },
    photoSet: { shotAt: '2026-07-10', angles: 'all' },
    description: '電池健康度 93%,以 5 年 5.2 萬公里來說屬正常衰減。實測續航 480km 是冷氣全程開啟、市區與國道混合的實跑數字,不是原廠公告值。'
  },

  /* ---- C0012 --------------------------------------- 純電,資料齊全 6/6 -- */
  {
    id: 'C0012', status: 'available', listedAt: '2026-08-05',
    powertrain: 'ev', brand: 'Tesla', model: 'Model Y', trim: 'Performance',
    year: 2022, regDate: '2022-06', category: '休旅車',
    mileage: 34000, mileageSource: '車輛系統里程紀錄 + 服務中心維修紀錄',
    transmission: '單速', displacement: null, color: '深藍', seats: 5,
    location: '台北市內湖區', sellerId: 'S006',
    price: {
      total: 1284000,
      breakdown: [
        { item: '車價', amount: 1278000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '隨車充電線與配件', amount: 0, note: '原廠隨車配件齊全,不另計價' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里(不含電池),已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [{ date: '2026-08-05', total: 1284000 }],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '原廠進口', maintenanceRecords: true,
      inspectionReport: 'reports/C0012.pdf',
      inspectedBy: '電池健康檢測中心 + 中華民國汽車鑑定協會', inspectedAt: '2026-08-01',
      knownIssues: []
    },
    battery: {
      capacity: 78.4, soh: 95,
      sohSource: '第三方電池檢測報告 2026-08-01(滿電估算 + 充放電曲線分析)',
      realRange: 430, officialRange: 514,
      chargePorts: ['TPC(特斯拉規格)', 'CCS2(需轉接頭)'], maxDcCharge: 250,
      warrantyUntil: '2030-06', replaced: false
    },
    photoSet: { shotAt: '2026-08-03', angles: 'all' },
    description: 'Performance 版本,21 吋圈,四輪胎紋皆餘 5mm 以上。原廠電池與驅動系統保固至 2030-06。'
  },

  /* ---- C0013 --------------------------------------- 純電,資料齊全 6/6 -- */
  {
    id: 'C0013', status: 'available', listedAt: '2026-07-12',
    powertrain: 'ev', brand: 'Hyundai', model: 'Ioniq 5', trim: 'EV500 Performance',
    year: 2022, regDate: '2022-04', category: '休旅車',
    mileage: 28000, mileageSource: '原廠保養紀錄(共 4 次,末次 2026-06)',
    transmission: '單速', displacement: null, color: '霧灰', seats: 5,
    location: '台北市內湖區', sellerId: 'S006',
    price: {
      total: 1164000,
      breakdown: [
        { item: '車價', amount: 1158000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '隨車充電線與配件', amount: 0, note: '原廠隨車配件齊全,不另計價' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里(不含電池),已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [
      { date: '2026-07-12', total: 1198000 },
      { date: '2026-08-04', total: 1164000 }
    ],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '原廠進口', maintenanceRecords: true,
      inspectionReport: 'reports/C0013.pdf',
      inspectedBy: '原廠 EV 檢測 + 中華民國汽車鑑定協會', inspectedAt: '2026-07-09',
      knownIssues: ['前保桿下緣有輕微刮痕(約 8cm,未傷及底漆)']
    },
    battery: {
      capacity: 72.6, soh: 96,
      sohSource: '原廠 EV 電池健康檢測 2026-07-09(SOH 報告可於原廠系統複查)',
      realRange: 410, officialRange: 446,
      chargePorts: ['CCS2'], maxDcCharge: 233,
      warrantyUntil: '2030-04', replaced: false
    },
    photoSet: { shotAt: '2026-07-11', angles: 'all' },
    description: '800V 架構,實測 10-80% 快充約 19 分鐘。支援 V2L 對外供電。'
  },

  /* ---- C0014 --------------------------------------- 純電,資料齊全 6/6 -- */
  {
    id: 'C0014', status: 'available', listedAt: '2026-08-06',
    powertrain: 'ev', brand: 'Kia', model: 'EV6', trim: 'GT-Line 四驅',
    year: 2023, regDate: '2023-02', category: '休旅車',
    mileage: 19000, mileageSource: '原廠保養紀錄(共 3 次,末次 2026-07)',
    transmission: '單速', displacement: null, color: '月光白', seats: 5,
    location: '台中市西屯區', sellerId: 'S002',
    price: {
      total: 1384000,
      breakdown: [
        { item: '車價', amount: 1378000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '隨車充電線與配件', amount: 0, note: '原廠隨車配件齊全,不另計價' },
        { item: '保固', amount: 0, note: '原廠新車保固尚在,詳見車輛履歷' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [{ date: '2026-08-06', total: 1384000 }],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '原廠進口', maintenanceRecords: true,
      inspectionReport: 'reports/C0014.pdf',
      inspectedBy: '原廠 EV 檢測 + 台灣檢驗科技 SGS', inspectedAt: '2026-08-02',
      knownIssues: []
    },
    battery: {
      capacity: 77.4, soh: 97,
      sohSource: '原廠 EV 電池健康檢測 2026-08-02',
      realRange: 450, officialRange: 506,
      chargePorts: ['CCS2'], maxDcCharge: 240,
      warrantyUntil: '2031-02', replaced: false
    },
    photoSet: { shotAt: '2026-08-04', angles: 'all' },
    description: '原廠新車保固(3 年 10 萬公里)至 2026-02 已到期,電池與驅動系統保固(7 年 15 萬公里)至 2031-02 仍有效,可隨車移轉。'
  },

  /* ---- C0015 ----------------- 純電,電池沒報告 + 照片過期 4/6 --------- */
  /* 二手電車最貴的秘密就是電池。沒有 SOH 報告的電車,你等於在買一個盲盒。 */
  {
    id: 'C0015', status: 'available', listedAt: '2026-06-02',
    powertrain: 'ev', brand: 'Nissan', model: 'Leaf', trim: '40kWh',
    year: 2019, regDate: '2019-08', category: '掀背車',
    mileage: 88000, mileageSource: '原廠保養紀錄(共 7 次,末次 2026-03)',
    transmission: '單速', displacement: null, color: '白', seats: 5,
    location: '高雄市三民區', sellerId: 'S004',
    price: {
      total: 394000,
      breakdown: [
        { item: '車價', amount: 388000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '保固', amount: 0, note: '本車不提供保固,價格已反映' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [
      { date: '2026-06-02', total: 438000 },
      { date: '2026-07-10', total: 414000 },
      { date: '2026-08-01', total: 394000 }
    ],
    history: {
      accident: false, flood: false, commercial: false, owners: 2,
      importType: '原廠進口', maintenanceRecords: true,
      inspectionReport: 'reports/C0015.pdf',
      inspectedBy: '中華民國汽車鑑定協會', inspectedAt: '2026-06-28',
      knownIssues: [
        '原廠 CHAdeMO 充電規格,台灣公共快充樁逐年減少中',
        '電池無主動液冷溫控,連續快充後充電速度會明顯下降(此為此代車型設計限制)'
      ]
    },
    battery: {
      capacity: 40, soh: null, sohSource: null,
      realRange: null, officialRange: 311,
      chargePorts: ['CHAdeMO'], maxDcCharge: 50,
      warrantyUntil: '2027-04', replaced: false
    },
    photoSet: { shotAt: '2026-05-20', angles: 'all' },
    description: '車輛通過機械檢測,但尚未提供電池健康度報告,照片也是 5 月拍的還沒重拍。這兩件事沒補齊之前,建議買家務必自行檢測電池再決定。'
  },

  /* ---- C0016 --------------------------------------- 純電,資料齊全 6/6 -- */
  {
    id: 'C0016', status: 'available', listedAt: '2026-07-31',
    powertrain: 'ev', brand: 'MG', model: 'MG4', trim: '豪華版',
    year: 2023, regDate: '2023-07', category: '掀背車',
    mileage: 22000, mileageSource: '原廠保養紀錄(共 3 次,末次 2026-06)',
    transmission: '單速', displacement: null, color: '橙', seats: 5,
    location: '高雄市三民區', sellerId: 'S004',
    price: {
      total: 724000,
      breakdown: [
        { item: '車價', amount: 718000 },
        { item: '過戶規費', amount: 3000, note: '監理站規費,實報實銷' },
        { item: '監理站驗車', amount: 1500 },
        { item: '強制險(1 年)', amount: 1500 },
        { item: '代辦手續費', amount: 0, note: '本站不收代辦費' },
        { item: '隨車充電線與配件', amount: 0, note: '原廠隨車配件齊全,不另計價' },
        { item: '保固', amount: 0, note: '6 個月 / 1 萬公里(不含電池),已含在車價內' }
      ],
      negotiable: false,
      note: '無其他隱藏費用。'
    },
    priceHistory: [{ date: '2026-07-31', total: 724000 }],
    history: {
      accident: false, flood: false, commercial: false, owners: 1,
      importType: '國產', maintenanceRecords: true,
      inspectionReport: 'reports/C0016.pdf',
      inspectedBy: '原廠 EV 檢測 + 中華民國汽車鑑定協會', inspectedAt: '2026-07-27',
      knownIssues: []
    },
    battery: {
      capacity: 64, soh: 95,
      sohSource: '原廠 EV 電池健康檢測 2026-07-27',
      realRange: 380, officialRange: 450,
      chargePorts: ['CCS2'], maxDcCharge: 140,
      warrantyUntil: '2031-05', replaced: false
    },
    photoSet: { shotAt: '2026-07-29', angles: 'all' },
    description: '後輪驅動,原廠電池保固 8 年 16 萬公里至 2031-05,可隨車移轉給下一手。'
  }

];
