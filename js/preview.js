/* design-draft layer (upload copy only): nothing leaves the draft */
(() => {
  const toast = document.createElement('div');
  toast.className = 'preview-toast';
  toast.setAttribute('role', 'status');
  document.body.append(toast);
  let timer;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('is-on'), 2600);
  };
  window.pulevPreviewSay = say;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.origin === location.origin) return; // the four draft pages and in-page links still work
    e.preventDefault();
    say('디자인 시안이라 실제 쇼핑몰로 연결되지 않아요.');
  }, true);
})();
