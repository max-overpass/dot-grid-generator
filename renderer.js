// ── Simplex-like noise (value noise, no deps) ──
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
  const a = hash(xi, yi), b = hash(xi+1, yi);
  const c = hash(xi, yi+1), d = hash(xi+1, yi+1);
  const sx = smoothstep(xf), sy = smoothstep(yf);
  return a + (b-a)*sx + (c-a)*sy + (a-b-c+d)*sx*sy;
}

// ── Dot generation ──
function generateDots(cfg, W, H) {
  const dots = [];
  const { gridType, spacingX, spacingY, rings, dotsPerRing } = cfg;

  if (gridType === 'square') {
    const offX = (W % spacingX) / 2, offY = (H % spacingY) / 2;
    for (let y = offY; y < H + spacingY; y += spacingY)
      for (let x = offX; x < W + spacingX; x += spacingX)
        dots.push({ bx: x, by: y, ix: Math.round(x/spacingX), iy: Math.round(y/spacingY) });

  } else if (gridType === 'hex') {
    const rowH = spacingY * 0.866;
    for (let row = -1; row * rowH < H + rowH; row++) {
      const offset = (row % 2 === 0) ? 0 : spacingX / 2;
      const offX = (W % spacingX) / 2;
      for (let col = -1; col * spacingX < W + spacingX; col++) {
        dots.push({ bx: offX + col * spacingX + offset, by: row * rowH, ix: col, iy: row });
      }
    }

  } else if (gridType === 'radial') {
    dots.push({ bx: W/2, by: H/2, ix: 0, iy: 0 });
    const r = rings || 8, dpr = dotsPerRing || 12;
    const maxR = Math.min(W, H) * 0.45;
    for (let ri = 1; ri <= r; ri++) {
      const radius = (ri / r) * maxR;
      const count = dpr * ri;
      for (let di = 0; di < count; di++) {
        const angle = (di / count) * Math.PI * 2;
        dots.push({ bx: W/2 + Math.cos(angle)*radius, by: H/2 + Math.sin(angle)*radius, ix: di, iy: ri });
      }
    }

  } else if (gridType === 'diagonal') {
    const step = spacingX;
    const diag = step * 0.707;
    for (let row = -2; row * diag < H + step*2; row++) {
      const offset = (row % 2 === 0) ? 0 : step / 2;
      for (let col = -2; col * step < W + step*2; col++) {
        dots.push({ bx: col * step + offset + (W % step)/2, by: row * diag + (H % diag)/2, ix: col, iy: row });
      }
    }
  }

  return dots;
}

// ── Color helpers ──
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

function lerpColor(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return `rgb(${Math.round(ca[0]+(cb[0]-ca[0])*t)},${Math.round(ca[1]+(cb[1]-ca[1])*t)},${Math.round(ca[2]+(cb[2]-ca[2])*t)})`;
}

function lerpMultiColor(colors, t) {
  const n = colors.length;
  if (n === 1) return colors[0];
  const scaled = Math.max(0, Math.min(1, t)) * (n - 1);
  const i = Math.min(Math.floor(scaled), n - 2);
  return lerpColor(colors[i], colors[i + 1], scaled - i);
}

function getDotColor(cfg, bx, by, W, H, palette) {
  const mode = cfg.dotColorMode;
  if (mode === 'solid') return cfg.dotColor || '#4f7fff';

  if (mode === 'gradient') {
    const stops = [cfg.gradColorA, cfg.gradColorB, cfg.gradColorC, cfg.gradColorD, cfg.gradColorE]
      .filter(c => c && c.trim());
    if (stops.length === 0) return '#4f7fff';
    const dir = cfg.gradientDir || 'horizontal';
    let t = 0;
    if (dir === 'horizontal') t = bx / W;
    else if (dir === 'vertical') t = by / H;
    else if (dir === 'diagonal') t = (bx/W + by/H) / 2;
    else if (dir === 'radial') {
      const dx = bx - W/2, dy = by - H/2;
      t = Math.min(Math.sqrt(dx*dx+dy*dy) / (Math.max(W,H)*0.6), 1);
    }
    return lerpMultiColor(stops, t);
  }

  if (mode === 'palette' && palette) {
    const colors = palette.colors;
    const t = ((bx/W + by/H) * colors.length * 0.5) % colors.length;
    const i = Math.floor(t) % colors.length;
    const j = (i + 1) % colors.length;
    return lerpColor(colors[i], colors[j], t - Math.floor(t));
  }

  return '#4f7fff';
}

// ── Draw single dot ──
function drawDot(ctx, x, y, size, shape, strokeWidth, color, alpha) {
  if (alpha <= 0 || size <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'square') {
    ctx.fillRect(x - size, y - size, size * 2, size * 2);
  } else if (shape === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
  } else if (shape === 'ring') {
    ctx.lineWidth = strokeWidth || 1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  } else if (shape === 'cross') {
    const sw = strokeWidth || 1.5;
    ctx.lineWidth = sw;
    ctx.beginPath();
    ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
    ctx.stroke();
  }
}

