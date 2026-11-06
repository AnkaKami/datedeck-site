(function () {
  var main = document.getElementById('gift');
  function $(id) { return document.getElementById(id); }
  function stored() { try { return localStorage.getItem('dd-lang'); } catch (e) { return null; } }
  var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'ru';
  var lang = stored() || (/^(ru|uk|be|kk)/i.test(nav) ? 'ru' : 'en');
  var L = JSON.parse(main.dataset.labels);

  var path = location.pathname, m = path.match(/^\/g\/([^/?#]+)/i);
  var raw = new URLSearchParams(location.search).get('c') || (m ? decodeURIComponent(m[1]) : '');
  var clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  var code = clean.length === 8 ? clean.slice(0, 4) + '-' + clean.slice(4) : '';
  var isGift = /^\/g(\/|$)/i.test(path);

  function apply(T) {
    L = Object.assign(L, T);
    document.documentElement.lang = 'en';
    $('g-title').textContent = T.g_title; $('g-lead').textContent = T.g_lead;
    document.querySelector('.code-label').textContent = T.g_code;
    $('open').textContent = T.g_open; $('copy').textContent = T.g_copy;
    document.querySelector('.once').textContent = T.g_once;
    document.querySelectorAll('.g-steps li').forEach(function (li, i) { li.textContent = T.g_steps[i]; });
    var st = document.querySelector('.store span'); if (st) st.innerHTML = '<small>' + T.soon_sub + '</small>' + T.soon;
    var home = document.querySelector('.nf a'); if (home) home.href = '/en/';
    document.querySelectorAll('.brand').forEach(function (b) { b.href = '/en/'; b.querySelector('span').textContent = 'Date Deck'; });
    var lg = document.querySelector('a.lang'); if (lg) { lg.textContent = 'RU'; lg.dataset.lang = 'ru'; lg.href = location.pathname + location.search; lg.onclick = function () { try { localStorage.setItem('dd-lang', 'ru'); } catch (e) {} }; }
    render();
  }
  function render() {
    if (code) {
      $('code').textContent = code;
      $('open').href = 'koloda://g/' + code;
      document.title = L.g_title || document.title;
    } else {
      $('code-box').hidden = true;
      if (!isGift) {
        $('g-title').textContent = L.nf_title; $('g-lead').textContent = L.nf_p;
        document.querySelector('.g-steps').hidden = true;
        document.querySelector('.store').hidden = true;
        document.querySelector('.envelope').hidden = true;
        $('nf').hidden = false;
      } else {
        $('g-lead').textContent = L.g_none;
      }
    }
  }
  $('copy').addEventListener('click', function () {
    var b = this;
    var done = function () { b.textContent = L.g_copied; setTimeout(function () { b.textContent = L.g_copy; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, function () {});
  });
  if (lang === 'en') fetch('/assets/gift-en.json').then(function (r) { return r.json(); }).then(apply).catch(render);
  else render();
})();
