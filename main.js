/* ── Custom cursor ── */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let rx = 0, ry = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cursor.style.left = cx + 'px';
  cursor.style.top = cy + 'px';
});

(function animateRing() {
  rx += (cx - rx) * 0.12;
  ry += (cy - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
})();

/* ── Scroll progress bar ── */
const bar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  bar.style.width = pct + '%';
}, { passive: true });

/* ── Fade-up on scroll ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ── Project carousel ── */
(function () {
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const dotsWrap = document.getElementById('carousel-dots');
  const countEl = document.getElementById('carousel-current');
  const totalEl = document.getElementById('carousel-total');

  if (!slides.length) return;

  let current = 0;
  const total = slides.length;

  /* Build dots */
  totalEl.textContent = total;
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(idx, dir) {
    if (idx === current) return;
    const outSlide = slides[current];
    const inSlide = slides[idx];
    const forward = dir !== undefined ? dir : idx > current;

    /* Slide outgoing off-screen */
    outSlide.style.transition = 'none';
    outSlide.style.transform = 'translateX(0)';
    outSlide.style.opacity = '1';

    /* Position incoming off-screen */
    inSlide.style.transition = 'none';
    inSlide.style.transform = `translateX(${forward ? '60px' : '-60px'})`;
    inSlide.style.opacity = '0';
    inSlide.style.display = 'block';

    /* Force reflow */
    inSlide.getBoundingClientRect();

    /* Animate both */
    outSlide.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease';
    outSlide.style.transform = `translateX(${forward ? '-60px' : '60px'})`;
    outSlide.style.opacity = '0';

    inSlide.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease';
    inSlide.style.transform = 'translateX(0)';
    inSlide.style.opacity = '1';

    outSlide.addEventListener('transitionend', function hide() {
      outSlide.style.display = 'none';
      outSlide.removeEventListener('transitionend', hide);
    });

    current = idx;
    updateUI();
  }

  function updateUI() {
    countEl.textContent = current + 1;
    document.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  /* Hide all slides except first */
  slides.forEach((s, i) => {
    if (i !== 0) s.style.display = 'none';
  });

  prevBtn.addEventListener('click', () => { if (current > 0) goTo(current - 1, false); });
  nextBtn.addEventListener('click', () => { if (current < total - 1) goTo(current + 1, true); });

  /* Keyboard navigation when carousel is focused */
  document.getElementById('project-carousel').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { if (current > 0) goTo(current - 1, false); }
    if (e.key === 'ArrowRight') { if (current < total - 1) goTo(current + 1, true); }
  });

  /* Touch / swipe support */
  let touchStartX = null;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0 && current < total - 1) goTo(current + 1, true);
      if (dx > 0 && current > 0) goTo(current - 1, false);
    }
    touchStartX = null;
  }, { passive: true });

  updateUI();
})();