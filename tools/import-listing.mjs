/* =============================================================================
 * 把一筆既有刊登匯入 8898,並且當場告訴你缺了什麼
 *
 *   node tools/import-listing.mjs <刊登網址>
 *
 * ⚠ 這支工具是給「賣家匯入自己的刊登」用的,一次一筆。
 *   它刻意不做批次、不吃清單頁、不遍歷整站 —— 那是把別人的資料庫整包搬走,
 *   跟這個站要解決的問題無關,而且照片與賣家資訊的權利本來就不在你手上。
 *
 * 為什麼要有這支
 * --------------
 * 8898 的立場是「資料不齊就攤開來給人看」。所以匯入的重點不是把車搬過來,
 * 是讓賣家看見自己少交代了什麼 —— 匯完會直接印出一張稽核表:
 * 六項透明度檢核過了幾項、每一項缺什麼、要補哪個欄位。
 *
 * 缺的欄位一律填 null,不會替賣家美化。填 null 在站上就是灰色的「未提供」。
 *
 * 需要系統裝有 Chrome 或 Edge(刊登頁多半是 SPA,curl 只拿得到空殼)。
 * 零 npm 依賴,Node 18+ 直接跑。
 * ========================================================================== */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/* ------------------------------------------------------------ 找瀏覽器 -- */

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
];

function findBrowser() {
  const hit = CANDIDATES.find(p => fs.existsSync(p));
  if (!hit) {
    console.error('找不到 Chrome 或 Edge。刊登頁是 SPA,一定要用瀏覽器渲染才拿得到資料。');
    process.exit(1);
  }
  return hit;
}

function render(url) {
  const browser = findBrowser();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'c8898-'));
  try {
    return execFileSync(browser, [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      '--user-data-dir=' + profile,
      '--virtual-time-budget=12000',
      '--dump-dom', url
    ], { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024, timeout: 90000 });
  } finally {
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
  }
}

/* ------------------------------------------------------------ 抽資料 ---- */

