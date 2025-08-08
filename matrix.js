/* Lightweight helper script. Historically this file rendered "matrix rain".
   It now supports multiple decorative modes. If --site-theme is set to "fractal",
   a small SVG fractal/noise background is injected. If set to "tree" the old
   growing tree is created. Otherwise, legacy matrix rain runs only when body
   contains the matrix-rain class.
*/
(function(){
  function ensureThemeLink(){
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
    // original matrix rain behavior preserved for pages that explicitly want it
    var body = document.body;
    if(!body || !body.classList.contains('matrix-rain')) return;
    if(document.querySelector('.matrix-rain-canvas')) return; // prevent duplicates

    var canvas = document.createElement('canvas');
    canvas.className = 'matrix-rain-canvas';
    var ctx = canvas.getContext('2d');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    var dpr = Math.max(window.devicePixelRatio || 1, 1);
    var width = 0, height = 0;
    var fontSize = 16; // CSS px
    var cols = 0;
    var drops = [];
    var running = true;

    var glyphs = '\u30a2\u30a4\u30a6\u30a8\u30aa\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd\u30bf\u30c1\u30c4\u30c6\u30c8\u30ca\u30cb\u30cc\u30cd\u30ce\u30cf\u30d2\u30d5\u30d8\u30db\u30de\u30df\u30e0\u30e1\u30e2\u30e4\u30e6\u30e8\u30e9\u30ea\u30eb\u30ec\u30ed\u30ef\u30f2\u30f30123456789-=+*<>|';

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

    var last = 0; var interval = 1000/28; // ~28fps subtle
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

  function createTree(){
    if(document.querySelector('#growing-tree')) return;
    var wrap = document.createElement('div');
    wrap.id = 'growing-tree';
    wrap.style.position = 'fixed';
    wrap.style.bottom = '0';
    wrap.style.left = '6vw';
    wrap.style.zIndex = '0';
    wrap.style.pointerEvents = 'none';
    wrap.innerHTML = '\n<svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n  <g transform="translate(20,20)">\n    <path class="tree-path" d="M120 400 C120 300 100 250 110 200 C115 170 140 150 150 120" stroke-linecap="round" stroke-linejoin="round"/>\n    <path class="tree-branch" d="M150 120 C170 110 180 90 210 80"/>\n    <path class="tree-branch" d="M140 140 C120 130 100 110 70 100"/>\n    <path class="tree-branch" d="M130 180 C160 175 180 165 210 160"/>\n    <path class="tree-branch" d="M110 220 C90 210 60 200 40 180"/>\n    <circle class="tree-leaf" cx="210" cy="80" r="6"/>\n    <circle class="tree-leaf" cx="70" cy="100" r="6"/>\n    <circle class="tree-leaf" cx="210" cy="160" r="7"/>\n    <circle class="tree-leaf" cx="40" cy="180" r="7"/>\n    <circle class="tree-leaf" cx="150" cy="110" r="5"/>\n  </g>\n</svg>\n';

    var style = document.createElement('style');
    style.textContent = '\n#growing-tree{ width: 360px; left: 6vw; bottom: 0; opacity: 0.98; transform: translateY(6%); }\n#growing-tree svg{ display:block; width:100%; height:auto; }\n#growing-tree .tree-path, #growing-tree .tree-branch{ stroke: var(--accent, #4fe0c1); fill:none; stroke-linecap: round; stroke-linejoin: round; }\n#growing-tree .tree-path{ stroke-width: 6; stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: growPath 90s linear forwards; }\n#growing-tree .tree-branch{ stroke-width:4; stroke-dasharray: 800; stroke-dashoffset: 800; animation: growPath 70s linear forwards; animation-delay: 4s; }\n#growing-tree .tree-leaf{ fill: var(--accent-2, #7bdcff); opacity: 0; transform-origin:center; animation: leafIn 14s ease forwards; }\n#growing-tree .tree-leaf:nth-of-type(1){ animation-delay: 6s; }\n#growing-tree .tree-leaf:nth-of-type(2){ animation-delay: 9s; }\n#growing-tree .tree-leaf:nth-of-type(3){ animation-delay: 18s; }\n#growing-tree .tree-leaf:nth-of-type(4){ animation-delay: 28s; }\n#growing-tree .tree-leaf:nth-of-type(5){ animation-delay: 36s; }\n@keyframes growPath{ to{ stroke-dashoffset: 0; } }\n@keyframes leafIn{ from{ opacity:0; transform: translateY(6px) scale(0.9); } to{ opacity:1; transform: translateY(0) scale(1); } }\n';

    document.head.appendChild(style);
    document.body.appendChild(wrap);
  }

  function createFractal(){
    if(document.querySelector('#fractal-bg')) return;
    var wrap = document.createElement('div');
    wrap.id = 'fractal-bg';
    wrap.setAttribute('aria-hidden','true');

    // Inline SVG: feTurbulence + animate give an animated fractal/noise texture
    wrap.innerHTML = '\n<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100" role="img">\n  <defs>\n    <filter id="f_noise">\n      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="2">\n        <animate attributeName="baseFrequency" values="0.85;0.95;0.85" dur="60s" repeatCount="indefinite" />\n      </feTurbulence>\n      <feColorMatrix type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 0.8 0" />\n      <feGaussianBlur stdDeviation="0.6" />\n    </filter>\n    <linearGradient id="g_tint" x1="0" x2="1">\n      <stop offset="0%" stop-color="#04212b" stop-opacity="0.9"/>\n      <stop offset="100%" stop-color="#072033" stop-opacity="0.75"/>\n    </linearGradient>\n  </defs>\n  <rect x="0" y="0" width="100" height="100" fill="url(#g_tint)"/>\n  <rect x="0" y="0" width="100" height="100" filter="url(#f_noise)" opacity="0.28" fill="#0fffd0"/>\n  <!-- subtle radial lighten to focus center content -->\n  <radialGradient id="vign" cx="50%" cy="35%" r="70%">\n    <stop offset="0%" stop-color="#0b1620" stop-opacity="0.0"/>\n    <stop offset="100%" stop-color="#000000" stop-opacity="0.45"/>\n  </radialGradient>\n  <rect x="0" y="0" width="100" height="100" fill="url(#vign)"/>\n</svg>\n';

    // Basic CSS to keep the fractal subtle and behind content
    var style = document.createElement('style');
    style.textContent = '\n#fractal-bg{ mix-blend-mode: screen; opacity: 0.95; }\n#fractal-bg svg{ width:100vw; height:100vh; display:block; }\n#fractal-bg rect{ shape-rendering: crispEdges; }\n';

    document.head.appendChild(style);
    document.body.appendChild(wrap);
  }

  document.addEventListener('DOMContentLoaded', function(){
    try{ ensureThemeLink(); } catch(e){}

    var theme = 'default';
    try{ theme = getComputedStyle(document.documentElement).getPropertyValue('--site-theme') || theme; theme = theme.trim(); }catch(e){ theme = theme; }

    if(theme === 'tree'){
      try{ createTree(); } catch(e){}
      return; // skip rain
    }

    if(theme === 'fractal'){
      try{ createFractal(); } catch(e){}
      return; // skip rain
    }

    // otherwise, preserve legacy behavior and run matrix rain if requested
    try{ initRain(); } catch(e){}
  });
})();
