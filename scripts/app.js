// ========= helpers =========
function isTouchDevice() {
  return (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) || ('ontouchstart' in window);
}

// ========= 1) typing effect =========
function runTyping() {
  const el = document.getElementById('typewrite');
  if (!el) return;
  const phrases = ['Software Engineer', 'Web Developer'];
  let i = 0;
  let j = 0;
  let del = false;

  function tick() {
    const current = phrases[i];
    el.textContent = current.slice(0, j);

    if (!del && j < current.length) {
      j++
    } else if (del && j > 0) {
      j--;
    } else {
      if (!del) {
        del = true;
        setTimeout(tick, 1000);
        return;
      } else {
        del = false;
        i = (i + 1) % phrases.length;

      }
    }
    const speed = del ? 60 : 120;
    setTimeout(tick, speed);
  }
  tick();
}
// ========= 2) theme toggle =========
function setupThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const root = document.documentElement;

  function syncBtn() {
    const isDark = root.getAttribute('data-theme') === 'dark';
    btn.textContent = isDark ? '☀️' : '🌙';
  }
  btn.addEventListener('click', () => {
    const cur = root.getAttribute('data-theme') || 'light';
    const next = (cur === 'dark') ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { }
    syncBtn();
  });
  syncBtn();
}

// ========= 3) custom cursor (hidden on touch) =========
function setupCustomCursor() {
  const customCursor = document.querySelector('.custom-cursor');
  if (!customCursor) return;
  if (isTouchDevice()) { customCursor.style.display = 'none'; return; }

  document.addEventListener('mousemove', (event) => {
    customCursor.style.top = event.clientY + 'px';
    customCursor.style.left = event.clientX + 'px';
  });
}

// ========= 4) reveal & timeline =========
function setupRevealAndTimeline() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.showNow').forEach(el => revealObserver.observe(el));

  const timeline = document.querySelector('.timelinee');
  if (!timeline) return;

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) timeline.classList.add('active'); });
  }, { threshold: 0.2 });
  timelineObserver.observe(timeline);

  const timelineItems = timeline.querySelectorAll('li');
  const itemObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        itemObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6, rootMargin: '0px 0px -30% 0px' });

  timelineItems.forEach((li, idx) => {
    li.style.transitionDelay = (idx * 120) + 'ms';
    itemObserver.observe(li);
  });
}

// ========= 5) sliders =========
function setupSliders() {
  document.querySelectorAll('.slider').forEach(slider => {
    const images = slider.querySelectorAll('img');
    if (!images.length) return;
    let currentIndex = 0;
    images[0].classList.add('active');
    setInterval(() => {
      images[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].classList.add('active');
    }, 3000);
  });
}

// ========= 6) contact form =========
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const btn = document.getElementById('sendBtn');
  const msg = document.getElementById('formMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn) btn.disabled = true;
    if (msg) msg.textContent = 'Sending...';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.reset();
        if (msg) msg.textContent = 'Thanks! Your message has been sent ✔';
      } else {
        const data = await res.json().catch(() => ({}));
        if (msg) msg.textContent = (data && data.error) ? data.error : 'Something went wrong. Please try again.';
      }
    } catch (err) {
      if (msg) msg.textContent = 'Network error. Please try again.';
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

// ========= 7) RuhMetro in-page slide (concept ↔ back + swipe) =========
function setupRuhMetroSlide() {
  const card = document.getElementById('ruhMetroCard');
  const openBtn = document.getElementById('openDetail');  // زر "concept →"
  const closeBtn = document.getElementById('closeDetail'); // زر "← back"
  if (!card) return;

  const setState = (open) => {
    if (open) {
      card.classList.add('show-details');
    } else {
      card.classList.remove('show-details');
    }
  };


  if (openBtn) openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setState(true);
  });


  if (closeBtn) closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setState(false);
  });

  // سوايب للجوال: يسار يفتح، يمين يرجع
  let startX = 0;
  card.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].clientX;
  }, { passive: true });

  card.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if (dx <= -50) setState(true);  // سحب يسار = افتح
    if (dx >= 50) setState(false); // سحب يمين = رجع
  }, { passive: true });
}

function setupSliderZoom() {
  const card = document.getElementById('ruhMetroCard');
  if (!card) return;
  const imgs = card.querySelectorAll('.panel-concept .slider img');
  const touch = (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) || ('ontouchstart' in window);

  if (touch) {

    imgs.forEach(img => {
      img.addEventListener('click', () => {
        const nowZoomed = img.classList.toggle('zoomed');

        if (nowZoomed) {
          card.classList.add('show-zoom');
        } else {

          if (!card.querySelector('.panel-concept .slider img.zoomed')) {
            card.classList.remove('show-zoom');
          }
        }
      });
    });
  } else {
    imgs.forEach(img => {
      img.addEventListener('mouseenter', () => card.classList.add('show-zoom'));
      img.addEventListener('mouseleave', () => card.classList.remove('show-zoom'));
    });
  }
}


// ========= init =========
document.addEventListener('DOMContentLoaded', () => {
  runTyping();
  setupThemeToggle();
  setupCustomCursor();
  setupRevealAndTimeline();
  setupSliders();
  setupContactForm();
  setupRuhMetroSlide();
  setupSliderZoom();
});

