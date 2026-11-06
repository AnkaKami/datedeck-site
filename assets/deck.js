(function () {
  var L = window.DD, D = window.DD_CARDS;
  if (!L || !D) return;
  var lang = L.lang;
  var HEART = 'M50 90 L13 53 A23 23 0 0 1 50 20 A23 23 0 0 1 87 53 Z';
  function logo() {
    var c = function (r, f) { return '<g transform="rotate(' + r + ' 256 420)"><rect x="181" y="120" width="150" height="214" rx="20" fill="' + f + '" stroke="#ff5a36" stroke-width="10"/></g>'; };
    return '<svg viewBox="70 70 372 372" aria-hidden="true"><g transform="translate(0 12)">' + c(-22, '#ffd9cf') + c(22, '#ffd9cf') + c(0, '#fff') + '<path d="' + HEART + '" fill="#ff5a36" transform="translate(211 172.5) scale(0.9)"/></g></svg>';
  }
  var backHTML = '<div class="bk"><b>' + L.back1 + '<br>' + L.back2 + '</b>' + logo() + '<i>' + L.back3 + '</i></div>';
  document.querySelectorAll('.back').forEach(function (b) { b.innerHTML = backHTML; });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function face(c) {
    var s = D.sections[c.s], t = c[lang];
    return '<div class="ticket" style="--c:' + s.color + ';--k:' + s.ink + '">' +
      '<div class="t-head"><span class="t-sec">' + esc(s[lang]) + '</span><span class="t-num">№' + c.id.slice(1) + '</span>' +
      '<svg class="t-ic" viewBox="0 0 84 84" aria-hidden="true">' + D.icons[s.icon] + '</svg></div>' +
      '<div class="t-body"><h3 class="t-title">' + esc(t[0]) + '</h3><p class="t-desc">' + esc(t[1]) + '</p>' +
      '<div class="t-chips"><span class="chip">' + '●●●'.slice(0, c.b) + ' ' + L.budget[c.b] + '</span><span class="chip">' + L.place[c.p] + '</span></div></div></div>';
  }

  var table = document.getElementById('table'), dealt = document.getElementById('dealt');
  var deckEl = table.querySelector('.deck'), btn = document.getElementById('draw'), hint = document.getElementById('hint');
  var cards = [], recent = [], geo = {}, busy = false;

  function layout() {
    var w = table.clientWidth, h = table.clientHeight;
    var cw = Math.round(Math.min(210, w * 0.36, (h - 110) / 1.4 / 1.08));
    var wide = w >= cw * 4.3;
    if (!wide) cw = Math.round(Math.min(210, w * 0.47, (h - 110) / 1.4 / 1.08));
    var ch = cw * 1.4;
    var top = wide ? Math.max(8, (h - 96 - ch) / 2) : 14;
    var deckX = wide ? 0 : (w - cw) / 2, deckY = wide ? top + 10 : top + 6;
    var fanC = wide ? cw * 1.25 + (w - cw * 1.25) / 2 : w / 2;
    var gap = wide ? cw * 0.78 : Math.min(cw * 0.62, (w - cw) / 2 - 6);
    table.style.setProperty('--cw', cw + 'px');
    deckEl.style.setProperty('--dx', deckX + 'px');
    deckEl.style.setProperty('--dy', deckY + 'px');
    deckEl.style.opacity = wide ? 1 : 0;
    geo = { cw: cw, deck: [deckX, deckY], fan: [-1, 0, 1].map(function (i) { return [fanC - cw / 2 + i * gap, top + Math.abs(i) * 14, i * 8]; }), center: [fanC - cw / 2, top - 6] };
    cards.forEach(place);
  }
  function tf(x, y, r, s) { return 'translate(' + x + 'px,' + y + 'px) rotate(' + (r || 0) + 'deg) scale(' + (s || 1) + ')'; }
  function place(el) {
    var st = el._st, g = geo;
    if (st === 'deck') el.style.transform = tf(g.deck[0], g.deck[1], 0);
    else if (st === 'picked') el.style.transform = tf(g.center[0], g.center[1], 0, 1.06);
    else { var f = g.fan[el._i]; el.style.transform = tf(f[0], f[1], f[2]); }
  }
  function choose3() {
    var pool = D.cards.filter(function (c) { return recent.indexOf(c.id) < 0; }), out = [], used = {};
    while (out.length < 3) {
      var c = pool[Math.floor(Math.random() * pool.length)];
      if (used[c.id] || out.some(function (o) { return o.s === c.s; })) continue;
      used[c.id] = 1; out.push(c);
    }
    recent = recent.concat(out.map(function (c) { return c.id; })).slice(-24);
    return out;
  }
  function deal() {
    busy = true;
    hint.textContent = L.hint;
    btn.textContent = L.redraw;
    choose3().forEach(function (c, i) {
      var el = document.createElement('div');
      el.className = 'card';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', c[lang][0]);
      el.innerHTML = '<div class="in"><div class="back">' + backHTML + '</div><div class="face">' + face(c) + '</div></div>';
      el._i = i; el._st = 'deck';
      el.style.transitionDelay = (i * 0.12) + 's';
      place(el);
      dealt.appendChild(el);
      cards.push(el);
      el.addEventListener('click', function () { pick(el); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(el); } });
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        el._st = 'fan'; place(el);
        setTimeout(function () { el.classList.add('up'); }, 520 + i * 120);
      }); });
    });
    setTimeout(function () { cards.forEach(function (el) { el.style.transitionDelay = '0s'; }); busy = false; }, 1300);
  }
  function collect(list, done) {
    list.forEach(function (el) { el.classList.remove('up', 'picked'); el._st = 'deck'; setTimeout(function () { place(el); }, 250); });
    setTimeout(function () { list.forEach(function (el) { el.remove(); }); done && done(); }, 1000);
  }
  function pick(el) {
    if (busy || el._st !== 'fan') return;
    if (!el.classList.contains('up')) el.classList.add('up');
    var rest = cards.filter(function (c) { return c !== el; });
    cards = [el];
    el._st = 'picked'; el.classList.add('picked'); place(el);
    collect(rest);
    hint.textContent = L.picked;
  }
  btn.addEventListener('click', function () {
    if (busy) return;
    busy = true;
    var old = cards; cards = [];
    if (old.length) collect(old, deal); else deal();
  });
  window.addEventListener('resize', layout);
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(deal, 350); });
  else setTimeout(deal, 500);

  var rv = document.getElementById('reveal');
  if (rv) rv.addEventListener('click', function () {
    var pair = rv.closest('.pair'), on = !pair.classList.contains('revealed');
    pair.classList.toggle('revealed', on);
    rv.textContent = on ? rv.dataset.on : rv.dataset.off;
    rv.setAttribute('aria-pressed', on);
  });
})();
