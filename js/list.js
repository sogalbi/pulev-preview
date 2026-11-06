/* PULEV list page — brand filter, sort, load more */
(() => {
  const grid = document.querySelector('[data-plp-grid]');
  if (!grid) return;

  const TOTAL = 1448;              // NEW category size on the live store
  const PER_PAGE = 12;
  const original = [...grid.children];  // products + campaign tiles, in display order
  const products = original.filter((li) => li.classList.contains('product'));
  const chips = [...document.querySelectorAll('[data-filter]')];
  const sortSel = document.querySelector('[data-plp-sort]');
  const countEl = document.querySelector('[data-plp-count]');
  const more = document.querySelector('[data-plp-more]');
  const shownEl = document.querySelector('[data-plp-shown]');
  const progress = document.querySelector('[data-plp-progress]');
  const loadBtn = document.querySelector('[data-plp-load]');
  const nextLink = document.querySelector('[data-plp-next]');
  const maxPage = Math.max(...products.map((p) => Number(p.dataset.page)));

  let page = 1;
  let filter = 'all';
  let sort = 'new';

  const render = () => {
    // order
    const list = sort === 'new'
      ? original
      : [...products].sort((a, b) => (sort === 'low' ? 1 : -1) * (a.dataset.price - b.dataset.price) || a.dataset.index - b.dataset.index);
    list.forEach((li) => grid.appendChild(li));

    // visibility: "all" pages through the list; a brand shows every piece of that brand
    let visible = 0;
    products.forEach((li) => {
      const show = filter === 'all' ? Number(li.dataset.page) <= page : li.dataset.brand === filter;
      li.hidden = !show;
      if (show) visible += 1;
    });
    original.filter((li) => li.hasAttribute('data-story')).forEach((li) => {
      li.hidden = !(filter === 'all' && sort === 'new' && Number(li.dataset.page) <= page);
    });

    countEl.textContent = filter === 'all' ? `전체 ${TOTAL.toLocaleString('en-US')}개` : `${visible}개 상품`;

    const loaded = Math.min(page * PER_PAGE, products.length);
    more.hidden = filter !== 'all';
    shownEl.textContent = loaded;
    progress.style.width = `${Math.max(2, (loaded / TOTAL) * 100)}%`;
    loadBtn.hidden = page >= maxPage;
    nextLink.hidden = page < maxPage;
  };

  chips.forEach((chip) => chip.addEventListener('click', () => {
    filter = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    render();
  }));

  sortSel.addEventListener('change', () => {
    sort = sortSel.value;
    render();
  });

  loadBtn.addEventListener('click', () => {
    page += 1;
    render();
    // move focus to the first newly shown piece
    const first = products.find((p) => Number(p.dataset.page) === page && !p.hidden);
    if (first) first.querySelector('a').focus();
  });

  render();
})();
