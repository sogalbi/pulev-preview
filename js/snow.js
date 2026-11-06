/* PULEV holiday — light snowfall over any element marked [data-snow].
   Pauses off-screen and in background tabs; still frame for reduced motion. */
(() => {
  const hosts = document.querySelectorAll('[data-snow]');
  if (!hosts.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  hosts.forEach((host) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'snow';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let w = 0;
    let h = 0;
    let flakes = [];
    let raf = 0;
    let running = false;
    let onScreen = true;

    const flake = (y) => ({
      x: Math.random() * w,
      y: y === undefined ? Math.random() * h : y,
      r: 0.6 + Math.random() * 1.8,
      speed: 0.25 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.5,
    });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      flakes.forEach((f) => {
        ctx.globalAlpha = f.alpha;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(140, Math.round((w * h) / 9000));
      flakes = Array.from({ length: count }, () => flake());
      draw();
    };

    const tick = () => {
      flakes.forEach((f) => {
        f.phase += 0.01;
        f.y += f.speed;
        f.x += Math.sin(f.phase) * 0.35;
        if (f.y > h + 4) Object.assign(f, flake(-4));
      });
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduce || !onScreen || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start(); else stop();
      }).observe(host);
    }
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();
  });
})();
