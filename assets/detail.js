/* =============================================================================
 * 8898 — 車輛詳情頁
 *
 * 這頁的規矩:資料是 null 就印「未提供」,絕對不把整列藏起來。
 * 買二手車最貴的代價,都藏在你看不到的那幾格。
 * ========================================================================== */

(function () {
  'use strict';

  var C = window.C8898;
  var main = document.getElementById('main');
  var esc = C.esc;

  var ICON_OK    = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 6.5"/></svg>';
  var ICON_NO    = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_WARN  = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg>';
  var ICON_SHIELD= '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.3-7.5 9.5-4.4-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg>';

  /* 統一的「沒有值就講清楚」渲染。傳 null 進來就印灰色斜體的說明,不留白。 */
  function val(v, fallback) {
    return (v === null || v === undefined || v === '')
      ? '<td class="unknown">' + esc(fallback || '未提供') + '</td>'
      : '<td>' + v + '</td>';
  }

  function row(k, cell) {
    return '<tr><th>' + esc(k) + '</th>' + cell + '</tr>';
  }

  /* 是 / 否 / 不願回答。null 一律顯示成「未提供」而不是「無」——
     把賣家的沉默預設成「沒問題」,買家就是這樣被坑的。
     polarity 決定哪一邊該亮紅色:事故是「有」不好,保養紀錄是「無」不好,
     換過電池則兩邊都只是事實,不該用顏色暗示好壞。 */
  function boolTag(v, yesText, noText, polarity) {
    var good = 'tag no', bad = 'tag yes', neutral = 'tag info';
    var yesCls, noCls;
    if (polarity === 'neutral')      { yesCls = neutral; noCls = neutral; }
    else if (polarity === 'trueGood'){ yesCls = good;    noCls = bad; }
    else                             { yesCls = bad;     noCls = good; }

    if (v === true)  return '<span class="' + yesCls + '">' + esc(yesText) + '</span>';
    if (v === false) return '<span class="' + noCls + '">' + esc(noText) + '</span>';
    return '<span class="tag na">未提供</span>';
  }

  /* ------------------------------------------------------------- 相簿 ---- */

  function gallery(car) {
    var need = C.requiredAngles(car);
    var have = {};
    car.photos.forEach(function (p) { have[p.label] = true; });
    var missing = need.filter(function (a) { return !have[a]; });

    var oldest = 0;
    car.photos.forEach(function (p) {
      var d = C.daysSince(p.shotAt);
      if (d !== null && d > oldest) oldest = d;
    });

    var audit;
    if (!missing.length && oldest <= C.PHOTO_MAX_DAYS) {
      audit = '必拍 ' + need.length + ' 個角度全部到齊,最舊一張拍攝於 ' + oldest + ' 天前。';
    } else {
      var parts = [];
      if (missing.length) parts.push('<b>缺 ' + missing.length + ' 張必拍角度:' + esc(missing.join('、')) + '</b>');
      if (oldest > C.PHOTO_MAX_DAYS) parts.push('<b>照片是 ' + oldest + ' 天前拍的,已超過 ' + C.PHOTO_MAX_DAYS + ' 天的有效期,應重拍</b>');
      audit = parts.join(';');
    }

    var thumbs = car.photos.map(function (p, i) {
      return '<button type="button" data-i="' + i + '" aria-current="' + (i === 0) + '" ' +
             'title="' + esc(p.label) + '">' +
             '<img src="' + C.placeholderPhoto(car, p, i) + '" alt="' + esc(p.label) + '" loading="lazy">' +
             '</button>';
    }).join('');

    var p0 = car.photos[0];
    return '' +
    '<section class="panel">' +
      '<h2>實拍照片 <small>' + car.photos.length + ' 張・每張標示拍攝日期</small></h2>' +
      '<div class="gallery-main">' +
        '<img id="g-main" src="' + C.placeholderPhoto(car, p0, 0, { hideLabel: true }) + '" alt="' + esc(p0.label) + '">' +
        '<div class="cap"><span id="g-label">' + esc(p0.label) + '</span>' +
        '<span id="g-shot" class="num">拍攝於 ' + esc(p0.shotAt || '未標示') +
          (p0.shotAt ? '(' + C.daysSince(p0.shotAt) + ' 天前)' : '') + '</span></div>' +
      '</div>' +
      '<div class="thumbs" id="thumbs">' + thumbs + '</div>' +
      '<p class="photo-audit">' + audit + '</p>' +
    '</section>';
  }

  /* ------------------------------------------------------------- 規格 ---- */

  function specs(car) {
    var pw = C.POWERTRAIN[car.powertrain] || { label: car.powertrain };
    var rows = '' +
      row('出廠年份 / 領牌', '<td class="num">' + car.year + ' 年 / ' + esc(car.regDate) + '</td>') +
      row('車型類別', '<td>' + esc(car.category) + '</td>') +
      row('動力類型', '<td>' + esc(pw.label) + '</td>') +
      row('排氣量', car.displacement
            ? '<td class="num">' + C.fmtMoney(car.displacement) + ' cc</td>'
            : '<td class="unknown">純電車無排氣量</td>') +
      row('變速系統', '<td>' + esc(car.transmission) + '</td>') +
      row('里程數', car.mileage === null || car.mileage === undefined
            ? '<td class="unknown">未標示</td>'
            : '<td class="num">' + C.fmtKm(car.mileage) +
              (car.mileageSource
                ? '<span class="src">依據:' + esc(car.mileageSource) + '</span>'
                : '<span class="src bad">未說明里程依據,等於只有賣家口頭保證</span>') +
              '</td>') +
      row('外觀顏色', '<td>' + esc(car.color) + '</td>') +
      row('座位數', '<td class="num">' + car.seats + ' 人</td>') +
      row('進口方式', '<td>' + esc(car.history.importType || '') + '</td>') +
      row('車輛所在地', '<td>' + esc(car.location) + '</td>') +
      row('刊登狀態', '<td>' + esc(C.STATUS[car.status] || car.status) +
            '・首次上架 ' + esc(car.listedAt) + '(' + C.daysSince(car.listedAt) + ' 天前)</td>');

    return '<section class="panel"><h2>車輛規格</h2><table class="kv"><tbody>' + rows + '</tbody></table></section>';
  }

  /* ------------------------------------------------------------- 電池 ---- */

  function battery(car) {
    if (!C.hasBattery(car)) return '';
    var b = car.battery || {};
    var isPlug = C.isPluggable(car);

    var sohCell;
    if (b.soh === null || b.soh === undefined) {
      sohCell = '<td class="unknown">未提供 SOH 報告 —— 電池是這台車最貴的零件,' +
                '沒有健康度數字等於買一個盲盒</td>';
    } else {
      sohCell = '<td><div class="soh"><span class="val num">' + b.soh + '%</span>' +
                '<span class="track"><span class="fill" style="width:' + b.soh + '%"></span></span></div>' +
                (b.sohSource ? '<span class="src">依據:' + esc(b.sohSource) + '</span>' : '') + '</td>';
    }

    var rows = '' +
      row('電池健康度 SOH', sohCell) +
      row('電池容量', b.capacity ? '<td class="num">' + b.capacity + ' kWh</td>' : val(null));

    if (isPlug) {
      rows += row('實測續航', b.realRange
            ? '<td class="num">' + C.fmtMoney(b.realRange) + ' km<span class="src">冷氣開啟、市區與高速混合實跑</span></td>'
            : val(null, '未提供實測數字')) +
        row('原廠公告續航', b.officialRange ? '<td class="num">' + C.fmtMoney(b.officialRange) + ' km</td>' : val(null)) +
        row('充電規格', (b.chargePorts && b.chargePorts.length)
            ? '<td>' + esc(b.chargePorts.join('、')) + '</td>' : val(null)) +
        row('直流快充峰值', b.maxDcCharge ? '<td class="num">' + b.maxDcCharge + ' kW</td>' : val(null));
    }

    rows += row('電池保固到期', b.warrantyUntil ? '<td class="num">' + esc(b.warrantyUntil) + '</td>' : val(null)) +
            row('是否更換過電池', '<td>' + boolTag(b.replaced, '曾更換', '原廠原裝', 'neutral') + '</td>');

    return '<section class="panel"><h2>動力電池 <small>二手電車最該問清楚的一頁</small></h2>' +
           '<table class="kv"><tbody>' + rows + '</tbody></table></section>';
  }

  /* ------------------------------------------------------------- 履歷 ---- */

  function history(car) {
    var h = car.history;
    var d = C.daysSince(h.inspectedAt);

    var inspCell;
    if (!h.inspectionReport || !h.inspectedAt) {
      inspCell = '<td class="unknown">未提供第三方驗車報告</td>';
    } else {
      var stale = d > C.INSPECTION_MAX_DAYS;
      inspCell = '<td>' + esc(h.inspectedBy || '') +
        '<span class="src' + (stale ? ' bad' : '') + '">' +
        esc(h.inspectedAt) + '(' + d + ' 天前)' +
        (stale ? ' — 已超過 ' + C.INSPECTION_MAX_DAYS + ' 天有效期,車況可能已經不同' : '') +
        '<br>報告檔案:' + esc(h.inspectionReport) + '(示範資料,檔案不存在)</span></td>';
    }

    var rows = '' +
      row('事故紀錄', '<td>' + boolTag(h.accident, '有,已揭露', '無') + '</td>') +
      row('泡水紀錄', '<td>' + boolTag(h.flood, '有,已揭露', '無') + '</td>') +
      row('營業 / 租賃車', '<td>' + boolTag(h.commercial, '是,已揭露', '否') + '</td>') +
      row('前手數', h.owners ? '<td class="num">' + h.owners + ' 手</td>' : val(null)) +
      row('原廠保養紀錄', '<td>' + boolTag(h.maintenanceRecords, '有,可查', '無', 'trueGood') + '</td>') +
      row('第三方驗車', inspCell);

    return '<section class="panel">' +
      '<h2>車輛履歷 <small>「未提供」代表賣家沒有回答,不代表沒有</small></h2>' +
      '<table class="kv"><tbody>' + rows + '</tbody></table></section>';
  }

  /* --------------------------------------------------------- 已知缺陷 ---- */

  function issues(car) {
    var list = car.history.knownIssues || [];
    var body = list.length
      ? '<ul class="issues">' + list.map(function (t) {
          return '<li>' + ICON_WARN + '<span>' + esc(t) + '</span></li>';
        }).join('') + '</ul>'
      : '<ul class="issues none"><li>' + ICON_OK +
        '<span>賣家聲明本車無已知缺陷。這是一項具名聲明,不是空白。</span></li></ul>';

    return '<section class="panel"><h2>已知缺陷 <small>刊登時的必填欄位</small></h2>' + body + '</section>';
  }

  /* ------------------------------------------------------------- 價格 ---- */

  function price(car) {
    var p = car.price;
    var sum = p.breakdown.reduce(function (a, b) { return a + (Number(b.amount) || 0); }, 0);

    var rows = p.breakdown.map(function (b) {
      var zero = !Number(b.amount);
      return '<tr' + (zero ? ' class="zero"' : '') + '>' +
        '<th>' + esc(b.item) + (b.note ? '<span class="note">' + esc(b.note) + '</span>' : '') + '</th>' +
        '<td class="num">' + (zero ? '0' : C.fmtMoney(b.amount)) + '</td></tr>';
    }).join('');

    var mismatch = sum !== p.total
      ? '<p class="cost-mismatch">費用明細加總 ' + C.fmtMoney(sum) +
        ' 元,與標示總價 ' + C.fmtMoney(p.total) + ' 元不符 —— 這台車的「明碼實價」徽章不會亮。</p>'
      : '';

    return '<section class="panel">' +
      '<div class="price-box">' +
        '<div class="big num">' + C.fmtWan(p.total) + '<i>萬</i></div>' +
        '<div class="exact num">NT$ ' + C.fmtMoney(p.total) + '</div>' +
        '<div class="claim">' + ICON_SHIELD + '<span>' + esc(p.note || '') +
          '<br>這個數字就是你要付的全部,沒有「電洽另有優惠」。</span></div>' +
      '</div>' +
      '<table class="cost-table"><tbody>' + rows + '</tbody>' +
        '<tfoot><tr><th>總計</th><td class="num">' + C.fmtMoney(sum) + '</td></tr></tfoot>' +
      '</table>' + mismatch +
    '</section>';
  }

  /* --------------------------------------------------- 價格變動時間軸 ---- */

  function priceTimeline(car) {
    var ph = car.priceHistory;
    if (!ph.length) return '';

    var items = ph.map(function (e, i) {
      var delta = '', cls = 'first', text = '首次刊登價';
      if (i > 0) {
        var diff = e.total - ph[i - 1].total;
        cls = diff < 0 ? 'down' : 'up';
        text = (diff < 0 ? '降 ' : '漲 ') + C.fmtWan(Math.abs(diff)) + ' 萬';
      }
      return '<li><span class="date num">' + esc(e.date) + '</span>' +
             '<span class="num">NT$ ' + C.fmtMoney(e.total) + '</span>' +
             '<span class="delta ' + cls + '">' + text + '</span></li>';
    }).join('');

    return '<section class="panel">' +
      '<h2>價格變動紀錄 <small>擋的是先掛低價再加價</small></h2>' +
      '<ol class="timeline">' + items + '</ol></section>';
  }

  /* --------------------------------------------------------- 透明度檢核 -- */

  function checklist(car, sc) {
    var items = sc.items.map(function (i) {
      return '<li class="' + (i.pass ? 'pass' : 'fail') + '">' +
        '<span class="mark">' + (i.pass ? ICON_OK : ICON_NO) + '</span>' +
        '<span><span class="name">' + esc(i.label) + '</span>' +
        '<span class="why">' + esc(i.pass ? i.detail : i.why) + '</span></span></li>';
    }).join('');

    return '<section class="panel">' +
      '<h2>透明度檢核 <small>全部由資料算出,賣家無法自稱誠信</small></h2>' +
      '<div class="score-head">' +
        '<span class="n num">' + sc.passed + '<small> / ' + sc.applicable + ' 項</small></span>' +
        '<span class="small ' + (sc.perfect ? '' : 'muted') + '">' +
          (sc.perfect ? '這台車該交代的都交代了' : '有 ' + (sc.applicable - sc.passed) + ' 項沒過,看下面') +
        '</span>' +
      '</div>' +
      '<ul class="checklist">' + items + '</ul>' +
      '<p class="pad tiny faint">判定規則全部公開在<a href="../how-it-works/index.html">防詐機制</a>那頁,' +
      '包含每一項的門檻與為什麼這樣訂。</p></section>';
  }

  /* ------------------------------------------------------------- 賣家 ---- */

  function seller(car) {
    var s = car.seller || {};
    var verified = !!(s.verified && (s.taxId || s.idVerified));

    var body = '<div class="pad">' +
      '<p class="seller-name">' + (verified ? ICON_SHIELD : '') + esc(s.name || '未提供') + '</p>' +
      '<table class="kv"><tbody>' +
        row('身分', '<td>' + (s.type === 'dealer' ? '車商' : '個人車主') + '</td>') +
        row('統一編號', s.taxId ? '<td class="num">' + esc(s.taxId) + '</td>' : val(null, '未提供(個人賣家)')) +
        row('營業地址', s.address ? '<td>' + esc(s.address) + '</td>' : val(null)) +
        row('實名驗證', s.verifiedAt
              ? '<td>已驗證・' + esc(s.verifiedAt) + '</td>'
              : '<td class="unknown">未完成實名驗證</td>') +
      '</tbody></table>';

    if (!verified) {
      body += '<div class="seller-warn">' + ICON_WARN +
        '<span>這位賣家沒有完成實名驗證。我們照樣讓他刊登,但這件事必須讓你看見 —— ' +
        '匿名交易一旦出事,你連對象是誰都查不到。看車請約在有監視器的公開場所,' +
        '過戶前務必核對行照與賣家身分證件是否一致。</span></div>';
    }

    body += '<p class="tiny faint mt">' +
      '這則刊登有問題?<a href="../about/index.html#report">回報給我們</a>。</p></div>';

    return '<section class="panel"><h2>賣家</h2>' + body + '</section>';
  }

  /* ----------------------------------------------------------- 主流程 ---- */

  function notFound(id) {
    main.innerHTML = '<div class="empty standalone">' +
      '<p>找不到編號 ' + esc(id || '(未指定)') + ' 的車輛。</p>' +
      '<a class="btn" href="../index.html">回到找車</a></div>';
  }

  function render() {
    var id = new URLSearchParams(location.search).get('id');
    var car = id ? C.byId(id) : null;
    if (!car) return notFound(id);

    var sc = C.scoreTransparency(car);
    var pw = C.POWERTRAIN[car.powertrain] || { label: car.powertrain };
    var title = car.year + ' ' + car.brand + ' ' + car.model + ' ' + car.trim;
    document.title = title + ' — 8898';

    main.innerHTML = '' +
      '<nav class="breadcrumb"><a href="../index.html">找車</a><span>›</span>' +
        '<span>' + esc(car.brand) + '</span><span>›</span><span>' + esc(title) + '</span></nav>' +

      '<div class="detail-head">' +
        '<h1>' + esc(title) + '</h1>' +
        '<div class="sub num">' +
          '<span>' + esc(pw.label) + '</span><span>・</span>' +
          '<span>' + C.fmtKm(car.mileage) + '</span><span>・</span>' +
          '<span>' + esc(car.location) + '</span><span>・</span>' +
          '<span>上架 ' + C.daysSince(car.listedAt) + ' 天</span><span>・</span>' +
          '<span>編號 ' + esc(car.id) + '</span>' +
        '</div>' +
      '</div>' +

      '<div class="detail-grid">' +
        '<div>' +
          gallery(car) + specs(car) + battery(car) + history(car) + issues(car) +
          '<section class="panel"><h2>賣家說明</h2><div class="pad">' +
            esc(car.description) + '</div></section>' +
        '</div>' +
        '<aside>' +
          price(car) + priceTimeline(car) + checklist(car, sc) + seller(car) +
        '</aside>' +
      '</div>';

    wireGallery(car);
  }

  function wireGallery(car) {
    var thumbs = document.getElementById('thumbs');
    if (!thumbs) return;
    var img = document.getElementById('g-main');
    var label = document.getElementById('g-label');
    var shot = document.getElementById('g-shot');

    thumbs.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-i]');
      if (!btn) return;
      var i = +btn.getAttribute('data-i');
      var p = car.photos[i];
      img.src = C.placeholderPhoto(car, p, i, { hideLabel: true });
      img.alt = p.label;
      label.textContent = p.label;
      shot.textContent = '拍攝於 ' + (p.shotAt || '未標示') +
        (p.shotAt ? '(' + C.daysSince(p.shotAt) + ' 天前)' : '');
      Array.prototype.forEach.call(thumbs.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-current', b === btn);
      });
    });
  }

  render();

})();
