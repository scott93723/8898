/* =============================================================================
 * 8898 — 首頁車輛列表:搜尋、篩選、排序、渲染
 *
 * 篩選狀態會同步到網址列,所以「80 萬以下、透明度滿分的純電車」這種條件
 * 可以直接複製網址丟給朋友。
 * ========================================================================== */

(function () {
  'use strict';

  var C = window.C8898;
  var form   = document.getElementById('filters');
  var sortEl = document.getElementById('f-sort');
  var grid   = document.getElementById('grid');
  var empty  = document.getElementById('empty');
  var countEl= document.getElementById('count');
  var evBox  = document.getElementById('ev-filters');

  var cars = C.all();

  /* -------------------------------------------------- 下拉選單填入選項 -- */

  function fillSelect(id, values) {
    var el = document.getElementById(id);
    values.sort().forEach(function (v) {
      var o = document.createElement('option');
      o.value = v; o.textContent = v;
      el.appendChild(o);
    });
  }

  function uniq(fn) {
    var seen = {}, out = [];
    cars.forEach(function (c) {
      var v = fn(c);
      if (v && !seen[v]) { seen[v] = true; out.push(v); }
    });
    return out;
  }

  fillSelect('f-brand', uniq(function (c) { return c.brand; }));
  fillSelect('f-category', uniq(function (c) { return c.category; }));
  /* 所在地只取到縣市層級,區級太細會變成一車一個選項 */
  fillSelect('f-location', uniq(function (c) {
    var m = /^.{2,3}?[市縣]/.exec(c.location || '');
    return m ? m[0] : c.location;
  }));

  /* -------------------------------------------------------------- 狀態 -- */

  function state() {
    var d = new FormData(form), s = {};
    d.forEach(function (v, k) { s[k] = v; });
    /* FormData 不會列出沒勾的 checkbox,所以自己補 false */
    ['noacc', 'noflood', 'nocom', 'insp', 'perfect'].forEach(function (k) {
      s[k] = form.elements[k].checked;
    });
    s.sort = sortEl.value;
    return s;
  }

  function readUrl() {
    var p = new URLSearchParams(location.search);
    p.forEach(function (v, k) {
      var el = form.elements[k];
      if (el) {
        if (el.type === 'checkbox') el.checked = (v === '1');
        else el.value = v;
      } else if (k === 'sort') {
        sortEl.value = v;
      }
    });
  }

  function writeUrl(s) {
    var p = new URLSearchParams();
    Object.keys(s).forEach(function (k) {
      var v = s[k];
      if (v === true) p.set(k, '1');
      else if (v && v !== false && !(k === 'sort' && v === 'new')) p.set(k, v);
    });
    var q = p.toString();
    try {
      history.replaceState(null, '', q ? '?' + q : location.pathname);
    } catch (e) {
      /* file:// 下部分瀏覽器會擋 replaceState,不影響功能,忽略 */
    }
  }

  /* ------------------------------------------------------------ 篩選 ---- */

  function match(car, s) {
    var sc = C.scoreTransparency(car);
    var h = car.history || {};
    var b = car.battery || {};

    if (s.q) {
      var hay = (car.brand + ' ' + car.model + ' ' + car.trim + ' ' + car.year).toLowerCase();
      if (hay.indexOf(s.q.trim().toLowerCase()) === -1) return false;
    }
    if (s.power && car.powertrain !== s.power) return false;
    if (s.brand && car.brand !== s.brand) return false;
    if (s.category && car.category !== s.category) return false;
    if (s.loc && (car.location || '').indexOf(s.loc) !== 0) return false;
    if (s.pmin && car.price.total < +s.pmin) return false;
    if (s.pmax && car.price.total > +s.pmax) return false;
    if (s.year && car.year < +s.year) return false;
    if (s.km && (car.mileage === null || car.mileage > +s.km)) return false;

    /* 「不願回答」(null)一律視同不通過 —— 這正是這站要抓的那種賣家 */
    if (s.noacc   && h.accident   !== false) return false;
    if (s.noflood && h.flood      !== false) return false;
    if (s.nocom   && h.commercial !== false) return false;

    if (s.insp && !sc.items.filter(function (i) { return i.key === 'inspection'; })[0].pass) return false;
    if (s.perfect && !sc.perfect) return false;

    if (s.soh   && !(b.soh >= +s.soh)) return false;
    if (s.range && !(b.realRange >= +s.range)) return false;
    if (s.port) {
      var ports = b.chargePorts || [];
      var hit = ports.some(function (p) { return p.indexOf(s.port) === 0; });
      if (!hit) return false;
    }
    return true;
  }

  var SORTERS = {
    'new':        function (a, b) { return a.listedAt < b.listedAt ? 1 : a.listedAt > b.listedAt ? -1 : 0; },
    'price-asc':  function (a, b) { return a.price.total - b.price.total; },
    'price-desc': function (a, b) { return b.price.total - a.price.total; },
    'km-asc':     function (a, b) { return (a.mileage || 0) - (b.mileage || 0); },
    'score':      function (a, b) {
      var sa = C.scoreTransparency(a), sb = C.scoreTransparency(b);
      return (sb.passed / sb.applicable) - (sa.passed / sa.applicable) || sb.passed - sa.passed;
    }
  };

  function sortBy(list, mode) {
    return list.slice().sort(SORTERS[mode] || SORTERS['new']);
  }

  /* ------------------------------------------------------------ 渲染 ---- */

  var ICON_OK   = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 6.5"/></svg>';
  var ICON_NO   = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_DOWN = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';

  /* 沒通過的原因濃縮成兩三個字,卡片上塞得下。完整原因在詳情頁的檢核表。 */
  function shortFail(item) {
    var w = item.why || '';
    if (/缺 /.test(w)) return '不齊';
    if (/超過/.test(w)) return '已過期';
    if (/不符/.test(w)) return '對不起來';
    return '未提供';
  }

  function badges(sc) {
    return sc.items.map(function (i) {
      var why = i.pass ? i.detail : i.why;
      return '<span class="badge ' + (i.pass ? 'pass' : 'fail') + '" title="' + C.esc(why) + '">' +
               (i.pass ? ICON_OK : ICON_NO) +
               '<span class="label">' + C.esc(i.label) + '</span>' +
               (i.pass ? '' : '<span>・' + shortFail(i) + '</span>') +
             '</span>';
    }).join('');
  }

  function scoreBar(sc) {
    var pips = '';
    for (var i = 0; i < sc.applicable; i++) {
      pips += '<i class="' + (i < sc.passed ? 'on' : '') + '"></i>';
    }
    return '<span class="score' + (sc.perfect ? ' perfect' : '') + '">' +
             '<span class="bar">' + pips + '</span>' +
             '<span class="num">' + sc.passed + '/' + sc.applicable + '</span>' +
           '</span>';
  }

  function card(car) {
    var sc = C.scoreTransparency(car);
    var p0 = car.photos[0];
    var pw = C.POWERTRAIN[car.powertrain] || { label: car.powertrain };
    var days = C.daysSince(car.listedAt);

    var drop = '';
    var ph = car.priceHistory;
    if (ph.length > 1 && ph[0].total > car.price.total) {
      drop = '<span class="drop">' + ICON_DOWN + '已降 ' +
             C.fmtWan(ph[0].total - car.price.total) + ' 萬</span>';
    }

    return '' +
    '<a class="car-card" href="car/index.html?id=' + C.esc(car.id) + '">' +
      '<div class="thumb">' +
        '<img src="' + C.placeholderPhoto(car, p0, 0) + '" alt="' +
          C.esc(car.year + ' ' + car.brand + ' ' + car.model + ' ' + (p0 ? p0.label : '')) + '" loading="lazy">' +
        '<span class="flag' + (C.hasBattery(car) ? ' ev' : '') + '">' + C.esc(pw.label) + '</span>' +
        (p0 && p0.shotAt ? '<span class="shot">實拍 ' + C.esc(p0.shotAt) + '</span>' : '') +
      '</div>' +
      '<div class="body">' +
        '<h3>' + car.year + ' ' + C.esc(car.brand) + ' ' + C.esc(car.model) +
          ' <span>' + C.esc(car.trim) + '</span></h3>' +
        '<div class="price-line">' +
          '<b class="num">' + C.fmtWan(car.price.total) + '<i>萬</i></b>' +
          '<span class="full num">NT$' + C.fmtMoney(car.price.total) + ' 含所有費用</span>' +
          drop +
        '</div>' +
        '<div class="spec-line num">' +
          '<span>' + C.fmtKm(car.mileage) + '</span>' +
          '<span>' + C.esc(car.location) + '</span>' +
          '<span>' + C.esc(car.transmission) + '</span>' +
        '</div>' +
        '<div class="badges">' + badges(sc) + '</div>' +
        '<div class="card-foot">' +
          scoreBar(sc) +
          '<span class="tiny faint">上架 ' + days + ' 天</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  }

  /* ------------------------------------------------------------ 主流程 -- */

  function render() {
    var s = state();

    /* 電車專屬條件只有在選了可外充的動力類型時才有意義 */
    evBox.hidden = !(s.power === 'ev' || s.power === 'phev');
    if (evBox.hidden) {
      ['soh', 'range', 'port'].forEach(function (k) { form.elements[k].value = ''; });
      s.soh = s.range = s.port = '';
    }

    writeUrl(s);

    var list = sortBy(cars.filter(function (c) { return match(c, s); }), s.sort);

    grid.innerHTML = list.map(card).join('');
    empty.hidden = list.length > 0;
    countEl.textContent = list.length === cars.length
      ? '全部 ' + cars.length + ' 台車'
      : '符合條件 ' + list.length + ' 台(共 ' + cars.length + ' 台)';
  }

  function reset() {
    form.reset();
    sortEl.value = 'new';
    render();
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  sortEl.addEventListener('change', render);
  document.getElementById('reset').addEventListener('click', reset);
  document.getElementById('reset2').addEventListener('click', reset);

  readUrl();
  render();

})();
