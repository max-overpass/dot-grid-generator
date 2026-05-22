const PRESETS = [
  {
    id: 'midnight-pulse',
    name: 'Midnight Pulse',
    config: {
      gridType: 'square', spacingX: 36, spacingY: 36,
      dotShape: 'circle', dotSize: 2.5, dotOpacity: 100,
      bgColor: '#080810', dotColorMode: 'solid', dotColor: '#4f7fff',
      animType: 'pulse', animSpeed: 40, amplitude: 60, stagger: 30, frequency: 50,
      opacityMin: 15, opacityMax: 100, mouseInteract: false
    }
  },
  {
    id: 'aurora-wave',
    name: 'Aurora Wave',
    config: {
      gridType: 'square', spacingX: 30, spacingY: 30,
      dotShape: 'circle', dotSize: 2, dotOpacity: 100,
      bgColor: '#050a10', dotColorMode: 'gradient',
      gradColorA: '#00d4ff', gradColorB: '#9b59b6', gradientDir: 'diagonal',
      animType: 'wave', animSpeed: 35, amplitude: 70, stagger: 20, frequency: 40,
      opacityMin: 10, opacityMax: 100, mouseInteract: false
    }
  },
  {
    id: 'ember-noise',
    name: 'Ember Noise',
    config: {
      gridType: 'square', spacingX: 28, spacingY: 28,
      dotShape: 'circle', dotSize: 3, dotOpacity: 100,
      bgColor: '#0f0500', dotColorMode: 'gradient',
      gradColorA: '#ff6b35', gradColorB: '#ff0066', gradientDir: 'radial',
      animType: 'noise', animSpeed: 25, amplitude: 80, stagger: 0, frequency: 50,
      noiseSeed: 42, opacityMin: 5, opacityMax: 100, mouseInteract: false
    }
  },
  {
    id: 'hex-breathe',
    name: 'Hex Breathe',
    config: {
      gridType: 'hex', spacingX: 40, spacingY: 40,
      dotShape: 'circle', dotSize: 3, dotOpacity: 100,
      bgColor: '#040a08', dotColorMode: 'solid', dotColor: '#00e87a',
      animType: 'breathe', animSpeed: 30, amplitude: 50, stagger: 60, frequency: 50,
      opacityMin: 8, opacityMax: 90, mouseInteract: false
    }
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    config: {
      gridType: 'square', spacingX: 32, spacingY: 32,
      dotShape: 'circle', dotSize: 2, dotOpacity: 100,
      bgColor: '#080808', dotColorMode: 'solid', dotColor: '#ffffff',
      animType: 'spotlight', animSpeed: 60, amplitude: 100, stagger: 0, frequency: 50,
      opacityMin: 3, opacityMax: 100, mouseInteract: true,
      mouseEffect: 'spotlight', mouseRadius: 150
    }
  },
  {
    id: 'cascade',
    name: 'Cascade',
    config: {
      gridType: 'square', spacingX: 40, spacingY: 40,
      dotShape: 'ring', dotSize: 4, dotOpacity: 100, strokeWidth: 1,
      bgColor: '#060610', dotColorMode: 'gradient',
      gradColorA: '#7b61ff', gradColorB: '#00d4ff', gradientDir: 'vertical',
      animType: 'cascade', animSpeed: 45, amplitude: 90, stagger: 80, frequency: 60,
      opacityMin: 0, opacityMax: 100, mouseInteract: false
    }
  },
  {
    id: 'radial-orbit',
    name: 'Radial Orbit',
    config: {
      gridType: 'radial', spacingX: 50, spacingY: 50,
      rings: 8, dotsPerRing: 16,
      dotShape: 'circle', dotSize: 2.5, dotOpacity: 100,
      bgColor: '#07050f', dotColorMode: 'gradient',
      gradColorA: '#c471ed', gradColorB: '#f7797d', gradientDir: 'radial',
      animType: 'orbit', animSpeed: 20, amplitude: 40, stagger: 50, frequency: 50,
      opacityMin: 20, opacityMax: 100, mouseInteract: false
    }
  },
  {
    id: 'matrix-flow',
    name: 'Matrix Flow',
    config: {
      gridType: 'square', spacingX: 24, spacingY: 24,
      dotShape: 'square', dotSize: 2, dotOpacity: 100,
      bgColor: '#000d00', dotColorMode: 'solid', dotColor: '#00ff41',
      animType: 'flow', animSpeed: 55, amplitude: 60, stagger: 40, frequency: 70,
      opacityMin: 0, opacityMax: 80, mouseInteract: false
    }
  },
  {
    id: 'diamond-ripple',
    name: 'Diamond Ripple',
    config: {
      gridType: 'square', spacingX: 36, spacingY: 36,
      dotShape: 'diamond', dotSize: 4, dotOpacity: 100,
      bgColor: '#0a0612', dotColorMode: 'palette', palette: 'neon',
      animType: 'ripple', animSpeed: 30, amplitude: 70, stagger: 0, frequency: 45,
      opacityMin: 10, opacityMax: 100, mouseInteract: true,
      mouseEffect: 'spotlight', mouseRadius: 120
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    config: {
      gridType: 'square', spacingX: 48, spacingY: 48,
      dotShape: 'circle', dotSize: 1.5, dotOpacity: 100,
      bgColor: '#fafafa', dotColorMode: 'solid', dotColor: '#c0c0cc',
      animType: 'none', animSpeed: 50, amplitude: 50, stagger: 0, frequency: 50,
      opacityMin: 20, opacityMax: 100, mouseInteract: false
    }
  }
];

const PALETTES = [
  { id: 'neon',    name: 'Neon',    colors: ['#ff006e','#8338ec','#3a86ff','#06d6a0','#ffbe0b'] },
  { id: 'sunset',  name: 'Sunset',  colors: ['#ff4e50','#f9d423','#fc913a','#ff4e50','#f9d423'] },
  { id: 'ocean',   name: 'Ocean',   colors: ['#0077b6','#00b4d8','#90e0ef','#caf0f8','#023e8a'] },
  { id: 'pastel',  name: 'Pastel',  colors: ['#ffb3c6','#c8b6ff','#b8f0e6','#ffd6a5','#caffbf'] },
  { id: 'mono',    name: 'Mono',    colors: ['#ffffff','#cccccc','#999999','#666666','#333333'] },
  { id: 'candy',   name: 'Candy',   colors: ['#ff79c6','#bd93f9','#50fa7b','#f1fa8c','#8be9fd'] },
];
