/* Relative posterior density for two scalar weights, shown as a surface or isodensity map. */
(() => {
  function initialize() {
    const canvas = document.getElementById('density-canvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
    const palettes = {
      dark: {
        label: '168,205,200', base: 'rgba(33,83,74,0.09)', frame: 'rgba(105,177,166,0.33)',
        grid: 'rgba(94,150,142,0.23)', mapGrid: 'rgba(115,178,164,0.17)', tick: 'rgba(145,189,178,0.5)',
        floorContour: t => 'rgba(102,218,188,' + (0.15 + t * 0.12) + ')',
        mapContour: t => 'rgba(' + Math.round(46 + 145 * t) + ',' + Math.round(159 + 93 * t) + ',' + Math.round(160 + 54 * t) + ',' + (0.55 + t * 0.45) + ')',
      },
      light: {
        label: '17,56,45', base: 'rgba(86,145,114,0.035)', frame: 'rgba(37,98,77,0.46)',
        grid: 'rgba(55,109,87,0.30)', mapGrid: 'rgba(49,103,83,0.23)', tick: 'rgba(32,76,61,0.65)',
        floorContour: t => 'rgba(41,117,89,' + (0.21 + t * 0.13) + ')',
        mapContour: t => 'rgba(' + Math.round(42 - 29 * t) + ',' + Math.round(127 - 58 * t) + ',' + Math.round(98 - 40 * t) + ',' + (0.68 + t * 0.32) + ')',
      },
    };
    let theme, palette;
    // f(1) = w₁w₂, independent standard normal priors and one Gaussian observation.
    const observation = 1.5;
    const noiseVariance = 0.65 ** 2;
    const xMax = 3, yMax = 3;
    const nx = 84, ny = 84;
    const surfaceHeight = 3.2;
    const likelihoodStates = new Map([[0, 'Prior only'], [1, 'Ordinary posterior'], [4, 'Stronger likelihood']]);
    function makeModel(power) {
      // At fixed positive product, the prior is largest at w₁ = w₂.
      // The maximizing product is max(0, y − σ²/λ), or zero for the prior.
      const modalProduct = power === 0 ? 0 : Math.max(0, observation - noiseVariance / power);
      const logPeak = -modalProduct - power * (observation - modalProduct) ** 2 / (2 * noiseVariance);
      function density(w1, w2) {
        const logPrior = -0.5 * (w1 ** 2 + w2 ** 2);
        const logLikelihood = -((observation - w1 * w2) ** 2) / (2 * noiseVariance);
        return Math.exp(logPrior + power * logLikelihood - logPeak);
      }
      const vertices = [];
      const faces = [];
      for (let j = 0; j <= ny; j++) {
        for (let i = 0; i <= nx; i++) {
          const x = xMax * (2 * i / nx - 1);
          const y = yMax * (2 * j / ny - 1);
          const value = density(x, y);
          vertices.push({ x, y, value });
        }
      }
      vertices.forEach(vertex => { vertex.z = vertex.value * surfaceHeight; });
      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const a = j * (nx + 1) + i;
          const corners = [a, a + 1, a + nx + 2, a + nx + 1];
          const height = corners.reduce((sum, k) => sum + vertices[k].value, 0) / 4;
          const dx = (vertices[a + 1].z - vertices[a].z) / (2 * xMax / nx);
          const dy = (vertices[a + nx + 1].z - vertices[a].z) / (2 * yMax / ny);
          const light = clamp((0.54 * dx - 0.39 * dy + 0.75) / Math.hypot(1, dx, dy), 0, 1);
          const shade = Math.round(8 + 30 * light + 11 * height);
          const opacity = clamp((height - 0.006) * 7.7, 0, 1);
          const strength = Math.sqrt(height);
          const red = Math.round(42 + 100 * strength + 40 * light);
          const green = Math.round(163 + 68 * strength + 23 * light);
          const blue = Math.round(140 + 68 * strength + 27 * light);
          const alpha = clamp((0.32 + strength * 0.54 + light * 0.21) * height / (0.018 + height), 0, 1);
          const shadow = Math.round((1 - light) * strength * 47);
          const greenInk = Math.round(83 + 35 * light - 14 * strength);
          faces.push({
            corners, height,
            x: (vertices[a].x + vertices[a + 1].x) / 2,
            y: (vertices[a].y + vertices[a + nx + 1].y) / 2,
            fill: 'rgba(' + Math.round(shade * 0.4) + ',' + (shade + 17) + ',' + (shade + 10) + ',' + opacity + ')',
            stroke: 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')',
            lightFill: 'rgba(' + (218 - shadow) + ',' + (238 - Math.round(shadow * 0.67)) + ',' + (225 - Math.round(shadow * 0.78)) + ',' + opacity + ')',
            lightStroke: 'rgba(16,' + greenInk + ',' + (greenInk - 19) + ',' + alpha + ')',
          });
        }
      }

      function isoline(level) {
        const segments = [];
        for (const { corners, x, y } of faces) {
          const edges = [];
          for (let i = 0; i < 4; i++) {
            const a = vertices[corners[i]];
            const b = vertices[corners[(i + 1) % 4]];
            if ((a.value < level) === (b.value < level)) continue;
            const fraction = (level - a.value) / (b.value - a.value);
            edges.push([a.x + fraction * (b.x - a.x), a.y + fraction * (b.y - a.y)]);
          }
          if (edges.length === 4 && (density(x, y) >= level) !== (vertices[corners[0]].value >= level)) {
            edges.push(edges.shift());
          }
          for (let i = 0; i + 1 < edges.length; i += 2) segments.push([edges[i], edges[i + 1]]);
        }
        return { level, segments };
      }
      const isolines = [0.015, 0.035, 0.065, 0.10, 0.15, 0.22, 0.32, 0.44, 0.57, 0.70, 0.83, 0.94].map(isoline);
      return { vertices, isolines, surfaceFaces: faces.filter(face => face.height >= 0.006) };
    }
    let model, selectedPower;
    let lastSortedYaw;
    const initialYaw = -0.48;
    const initialPitch = 0.45;
    let yaw = initialYaw, pitch = initialPitch;
    let mode = 'surface', drag = null, focusFrame = 0, renderFrame = 0;
    let width = 0, height = 0;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const controls = [...document.querySelectorAll('[data-density-mode]')];
    const powerControls = [...document.querySelectorAll('[data-likelihood-power]')];
    const stateLabel = document.getElementById('density-state');
    const mono = 'ui-monospace, SFMono-Regular, Consolas, monospace';

    function line(a, b, color, weight = 1) {
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.strokeStyle = color;
      context.lineWidth = weight;
      context.stroke();
    }

    function label(text, point, align = 'center', opacity = 0.65) {
      context.textAlign = align;
      context.fillStyle = 'rgba(' + palette.label + ',' + (theme === 'light' ? Math.min(1, opacity + 0.20) : opacity) + ')';
      context.font = (width < 400 ? 9 : 10) + 'px ' + mono;
      context.fillText(text, point.x, point.y);
    }

    function drawContours(project, flat) {
      for (const { level, segments } of model.isolines) {
        context.beginPath();
        for (const [a, b] of segments) {
          const p = project(a[0], a[1], 0);
          const q = project(b[0], b[1], 0);
          context.moveTo(p.x, p.y);
          context.lineTo(q.x, q.y);
        }
        const t = Math.sqrt(level);
        context.strokeStyle = flat ? palette.mapContour(t) : palette.floorContour(t);
        context.lineWidth = flat ? 1.2 + t * 0.3 : 0.78;
        context.stroke();
      }
    }

    function drawSurface() {
      const c = Math.cos(yaw), s = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const raw = (x, y, z) => ({ x: c * x - s * y, y: (s * x + c * y) * sp - cp * z });
      const corners = [[-xMax, -yMax], [xMax, -yMax], [xMax, yMax], [-xMax, yMax]];
      // Orbit about the ground origin. Stable horizontal scale keeps foreground
      // points moving with a horizontal drag, even as the bounding box rotates.
      const radius = Math.hypot(xMax, yMax);
      const sideMargin = width < 410 ? 11 : 20;
      const verticalMargin = height < 245 ? 9 : 16;
      const ox = width / 2, oy = height * 0.635;
      const scaleX = Math.min((width - sideMargin * 2) / (2 * radius), height * 0.22);
      const scaleY = Math.min(
        (oy - verticalMargin) / ((surfaceHeight + 0.13) * cp + 1.85 * sp),
        (height - oy - verticalMargin) / (radius * sp),
        scaleX * 1.23,
      );
      const project = (x, y, z) => {
        const p = raw(x, y, z);
        return { x: ox + scaleX * p.x, y: oy + scaleY * p.y };
      };
      const projected = model.vertices.map(v => project(v.x, v.y, v.z + 0.13));

      // Fine guide lines and the four-sided base frame sit below the density mesh.
      const frame = corners.map(p => project(...p, 0));
      context.beginPath();
      frame.forEach((p, i) => i ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y));
      context.closePath();
      context.fillStyle = palette.base;
      context.fill();
      context.lineWidth = 0.7;
      context.strokeStyle = palette.frame;
      context.stroke();
      for (let x = -3; x <= 3; x += 0.5) {
        line(project(x, -yMax, 0), project(x, yMax, 0), palette.grid, 0.65);
      }
      for (let y = -3; y <= 3; y += 0.5) {
        line(project(-xMax, y, 0), project(xMax, y, 0), palette.grid, 0.65);
      }
      drawContours(project, false);

      // Depth-sort cells so that both peaks occlude the grid behind them.
      if (lastSortedYaw !== yaw) {
        model.surfaceFaces.sort((a, b) => (a.x - b.x) * s + (a.y - b.y) * c);
        lastSortedYaw = yaw;
      }
      context.lineJoin = 'round';
      context.lineWidth = width < 430 ? 0.73 : 0.94;
      const lowerX = s >= 0, lowerY = c >= 0;
      for (const face of model.surfaceFaces) {
        const a = projected[face.corners[0]], b = projected[face.corners[1]];
        const d = projected[face.corners[2]], e = projected[face.corners[3]];
        context.beginPath();
        context.moveTo(a.x, a.y); context.lineTo(b.x, b.y);
        context.lineTo(d.x, d.y); context.lineTo(e.x, e.y); context.closePath();
        context.fillStyle = theme === 'light' ? face.lightFill : face.fill;
        context.fill();

        context.beginPath();
        // Each cell draws its two foreground edges after its fill.
        const middle = lowerX ? (lowerY ? d : b) : (lowerY ? e : a);
        const first = lowerX ? (lowerY ? e : a) : (lowerY ? d : b);
        const last = lowerX ? (lowerY ? b : d) : (lowerY ? a : e);
        context.moveTo(first.x, first.y); context.lineTo(middle.x, middle.y); context.lineTo(last.x, last.y);
        context.strokeStyle = theme === 'light' ? face.lightStroke : face.stroke;
        context.stroke();
      }

      const frontY = c >= 0 ? yMax : -yMax;
      const frontX = s >= 0 ? xMax : -xMax;
      const yOffset = Math.sign(frontY);
      const xOffset = Math.sign(frontX);
      for (const tick of [-2, 0, 2]) {
        let p = project(tick, frontY, 0);
        let q = project(tick, frontY + yOffset * 0.08, 0);
        line(p, q, palette.tick, 0.75);
        if (width > 320) label(String(tick).replace('-', '−'), { x: q.x, y: q.y + 10 }, 'center', 0.55);
        p = project(frontX, tick, 0);
        q = project(frontX + xOffset * 0.08, tick, 0);
        line(p, q, palette.tick, 0.75);
        if (width > 320) label(String(tick).replace('-', '−'), { x: q.x + 2, y: q.y + 9 }, 'center', 0.55);
      }
      const p1 = project(-frontX, frontY, 0);
      const p2 = project(frontX, -frontY, 0);
      label('w₁', { x: clamp(p1.x, 12, width - 12), y: p1.y + 13 }, 'center', 0.80);
      label('w₂', { x: clamp(p2.x, 12, width - 12), y: p2.y + 13 }, 'center', 0.80);
    }

    function drawMap() {
      const scale = Math.min((width - 46) / (2 * xMax), (height - 28) / (2 * yMax));
      const project = (x, y) => ({ x: width / 2 + x * scale, y: height / 2 - y * scale });
      for (let x = -3; x <= 3; x += 0.5) {
        line(project(x, -yMax), project(x, yMax), palette.mapGrid, 0.65);
        if (Number.isInteger(x) && x % 2 === 0) label(String(x).replace('-', '−'), project(x, -yMax - 0.15), 'center');
      }
      for (let y = -3; y <= 3; y += 0.5) {
        line(project(-xMax, y), project(xMax, y), palette.mapGrid, 0.65);
        if (Number.isInteger(y) && y % 2 === 0) label(String(y).replace('-', '−'), project(-xMax - 0.10, y - 0.06), 'right');
      }
      drawContours(project, true);
      label('w₁', project(xMax, -yMax - 0.15), 'right', 0.8);
      label('w₂', project(-xMax - 0.10, yMax - 0.1), 'right', 0.8);
    }

    function draw() {
      renderFrame = 0;
      theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
      palette = palettes[theme];
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width < 1 || height < 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
      context.clearRect(0, 0, width, height);
      if (mode === 'surface') drawSurface();
      else drawMap();
      canvas.dataset.painted = 'true';
    }
    function scheduleDraw() {
      if (!renderFrame) renderFrame = requestAnimationFrame(draw);
    }

    function selectPower(power) {
      if (power === selectedPower || !likelihoodStates.has(power)) return;
      model = makeModel(power);
      selectedPower = power;
      lastSortedYaw = undefined;
      canvas.dataset.likelihoodPower = String(power);
      powerControls.forEach(button => {
        const active = Number(button.dataset.likelihoodPower) === power;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('is-active', active);
      });
      if (stateLabel) stateLabel.textContent = likelihoodStates.get(power);
      scheduleDraw();
    }
    powerControls.forEach(button => button.addEventListener('click', () => selectPower(Number(button.dataset.likelihoodPower))));

    function selectMode(next) {
      mode = next === 'contours' ? 'contours' : 'surface';
      canvas.dataset.mode = mode;
      controls.forEach(button => {
        const active = button.dataset.densityMode === mode;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('is-active', active);
      });
      canvas.style.cursor = mode === 'surface' ? 'grab' : 'default';
      // Capture a one-finger orbit on the figure; pinch zoom and page scrolling outside it remain native.
      canvas.style.touchAction = mode === 'surface' ? 'pinch-zoom' : 'auto';
      scheduleDraw();
    }
    controls.forEach(button => button.addEventListener('click', () => selectMode(button.dataset.densityMode)));
    function reset() {
      cancelAnimationFrame(focusFrame);
      const delta = Math.atan2(Math.sin(initialYaw - yaw), Math.cos(initialYaw - yaw));
      const startYaw = yaw, startPitch = pitch, start = performance.now();
      function animate(now) {
        const progress = motion.matches ? 1 : Math.min(1, (now - start) / 240);
        const ease = 1 - Math.pow(1 - progress, 3);
        yaw = startYaw + delta * ease;
        pitch = startPitch + (initialPitch - startPitch) * ease;
        scheduleDraw();
        if (progress < 1) focusFrame = requestAnimationFrame(animate);
      }
      animate(start);
    }
    canvas.addEventListener('pointerdown', event => {
      if (mode !== 'surface' || event.button !== 0 || drag) return;
      cancelAnimationFrame(focusFrame);
      drag = { x: event.clientX, y: event.clientY, yaw, pitch, id: event.pointerId };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      yaw = drag.yaw - (event.clientX - drag.x) * 4.5 / Math.max(width, 300);
      pitch = clamp(drag.pitch + (event.clientY - drag.y) * 1.75 / Math.max(height, 240), 0.18, 0.98);
      scheduleDraw();
    });
    function endDrag(event) {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      canvas.style.cursor = mode === 'surface' ? 'grab' : 'default';
    }
    canvas.addEventListener('lostpointercapture', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('dblclick', reset);
    canvas.addEventListener('keydown', event => {
      if (mode !== 'surface') return;
      if (event.key === 'Home') {
        event.preventDefault();
        reset();
        return;
      }
      const keys = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] };
      const change = keys[event.key];
      if (!change) return;
      event.preventDefault();
      cancelAnimationFrame(focusFrame);
      yaw += change[0];
      pitch = clamp(pitch + change[1], 0.18, 0.98);
      scheduleDraw();
    });
    if (!canvas.hasAttribute('tabindex')) canvas.tabIndex = 0;
    if ('ResizeObserver' in window) new ResizeObserver(scheduleDraw).observe(canvas);
    window.addEventListener('resize', scheduleDraw, { passive: true });
    window.addEventListener('site-theme-change', scheduleDraw);
    selectPower(1);
    selectMode('surface');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
