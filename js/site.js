// Franschhoek Hospitality Academy — site behaviour
(function () {
  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.getAttribute('data-open') === 'true';
      mobileNav.setAttribute('data-open', open ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  }

  // Donation boxes
  var SNAPSCAN = 'https://pos.snapscan.io/qr/XSVFnKWE';
  function fmt(n) { return 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function impactFor(n) {
    if (!n) return 'Choose an amount to see what it pays for.';
    if (n >= 4000) return 'Supports one student for a whole month.';
    if (n >= 2000) return 'Covers a month of printing and study materials for the class.';
    if (n >= 1000) return 'Pays for about a week of one student’s training.';
    return 'Helps pay for a student’s study materials and kitchen supplies.';
  }
  document.querySelectorAll('[data-donate]').forEach(function (box) {
    var state = { monthly: true, amount: 1000 };
    var freqBtns = box.querySelectorAll('[data-freq]');
    var amtBtns = box.querySelectorAll('[data-amount]');
    var other = box.querySelector('[data-other]');
    var note = box.querySelector('[data-impact]');
    var cta = box.querySelector('[data-cta]');
    function render() {
      freqBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', String((b.dataset.freq === 'monthly') === state.monthly));
      });
      amtBtns.forEach(function (b) {
        var n = Number(b.dataset.amount);
        b.textContent = fmt(n) + (state.monthly ? '/mo' : '');
        b.setAttribute('aria-pressed', String(n === state.amount && !(other && other.value)));
      });
      note.textContent = impactFor(state.amount) + (state.monthly && state.amount ? ' Every month.' : '');
      cta.textContent = state.amount ? 'Give ' + fmt(state.amount) + (state.monthly ? ' a month' : '') : 'Donate';
      cta.href = SNAPSCAN;
    }
    freqBtns.forEach(function (b) {
      b.addEventListener('click', function () { state.monthly = b.dataset.freq === 'monthly'; render(); });
    });
    amtBtns.forEach(function (b) {
      b.addEventListener('click', function () { state.amount = Number(b.dataset.amount); if (other) other.value = ''; render(); });
    });
    if (other) other.addEventListener('input', function () { state.amount = Number(other.value) || 0; render(); });
    render();
  });

  // Video placeholders: play the file when a source is set
  document.querySelectorAll('[data-video]').forEach(function (wrap) {
    var btn = wrap.querySelector('.play');
    var src = wrap.getAttribute('data-video');
    if (!btn || !src) return;
    btn.addEventListener('click', function () {
      var v = document.createElement('video');
      v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
      wrap.appendChild(v); btn.remove();
      var cap = wrap.querySelector('.video-caption'); if (cap) cap.remove();
    });
  });
})();
