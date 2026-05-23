class Controls {
  constructor(app) {
    this.app = app;
    this._setupCollapsibles();
    this._setupSegmented();
    this._setupSliders();
    this._setupColors();
    this._setupCheckboxes();
    this._setupSelect();
    this._setupPreviewSize();
    this._setupPresetGrid();
    this._setupMyPresets();
    this._setupPalettePicker();
    this._setupExport();
    this._setupHeaderActions();
  }

  _setupCollapsibles() {
    document.querySelectorAll('.section-header.collapsible').forEach(header => {
      header.addEventListener('click', () => {
        const targetId = header.dataset.target;
        const body = document.getElementById(targetId);
        if (!body) return;
        const isCollapsed = body.classList.contains('hidden');
        body.classList.toggle('hidden', !isCollapsed);
        header.classList.toggle('collapsed', !isCollapsed);
      });
    });
  }

  _setupSegmented() {
    const groups = {
      gridType:    v => this.app.set('gridType', v),
      dotShape:    v => this.app.set('dotShape', v),
      dotColorMode:v => this.app.set('dotColorMode', v),
      gradientDir: v => this.app.set('gradientDir', v),
      mouseEffect: v => this.app.set('mouseEffect', v),
    };

    Object.entries(groups).forEach(([id, fn]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', e => {
        const btn = e.target.closest('.seg-btn');
        if (!btn) return;
        el.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fn(btn.dataset.value);
      });
    });
  }

  _setupSliders() {
    const sliders = [
      ['spacingX',    'valSpacingX',    v => { this.app.set('spacingX', +v); if (document.getElementById('linkSpacing').checked) { this.app.set('spacingY', +v); document.getElementById('spacingY').value = v; document.getElementById('valSpacingY').textContent = v; } }],
      ['spacingY',    'valSpacingY',    v => this.app.set('spacingY', +v)],
      ['rings',       'valRings',       v => this.app.set('rings', +v)],
      ['dotsPerRing', 'valDotsPerRing', v => this.app.set('dotsPerRing', +v)],
      ['dotSize',     'valDotSize',     v => this.app.set('dotSize', +v)],
      ['strokeWidth', 'valStrokeWidth', v => this.app.set('strokeWidth', +v)],
      ['dotOpacity',  'valDotOpacity',  v => this.app.set('dotOpacity', +v)],
      ['animSpeed',   'valAnimSpeed',   v => this.app.set('animSpeed', +v)],
      ['amplitude',   'valAmplitude',   v => this.app.set('amplitude', +v)],
      ['stagger',     'valStagger',     v => this.app.set('stagger', +v)],
      ['frequency',   'valFrequency',   v => this.app.set('frequency', +v)],
      ['noiseSeed',   'valNoiseSeed',   v => this.app.set('noiseSeed', +v)],
      ['opacityMin',  'valOpacityMin',  v => this.app.set('opacityMin', +v)],
      ['opacityMax',  'valOpacityMax',  v => this.app.set('opacityMax', +v)],
      ['mouseRadius', 'valMouseRadius', v => this.app.set('mouseRadius', +v)],
    ];

    sliders.forEach(([id, valId, fn]) => {
      const el = document.getElementById(id);
      const val = document.getElementById(valId);
      if (!el) return;
      el.addEventListener('input', e => {
        if (val) val.textContent = e.target.value;
        fn(e.target.value);
      });
    });

  }

  _setupColors() {
    const pairs = [
      ['bgColor',      'bgColorText',      'bgColor'],
      ['dotColor',     'dotColorText',     'dotColor'],
      ['gradColorA',   'gradColorAText',   'gradColorA'],
      ['gradColorB',   'gradColorBText',   'gradColorB'],
      ['gradColorC',   'gradColorCText',   'gradColorC'],
      ['gradColorD',   'gradColorDText',   'gradColorD'],
      ['gradColorE',   'gradColorEText',   'gradColorE'],
    ];

    pairs.forEach(([pickId, textId, key]) => {
      const pick = document.getElementById(pickId);
      const text = document.getElementById(textId);
      if (!pick || !text) return;

      pick.addEventListener('input', e => {
        text.value = e.target.value;
        this.app.set(key, e.target.value);
      });

      text.addEventListener('input', e => {
        const v = e.target.value;
        if (/^#[0-9a-f]{6}$/i.test(v)) {
          pick.value = v;
          this.app.set(key, v);
        }
      });
    });
  }

  _setupCheckboxes() {
    document.getElementById('mouseInteract').addEventListener('change', e => {
      this.app.set('mouseInteract', e.target.checked);
      document.getElementById('mouseControls').style.display = e.target.checked ? '' : 'none';
    });
  }

  _setupSelect() {
    document.getElementById('animType').addEventListener('change', e => {
      this.app.set('animType', e.target.value);
      this._updateAnimUI(e.target.value);
    });
  }

  _updateAnimUI(animType) {
    document.getElementById('noiseSeedRow').style.display = animType === 'noise' ? '' : 'none';
  }

  _setupPreviewSize() {
    const wEl = document.getElementById('previewW');
    const hEl = document.getElementById('previewH');

    const apply = () => {
      const w = Math.max(100, Math.min(3840, +wEl.value));
      const h = Math.max(100, Math.min(2160, +hEl.value));
      this.app.resizeCanvas(w, h);
    };

    wEl.addEventListener('change', apply);
    hEl.addEventListener('change', apply);

    document.getElementById('btnFitCanvas').addEventListener('click', () => {
      this.app.fitCanvas();
    });

    document.getElementById('btnPause').addEventListener('click', () => {
      this.app.renderer.paused = !this.app.renderer.paused;
      document.getElementById('btnPause').innerHTML = this.app.renderer.paused
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
        : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    });

    document.getElementById('btnReset').addEventListener('click', () => {
      this.app.renderer.reset();
    });
  }

  _setupPresetGrid() {
    const grid = document.getElementById('presetGrid');

    PRESETS.forEach(preset => {
      const card = document.createElement('div');
      card.className = 'preset-card';
      card.dataset.id = preset.id;

      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      card.appendChild(canvas);

      const label = document.createElement('div');
      label.className = 'preset-label';
      label.textContent = preset.name;
      card.appendChild(label);

      card.addEventListener('click', () => {
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.app.applyPreset(preset);
      });

      grid.appendChild(card);

      // Render thumbnail (delayed to let layout settle)
      setTimeout(() => {
        this.app.renderer.renderToCanvas(canvas, preset.config, 800);
      }, 50);
    });
  }

  _setupMyPresets() {
    const STORAGE_KEY = 'dotgrid_saved_presets';

    const loadSaved = () => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
      catch(e) { return []; }
    };

    const saveToDisk = (presets) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    };

    const renderCard = (preset, presets) => {
      const grid = document.getElementById('myPresetGrid');
      const card = document.createElement('div');
      card.className = 'preset-card';
      card.dataset.id = preset.id;

      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      card.appendChild(canvas);

      const label = document.createElement('div');
      label.className = 'preset-label';
      label.textContent = preset.name;
      card.appendChild(label);

      const del = document.createElement('button');
      del.className = 'preset-delete';
      del.innerHTML = '×';
      del.title = 'Delete preset';
      del.addEventListener('click', e => {
        e.stopPropagation();
        const updated = loadSaved().filter(p => p.id !== preset.id);
        saveToDisk(updated);
        card.remove();
        document.getElementById('noPresetsMsg').style.display = updated.length === 0 ? '' : 'none';
      });
      card.appendChild(del);

      card.addEventListener('click', () => {
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.app.applyPreset(preset);
      });

      grid.appendChild(card);
      setTimeout(() => this.app.renderer.renderToCanvas(canvas, preset.config, 800), 50);
    };

    const refresh = () => {
      const grid = document.getElementById('myPresetGrid');
      const noMsg = document.getElementById('noPresetsMsg');
      // Remove all existing custom cards
      grid.querySelectorAll('.preset-card').forEach(c => c.remove());
      const presets = loadSaved();
      noMsg.style.display = presets.length === 0 ? '' : 'none';
      presets.forEach(p => renderCard(p, presets));
    };

    // Save button shows the inline form
    document.getElementById('btnSavePreset').addEventListener('click', () => {
      const form = document.getElementById('savePresetForm');
      form.style.display = '';
      document.getElementById('presetNameInput').value = '';
      document.getElementById('presetNameInput').focus();
    });

    document.getElementById('btnCancelSavePreset').addEventListener('click', () => {
      document.getElementById('savePresetForm').style.display = 'none';
    });

    const confirmSave = () => {
      const name = document.getElementById('presetNameInput').value.trim();
      if (!name) return;
      const preset = { id: 'custom_' + Date.now(), name, config: { ...this.app.cfg } };
      const presets = loadSaved();
      presets.push(preset);
      saveToDisk(presets);
      document.getElementById('savePresetForm').style.display = 'none';
      renderCard(preset, presets);
      document.getElementById('noPresetsMsg').style.display = 'none';
      this.app.toast(`"${name}" saved`);
    };

    document.getElementById('btnConfirmSavePreset').addEventListener('click', confirmSave);
    document.getElementById('presetNameInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') confirmSave();
      if (e.key === 'Escape') document.getElementById('savePresetForm').style.display = 'none';
    });

    // Load any saved presets on startup
    refresh();
  }

  _setupPalettePicker() {
    const container = document.getElementById('palettePicker');
    PALETTES.forEach(palette => {
      const opt = document.createElement('div');
      opt.className = 'palette-option';
      opt.dataset.id = palette.id;

      palette.colors.forEach(c => {
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch';
        swatch.style.background = c;
        opt.appendChild(swatch);
      });

      const name = document.createElement('span');
      name.className = 'palette-name';
      name.textContent = palette.name;
      opt.appendChild(name);

      opt.addEventListener('click', () => {
        container.querySelectorAll('.palette-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        this.app.set('palette', palette.id);
      });

      container.appendChild(opt);
    });

    // Default select first
    container.querySelector('.palette-option')?.classList.add('active');
  }

  _setupExport() {
    let activeTab = 'css';

    document.getElementById('btnExport').addEventListener('click', () => {
      this._refreshExportCode(activeTab);
      document.getElementById('exportModal').style.display = 'flex';
    });

    document.getElementById('btnCloseExport').addEventListener('click', () => {
      document.getElementById('exportModal').style.display = 'none';
    });

    document.getElementById('exportModal').addEventListener('click', e => {
      if (e.target === document.getElementById('exportModal'))
        document.getElementById('exportModal').style.display = 'none';
    });

    document.querySelectorAll('.export-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.export-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        this._refreshExportCode(activeTab);
      });
    });

    document.getElementById('btnCopyExport').addEventListener('click', () => {
      const code = document.getElementById('exportCode').textContent;
      navigator.clipboard.writeText(code).then(() => this.app.toast('Copied to clipboard'));
    });

    document.getElementById('btnDownloadExport').addEventListener('click', () => {
      this.app.exporter.download(activeTab, this.app.cfg);
      this.app.toast('Downloaded');
    });
  }

  _refreshExportCode(tabId) {
    const code = document.getElementById('exportCode');
    code.textContent = this.app.exporter.getCode(tabId, this.app.cfg);
  }

  _setupHeaderActions() {
    document.getElementById('btnShareUrl').addEventListener('click', () => {
      const encoded = btoa(JSON.stringify(this.app.cfg));
      const url = location.origin + location.pathname + '?c=' + encoded;
      navigator.clipboard.writeText(url).then(() => this.app.toast('URL copied to clipboard'));
    });
  }

  // Sync all UI elements from config
  sync(cfg) {
    // Sliders & values
    const sliderMap = {
      spacingX: 'valSpacingX', spacingY: 'valSpacingY',
      rings: 'valRings', dotsPerRing: 'valDotsPerRing',
      dotSize: 'valDotSize', strokeWidth: 'valStrokeWidth',
      dotOpacity: 'valDotOpacity', animSpeed: 'valAnimSpeed',
      amplitude: 'valAmplitude', stagger: 'valStagger',
      frequency: 'valFrequency', noiseSeed: 'valNoiseSeed',
      opacityMin: 'valOpacityMin', opacityMax: 'valOpacityMax',
      mouseRadius: 'valMouseRadius',
    };

    Object.entries(sliderMap).forEach(([key, valId]) => {
      const el = document.getElementById(key);
      const val = document.getElementById(valId);
      if (el && cfg[key] !== undefined) el.value = cfg[key];
      if (val && cfg[key] !== undefined) val.textContent = cfg[key];
    });

    // Segmented
    const segMap = { gridType: cfg.gridType, dotShape: cfg.dotShape, dotColorMode: cfg.dotColorMode, gradientDir: cfg.gradientDir, mouseEffect: cfg.mouseEffect };
    Object.entries(segMap).forEach(([groupId, value]) => {
      const group = document.getElementById(groupId);
      if (!group) return;
      group.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b.dataset.value === value));
    });

    // Colors
    const colorMap = { bgColor: ['bgColor','bgColorText'], dotColor: ['dotColor','dotColorText'], gradColorA: ['gradColorA','gradColorAText'], gradColorB: ['gradColorB','gradColorBText'], gradColorC: ['gradColorC','gradColorCText'], gradColorD: ['gradColorD','gradColorDText'], gradColorE: ['gradColorE','gradColorEText'] };
    Object.entries(colorMap).forEach(([key, [pickId, textId]]) => {
      const pick = document.getElementById(pickId), text = document.getElementById(textId);
      if (pick && cfg[key]) pick.value = cfg[key];
      if (text && cfg[key]) text.value = cfg[key];
    });

    // Select
    const animEl = document.getElementById('animType');
    if (animEl && cfg.animType) animEl.value = cfg.animType;
    this._updateAnimUI(cfg.animType || 'none');

    // Checkboxes
    const mi = document.getElementById('mouseInteract');
    if (mi) mi.checked = !!cfg.mouseInteract;
    document.getElementById('mouseControls').style.display = cfg.mouseInteract ? '' : 'none';

    // Conditional controls
    this._updateColorMode(cfg.dotColorMode);
    this._updateGridType(cfg.gridType);
    this._updateDotShape(cfg.dotShape);

    // Palette
    if (cfg.palette) {
      document.querySelectorAll('.palette-option').forEach(o => {
        o.classList.toggle('active', o.dataset.id === cfg.palette);
      });
    }
  }

  _updateColorMode(mode) {
    document.getElementById('solidColorControls').style.display   = mode === 'solid' ? '' : 'none';
    document.getElementById('gradientColorControls').style.display = mode === 'gradient' ? '' : 'none';
    document.getElementById('paletteColorControls').style.display  = mode === 'palette' ? '' : 'none';
  }

  _updateGridType(type) {
    const isRadial = type === 'radial';
    document.getElementById('radialControls').style.display     = isRadial ? '' : 'none';
    document.getElementById('radialDotsControls').style.display = isRadial ? '' : 'none';
  }

  _updateDotShape(shape) {
    document.getElementById('strokeWidthRow').style.display = (shape === 'ring' || shape === 'cross') ? '' : 'none';
  }
}
