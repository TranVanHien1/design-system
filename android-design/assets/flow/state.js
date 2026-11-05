// android-design flow kit: ?state=<name> reveals elements whose data-when lists <name> (space-separated).
// "default" matches when no state is given; "!name" matches every state except name.
// ?theme=dark sets html[data-theme=dark] (tokens.css dark scheme); ?lang=xx sets html[lang].
(function () {
  var q = new URLSearchParams(location.search);
  var state = q.get('state') || 'default';
  var root = document.documentElement;
  root.dataset.state = state;
  if (q.get('theme')) root.dataset.theme = q.get('theme');
  if (q.get('lang')) root.lang = q.get('lang');
  function match(list) {
    var neg = list.filter(function (w) { return w.charAt(0) === '!'; });
    if (list.indexOf(state) >= 0) return true;
    return neg.length > 0 && neg.indexOf('!' + state) < 0 && list.filter(function (w) { return w.charAt(0) !== '!'; }).length === 0;
  }
  function apply() {
    document.querySelectorAll('[data-when]').forEach(function (el) {
      if (match(el.getAttribute('data-when').split(/\s+/))) el.classList.add('when-on');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
