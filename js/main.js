/* PULEV brand page — small, dependency-free behaviours */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = window.matchMedia('(max-width: 767px)');

  /* Header: transparent over the hero, solid after it */
  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('.hero');
  if (header && header.hasAttribute('data-solid')) {
    header.classList.add('is-solid');
  } else if (header && hero && 'IntersectionObserver' in window) {
    const headerH = () => header.offsetHeight || 72;
    let io;
    const watch = () => {
      if (io) io.disconnect();
      io = new IntersectionObserver(
        ([entry]) => header.classList.toggle('is-solid', !entry.isIntersecting),
        { rootMargin: `-${headerH()}px 0px 0px 0px` }
      );
      io.observe(hero);
    };
    watch();
    phone.addEventListener('change', watch);
  } else if (header) {
    header.classList.add('is-solid');
  }

  /* Full-screen menu */
  const menu = document.getElementById('menu');
  const openers = document.querySelectorAll('[data-menu-open]');
  const closer = menu && menu.querySelector('[data-menu-close]');
  let lastFocus = null;

  const focusables = () =>
    [...menu.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null);

  const openMenu = (trigger) => {
    lastFocus = trigger || document.activeElement;
    menu.hidden = false;
    root.classList.add('is-locked');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    requestAnimationFrame(() => {
      menu.classList.add('is-open');
      closer && closer.focus();
    });
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    root.classList.remove('is-locked');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    const done = () => { menu.hidden = true; };
    if (reduceMotion) done();
    else menu.addEventListener('transitionend', done, { once: true });
    lastFocus && lastFocus.focus();
  };

  if (menu) {
    openers.forEach((b) => b.addEventListener('click', () => openMenu(b)));
    closer && closer.addEventListener('click', closeMenu);
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    // in-page links inside the menu should close it
    menu.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* Scroll reveal */
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  const show = (el) => el.classList.add('is-in');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // on phones these rows scroll sideways: reveal the whole row at once
        const row = entry.target.parentElement && entry.target.parentElement.closest('.wall, [data-row]');
        if (phone.matches && row) {
          row.querySelectorAll('[data-reveal]').forEach((el) => { show(el); io.unobserve(el); });
          return;
        }
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* Phone gallery counter */
  const wall = document.querySelector('[data-wall]');
  const indexEl = document.querySelector('[data-wall-index]');
  if (wall && indexEl) {
    const pieces = [...wall.children];
    let ticking = false;
    const update = () => {
      ticking = false;
      const wallLeft = wall.getBoundingClientRect().left;
      let best = 0;
      let bestDist = Infinity;
      pieces.forEach((p, i) => {
        const d = Math.abs(p.getBoundingClientRect().left - wallLeft);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      indexEl.textContent = String(best + 1).padStart(2, '0');
    };
    wall.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }
})();
