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
    // Giving cards link here with ?amount=2000&freq=once so the box opens with that choice
    var q = new URLSearchParams(location.search);
    if (Number(q.get('amount')) > 0) state.amount = Number(q.get('amount'));
    if (q.get('freq') === 'once') state.monthly = false;
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
      note.textContent = impactFor(state.amount) + (state.monthly && state.amount ? ' Every month, set up as a bank stop order.' : '');
      if (state.monthly) {
        // SnapScan is once-off only, so monthly gifts go to the stop-order steps on Support Us
        cta.textContent = state.amount ? 'Set up ' + fmt(state.amount) + ' a month' : 'Give monthly';
        cta.href = (location.pathname.indexOf('support-us') > -1 ? '' : 'support-us.html') + '#monthly';
        cta.removeAttribute('target');
      } else {
        // Open SnapScan in a new tab with the amount filled in (SnapScan takes the amount in cents)
        cta.textContent = state.amount ? 'Give ' + fmt(state.amount) + ' now' : 'Donate';
        cta.href = SNAPSCAN + (state.amount ? '?amount=' + Math.round(state.amount * 100) : '');
        cta.target = '_blank';
        cta.rel = 'noopener';
      }
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

  // Pop-up YouTube player
  function openVideo(id, title) {
    var d = document.createElement('dialog');
    d.className = 'video-pop';
    d.innerHTML = '<button class="video-pop-close" aria-label="Close video">&times;</button>' +
      '<div class="video-pop-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0&modestbranding=1" title="' + title.replace(/"/g, '') + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
    document.body.appendChild(d);
    var close = function () { d.close(); };
    d.querySelector('.video-pop-close').addEventListener('click', close);
    d.addEventListener('click', function (e) { if (e.target === d) close(); });
    d.addEventListener('close', function () { d.remove(); }); // stops the video
    d.showModal();
  }

  // Video placeholders: play the file when a source is set
  document.querySelectorAll('[data-video]').forEach(function (wrap) {
    var btn = wrap.querySelector('.play');
    var src = wrap.getAttribute('data-video');
    if (!btn || !src) return;
    btn.addEventListener('click', function () {
      var yt = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
      var v;
      if (yt) {
        // YouTube link: play in a pop-up player at the video's own shape; loaded only when clicked
        openVideo(yt[1], btn.getAttribute('aria-label') || 'Video');
        return;
      } else {
        v = document.createElement('video');
        v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
      }
      wrap.appendChild(v); btn.remove();
      var cap = wrap.querySelector('.video-caption'); if (cap) cap.remove();
    });
  });
})();

// Home hero video: stay on the still frame for visitors who have reduced motion switched on
(function () {
  var v = document.querySelector('.hero-video');
  if (!v) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    v.removeAttribute('autoplay');
    v.pause();
    return;
  }
  // Some phones (e.g. iPhones in Low Power Mode) block autoplay: start it on the first touch or scroll instead
  v.muted = true;
  var kick = function () {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  };
  kick();
  ['touchstart', 'scroll', 'click'].forEach(function (ev) {
    window.addEventListener(ev, function once() {
      if (v.paused) kick();
      window.removeEventListener(ev, once);
    }, { passive: true });
  });
})();

// Impact numbers: count up every time they scroll into view
(function () {
  var nums = document.querySelectorAll('.stat b:not(.no-count)'); // dates and other facts are left alone
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!nums.length || reduce || !('IntersectionObserver' in window)) return;
  var run = function (el) {
    var text = el.dataset.final;
    var m = text.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m) return;
    var target = parseInt(m[2].replace(/,/g, ''), 10);
    var commas = m[2].indexOf(',') > -1;
    var token = el.dataset.run = String(Number(el.dataset.run || 0) + 1);
    var start = null, dur = 1600;
    var fmt = function (n) { return commas ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : String(n); };
    var step = function (t) {
      if (el.dataset.run !== token) return; // a newer run took over
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + fmt(Math.round(target * eased)) + m[3];
      if (p < 1) requestAnimationFrame(step); else el.textContent = text;
    };
    el.textContent = m[1] + fmt(0) + m[3];
    requestAnimationFrame(step);
  };
  // Count once the numbers are 30% up from the bottom of the screen...
  var zone = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.target.dataset.armed === '1') { e.target.dataset.armed = '0'; run(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
  // ...and get ready to count again once they have scrolled fully off screen
  var away = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) {
        e.target.dataset.run = String(Number(e.target.dataset.run || 0) + 1);
        e.target.textContent = e.target.dataset.final;
        e.target.dataset.armed = '1';
      }
    });
  });
  nums.forEach(function (el) {
    el.dataset.final = el.textContent;
    el.dataset.armed = '1';
    zone.observe(el);
    away.observe(el);
  });
})();

