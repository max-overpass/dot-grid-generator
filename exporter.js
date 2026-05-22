function exportCSS(cfg) {
  const { bgColor, dotColor, spacingX, spacingY, dotSize } = cfg;
  const [r,g,b] = hexToRgb(dotColor || '#4f7fff');
  const alpha = (cfg.dotOpacity / 100).toFixed(2);
  const color = `rgba(${r},${g},${b},${alpha})`;
  const bg = bgColor || '#0a0a0f';

  if (cfg.dotShape === 'circle') {
    return `.dot-grid {
  background-color: ${bg};
  background-image: radial-gradient(circle, ${color} ${dotSize}px, transparent ${dotSize}px);
  background-size: ${spacingX}px ${spacingY}px;
}`;
  } else if (cfg.dotShape === 'square') {
    const s = dotSize * 2;
    return `.dot-grid {
  background-color: ${bg};
  background-image:
    linear-gradient(${color} 1px, transparent 1px),
    linear-gradient(90deg, ${color} 1px, transparent 1px);
  background-size: ${spacingX}px ${spacingY}px;
}`;
  }

  return `.dot-grid {
  /* Note: complex dot shapes require canvas or SVG.
     This CSS approximation uses radial-gradient. */
  background-color: ${bg};
  background-image: radial-gradient(circle, ${color} ${dotSize}px, transparent ${dotSize}px);
  background-size: ${spacingX}px ${spacingY}px;
}`;
}

