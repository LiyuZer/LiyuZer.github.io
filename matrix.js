/* Lightweight Matrix rain effect (optional). Enabled when <body> has class "matrix-rain" */
(function(){
  const start = () => {
    const body = document.body;
    if (!body || !body.classList.contains('matrix-rain')) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-rain-canvas';
    canvas.setAttribute('aria-hidden','true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    let width = 0, height = 0;
    let fontSize = 16; // base font size; will scale with DPR
    let columns = 0;
    let drops = [];
    const chars = 'アカサタナハマヤラワ012345789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>[]{}/*+-=|';

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      fontSize = Math.max(14, Math.min(22, Math.round(width / 80))); // adaptive
      columns = Math.floor(width / fontSize);
      drops = Array.from({length: columns}, () => Math.floor(Math.random() * -20));
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
    };

    const clearTrail = () => {
      // translucent fill to create trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);
    };

    const draw = () => {
      if (document.hidden) return; // pause when not visible
      clearTrail();
      for (let i = 0; i < drops.length; i++) {
        const text = chars[(Math.random() * chars.length) | 0];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        // glow effect
        ctx.shadowColor = 'rgba(0,255,65,0.35)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#00ff41';
        ctx.fillText(text, x, y);
        // occasionally reset drop to top when off screen
        if (y > height && Math.random() > 0.975) {
          drops[i] = Math.floor(Math.random() * -20);
        }
        drops[i] += 1; // speed
      }
    };

    let rafId;
    const loop = () => {
      draw();
      rafId = requestAnimationFrame(loop);
    };

    const onVis = () => {
      if (document.hidden) return;
      if (!rafId) loop();
    };

    resize();
    loop();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);

    // Clean-up on page unload (not strictly necessary in static sites)
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