// Header: slightly see-through once the page is scrolled
(function () {
  var h = document.querySelector('.site-header');
  if (!h) return;
  var update = function () { h.classList.toggle('scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// Forms that are not connected to a sign-up service yet: show a message instead of an error page
(function () {
  document.querySelectorAll('form[action^="["]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.querySelector('.form-note')) return;
      var news = f.classList.contains('news-form');
      var to = news || f.action.indexOf('CONTACT') > -1 ? 'michaela' : 'shaneill';
      var p = document.createElement('p');
      p.className = 'form-note';
      p.setAttribute('role', 'status');
      p.innerHTML = (news ? 'Online sign-up is coming soon. To get the Academy Diary now, email '
                          : 'This form is not switched on yet. Please email ') +
        '<a href="mailto:' + to + '@franschhoekhospitalityacademy.co.za">' + to + '@franschhoekhospitalityacademy.co.za</a>.';
      f.insertAdjacentElement(news ? 'afterend' : 'beforeend', p);
    });
  });
})();

// Newsletter sign-up boxes: send the email to MailerLite without leaving the page
(function () {
  document.querySelectorAll('form[data-mailerlite]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type="submit"]');
      var note = f.nextElementSibling && f.nextElementSibling.classList.contains('form-note') ? f.nextElementSibling : null;
      if (!note) {
        note = document.createElement('p');
        note.className = 'form-note';
        note.setAttribute('role', 'status');
        f.insertAdjacentElement('afterend', note);
      }
      var done = function () {
        f.reset();
        note.textContent = 'Thank you! Please check your inbox and click the link to confirm your sign-up.';
        btn.disabled = false; btn.textContent = 'Sign up';
      };
      var fail = function () {
        note.textContent = 'Sorry, that didn\u2019t work. Please check your email address and try again.';
        btn.disabled = false; btn.textContent = 'Sign up';
      };
      btn.disabled = true; btn.textContent = 'Signing up…';
      var data = new FormData(f);
      fetch(f.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (res) { if (res && res.success === false) fail(); else done(); })
        .catch(function () {
          // If the browser can't read MailerLite's reply, send it anyway; MailerLite still records the sign-up
          fetch(f.action, { method: 'POST', body: data, mode: 'no-cors' }).then(done, fail);
        });
    });
  });
})();

// Contact form: pre-choose the topic when a link sends ?topic=... (e.g. from Support Us)
(function () {
  var sel = document.getElementById('c-about');
  if (!sel) return;
  var topics = {
    volunteer: ['Volunteering my time', "I'd like to share my skills with the students as a guest lecturer or mentor."],
    supplies: ['Donating kitchen supplies or stationery', "I'd like to sponsor kitchen supplies for the Academy."],
    stationery: ['Donating kitchen supplies or stationery', "I'd like to sponsor stationery and printing for the Academy."],
    study: ['Studying at the Academy', ''],
    donate: ['Making a donation', ''],
    certificate: ['Making a donation', "I've made a donation and would like a Section 18A tax certificate. My name, the amount and the date:"],
    sponsor: ['Sponsorship or partnership', ''],
    ambassador: ['Becoming an ambassador', "I'd like to find out about becoming an ambassador for the Academy."]
  };
  var t = topics[new URLSearchParams(location.search).get('topic')];
  if (!t) return;
  sel.value = t[0];
  var msg = document.getElementById('c-msg');
  if (msg && !msg.value && t[1]) msg.value = t[1];
})();

