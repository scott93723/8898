/* =============================================================================
 * 8898 — 共用核心
 *
 * 這裡放的是「政策」,不是資料:必拍角度清單、透明度徽章的判定門檻,
 * 全部集中在這一支,改一個地方全站生效。車輛資料本身在 data/cars.js。
 *
 * 無框架、無依賴、不需建置。刻意寫成 ES5 風格的 IIFE,
 * 這樣直接雙擊 index.html 用 file:// 開也能跑。
 * ========================================================================== */

(function (global) {
  'use strict';

  /* ---------------------------------------------------------------- 政策 -- */

  /* 必拍 12 角度。里程表、底盤、鈑件接縫這三張是關鍵 ——
     跳表、泡水、事故修復最容易在這裡露餡,型錄圖絕對交不出來。 */
  var REQUIRED_ANGLES = [
    '車頭 45 度', '車尾 45 度', '左側車身', '右側車身',
    '內裝前座', '內裝後座', '里程表', '引擎室 / 電機室',
    '底盤', '輪胎與胎紋', '鈑件接縫', '行照(遮碼)'
  ];

  /* 可外充的車(純電、插電式油電)多一張充電孔。
     油電車不能外充、沒有充電孔,維持 12 張。 */
  var PLUGIN_ANGLE = '充電孔';

  var INSPECTION_MAX_DAYS = 180;   // 驗車報告有效天數 —— 車況會變,半年前的報告不算數
  var PHOTO_MAX_DAYS = 60;         // 實拍照有效天數

  var POWERTRAIN = {
    gas:    { label: '汽油', short: '油' },
    hybrid: { label: '油電', short: '油電' },
    phev:   { label: '插電式油電', short: 'PHEV' },
    ev:     { label: '純電', short: '電' }
  };

  var STATUS = {
    available: '待售',
    reserved:  '已預訂',
    sold:      '已售出'
  };

  function isPluggable(car) {
    return car.powertrain === 'ev' || car.powertrain === 'phev';
  }

  /* 有動力電池就要交代電池健康度 —— 油電車的電池換一顆一樣要六位數,
     不是只有純電車該講。 */
  function hasBattery(car) {
    return car.powertrain !== 'gas';
  }

  function requiredAngles(car) {
    var list = REQUIRED_ANGLES.slice();
    if (isPluggable(car)) list.push(PLUGIN_ANGLE);
    return list;
  }

  /* -------------------------------------------------------- 日期與格式化 -- */

  /* 手動解析 YYYY-MM-DD。不用 new Date(str) 是因為它會當成 UTC 解讀,
     在台灣時區會整整差一天,天數判定就會在邊界出錯。 */
  function parseDate(s) {
    if (!s) return null;
    var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(s).trim());
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1);
  }

  function startOfToday() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function daysSince(s) {
    var d = parseDate(s);
    if (!d) return null;
    return Math.floor((startOfToday() - d) / 86400000);
  }

  function fmtMoney(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* 台灣講車價習慣用「萬」。45.6 萬比 456,000 好讀。 */
  function fmtWan(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    var w = n / 10000;
    return (w % 1 === 0 ? w.toFixed(0) : w.toFixed(1));
  }

  function fmtKm(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return fmtMoney(n) + ' km';
  }

  function fmtDate(s) {
    return s ? String(s) : '—';
  }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ------------------------------------------------------------ 佔位圖片 -- */

  /* 還沒有真實照片,用內嵌 SVG 產生佔位圖 ——
     不依賴任何圖檔,也不會出現破圖。每張都清楚標示「示範圖」,
     避免被誤認成實車照,那正好違反這站的立場。 */
  function hueOf(id) {
    var h = 0, i;
    for (i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
    return h;
  }

  /* opts.hideLabel:相簿主圖下方本來就有一條說明列會寫角度,
     再把角度畫進圖裡兩者會疊在一起(窄畫面尤其明顯)。 */
  function placeholderPhoto(car, photo, index, opts) {
    var h = (hueOf(car.id) + index * 7) % 360;
    var bg = 'hsl(' + h + ',14%,88%)';
    var bg2 = 'hsl(' + h + ',16%,80%)';
    var ink = 'hsl(' + h + ',22%,32%)';
    var label = photo && photo.label ? photo.label : '實拍照';

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + bg + '"/><stop offset="1" stop-color="' + bg2 + '"/>' +
        '</linearGradient></defs>' +
        '<rect width="800" height="600" fill="url(#g)"/>' +
        '<g fill="none" stroke="' + ink + '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" opacity="0.55">' +
          '<rect x="92" y="322" width="616" height="96" rx="30"/>' +
          '<path d="M228 322 L292 244 L516 244 L596 322"/>' +
          '<path d="M400 244 L400 322"/>' +
          '<circle cx="240" cy="424" r="48"/><circle cx="240" cy="424" r="20"/>' +
          '<circle cx="576" cy="424" r="48"/><circle cx="576" cy="424" r="20"/>' +
          '<path d="M120 470 L680 470"/>' +
        '</g>' +
        (opts && opts.hideLabel ? '' :
          '<text x="400" y="530" text-anchor="middle" fill="' + ink + '" ' +
            'font-family="PingFang TC, Noto Sans TC, Microsoft JhengHei, sans-serif" ' +
            'font-size="34">' + esc(label) + '</text>') +
        '<text x="400" y="98" text-anchor="middle" fill="' + ink + '" opacity="0.6" ' +
          'font-family="PingFang TC, Noto Sans TC, Microsoft JhengHei, sans-serif" ' +
          'font-size="22" letter-spacing="4">示範圖・非實車照片</text>' +
      '</svg>';

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ------------------------------------------------------------ 正規化 ---- */

  /* 把 photoSet 這種簡寫展開成完整的 photos 陣列,並把 sellerId 接上賣家資料。
     資料檔只寫最少的東西,展開規則(必拍幾張、哪些角度)屬於政策,留在這裡。 */
  function normalize(car) {
    if (car._normalized) return car;

    var sellers = global.SELLERS_8898 || {};
    car.seller = car.seller || sellers[car.sellerId] || null;

    if (!car.photos) {
      var spec = car.photoSet || {};
      var angles = requiredAngles(car);
      if (Array.isArray(spec.angles)) {
        angles = spec.angles;
      } else if (typeof spec.count === 'number') {
        angles = angles.slice(0, spec.count);
      }
      car.photos = angles.map(function (label, i) {
        return {
          src: 'img/cars/' + car.id + '-' + (i + 1 < 10 ? '0' : '') + (i + 1) + '.webp',
          label: label,
          shotAt: spec.shotAt || null
        };
      });
    }

    car.battery = car.battery || null;
    car.history = car.history || {};
    if (!Array.isArray(car.history.knownIssues)) car.history.knownIssues = [];
    car.priceHistory = car.priceHistory || [];

    car._normalized = true;
    return car;
  }

  /* ------------------------------------------------- 透明度徽章(核心)-- */

  /* 這站的靈魂。六項全部由資料本身算出來,賣家沒有任何欄位可以「自稱誠信」。
     沒通過的項目不會被藏起來 —— 前端會把它畫成灰色刪除線的「未提供」,
     買家一眼就看得出這台車在閃躲什麼。 */
  function scoreTransparency(car) {
    normalize(car);
    var items = [];

    /* 1. 明碼實價 —— 打的是「電洽」和成交才冒出來的代辦費 */
    (function () {
      var p = car.price || {};
      var list = p.breakdown || [];
      var sum = list.reduce(function (a, b) { return a + (Number(b.amount) || 0); }, 0);
      var pass = true, why = [];

      if (!(Number(p.total) > 0)) { pass = false; why.push('未標示總價'); }
      if (!list.length) { pass = false; why.push('未提供費用明細'); }
      else if (sum !== Number(p.total)) {
        pass = false;
        why.push('費用明細加總 ' + fmtMoney(sum) + ' 元,與標示總價 ' + fmtMoney(p.total) + ' 元不符');
      }
      if (p.negotiable === true) { pass = false; why.push('標示為可議價,總價不確定'); }

      items.push({
        key: 'price', label: '明碼實價', pass: pass,
        detail: '總價 ' + fmtMoney(p.total) + ' 元,' + list.length + ' 項費用逐條列出且加總相符',
        why: why.join(';')
      });
    })();

    /* 2. 第三方驗車 —— 打的是「只有賣家一張嘴」 */
    (function () {
      var h = car.history || {};
      var d = daysSince(h.inspectedAt);
      var pass = !!(h.inspectionReport && h.inspectedAt && d !== null && d <= INSPECTION_MAX_DAYS);
      var why = '';
      if (!h.inspectionReport || !h.inspectedAt) why = '未提供第三方驗車報告';
      else if (d > INSPECTION_MAX_DAYS) why = '報告是 ' + d + ' 天前的,已超過 ' + INSPECTION_MAX_DAYS + ' 天,車況可能已經不同';

      items.push({
        key: 'inspection', label: '第三方驗車', pass: pass,
        detail: (h.inspectedBy || '') + '・' + fmtDate(h.inspectedAt) + '(' + d + ' 天前)',
        why: why
      });
    })();

    /* 3. 里程可查 —— 打的是跳表 */
    (function () {
      var src = car.mileageSource && String(car.mileageSource).trim();
      var pass = !!(car.mileage !== null && car.mileage !== undefined && src);
      items.push({
        key: 'mileage', label: '里程可查', pass: pass,
        detail: src || '',
        why: car.mileage === null || car.mileage === undefined
          ? '未標示里程'
          : '未說明里程數字的依據,等於只有賣家口頭保證'
      });
    })();

    /* 4. 實拍達標 —— 打的是型錄圖和網路盜圖 */
    (function () {
      var need = requiredAngles(car);
      var have = {};
      (car.photos || []).forEach(function (p) { have[p.label] = true; });
      var missing = need.filter(function (a) { return !have[a]; });

      var oldest = null;
      (car.photos || []).forEach(function (p) {
        var d = daysSince(p.shotAt);
        if (d === null) { oldest = Infinity; return; }
        if (oldest === null || d > oldest) oldest = d;
      });

      var stale = oldest === null || oldest > PHOTO_MAX_DAYS;
      var pass = missing.length === 0 && !stale;

      var why = [];
      if (missing.length) why.push('缺 ' + missing.length + ' 張必拍角度:' + missing.join('、'));
      if (oldest === null || oldest === Infinity) why.push('照片未標示拍攝日期');
      else if (stale) why.push('照片是 ' + oldest + ' 天前拍的,已超過 ' + PHOTO_MAX_DAYS + ' 天,需重拍');

      items.push({
        key: 'photos', label: '實拍達標', pass: pass,
        detail: (car.photos || []).length + ' 張實拍,必拍 ' + need.length + ' 角度齊全,' + oldest + ' 天前拍攝',
        why: why.join(';')
      });
    })();

    /* 5. 賣家實名 —— 打的是匿名賣家、一頁式詐騙 */
    (function () {
      var s = car.seller || {};
      var pass = !!(s.verified && (s.taxId || s.idVerified));
      var detail = s.taxId
        ? s.name + '・統編 ' + s.taxId
        : (s.name || '') + '・已完成個人身分驗證';
      items.push({
        key: 'seller', label: '賣家實名', pass: pass,
        detail: detail,
        why: s.verified ? '賣家已驗證但未提供統編或身分證明' : '賣家未完成實名驗證,出事找不到人'
      });
    })();

    /* 6. 電池報告 —— 二手電車最貴的秘密。只對有動力電池的車適用。 */
    if (hasBattery(car)) {
      var b = car.battery || {};
      var pass = !!(b.soh !== null && b.soh !== undefined && b.sohSource);
      items.push({
        key: 'battery', label: '電池報告', pass: pass,
        detail: 'SOH ' + b.soh + '%・' + (b.sohSource || ''),
        why: '未提供電池健康度(SOH)報告,等於買一個盲盒'
      });
    }

    var passed = items.filter(function (i) { return i.pass; }).length;
    return {
      items: items,
      passed: passed,
      applicable: items.length,
      perfect: passed === items.length
    };
  }

  /* ------------------------------------------------------------ 資料存取 -- */

  var _cache = null;

  function all() {
    if (_cache) return _cache;
    _cache = (global.CARS_8898 || []).map(normalize);
    validate(_cache);
    return _cache;
  }

  function byId(id) {
    var list = all(), i;
    for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* 資料自檢。發現對不起來的地方就往 console 丟警告 ——
     改完 data/cars.js 重整一次就知道有沒有寫錯。 */
  function validate(list) {
    var seen = {};
    list.forEach(function (c) {
      if (seen[c.id]) console.warn('[8898] 車輛編號重複:' + c.id);
      seen[c.id] = true;

      var sum = (c.price.breakdown || []).reduce(function (a, b) {
        return a + (Number(b.amount) || 0);
      }, 0);
      if (sum !== c.price.total) {
        console.warn('[8898] ' + c.id + ' 費用明細加總 ' + sum + ' ≠ 總價 ' + c.price.total);
      }

      var ph = c.priceHistory;
      if (ph.length && ph[ph.length - 1].total !== c.price.total) {
        console.warn('[8898] ' + c.id + ' 價格歷史最後一筆 ' + ph[ph.length - 1].total +
                     ' ≠ 目前總價 ' + c.price.total);
      }
      if (!c.seller) console.warn('[8898] ' + c.id + ' 找不到賣家 ' + c.sellerId);
    });
  }

  /* ---------------------------------------------------------------- 主題 -- */

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('theme8898', t); } catch (e) { /* 無痕模式會擋,忽略 */ }
  }

  function initTheme() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      if (!cur) {
        cur = global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark' : 'light';
      }
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  /* 示範資料橫幅。資料是假的就得講清楚,不然這站的立場自己先破功。 */
  function initDemoBanner() {
    if (!global.DEMO_DATA_8898) return;
    var el = document.querySelector('[data-demo-banner]');
    if (el) el.hidden = false;
  }

  function init() {
    initTheme();
    initDemoBanner();
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---------------------------------------------------------------- 匯出 -- */

  global.C8898 = {
    REQUIRED_ANGLES: REQUIRED_ANGLES,
    INSPECTION_MAX_DAYS: INSPECTION_MAX_DAYS,
    PHOTO_MAX_DAYS: PHOTO_MAX_DAYS,
    POWERTRAIN: POWERTRAIN,
    STATUS: STATUS,
    isPluggable: isPluggable,
    hasBattery: hasBattery,
    requiredAngles: requiredAngles,
    parseDate: parseDate,
    daysSince: daysSince,
    fmtMoney: fmtMoney,
    fmtWan: fmtWan,
    fmtKm: fmtKm,
    fmtDate: fmtDate,
    esc: esc,
    placeholderPhoto: placeholderPhoto,
    normalize: normalize,
    scoreTransparency: scoreTransparency,
    all: all,
    byId: byId
  };

})(window);
