/* PULEV product page — options, total price, like, size guide, phone buy bar */
(() => {
  const form = document.querySelector('[data-buy]');
  if (!form) return;
  const smooth = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  const base = Number(form.dataset.base);
  const totalEl = form.querySelector('[data-total]');
  const mirror = document.querySelector('[data-total-mirror]');
  const qtyInput = form.querySelector('[data-qty-input]');
  const error = form.querySelector('#size-error');
  const sizeChips = error.closest('fieldset').querySelector('.chips');
  const fmt = (n) => `${n.toLocaleString('ko-KR')}원`;

  const extraOf = (name) => {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? Number(el.dataset.extra || 0) : 0;
  };
  const qty = () => {
    let q = parseInt(qtyInput.value, 10);
    if (!Number.isFinite(q)) q = 1;
    q = Math.min(10, Math.max(1, q));
    qtyInput.value = q;
    return q;
  };
  const update = () => {
    const total = (base + extraOf('size')) * qty() + extraOf('gift');
    totalEl.textContent = fmt(total);
    if (mirror) mirror.textContent = fmt(total);
  };

  form.addEventListener('change', (e) => {
    if (e.target.name === 'size') {
      error.hidden = true;
      sizeChips.classList.remove('is-invalid');
    }
    update();
  });
  form.querySelectorAll('[data-qty]').forEach((btn) => btn.addEventListener('click', () => {
    qtyInput.value = qty() + Number(btn.dataset.qty);
    update();
  }));

  // Buy / cart: a size is required. The sample hands the order over to the live store.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.querySelector('input[name="size"]:checked')) {
      error.hidden = false;
      sizeChips.classList.add('is-invalid');
      const first = form.querySelector('input[name="size"]:not(:disabled)');
      if (first) first.focus();
      return;
    }
    window.pulevPreviewSay('디자인 시안이라 실제 주문은 되지 않아요.');
  });

  // Like (desktop button and phone bar stay in sync)
  const likes = document.querySelectorAll('[data-like]');
  likes.forEach((btn) => btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    likes.forEach((b) => b.setAttribute('aria-pressed', String(on)));
  }));

  // Size guide link opens the accordion
  const guideBtn = document.querySelector('[data-open-size]');
  const guide = document.getElementById('size-guide');
  if (guideBtn && guide) guideBtn.addEventListener('click', () => {
    guide.open = true;
    guide.scrollIntoView({ behavior: smooth, block: 'center' });
    guide.querySelector('summary').focus({ preventScroll: true });
  });

  // Phone buy bar: jump to the options, and step aside while the real buttons are on screen
  const bar = document.querySelector('[data-buybar]');
  const jump = document.querySelector('[data-jump-buy]');
  if (jump) jump.addEventListener('click', (e) => {
    e.preventDefault();
    form.scrollIntoView({ behavior: smooth, block: 'start' });
    const first = form.querySelector('input[name="size"]:not(:disabled)');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 450);
  });
  if (bar && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => bar.classList.toggle('is-hidden', entry.isIntersecting), { threshold: 0.4 })
      .observe(form.querySelector('.pdp__actions'));
  }

  // Phone gallery counter
  const gallery = document.querySelector('[data-gallery]');
  const indexEl = document.querySelector('[data-gallery-index]');
  if (gallery && indexEl) gallery.addEventListener('scroll', () => {
    indexEl.textContent = String(Math.round(gallery.scrollLeft / gallery.clientWidth) + 1);
  }, { passive: true });

  update();
})();