// Contact form: sent to Shaneill's inbox through FormSubmit (formsubmit.co), without leaving the page
(function () {
  document.querySelectorAll('form[data-formsubmit]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type="submit"]');
      var label = btn.textContent;
      var say = function (html) {
        var n = f.querySelector('.form-note');
        if (!n) { n = document.createElement('p'); n.className = 'form-note'; n.setAttribute('role', 'status'); f.appendChild(n); }
        n.innerHTML = html;
      };
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (String(res.success) !== 'true') {
            if (/activat/i.test(res.message || '')) {
              // First message to a new address: FormSubmit emails Shaneill an "Activate Form" link instead of delivering it
              btn.disabled = false; btn.textContent = label;
              say('This form is still being switched on, so your message wasn\u2019t delivered. Please email <a href="mailto:shaneill@franschhoekhospitalityacademy.co.za">shaneill@franschhoekhospitalityacademy.co.za</a> or WhatsApp 081 009 5157.');
              return;
            }
            throw new Error(res.message || 'failed');
          }
          f.reset();
          say(f.classList.contains('apply') ? '<b>Thank you, your application has been sent.</b> Shortlisted applicants will be contacted for an interview.' : '<b>Thank you, your message has been sent.</b> We\u2019ll get back to you soon.');
          btn.textContent = 'Sent';
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = label;
          say('Sorry, your message didn\u2019t send. Please email <a href="mailto:shaneill@franschhoekhospitalityacademy.co.za">shaneill@franschhoekhospitalityacademy.co.za</a> or WhatsApp 081 009 5157.');
        });
    });
  });
})();

// About timeline: hovering, focusing or tapping a year shows its story
(function () {
  var items = document.querySelectorAll('.tl-item');
  var show = function (it) { items.forEach(function (x) { x.classList.toggle('is-active', x === it); }); };
  items.forEach(function (it) {
    it.addEventListener('mouseenter', function () { show(it); });
    it.addEventListener('focus', function () { show(it); });
    it.addEventListener('click', function () { show(it); });
  });
})();

// Cards marked .reveal rise into place as they scroll into view
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.2 });
  els.forEach(function (e) { io.observe(e); });
})();

// About: clicking or tapping a team or ambassador card opens their full story in a pop-up
(function () {
  document.querySelectorAll('.person').forEach(function (p) {
    var open = function () {
      var img = p.querySelector('.ph img');
      var name = p.querySelector('b').textContent;
      var more = p.querySelector('.person-more');
      var d = document.createElement('dialog');
      d.className = 'bio-pop';
      d.setAttribute('aria-label', name);
      d.innerHTML = '<button class="bio-pop-close" aria-label="Close">&times;</button><div class="bio-pop-inner">' +
        '<img src="' + img.getAttribute('src') + '" alt="' + img.alt + '" style="object-position:' + (img.style.objectPosition || '50% 25%') + '">' +
        '<div class="bio-pop-text"><h3></h3>' + more.innerHTML + '</div></div>';
      d.querySelector('h3').textContent = name;
      document.body.appendChild(d);
      d.querySelector('.bio-pop-close').addEventListener('click', function () { d.close(); });
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
      d.addEventListener('close', function () { d.remove(); p.focus(); });
      d.showModal();
    };
    p.addEventListener('click', open);
    p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
})();

// Academy Diary: filter posts by category
(function () {
  var btns = document.querySelectorAll('[data-filter]');
  if (!btns.length) return;
  var items = document.querySelectorAll('[data-cat]');
  var empty = document.querySelector('.diary-empty');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.filter, shown = 0;
      btns.forEach(function (x) {
        var on = x === b;
        x.setAttribute('aria-pressed', String(on));
        x.classList.toggle('btn-ink', on);
        x.classList.toggle('btn-outline', !on);
      });
      items.forEach(function (it) {
        var show = f === 'all' || it.dataset.cat === f;
        it.hidden = !show;
        if (it.id === 'featured') it.closest('section').hidden = !show; // no empty gap where the featured post was
        if (show) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });
  // Links like academy-diary.html?filter=events open with that filter chosen
  var start = new URLSearchParams(location.search).get('filter');
  var startBtn = start && document.querySelector('[data-filter="' + start + '"]');
  if (startBtn) startBtn.click();
})();
