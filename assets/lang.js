(function () {
  var K = 'dd-lang';
  function get() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(K, v); } catch (e) {} }
  document.querySelectorAll('a.lang').forEach(function (a) { a.addEventListener('click', function () { set(a.dataset.lang); }); });
  var p = location.pathname, onHome = p === '/' || p === '/index.html';
  if (onHome && !get()) {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'ru';
    if (!/^(ru|uk|be|kk)/i.test(nav)) location.replace('/en/' + location.hash);
  }
})();
