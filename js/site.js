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

// Home hero video: stay on the still frame for visitors who have reduced motion switched on
(function () {
  var v = document.querySelector('.hero-video');
  if (v && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    v.removeAttribute('autoplay');
    v.pause();
  }
})();

// Impact numbers: count up from 0 the first time they scroll into view
(function () {
  var nums = document.querySelectorAll('.stat b');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!nums.length || reduce || !('IntersectionObserver' in window)) return;
  var run = function (el) {
    var text = el.textContent;
    var m = text.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m) return;
    var target = parseInt(m[2].replace(/,/g, ''), 10);
    var commas = m[2].indexOf(',') > -1;
    var start = null, dur = 1600;
    var fmt = function (n) { return commas ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : String(n); };
    var step = function (t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + fmt(Math.round(target * eased)) + m[3];
      if (p < 1) requestAnimationFrame(step); else el.textContent = text;
    };
    el.textContent = m[1] + fmt(0) + m[3];
    requestAnimationFrame(step);
  };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.unobserve(e.target); run(e.target); }
    });
  }, { threshold: 0.6 });
  nums.forEach(function (el) { io.observe(el); });
})();