const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function extract(html) {
  const out = { specs: {} };

  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
  out.title = h1 ? strip(h1[1]) : null;

  const t = /<title>([^<]*)/.exec(html);
  out.pageTitle = t ? strip(t[1]) : null;

  /* 規格是「值 / 標籤」成對的區塊,class 名帶 hash 所以用寬鬆比對 */
  const vals = [...html.matchAll(/_info-value_[^"]*"[^>]*>([\s\S]*?)<\/div>/g)].map(m => strip(m[1]));
  const labs = [...html.matchAll(/_info-label_[^"]*"[^>]*>([\s\S]*?)<\/div>/g)].map(m => strip(m[1]));
  labs.forEach((l, i) => { if (l && vals[i]) out.specs[l] = vals[i]; });

  /* 價格。抓得到數字才算,抓不到多半是「電洽」—— 那本身就是一項未通過。 */
  const price = [...html.matchAll(/_price[^"]*"[^>]*>([\s\S]{0,40}?)</g)]
    .map(m => strip(m[1])).filter(s => /^[\d.]+$/.test(s))[0];
  out.priceWan = price ? parseFloat(price) : null;

  out.photoCount = new Set(
    [...html.matchAll(/https:\/\/i\d?\.8891[^"'\s]+\.(?:jpe?g|webp|png)/gi)].map(m => m[0])
  ).size;

  return out;
}

/* --------------------------------------------------- 對映到 8898 欄位 -- */

const WAN = 10000;

function toCar(src, url) {
  const s = src.specs;
  const title = src.title || src.pageTitle || '';

  /* 「Suzuki Jimny 2003款 1.3 藍色」 */
  const tm = /^(\S+)\s+(\S+)\s+(\d{4})款?\s*(.*)$/.exec(title);
  const brand = tm ? tm[1] : null;
  const model = tm ? tm[2] : null;
  const year = tm ? +tm[3] : null;
  const trim = tm && tm[4] ? tm[4].trim() : null;

  /* 「9.7萬公里」/「97,000 公里」 */
  let mileage = null;
  const mk = /([\d.]+)\s*萬\s*公里/.exec(s['里程實拍'] || s['里程'] || '');
  const mn = /([\d,]+)\s*公里/.exec(s['里程實拍'] || s['里程'] || '');
  if (mk) mileage = Math.round(parseFloat(mk[1]) * WAN);
  else if (mn) mileage = parseInt(mn[1].replace(/,/g, ''), 10);

  const fuel = s['引擎燃料'] || '';
  const powertrain = /電/.test(fuel) ? 'ev' : (/油電|複合/.test(fuel) ? 'hybrid' : 'gas');

  const cc = /([\d.]+)\s*L/i.exec(s['排氣量'] || '');
  const seats = /(\d+)\s*座/.exec(s['車門乘客'] || '');

  /* 領牌年月藏在標籤裡:「2003/05領牌」 */
  let regDate = null;
  for (const k of Object.keys(s)) {
    const r = /(\d{4})\s*\/\s*(\d{1,2})\s*領牌/.exec(k + ' ' + s[k]);
    if (r) { regDate = r[1] + '-' + String(r[2]).padStart(2, '0'); break; }
  }

  return {
    id: 'IMPORT-' + Date.now().toString(36).toUpperCase(),
    status: 'available',
    listedAt: new Date().toISOString().slice(0, 10),
    powertrain,
    brand, model, trim, year, regDate,
    category: null,
    mileage,
    /* 「里程實拍」只代表有拍一張里程表的照片,不是可查證的來源。
       原廠保養紀錄、第三方驗車報告的行車電腦讀值才算。 */
    mileageSource: null,
    transmission: s['變速系統'] || null,
    displacement: cc ? Math.round(parseFloat(cc[1]) * 1000) : null,
    color: /(\S+色)\s*$/.exec(title) ? /(\S+色)\s*$/.exec(title)[1] : null,
    seats: seats ? +seats[1] : null,
    location: s['所在地'] || null,
    sellerId: null,

    price: {
      total: src.priceWan ? Math.round(src.priceWan * WAN) : null,
      breakdown: [],
      negotiable: src.priceWan ? false : true,
      note: null
    },
    priceHistory: [],

    history: {
      accident: null, flood: null, commercial: null, owners: null,
      importType: null, maintenanceRecords: null,
      inspectionReport: null, inspectedBy: null, inspectedAt: null,
      knownIssues: []
    },

    photoSet: { shotAt: null, count: src.photoCount || 0 },
    description: null,
    _source: url
  };
}

/* ------------------------------------------------------------ 稽核 ------ */

/* 直接用站上那份判定邏輯,不另外寫一份 —— 兩份遲早會不一致 */
function loadCore() {
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  const root = path.join(here, '..');
  const win = {
    SELLERS_8898: {},
    matchMedia: () => ({ matches: false }),
    localStorage: { getItem: () => null, setItem: () => {} }
  };
  const ctx = {
    window: win, document: {
      readyState: 'complete', addEventListener: () => {},
      querySelector: () => null,
      documentElement: { setAttribute: () => {}, getAttribute: () => null }
    }
  };
  const src = fs.readFileSync(path.join(root, 'assets', 'core.js'), 'utf8');
  new Function('window', 'document', src)(ctx.window, ctx.document);
  return win.C8898;
}

/* ---------------------------------------------------------------- 主程 -- */

const url = process.argv[2];
if (!url) {
  console.error('用法:node tools/import-listing.mjs <刊登網址>');
  console.error('一次一筆,而且請只匯入你自己的刊登。');
  process.exit(1);
}

console.log('渲染頁面中(SPA 要跑 JS,大約十幾秒)…\n');
const html = render(url);
const src = extract(html);
const car = toCar(src, url);

const C = loadCore();
const sc = C.scoreTransparency(car);

console.log('抓到的資料');
console.log('─'.repeat(58));
console.log(`  車輛      ${car.year || '?'} ${car.brand || '?'} ${car.model || '?'} ${car.trim || ''}`);
console.log(`  標價      ${car.price.total ? C.fmtMoney(car.price.total) + ' 元' : '未標示(可能是電洽)'}`);
console.log(`  里程      ${car.mileage ? C.fmtMoney(car.mileage) + ' km' : '未標示'}`);
console.log(`  所在地    ${car.location || '未標示'}`);
console.log(`  變速      ${car.transmission || '未標示'}`);
/* 刊登頁的圖多半是延遲載入,不捲動抓不到全部。所以這個數字是下限,不要講死。 */
console.log(`  照片      至少 ${car.photoSet.count} 張(延遲載入,可能抓不全)`);

console.log('\n透明度檢核');
console.log('─'.repeat(58));
sc.items.forEach(i => {
  console.log(`  ${i.pass ? '✓' : '✗'} ${i.label.padEnd(6)} ${i.pass ? i.detail : i.why}`);
});
console.log('─'.repeat(58));
console.log(`  ${sc.passed} / ${sc.applicable} 項通過`);

if (!sc.perfect) {
  console.log('\n要在 8898 上架前補齊的欄位');
  console.log('─'.repeat(58));
  const TODO = {
    price:      'price.breakdown —— 車價、過戶規費、驗車、強制險逐條列出,加總要等於 total',
    inspection: 'history.inspectionReport / inspectedBy / inspectedAt —— 第三方驗車報告,180 天內',
    mileage:    'mileageSource —— 里程數字的依據。「賣家表示」不算,要原廠保養紀錄或驗車報告讀值',
    photos:     'photoSet.shotAt 與必拍角度 —— 每張要標拍攝日期,60 天內',
    seller:     'sellerId —— 賣家要完成實名驗證(車商填統編,個人做身分驗證)',
    battery:    'battery.soh / sohSource —— 電池健康度與依據'
  };
  sc.items.filter(i => !i.pass).forEach(i => console.log('  • ' + (TODO[i.key] || i.label)));
  console.log('\n  另外還要填:history 的事故 / 泡水 / 營業車(可以填 true,但不能不填)、');
  console.log('  history.knownIssues(沒有缺陷就送空陣列)、category、description。');
}

const out = 'data/imported-' + car.id + '.js';
fs.writeFileSync(out,
  '/* 由 tools/import-listing.mjs 從既有刊登匯入,缺的欄位一律 null。\n' +
  '   來源:' + url + '\n' +
  '   補齊上面稽核表列出的欄位之後,再貼進 data/cars.js。 */\n\n' +
  'export default ' + JSON.stringify(car, null, 2) + ';\n', 'utf8');

console.log(`\n已寫出 ${out} —— 補齊後再貼進 data/cars.js。`);