// ── Renderer class ──
class DotRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.t = 0;
    this.paused = false;
    this.dots = [];
    this.W = 0;
    this.H = 0;
    this.mouse = { x: -9999, y: -9999 };
    this.raf = null;
    this.lastTime = 0;
    this.activePreset = null;
    this.palette = null;
    this._gradCache = null;
  }

  resize(W, H) {
    this.W = W;
    this.H = H;
    this.canvas.width = W;
    this.canvas.height = H;
    this._gradCache = null;
    this.rebuildDots();
  }

  rebuildDots() {
    if (!this.cfg) return;
    this.dots = generateDots(this.cfg, this.W, this.H);
  }

  updateConfig(cfg) {
    const needsRebuild = !this.cfg ||
      cfg.gridType !== this.cfg.gridType ||
      cfg.spacingX !== this.cfg.spacingX ||
      cfg.spacingY !== this.cfg.spacingY ||
      cfg.rings !== this.cfg.rings ||
      cfg.dotsPerRing !== this.cfg.dotsPerRing;

    this.cfg = cfg;
    this._gradCache = null;

    // resolve palette
    if (cfg.dotColorMode === 'palette') {
      this.palette = PALETTES.find(p => p.id === (cfg.palette || 'neon')) || PALETTES[0];
    } else {
      this.palette = null;
    }

    if (needsRebuild) this.rebuildDots();
  }

  getAnimatedValues(dot, t, cfg) {
    const { animType, animSpeed, amplitude, stagger, frequency, opacityMin, opacityMax, noiseSeed } = cfg;
    const speed = (animSpeed / 50) * 0.001;
    const amp = amplitude / 100;
    const oMin = opacityMin / 100, oMax = opacityMax / 100;
    const freq = frequency / 50;

    let scale = 1, alpha = oMax, dx = 0, dy = 0;

    if (animType === 'none') {
      return { scale: 1, alpha: cfg.dotOpacity / 100, dx: 0, dy: 0 };
    }

    const staggerOffset = (stagger / 100) * (dot.ix * 0.3 + dot.iy * 0.3);

    if (animType === 'pulse') {
      const s = Math.sin(t * speed * 6 + staggerOffset);
      scale = 1 + s * amp * 0.8;
      alpha = oMin + (oMax - oMin) * ((s + 1) / 2);

    } else if (animType === 'wave') {
      const s = Math.sin(t * speed * 4 + dot.bx / (this.W / (freq * 4)) + staggerOffset);
      scale = 1 + s * amp * 0.5;
      alpha = oMin + (oMax - oMin) * ((s + 1) / 2);
      dy = s * amp * 3;

    } else if (animType === 'breathe') {
      const cycle = (Math.sin(t * speed * 2 + staggerOffset) + 1) / 2;
      scale = 0.4 + cycle * (1 + amp * 0.5);
      alpha = oMin + (oMax - oMin) * cycle;

    } else if (animType === 'noise') {
      const seed = noiseSeed || 1;
      const nx = dot.bx / (this.W * 0.3 / freq);
      const ny = dot.by / (this.H * 0.3 / freq);
      const n = valueNoise(nx + t * speed * 0.5, ny + t * speed * 0.3, seed);
      scale = 0.2 + n * (1 + amp);
      alpha = oMin + (oMax - oMin) * n;

    } else if (animType === 'spotlight') {
      const wave = (Math.sin(t * speed * 2) + 1) / 2;
      const cx = this.W * (0.3 + 0.4 * Math.sin(t * speed * 0.7));
      const cy = this.H * (0.3 + 0.4 * Math.cos(t * speed * 0.5));
      const dist = Math.hypot(dot.bx - cx, dot.by - cy);
      const r = Math.min(this.W, this.H) * 0.3 * amp;
      const proximity = Math.max(0, 1 - dist / r);
      scale = 0.3 + proximity * 1.5;
      alpha = oMin + (oMax - oMin) * (0.1 + proximity * 0.9);

    } else if (animType === 'orbit') {
      const angle = t * speed * 3 + staggerOffset;
      const r = amp * 4;
      dx = Math.cos(angle) * r;
      dy = Math.sin(angle) * r;
      alpha = oMax;

    } else if (animType === 'flow') {
      const nx = dot.bx / (this.W * 0.4);
      const ny = dot.by / (this.H * 0.4);
      const n = valueNoise(nx + t * speed * 0.3, ny, 77);
      const angle = n * Math.PI * 4;
      dx = Math.cos(angle) * amp * 5;
      dy = Math.sin(angle) * amp * 2;
      alpha = oMin + (oMax - oMin) * (0.5 + n * 0.5);

    } else if (animType === 'ripple') {
      const cx = this.W / 2, cy = this.H / 2;
      const dist = Math.hypot(dot.bx - cx, dot.by - cy);
      const maxDist = Math.hypot(this.W / 2, this.H / 2);
      const phase = dist / (maxDist * 0.3 / freq) - t * speed * 8;
      const s = Math.sin(phase);
      scale = 1 + s * amp * 0.6;
      alpha = oMin + (oMax - oMin) * ((s + 1) / 2);

    } else if (animType === 'cascade') {
      const col = dot.ix || 0, row = dot.iy || 0;
      const offset = (col + row) * (stagger / 100) * 0.5;
      const s = (Math.sin(t * speed * 5 - offset) + 1) / 2;
      scale = 0.1 + s * (1 + amp * 0.5);
      alpha = oMin + (oMax - oMin) * s;
    }

    return { scale: Math.max(0.01, scale), alpha: Math.max(0, Math.min(1, alpha)), dx, dy };
  }

  applyMouseEffect(dot, cfg) {
    if (!cfg.mouseInteract) return { scale: 1, alpha: 1, dx: 0, dy: 0 };
    const { mouseEffect, mouseRadius } = cfg;
    const r = mouseRadius || 120;
    const dist = Math.hypot(dot.bx - this.mouse.x, dot.by - this.mouse.y);
    if (dist > r) return { scale: 1, alpha: 1, dx: 0, dy: 0 };

    const proximity = 1 - dist / r;
    const smooth = smoothstep(proximity);

    if (mouseEffect === 'spotlight') {
      return { scale: 1 + smooth * 1.5, alpha: 0.1 + smooth * 0.9, dx: 0, dy: 0 };
    } else if (mouseEffect === 'repel') {
      const angle = Math.atan2(dot.by - this.mouse.y, dot.bx - this.mouse.x);
      return { scale: 1, alpha: 1, dx: Math.cos(angle) * smooth * r * 0.3, dy: Math.sin(angle) * smooth * r * 0.3 };
    } else if (mouseEffect === 'attract') {
      const angle = Math.atan2(this.mouse.y - dot.by, this.mouse.x - dot.bx);
      return { scale: 1 + smooth * 0.5, alpha: 1, dx: Math.cos(angle) * smooth * r * 0.15, dy: Math.sin(angle) * smooth * r * 0.15 };
    }
    return { scale: 1, alpha: 1, dx: 0, dy: 0 };
  }

  render(timestamp) {
    if (!this.paused) {
      const dt = this.lastTime ? timestamp - this.lastTime : 16;
      this.t += dt;
    }
    this.lastTime = timestamp;

    const { ctx, W, H, cfg, dots } = this;
    if (!cfg || !W || !H) return;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = cfg.bgColor || '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    const { dotShape, dotSize, strokeWidth } = cfg;

    for (const dot of dots) {
      const anim = this.getAnimatedValues(dot, this.t, cfg);
      const mouse = this.applyMouseEffect(dot, cfg);

      const finalScale = anim.scale * mouse.scale;
      const finalAlpha = anim.alpha * mouse.alpha * (cfg.dotOpacity / 100);
      const x = dot.bx + anim.dx + mouse.dx;
      const y = dot.by + anim.dy + mouse.dy;
      const size = dotSize * finalScale;

      const color = getDotColor(cfg, dot.bx, dot.by, W, H, this.palette);
      drawDot(ctx, x, y, size, dotShape, strokeWidth, color, finalAlpha);
    }

    ctx.globalAlpha = 1;
  }

  start() {
    const loop = (ts) => {
      this.render(ts);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  }

  reset() { this.t = 0; this.lastTime = 0; }

  // Render a single static frame to a given canvas (for thumbnails)
  renderToCanvas(canvas, cfg, t = 500) {
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');
    const dots = generateDots(cfg, W, H);
    let palette = null;
    if (cfg.dotColorMode === 'palette') {
      palette = PALETTES.find(p => p.id === (cfg.palette || 'neon')) || PALETTES[0];
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = cfg.bgColor || '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    const fake = new DotRenderer(canvas);
    fake.cfg = cfg;
    fake.W = W; fake.H = H;
    fake.dots = dots;
    fake.palette = palette;
    fake.t = t;

    for (const dot of dots) {
      const anim = fake.getAnimatedValues(dot, t, cfg);
      const finalAlpha = anim.alpha * (cfg.dotOpacity / 100);
      const x = dot.bx + anim.dx;
      const y = dot.by + anim.dy;
      const size = cfg.dotSize * anim.scale;
      const color = getDotColor(cfg, dot.bx, dot.by, W, H, palette);
      drawDot(ctx, x, y, size, cfg.dotShape, cfg.strokeWidth, color, finalAlpha);
    }
    ctx.globalAlpha = 1;
  }
}