function exportSVG(cfg, W, H) {
  const dots = generateDots(cfg, W, H);
  const { bgColor, dotSize, dotShape, dotColor, dotOpacity, strokeWidth } = cfg;
  const alpha = (dotOpacity / 100).toFixed(2);
  const fill = dotColor || '#4f7fff';

  let palette = null;
  if (cfg.dotColorMode === 'palette') {
    palette = PALETTES.find(p => p.id === (cfg.palette || 'neon')) || PALETTES[0];
  }

  const shapes = dots.map(dot => {
    const color = getDotColor(cfg, dot.bx, dot.by, W, H, palette);
    const x = dot.bx.toFixed(1), y = dot.by.toFixed(1);
    const r = dotSize.toFixed(1);

    if (dotShape === 'circle')
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${alpha}"/>`;
    if (dotShape === 'square')
      return `<rect x="${(dot.bx-dotSize).toFixed(1)}" y="${(dot.by-dotSize).toFixed(1)}" width="${(dotSize*2).toFixed(1)}" height="${(dotSize*2).toFixed(1)}" fill="${color}" opacity="${alpha}"/>`;
    if (dotShape === 'diamond')
      return `<polygon points="${x},${(dot.by-dotSize).toFixed(1)} ${(dot.bx+dotSize).toFixed(1)},${y} ${x},${(dot.by+dotSize).toFixed(1)} ${(dot.bx-dotSize).toFixed(1)},${y}" fill="${color}" opacity="${alpha}"/>`;
    if (dotShape === 'ring')
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth||1}" opacity="${alpha}"/>`;
    if (dotShape === 'cross') {
      const sw = strokeWidth || 1.5;
      return `<line x1="${(dot.bx-dotSize).toFixed(1)}" y1="${y}" x2="${(dot.bx+dotSize).toFixed(1)}" y2="${y}" stroke="${color}" stroke-width="${sw}" opacity="${alpha}"/><line x1="${x}" y1="${(dot.by-dotSize).toFixed(1)}" x2="${x}" y2="${(dot.by+dotSize).toFixed(1)}" stroke="${color}" stroke-width="${sw}" opacity="${alpha}"/>`;
    }
    return '';
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bgColor||'#0a0a0f'}"/>
  ${shapes}
</svg>`;
}

function exportJS(cfg) {
  const clean = Object.fromEntries(
    Object.entries(cfg).map(([k,v]) => [k, typeof v === 'number' ? Math.round(v*100)/100 : v])
  );

  return `// Dot Grid Generator — JS Snippet
// Drop this into your page. Requires a <canvas id="dotCanvas"> element.

const config = ${JSON.stringify(clean, null, 2)};

// Minimal self-contained renderer
(function() {
  const canvas = document.getElementById('dotCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function smoothstep(t) { return t * t * (3 - 2 * t); }
  function valueNoise(x, y, seed) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const s = seed | 0;
    function hash(a, b) {
      let h = (a * 1619 + b * 31337 + s * 6271) | 0;
      h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
      h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
      return ((h >> 16) ^ h) / 2147483647;
    }
    const a = hash(xi,yi), b = hash(xi+1,yi), c = hash(xi,yi+1), d = hash(xi+1,yi+1);
    const sx = smoothstep(xf), sy = smoothstep(yf);
    return a + (b-a)*sx + (c-a)*sy + (a-b-c+d)*sx*sy;
  }

  let t = 0, lastTime = 0;
  const dots = [];
  const { spacingX, spacingY } = config;
  const W = canvas.width, H = canvas.height;
  const offX = (W % spacingX) / 2, offY = (H % spacingY) / 2;
  for (let y = offY; y < H + spacingY; y += spacingY)
    for (let x = offX; x < W + spacingX; x += spacingX)
      dots.push({ bx: x, by: y, ix: Math.round(x/spacingX), iy: Math.round(y/spacingY) });

  function hexToRgb(hex) {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  }

  function frame(ts) {
    t += lastTime ? ts - lastTime : 16;
    lastTime = ts;
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, W, H);
    const speed = (config.animSpeed / 50) * 0.025;
    const amp = config.animSpeed / 100;
    const oMin = config.opacityMin / 100, oMax = config.opacityMax / 100;
    for (const dot of dots) {
      const staggerOffset = (config.stagger / 100) * (dot.ix * 0.3 + dot.iy * 0.3);
      let scale = 1, alpha = oMax;
      if (config.animType === 'pulse') {
        const s = Math.sin(t * speed * 6 + staggerOffset);
        scale = 1 + s * amp * 0.8;
        alpha = oMin + (oMax - oMin) * ((s + 1) / 2);
      } else if (config.animType === 'wave') {
        const s = Math.sin(t * speed * 4 + dot.bx / (W / (config.frequency / 50 * 4)) + staggerOffset);
        scale = 1 + s * amp * 0.5;
        alpha = oMin + (oMax - oMin) * ((s + 1) / 2);
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * (config.dotOpacity / 100)));
      ctx.fillStyle = config.dotColor || '#4f7fff';
      const x = dot.bx, y = dot.by, r = config.dotSize * Math.max(0.01, scale);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();`;
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

class Exporter {
  constructor(renderer) {
    this.renderer = renderer;
  }

  getCode(tabId, cfg) {
    const W = this.renderer.W, H = this.renderer.H;
    switch (tabId) {
      case 'css': return exportCSS(cfg);
      case 'svg': return exportSVG(cfg, W, H);
      case 'js':  return exportJS(cfg);
      case 'png': return '/* Click "Download" to save PNG */\n\n// The canvas will be exported as a PNG image\n// at the current preview dimensions: ' + W + '×' + H;
      default: return '';
    }
  }

  downloadPNG(cfg) {
    const canvas = this.renderer.canvas;
    this.renderer.render(this.renderer.t);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dot-grid.png';
    a.click();
  }

  downloadSVG(cfg) {
    const W = this.renderer.W, H = this.renderer.H;
    const svg = exportSVG(cfg, W, H);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dot-grid.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadCSS(cfg) {
    const css = exportCSS(cfg);
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dot-grid.css';
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadJS(cfg) {
    const js = exportJS(cfg);
    const blob = new Blob([js], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dot-grid.js';
    a.click();
    URL.revokeObjectURL(url);
  }

  download(tabId, cfg) {
    switch (tabId) {
      case 'png': this.downloadPNG(cfg); break;
      case 'svg': this.downloadSVG(cfg); break;
      case 'css': this.downloadCSS(cfg); break;
      case 'js':  this.downloadJS(cfg); break;
    }
  }
}
