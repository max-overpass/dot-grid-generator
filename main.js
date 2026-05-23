const DEFAULT_CONFIG = {
  // Grid
  gridType: 'square',
  spacingX: 40,
  spacingY: 40,
  rings: 8,
  dotsPerRing: 12,

  // Dots
  dotShape: 'circle',
  dotSize: 3,
  strokeWidth: 1,
  dotOpacity: 100,

  // Colour
  bgColor: '#0a0a0f',
  dotColorMode: 'solid',
  dotColor: '#4f7fff',
  gradColorA: '#4f7fff',
  gradColorB: '#ff4fa0',
  gradColorC: '#ffb347',
  gradColorD: '#00e87a',
  gradColorE: '#c471ed',
  gradientDir: 'horizontal',
  palette: 'neon',

  // Animation
  animType: 'pulse',
  animSpeed: 50,
  amplitude: 50,
  stagger: 0,
  frequency: 50,
  noiseSeed: 1,
  opacityMin: 20,
  opacityMax: 100,

  // Mouse
  mouseInteract: false,
  mouseEffect: 'spotlight',
  mouseRadius: 120,
};

class App {
  constructor() {
    this.cfg = { ...DEFAULT_CONFIG };
    this._loadFromUrl();

    this.canvas = document.getElementById('dotCanvas');
    this.renderer = new DotRenderer(this.canvas);
    this.exporter = new Exporter(this.renderer);
    this.controls = new Controls(this);

    this._setupMouse();
    this._applyConfig();
    this.controls.sync(this.cfg);

    this.fitCanvas();
    this.renderer.start();
  }

  set(key, value) {
    this.cfg[key] = value;

    if (key === 'dotColorMode') this.controls._updateColorMode(value);
    if (key === 'gridType') this.controls._updateGridType(value);
    if (key === 'dotShape') this.controls._updateDotShape(value);

    this._applyConfig();
  }

  _applyConfig() {
    this.renderer.updateConfig({ ...this.cfg });
  }

  applyPreset(preset) {
    this.cfg = { ...DEFAULT_CONFIG, ...preset.config };
    this._applyConfig();
    this.controls.sync(this.cfg);
  }

  resizeCanvas(w, h) {
    document.getElementById('previewW').value = w;
    document.getElementById('previewH').value = h;
    this.renderer.resize(w, h);
  }

  fitCanvas() {
    const container = document.getElementById('canvasContainer');
    const rect = container.getBoundingClientRect();
    const maxW = Math.floor(rect.width  - 48);
    const maxH = Math.floor(rect.height - 48);

    const targetW = +document.getElementById('previewW').value || 1440;
    const targetH = +document.getElementById('previewH').value || 900;

    const scale = Math.min(1, maxW / targetW, maxH / targetH);
    const w = Math.round(targetW * scale);
    const h = Math.round(targetH * scale);

    // Set CSS size only for display scaling, keep canvas resolution
    this.canvas.style.width  = w + 'px';
    this.canvas.style.height = h + 'px';

    // Only resize internal resolution if never set
    if (!this.renderer.W) {
      this.renderer.resize(targetW, targetH);
    }
  }

  _setupMouse() {
    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.renderer.W / rect.width;
      const scaleY = this.renderer.H / rect.height;
      this.renderer.mouse.x = (e.clientX - rect.left) * scaleX;
      this.renderer.mouse.y = (e.clientY - rect.top) * scaleY;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.renderer.mouse.x = -9999;
      this.renderer.mouse.y = -9999;
    });
  }

  _loadFromUrl() {
    try {
      const params = new URLSearchParams(location.search);
      const c = params.get('c');
      if (c) {
        const parsed = JSON.parse(atob(c));
        this.cfg = { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch(e) {}
  }

  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();

  // Handle canvas resize on window resize
  window.addEventListener('resize', () => {
    window.app.fitCanvas();
  });

  // Apply full canvas resolution after fit
  const w = +document.getElementById('previewW').value || 1440;
  const h = +document.getElementById('previewH').value || 900;
  window.app.renderer.resize(w, h);
  window.app.fitCanvas();
});
