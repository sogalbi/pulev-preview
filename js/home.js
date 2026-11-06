/* PULEV home — campaign slideshow, shop tabs, launch calendar */
(() => {
  /* ───────── Campaign slideshow: moves only when the visitor asks ───────── */
  const root = document.querySelector('[data-showing]');
  if (root) {
    const slides = [...root.querySelectorAll('.showing__slide')];
    const titles = [...root.querySelectorAll('.showing__title')];
    const indexEl = root.querySelector('[data-showing-index]');
    const upNextEl = root.querySelector('[data-showing-upnext]');
    const n = slides.length;
    let current = 0;

    const setActive = (list, i) => list.forEach((el, k) => {
      const on = k === i;
      el.classList.toggle('is-active', on);
      if (on) { el.removeAttribute('aria-hidden'); el.removeAttribute('tabindex'); }
      else { el.setAttribute('aria-hidden', 'true'); el.setAttribute('tabindex', '-1'); }
    });

    const go = (i) => {
      current = (i + n) % n;
      setActive(slides, current);
      setActive(titles, current);
      if (indexEl) indexEl.textContent = String(current + 1).padStart(2, '0');
      const next = titles[(current + 1) % n].querySelector('.showing__brand');
      if (upNextEl && next) upNextEl.textContent = next.textContent;
    };

    root.querySelector('[data-showing-prev]').addEventListener('click', () => go(current - 1));
    root.querySelector('[data-showing-next]').addEventListener('click', () => go(current + 1));

    // swipe on touch screens
    const media = root.querySelector('.showing__media');
    let x0 = null;
    media.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    media.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    });

    go(0);
  }

  /* ───────── Shop tabs (WAI-ARIA tabs, automatic activation) ───────── */
  document.querySelectorAll('[data-tabs]').forEach((wrap) => {
    const tabs = [...wrap.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (e) => {
        const k = e.key;
        let j = null;
        if (k === 'ArrowRight') j = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') j = 0;
        else if (k === 'End') j = tabs.length - 1;
        if (j === null) return;
        e.preventDefault();
        select(tabs[j], true);
      });
    });
  });

  /* ───────── Launch calendar: status follows the real date ───────── */
  const kstDay = (d) => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    return Date.parse(`${parts}T00:00:00Z`);
  };
  const isAndroid = /android/i.test(navigator.userAgent);
  const PLAY = 'https://play.google.com/store/apps/details?id=com.cafe24.ec.pluspulevshop';

  document.querySelectorAll('[data-launch]').forEach((item) => {
    const at = new Date(item.dataset.launch);
    const now = new Date();
    const status = item.querySelector('[data-launch-status]');
    const cta = item.querySelector('[data-launch-cta]');
    if (now >= at) {
      item.classList.add('is-open');
      status.textContent = '지금 판매 중';
      cta.firstChild.textContent = '컬렉션 보기 ';
      cta.href = item.dataset.shop;
      return;
    }
    const days = Math.round((kstDay(at) - kstDay(now)) / 86400000);
    status.textContent = days <= 0 ? '오늘 오픈' : `오픈 D-${days}`;
    if (isAndroid) cta.href = PLAY;
  });

  // keep upcoming launches first, opened ones after
  const list = document.querySelector('[data-launches]');
  if (list) {
    [...list.children]
      .sort((a, b) => (a.classList.contains('is-open') - b.classList.contains('is-open')) || (new Date(a.dataset.launch) - new Date(b.dataset.launch)))
      .forEach((li) => list.appendChild(li));
    // phones: scroll-snap keeps the moved card in view, so start the row at its first card again
    list.scrollLeft = 0;
    requestAnimationFrame(() => { list.scrollLeft = 0; });
  }
})();
