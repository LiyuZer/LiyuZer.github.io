/* Lightweight Matrix rain overlay. Activates when body has class "matrix-rain". */
(function(){
  function ensureThemeLink(){
    // If theme.css isn't linked, inject it (helps pages missing the <link>)
    var has = Array.from(document.styleSheets || []).some(function(ss){
      try { return (ss.href||'').endsWith('theme.css'); } catch(e){ return false; }
    });
    if(!has){
      var existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .some(function(l){ return (l.getAttribute('href')||'').indexOf('theme.css') !== -1; });
      if(!existing){
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'theme.css';
        document.head && document.head.appendChild(link);
      }
    }
  }

  function initRain(){
    var body = document.body;
    if(!body || !body.classList.contains('matrix-rain')) return;
    if(document.querySelector('.matrix-rain-canvas')) return; // prevent duplicates

    var canvas = document.createElement('canvas');
    canvas.className = 'matrix-rain-canvas';
    var ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    var dpr = Math.max(window.devicePixelRatio || 1, 1);
    var width = 0, height = 0;
    var fontSize = 16; // CSS px
    var cols = 0;
    var drops = [];
    var running = true;

    var glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789-=+*<>|';

    function resize(){
      width = Math.floor(window.innerWidth);
      height = Math.floor(window.innerHeight);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.font = fontSize + 'px monospace';
      cols = Math.ceil(width / fontSize);
      drops = new Array(cols);
      for(var i=0;i<cols;i++) drops[i] = Math.floor(Math.random()*height/fontSize);
    }

    function randGlyph(){
      return glyphs.charAt(Math.floor(Math.random()*glyphs.length));
    }

    var last = 0; var interval = 1000/28; // ~28fps for subtle motion
    function frame(ts){
      if(!running){ requestAnimationFrame(frame); return; }
      if(!last) last = ts;
      var delta = ts - last;
      if(delta < interval){ requestAnimationFrame(frame); return; }
      last = ts;

      // Fade the canvas slightly to create trails
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0,0,width,height);

      ctx.fillStyle = '#00ff41';
      for(var i=0;i<cols;i++){
        var x = i * fontSize;
        var y = drops[i] * fontSize;
        ctx.fillText(randGlyph(), x, y);

        if(y > height && Math.random() > 0.975){
          drops[i] = 0;
        } else {
          drops[i] += 1;
        }
      }
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function(){ running = (document.visibilityState !== 'hidden'); });

    resize();
    requestAnimationFrame(frame);
  }

  document.addEventListener('DOMContentLoaded', function(){
    try { ensureThemeLink(); } catch(e){}
    try { initRain(); } catch(e){}
  });
})();
