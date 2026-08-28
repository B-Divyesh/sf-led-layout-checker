import './styles.css';
import { runChecks, segmentCurrent, totalCurrent, totalWatts } from './calculations';
import { emptyLayout, sampleLayout, type Layout, type Point, type Segment } from './model';

const app = document.querySelector<HTMLDivElement>('#app')!;
const REAL_KEY = 'led-layout-checker:layout:v1';
const DEMO_KEY = 'demo:led-layout-checker:layout:v1';
const LICENSE_KEY = 'sb_license:led-layout-checker';
const LICENSE_CACHE_KEY = 'sb_license_check:led-layout-checker';
const DEMO_LICENSE_KEY = 'demo:sb_license:led-layout-checker';
const DEMO_LICENSE_CACHE_KEY = 'demo:sb_license_check:led-layout-checker';
const BUILD_ID = 'v1.1.0';
const BILLING_BASE = 'https://api.sociobot.in/api/v1/products/led-layout-checker';
const palette = ['#168a67', '#d45a49', '#a66f00', '#5368c9', '#8a4ba3'];

type Tool = 'select' | 'segment' | 'controller' | 'supply';

let layout: Layout = emptyLayout();
let demoMode = false;
let activeTool: Tool = 'select';
let activeSegmentId = '';
let selectedItem = '';
let drawingPoints: Point[] = [];
let motionPaused = false;
let undoStack: Layout[] = [];
let paid = false;
let licenseNotice = '';
let saveTimer = 0;
let pendingImport: Layout | null = null;

function escapeHtml(value: string | number): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function cloneLayout(value: Layout): Layout {
  return structuredClone(value);
}

function storageKey(): string {
  return demoMode ? DEMO_KEY : REAL_KEY;
}

function loadLayout(): Layout {
  if (demoMode) {
    const saved = localStorage.getItem(DEMO_KEY);
    return saved ? safeParse(saved, sampleLayout()) : sampleLayout();
  }
  const saved = localStorage.getItem(REAL_KEY);
  return saved ? safeParse(saved, emptyLayout()) : emptyLayout();
}

function safeParse(raw: string, fallback: Layout): Layout {
  try {
    const parsed = JSON.parse(raw) as Layout;
    return Array.isArray(parsed.segments) && Array.isArray(parsed.controllers) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveLayout(message = 'Saved in this browser'): void {
  layout.updatedAt = new Date().toISOString();
  localStorage.setItem(storageKey(), JSON.stringify(layout));
  const status = document.querySelector<HTMLElement>('#save-status');
  if (status) {
    status.textContent = message;
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => { status.textContent = 'Changes save in this browser'; }, 1800);
  }
}

function snapshot(): void {
  undoStack.push(cloneLayout(layout));
  if (undoStack.length > 30) undoStack.shift();
}

function routePath(): string {
  if (new URLSearchParams(location.search).get('demo') === '1') return '/demo';
  return location.pathname.replace(/\/$/, '') || '/';
}

function isPlannerPath(path = routePath()): boolean {
  return path === '/planner' || path === '/demo';
}

function licenseKeys(): [string, string] {
  return demoMode ? [DEMO_LICENSE_KEY, DEMO_LICENSE_CACHE_KEY] : [LICENSE_KEY, LICENSE_CACHE_KEY];
}

function navigate(path: string): void {
  history.pushState({}, '', path);
  renderRoute();
  void checkStoredLicense();
}

function header(): string {
  return `
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-link aria-label="LED Layout Checker home">
        <svg aria-hidden="true" viewBox="0 0 36 36"><path d="M5 26 12 9l9 18 10-16"/><circle cx="5" cy="26" r="3"/><circle cx="12" cy="9" r="3"/><circle cx="21" cy="27" r="3"/><circle cx="31" cy="11" r="3"/></svg>
        <span>LED Layout Checker</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/planner" data-link>Planner</a>
        <a href="/?demo=1" data-link>Demo</a>
        <a href="/privacy" data-link>Privacy</a>
      </nav>
    </header>`;
}

function footer(): string {
  return `<footer class="site-footer">
    <p>Plan LED paths before soldering.</p>
    <div><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></div>
    <p>${BUILD_ID} · Hero imagery was generated for this product.</p>
  </footer>`;
}

function landing(): string {
  return `${header()}<main id="main" tabindex="-1">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Check addressable LED art before building</p>
        <h1 tabindex="-1">Plan LED strips before you solder</h1>
        <p class="lede">For hobbyists building large LED art who need clear data paths and marked power points.</p>
        <div class="hero-action">
          <a class="button primary" href="/?demo=1" data-link>Try it with sample data</a>
          <span>Open a checked 480-pixel arch.</span>
        </div>
        <ul class="plain-facts" aria-label="Product facts">
          <li><span aria-hidden="true">⌂</span> Plans stay in this browser.</li>
          <li><span aria-hidden="true">↯</span> Works offline after your first visit.</li>
          <li><span aria-hidden="true">◇</span> Core planning and SVG export are free.</li>
        </ul>
      </div>
      <figure class="hero-art">
        <picture>
          <source srcset="/assets/hero-routing-600.webp 600w, /assets/hero-routing.webp 1200w" sizes="(max-width: 700px) calc(100vw - 32px), 48vw" type="image/webp" />
          <img src="/assets/hero-routing.png" srcset="/assets/hero-routing-600.png 600w, /assets/hero-routing.png 1200w" sizes="(max-width: 700px) calc(100vw - 32px), 48vw" width="1200" height="800" fetchpriority="high" alt="An abstract LED sculpture plan with mint paths, amber nodes, and coral power branches." />
        </picture>
        <figcaption>Trace data from the controller to the last pixel.</figcaption>
      </figure>
    </section>
    <section class="preview-band" aria-labelledby="preview-title">
      <div>
        <p class="eyebrow">Layout preview</p>
        <h2 id="preview-title">See data, current, and power on one plan</h2>
        <p>Draw the shape. Set pixel counts. Mark power points. The checks update as you work.</p>
        <a class="text-link" href="/planner" data-link>Start a blank plan →</a>
      </div>
      ${miniPreview()}
    </section>
    <section class="steps" aria-labelledby="steps-title">
      <p class="eyebrow">How it works</p>
      <h2 id="steps-title">From sketch to labeled plan</h2>
      <ol>
        <li><span>01</span><h3>Draw the paths</h3><p>Click along each strip in its real data order.</p></li>
        <li><span>02</span><h3>Add power details</h3><p>Add pixel counts, supplies, and power points.</p></li>
        <li><span>03</span><h3>Check and export</h3><p>Resolve warnings, then download a labeled SVG.</p></li>
      </ol>
    </section>
    <section class="limits" aria-labelledby="limits-title">
      <div><p class="eyebrow">Clear limits</p><h2 id="limits-title">A planning check, not electrical approval</h2></div>
        <p>Current figures use your pixel count, brightness, and supply details. Confirm wire size, fusing, voltage drop, and mains work with qualified guidance.</p>
    </section>
    <section class="pricing" aria-labelledby="pricing-title">
      <div>
        <p class="eyebrow">Studio license</p>
        <h2 id="pricing-title">Plan larger builds for $12 once</h2>
        <p>Studio adds multiple controllers and a parts summary. Checks and labeled SVG export stay free.</p>
        <p>Checkout runs through Sociobot. Dodo is the merchant of record and handles payment and refunds.</p>
        <p><a href="/privacy" data-link>Privacy</a> · <a href="/terms" data-link>Terms</a></p>
      </div>
      <div class="price-action"><strong>$12</strong><span>one-time purchase</span><a class="button light" href="${BILLING_BASE}/checkout">Buy Studio</a><a class="text-link" href="/planner#studio-title" data-link>Restore a license</a></div>
    </section>
  </main>${footer()}`;
}

function miniPreview(): string {
  return `<div class="mini-plan" role="img" aria-label="Sample arch plan with three routed LED segments and two power supplies">
    <svg viewBox="0 0 600 330" aria-hidden="true">
      <path class="grid-lines" d="M0 55h600M0 110h600M0 165h600M0 220h600M0 275h600M100 0v330M200 0v330M300 0v330M400 0v330M500 0v330" />
      <path class="preview-wire wire-one" d="M70 170C95 55 210 38 300 58"/><path class="preview-wire wire-two" d="M300 58C410 38 505 75 535 170"/><path class="preview-wire wire-three" d="M530 230C390 270 200 265 75 220"/>
      <path class="power-line" d="M125 285 100 130M480 285 505 120"/>
      <circle class="preview-controller" cx="48" cy="172" r="13"/><path class="preview-supply" d="m125 272 13 13-13 13-13-13zM480 272l13 13-13 13-13-13z"/>
      <g class="preview-nodes"><circle cx="70" cy="170" r="6"/><circle cx="300" cy="58" r="6"/><circle cx="535" cy="170" r="6"/><circle cx="530" cy="230" r="6"/><circle cx="75" cy="220" r="6"/></g>
    </svg>
    <div class="mini-caption"><span>480 pixels</span><span>11.5 A estimate</span><span class="warning-pill">2 checks</span></div>
  </div>`;
}

function demoBanner(): string {
  return `<div class="demo-banner" role="status" aria-label="Demo mode">
    <strong>Demo — sample data, nothing is saved to your plans.</strong>
    <div><button class="text-button" id="reset-demo">Reset demo</button><button class="text-button" id="start-real">Start for real</button></div>
  </div>`;
}

function planner(): string {
  const checks = runChecks(layout);
  const warningCount = checks.filter((check) => check.level === 'warn').length;
  const active = layout.segments.find((segment) => segment.id === activeSegmentId) ?? layout.segments[0];
  if (active && !activeSegmentId) activeSegmentId = active.id;
  if (!selectedItem) selectedItem = active ? `segment:${active.id}` : layout.controllers[0] ? `controller:${layout.controllers[0].id}` : '';
  return `${header()}${demoMode ? demoBanner() : ''}<main id="main" class="planner-page" tabindex="-1">
    <section class="planner-heading">
      <div><p class="eyebrow">Layout workspace</p><h1 tabindex="-1">Check your LED layout</h1><p>Edit the plan, then review each warning.</p></div>
      <div class="heading-actions"><span id="save-status" role="status">Changes save in this browser</span><button id="undo" ${undoStack.length ? '' : 'disabled'}>Undo</button><button id="export-plan">Export plan JSON</button><button id="import-trigger">Import plan JSON</button><input id="import-plan" hidden type="file" accept="application/json,.json" aria-label="Choose plan JSON file" /><button class="primary" id="export-svg">Export labeled SVG</button><p id="import-message" class="action-message" role="status" aria-live="polite"></p></div>
    </section>
    <section class="workspace" aria-label="LED layout editor">
      <div class="tool-rail" aria-labelledby="tools-title">
        <h2 id="tools-title">Place</h2>
        <button class="tool ${activeTool === 'select' ? 'active' : ''}" data-tool="select" aria-pressed="${activeTool === 'select'}"><span>↖</span>Select</button>
        <button class="tool ${activeTool === 'segment' ? 'active' : ''}" data-tool="segment" aria-pressed="${activeTool === 'segment'}"><span>⌁</span>Segment</button>
        <button class="tool ${activeTool === 'controller' ? 'active' : ''}" data-tool="controller" aria-pressed="${activeTool === 'controller'}"><span>⬡</span>Controller</button>
        <button class="tool ${activeTool === 'supply' ? 'active' : ''}" data-tool="supply" aria-pressed="${activeTool === 'supply'}"><span>◇</span>Supply</button>
        <div class="keyboard-place">
          <h3>Keyboard point</h3>
          <p id="coordinate-help">Enter X and Y from 0 to 100.</p>
          <label>X <input id="point-x" type="number" min="0" max="100" value="50" required aria-describedby="coordinate-help" /></label>
          <label>Y <input id="point-y" type="number" min="0" max="100" value="50" required aria-describedby="coordinate-help" /></label>
          <button id="add-point">Place at coordinates</button>
        </div>
        ${drawingPoints.length ? `<div class="draw-status" role="status"><strong>${drawingPoints.length} points in new segment</strong><button id="finish-segment" ${drawingPoints.length < 2 ? 'disabled' : ''}>Finish segment</button><button id="cancel-draw">Cancel</button></div>` : ''}
      </div>
      <div class="plan-wrap">
        <div class="plan-toolbar">
          <label>Plan name<input id="layout-name" value="${escapeHtml(layout.name)}" maxlength="70" /></label>
          <label>Select plan item<select id="plan-item-select">${planItemOptions()}</select></label>
          <button id="motion-toggle" aria-pressed="${motionPaused}">${motionPaused ? 'Play data flow' : 'Pause data flow'}</button>
        </div>
        <div id="plan-canvas" class="plan-canvas" tabindex="0" role="group" aria-label="LED layout plan" aria-describedby="plan-description">
          ${planSvg(layout)}
        </div>
        ${planDescription(layout)}
        <p class="canvas-help">Choose Segment, Controller, or Supply. Then click the plan. Use the coordinate controls for keyboard placement.</p>
      </div>
      <section class="check-panel" aria-labelledby="checks-title">
        <div class="check-title"><div><p class="eyebrow">Live checks</p><h2 id="checks-title">${warningCount ? `${warningCount} ${warningCount === 1 ? 'warning' : 'warnings'}` : 'Ready to review'}</h2></div><span class="check-count ${warningCount ? 'has-warnings' : ''}">${warningCount ? '!' : '✓'}</span></div>
        <dl class="totals"><div><dt>Pixels</dt><dd>${layout.segments.reduce((n, segment) => n + segment.pixels, 0)}</dd></div><div><dt>Current</dt><dd>${totalCurrent(layout).toFixed(1)} A</dd></div><div><dt>Power</dt><dd>${totalWatts(layout).toFixed(0)} W</dd></div></dl>
        <ul class="check-list" tabindex="0" aria-label="Layout check results">${checks.map((check) => `<li class="${check.level}"><span aria-hidden="true">${check.level === 'pass' ? '✓' : '!'}</span><div><strong>${escapeHtml(check.title)}</strong><p>${escapeHtml(check.detail)}</p></div></li>`).join('')}</ul>
        <p class="safety-note"><strong>Estimate only.</strong> Confirm wire size, fusing, voltage drop, and mains work with qualified guidance.</p>
      </section>
    </section>
    <section class="setup" aria-labelledby="setup-title">
      <div class="setup-heading"><div><p class="eyebrow">Plan details</p><h2 id="setup-title">Set the plan details</h2></div><p>Current uses the values below. A 20% supply margin appears in the checks.</p></div>
      <div class="setup-grid">
        <fieldset><legend>Whole plan</legend>
          <label>LED voltage<select id="voltage"><option value="5" ${layout.voltage === 5 ? 'selected' : ''}>5 V</option><option value="12" ${layout.voltage === 12 ? 'selected' : ''}>12 V</option></select></label>
          <label>Max current per pixel<input id="pixel-current" type="number" min="1" max="100" value="${layout.milliAmpsPerPixel}" /><span>mA</span></label>
          <label>Planned brightness<input id="brightness" type="range" min="1" max="100" value="${layout.brightness}" /><output id="brightness-output">${layout.brightness}%</output></label>
        </fieldset>
        <fieldset><legend>Selected segment</legend>${active ? segmentFields(active) : '<p class="empty-copy">Draw a segment to set its pixel count and power points.</p>'}</fieldset>
        <fieldset><legend>Sources</legend>
          ${layout.controllers.map((controller) => `<div class="source-row"><span class="source-mark controller-mark">C</span><div class="source-fields"><label>${escapeHtml(controller.name)}<input data-controller-name="${controller.id}" value="${escapeHtml(controller.name)}" /></label><button class="remove-source" data-remove-controller="${controller.id}">Remove ${escapeHtml(controller.name)}</button></div></div>`).join('') || '<p>No controller placed. Add one to state where data begins.</p>'}
          ${layout.supplies.map((supply) => `<div class="source-row"><span class="source-mark supply-mark">P</span><div class="source-fields"><label>${escapeHtml(supply.name)} voltage<select data-supply-volts="${supply.id}" aria-label="${escapeHtml(supply.name)} voltage"><option value="5" ${supply.volts === 5 ? 'selected' : ''}>5 V</option><option value="12" ${supply.volts === 12 ? 'selected' : ''}>12 V</option></select></label><label>Available current<input data-supply-amps="${supply.id}" type="number" min="0.1" max="200" step="0.1" value="${supply.amps}" aria-label="${escapeHtml(supply.name)} available amps" /><span>A</span></label><button class="remove-source" data-remove-supply="${supply.id}">Remove ${escapeHtml(supply.name)}</button></div></div>`).join('') || '<p>No supply placed.</p>'}
          <button id="add-controller" class="secondary">Add controller ${paid || layout.controllers.length === 0 ? '' : '· Studio'}</button>
        </fieldset>
      </div>
    </section>
    ${studioSection()}
    <dialog id="import-dialog" aria-labelledby="import-title" aria-describedby="import-preview">
      <h2 id="import-title">Replace this plan?</h2>
      <p id="import-preview"></p>
      <p>The imported plan replaces the current ${demoMode ? 'demo' : 'saved'} plan. You can undo the replacement until you leave this page.</p>
      <div><button id="cancel-import">Keep current plan</button><button class="primary" id="confirm-import">Replace with imported plan</button></div>
    </dialog>
  </main>${footer()}<div id="toast" class="toast" role="status" aria-live="polite"></div>`;
}

function planItemOptions(): string {
  const options = [
    ...layout.segments.map((item) => [`segment:${item.id}`, `Segment: ${item.name}`]),
    ...layout.controllers.map((item) => [`controller:${item.id}`, `Controller: ${item.name}`]),
    ...layout.supplies.map((item) => [`supply:${item.id}`, `Supply: ${item.name}`]),
  ];
  return options.length
    ? options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${selectedItem === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')
    : '<option value="">No plan items yet</option>';
}

function segmentFields(segment: Segment): string {
  return `<label>Segment<select id="active-segment">${layout.segments.map((item) => `<option value="${item.id}" ${item.id === segment.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label>
    <label>Name<input id="segment-name" value="${escapeHtml(segment.name)}" maxlength="40" /></label>
    <label>Pixel count<input id="segment-pixels" type="number" min="1" max="5000" value="${segment.pixels}" /></label>
    ${layout.controllers.length ? `<label>Controller<select id="segment-controller">${layout.controllers.map((controller) => `<option value="${controller.id}" ${controller.id === segment.controllerId ? 'selected' : ''}>${escapeHtml(controller.name)}</option>`).join('')}</select></label>` : '<p class="field-result">Place a controller to restore the data route.</p>'}
    <label>Data direction<select id="segment-direction"><option value="forward" ${segment.direction === 'forward' ? 'selected' : ''}>Start → end</option><option value="reverse" ${segment.direction === 'reverse' ? 'selected' : ''}>End → start</option></select></label>
    <label>Power points<select id="segment-injection"><option value="none" ${segment.injection === 'none' ? 'selected' : ''}>Not marked</option><option value="start" ${segment.injection === 'start' ? 'selected' : ''}>At data start</option><option value="both" ${segment.injection === 'both' ? 'selected' : ''}>At both ends</option></select></label>
    <p class="field-result">Estimated segment current: <strong>${segmentCurrent(segment, layout).toFixed(1)} A</strong></p>
    <button id="remove-segment" class="remove-source">Remove ${escapeHtml(segment.name)}</button>`;
}

function studioSection(): string {
  return `<section class="studio-panel" aria-labelledby="studio-title">
    <div><p class="eyebrow">Optional Studio</p><h2 id="studio-title" tabindex="-1">Multiple controllers and a parts summary</h2><p>$12 once. The free planner keeps its checks and labeled SVG export.</p><p>Checkout runs through Sociobot. Dodo is the merchant of record and handles payment and refunds.</p><p><a href="/privacy" data-link>Privacy</a> · <a href="/terms" data-link>Terms</a></p></div>
    <div class="studio-actions">${paid ? `<span class="license-active">✓ Studio active</span><button id="export-summary">Export parts summary</button>` : `<a class="button light" href="${BILLING_BASE}/checkout">Buy Studio for $12</a>${licenseNotice ? `<p class="license-notice">${escapeHtml(licenseNotice)}</p>` : ''}<details><summary>Have a license?</summary><p id="license-requirement">Paste the token from your purchase email.</p><label>License token<input id="license-token" autocomplete="off" required aria-describedby="license-requirement license-message" /></label><button id="verify-license">Verify license</button><p id="license-message" role="status" aria-live="polite"></p></details>`}</div>
  </section>`;
}

function planDescription(value: Layout): string {
  const segments = value.segments.map((segment) => {
    const route = segment.points.map((point) => `${point.x}, ${point.y}`).join(' to ');
    const controller = value.controllers.find((item) => item.id === segment.controllerId)?.name ?? 'no controller';
    return `<li>${escapeHtml(segment.name)}: ${segment.pixels} pixels, ${escapeHtml(segment.direction)} data, ${escapeHtml(controller)}, coordinates ${route}.</li>`;
  }).join('');
  const controllers = value.controllers.map((item) => `${escapeHtml(item.name)} at ${item.point.x}, ${item.point.y}`).join('; ') || 'none';
  const supplies = value.supplies.map((item) => `${escapeHtml(item.name)} at ${item.point.x}, ${item.point.y}`).join('; ') || 'none';
  return `<div id="plan-description" class="sr-only"><h3>Plan contents</h3><p>Controllers: ${controllers}. Supplies: ${supplies}.</p><ul>${segments || '<li>No LED segments yet.</li>'}</ul></div>`;
}

function planSvg(value: Layout): string {
  const markerDefs = palette.map((color, index) => `<marker id="arrow-${index}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="${color}"/></marker>`).join('');
  const segments = value.segments.map((segment, index) => {
    const points = segment.direction === 'reverse' ? [...segment.points].reverse() : segment.points;
    const coords = points.map((point) => `${point.x * 10},${point.y * 6}`).join(' ');
    const first = points[0];
    const last = points.at(-1)!;
    const color = palette[index % palette.length];
    return `<g class="plan-segment ${selectedItem === `segment:${segment.id}` ? 'selected' : ''}" data-select-item="segment:${segment.id}">
      <polyline points="${coords}" stroke="${color}" marker-end="url(#arrow-${index % palette.length})" />
      ${points.map((point, pointIndex) => `<circle cx="${point.x * 10}" cy="${point.y * 6}" r="${pointIndex === 0 ? 7 : 4}" fill="${color}" />`).join('')}
      <circle class="data-spark ${motionPaused ? 'paused' : ''}" cx="${first.x * 10}" cy="${first.y * 6}" r="7" fill="#ffd166"><animateMotion dur="2.4s" repeatCount="indefinite" path="${polylinePath(points)}" /></circle>
      <text x="${first.x * 10 + 10}" y="${first.y * 6 - 10}">START · ${escapeHtml(segment.name)} · ${segment.pixels}px</text>
      <text x="${last.x * 10 + 10}" y="${last.y * 6 + 20}">END</text>
      ${injectionMarks(segment, points, color)}
    </g>`;
  }).join('');
  const drawing = drawingPoints.length ? `<g class="drawing-segment"><polyline points="${drawingPoints.map((point) => `${point.x * 10},${point.y * 6}`).join(' ')}"/>${drawingPoints.map((point) => `<circle cx="${point.x * 10}" cy="${point.y * 6}" r="6"/>`).join('')}</g>` : '';
  const controllers = value.controllers.map((controller) => `<g class="controller-shape ${selectedItem === `controller:${controller.id}` ? 'selected' : ''}" data-select-item="controller:${controller.id}"><polygon points="${hexPoints(controller.point.x * 10, controller.point.y * 6, 15)}"/><text x="${controller.point.x * 10 + 20}" y="${controller.point.y * 6 + 5}">${escapeHtml(controller.name)}</text></g>`).join('');
  const supplies = value.supplies.map((supply) => `<g class="supply-shape ${selectedItem === `supply:${supply.id}` ? 'selected' : ''}" data-select-item="supply:${supply.id}"><path d="M${supply.point.x * 10} ${supply.point.y * 6 - 14}l14 14-14 14-14-14z"/><text x="${supply.point.x * 10 + 20}" y="${supply.point.y * 6 + 5}">${escapeHtml(supply.name)} · ${supply.amps}A</text></g>`).join('');
  return `<svg viewBox="0 0 1000 600" aria-hidden="true"><defs>${markerDefs}<pattern id="small-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#d7d3c3" stroke-width="1"/></pattern></defs><rect width="1000" height="600" fill="#f5f1df"/><rect width="1000" height="600" fill="url(#small-grid)"/>${segments}${drawing}${controllers}${supplies}</svg>`;
}

function polylinePath(points: Point[]): string {
  return points.map((point, index) => `${index ? 'L' : 'M'}${point.x * 10} ${point.y * 6}`).join(' ');
}

function injectionMarks(segment: Segment, points: Point[], color: string): string {
  if (segment.injection === 'none') return '';
  const targets = segment.injection === 'both' ? [points[0], points.at(-1)!] : [points[0]];
  return targets.map((point) => `<g class="injection-mark"><path d="M${point.x * 10 - 8} ${point.y * 6 + 18}h16l-8 13z" fill="${color}"/><text x="${point.x * 10 + 12}" y="${point.y * 6 + 29}">POWER</text></g>`).join('');
}

function hexPoints(cx: number, cy: number, radius: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 3 * index;
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  }).join(' ');
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  const title = privacy ? 'Your plan stays on your device' : 'Use the checker as a planning aid';
  return `${header()}<main id="main" class="text-page" tabindex="-1"><p class="eyebrow">${privacy ? 'Privacy' : 'Terms'}</p><h1 tabindex="-1">${title}</h1>${privacy ? `
    <p>LED Layout Checker stores your plan and license token in this browser. It does not send plan data to our servers.</p>
    <h2>What leaves your browser</h2><p>Opening checkout or verifying a license contacts the Sociobot billing service. Plan data is not included.</p><p>A stored verdict is reused for one day.</p>
    <h2>Demo data</h2><p>Demo plans and licenses use separate browser keys. Demo mode never reads or changes your saved plan or license.</p><p>“Reset demo” restores the sample and clears demo licenses. “Start for real” clears every demo key and opens your saved plan, or a blank plan if you have none.</p>
    <h2>Delete your data</h2><p>Clear this site’s browser storage to remove plans and license data.</p>` : `
    <p>This tool provides conservative estimates from the values you enter. It is not electrical advice or certification.</p>
    <h2>Your responsibility</h2><p>Confirm supply sizing, wire gauge, fusing, voltage drop, connectors, and mains work with qualified guidance.</p>
    <h2>Studio purchase</h2><p>Studio is a $12 one-time license. Checkout runs through Sociobot. Dodo is the merchant of record and handles payment and refunds.</p>
    <h2>No warranty</h2><p>The software is provided “as is” under the MIT License. Stop if a check conflicts with qualified advice.</p>`}<a class="button primary" href="/planner" data-link>Open the planner</a></main>${footer()}`;
}

function notFound(): string {
  return `${header()}<main id="main" class="not-found" tabindex="-1"><div class="broken-path" aria-hidden="true"><span>1</span><i></i><span>?</span></div><p class="eyebrow">404 · open circuit</p><h1 tabindex="-1">This path does not connect</h1><p>The page may have moved. Your saved plan is still in this browser.</p><a class="button primary" href="/planner" data-link>Return to the planner</a></main>${footer()}`;
}

function renderRoute(focusHeading = true): void {
  const path = routePath();
  const nextDemoMode = path === '/demo';
  if (nextDemoMode !== demoMode) {
    paid = false;
    licenseNotice = '';
    activeSegmentId = '';
    selectedItem = '';
  }
  demoMode = nextDemoMode;
  if (isPlannerPath(path)) layout = loadLayout();
  const pages: Record<string, () => string> = {
    '/': landing,
    '/planner': planner,
    '/demo': planner,
    '/privacy': () => legalPage('privacy'),
    '/terms': () => legalPage('terms'),
  };
  app.innerHTML = (pages[path] ?? notFound)();
  const metadata = routeMetadata(path);
  document.title = metadata.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', metadata.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', metadata.canonical);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', metadata.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', metadata.description);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', metadata.title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', metadata.description);
  bindCommon();
  if (isPlannerPath(path)) bindPlanner();
  if (focusHeading) requestAnimationFrame(() => {
    const hashTarget = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    const heading = hashTarget ?? document.querySelector<HTMLElement>('h1');
    heading?.focus({ preventScroll: true });
    if (hashTarget) hashTarget.scrollIntoView();
    const status = document.querySelector<HTMLElement>('#route-status');
    if (status) status.textContent = heading?.textContent ?? 'Page changed';
  });
}

function routeMetadata(path: string): { title: string; description: string; canonical: string } {
  const values: Record<string, [string, string]> = {
    '/': ['LED Layout Checker — plan strips before soldering', 'Draw LED paths, check current and power points, then export a labeled plan before soldering.'],
    '/planner': ['Planner — LED Layout Checker', 'Draw LED strips, place controllers and supplies, check power points, and export your plan.'],
    '/demo': ['Demo — LED Layout Checker', 'Try a checked 480-pixel garden arch with isolated sample data.'],
    '/privacy': ['Privacy — LED Layout Checker', 'See what LED Layout Checker stores in your browser and when the billing service is contacted.'],
    '/terms': ['Terms — LED Layout Checker', 'Read the planning limits and Studio purchase terms for LED Layout Checker.'],
  };
  const [title, description] = values[path] ?? ['Page not found — LED Layout Checker', 'This LED Layout Checker page does not exist. Return to the planner.'];
  const canonicalPath = path === '/demo' ? '/demo' : path;
  return { title, description, canonical: `https://led-layout-checker.sociobot.in${canonicalPath}` };
}

function bindCommon(): void {
  document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    const main = document.querySelector<HTMLElement>('#main');
    main?.focus();
    main?.scrollIntoView();
  });
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const url = new URL(link.href);
    navigate(`${url.pathname}${url.search}${url.hash}`);
  }));
}

function updateAndRender(mutator: () => void): void {
  snapshot();
  mutator();
  saveLayout();
  renderRoute(false);
}

function bindPlanner(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => button.addEventListener('click', () => {
    activeTool = button.dataset.tool as Tool;
    drawingPoints = activeTool === 'segment' ? drawingPoints : [];
    renderRoute(false);
  }));
  document.querySelector('#plan-canvas')?.addEventListener('click', placeFromPointer);
  document.querySelectorAll<SVGElement>('[data-select-item]').forEach((item) => item.addEventListener('click', (event) => {
    if (activeTool !== 'select') return;
    event.stopPropagation();
    const value = item.dataset.selectItem;
    if (value) selectPlanItem(value, false);
  }));
  document.querySelector('#add-point')?.addEventListener('click', () => {
    const xInput = document.querySelector<HTMLInputElement>('#point-x');
    const yInput = document.querySelector<HTMLInputElement>('#point-y');
    const invalidInput = [xInput, yInput].find((input) => !input?.value.trim());
    const x = Number(xInput?.value);
    const y = Number(yInput?.value);
    if (invalidInput || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) {
      const firstInvalid = invalidInput ?? (x < 0 || x > 100 || !Number.isFinite(x) ? xInput : yInput);
      firstInvalid?.setAttribute('aria-invalid', 'true');
      firstInvalid?.focus();
      return toast('Use coordinates from 0 to 100. Enter both X and Y.');
    }
    xInput?.removeAttribute('aria-invalid');
    yInput?.removeAttribute('aria-invalid');
    placeAt({ x, y });
  });
  document.querySelector('#finish-segment')?.addEventListener('click', finishSegment);
  document.querySelector('#cancel-draw')?.addEventListener('click', () => { drawingPoints = []; renderRoute(false); });
  document.querySelector('#undo')?.addEventListener('click', () => {
    const previous = undoStack.pop();
    if (!previous) return;
    layout = previous;
    saveLayout('Last change undone');
    renderRoute(false);
  });
  document.querySelector('#reset-demo')?.addEventListener('click', () => {
    clearDemoStorage();
    paid = false;
    licenseNotice = '';
    layout = sampleLayout();
    undoStack = [];
    activeSegmentId = layout.segments[0].id;
    selectedItem = `segment:${activeSegmentId}`;
    saveLayout('Demo reset');
    renderRoute(false);
  });
  document.querySelector('#start-real')?.addEventListener('click', () => {
    clearDemoStorage();
    paid = false;
    licenseNotice = '';
    activeSegmentId = '';
    selectedItem = '';
    navigate('/planner');
  });
  document.querySelector('#export-svg')?.addEventListener('click', exportSvg);
  document.querySelector('#export-plan')?.addEventListener('click', exportPlan);
  const importInput = document.querySelector<HTMLInputElement>('#import-plan');
  document.querySelector('#import-trigger')?.addEventListener('click', () => importInput?.click());
  importInput?.addEventListener('change', () => { void prepareImport(importInput); });
  document.querySelector('#cancel-import')?.addEventListener('click', closeImportDialog);
  document.querySelector('#confirm-import')?.addEventListener('click', confirmImport);
  document.querySelector('#export-summary')?.addEventListener('click', exportSummary);
  document.querySelector('#motion-toggle')?.addEventListener('click', () => { motionPaused = !motionPaused; renderRoute(false); });
  document.querySelector('#add-controller')?.addEventListener('click', () => {
    if (!paid && layout.controllers.length >= 1) {
      history.replaceState({}, '', `${location.pathname}${location.search}#studio-title`);
      const studioTitle = document.querySelector<HTMLElement>('#studio-title');
      studioTitle?.focus({ preventScroll: true });
      studioTitle?.scrollIntoView();
      return toast('Studio adds multiple controllers. Buy Studio below or enter a license.');
    }
    activeTool = 'controller'; toast('Controller tool selected. Click the plan to place it.'); renderRoute(false);
  });
  document.querySelector('#remove-segment')?.addEventListener('click', () => {
    const removedId = activeSegmentId;
    updateAndRender(() => {
      layout.segments = layout.segments.filter((segment) => segment.id !== removedId);
      activeSegmentId = layout.segments[0]?.id ?? '';
      selectedItem = activeSegmentId ? `segment:${activeSegmentId}` : '';
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-remove-controller]').forEach((button) => button.addEventListener('click', () => {
    updateAndRender(() => {
      layout.controllers = layout.controllers.filter((controller) => controller.id !== button.dataset.removeController);
      if (selectedItem === `controller:${button.dataset.removeController}`) selectedItem = layout.segments[0] ? `segment:${layout.segments[0].id}` : '';
    });
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-remove-supply]').forEach((button) => button.addEventListener('click', () => {
    updateAndRender(() => {
      layout.supplies = layout.supplies.filter((supply) => supply.id !== button.dataset.removeSupply);
      if (selectedItem === `supply:${button.dataset.removeSupply}`) selectedItem = layout.segments[0] ? `segment:${layout.segments[0].id}` : '';
    });
  }));
  document.querySelector('#verify-license')?.addEventListener('click', restoreLicense);
  bindInputs();
}

function bindInputs(): void {
  const set = (selector: string, event: 'input' | 'change', action: (target: HTMLInputElement | HTMLSelectElement) => void) => {
    document.querySelector<HTMLInputElement | HTMLSelectElement>(selector)?.addEventListener(event, (e) => action(e.currentTarget as HTMLInputElement | HTMLSelectElement));
  };
  set('#layout-name', 'change', (target) => updateAndRender(() => { layout.name = target.value.trim() || 'Untitled light plan'; }));
  set('#voltage', 'change', (target) => updateAndRender(() => { layout.voltage = Number(target.value) as 5 | 12; }));
  set('#pixel-current', 'change', (target) => updateAndRender(() => { layout.milliAmpsPerPixel = clamp(Number(target.value), 1, 100); }));
  set('#brightness', 'change', (target) => updateAndRender(() => { layout.brightness = clamp(Number(target.value), 1, 100); }));
  set('#brightness', 'input', (target) => { const output = document.querySelector('#brightness-output'); if (output) output.textContent = `${target.value}%`; });
  set('#active-segment', 'change', (target) => { activeSegmentId = target.value; renderRoute(false); });
  set('#plan-item-select', 'change', (target) => selectPlanItem(target.value, true));
  set('#segment-name', 'change', (target) => changeSegment((segment) => { segment.name = target.value.trim() || 'LED segment'; }));
  set('#segment-pixels', 'change', (target) => changeSegment((segment) => { segment.pixels = clamp(Number(target.value), 1, 5000); }));
  set('#segment-controller', 'change', (target) => changeSegment((segment) => { segment.controllerId = target.value; }));
  set('#segment-direction', 'change', (target) => changeSegment((segment) => { segment.direction = target.value as Segment['direction']; }));
  set('#segment-injection', 'change', (target) => changeSegment((segment) => { segment.injection = target.value as Segment['injection']; }));
  document.querySelectorAll<HTMLInputElement>('[data-controller-name]').forEach((input) => input.addEventListener('change', () => updateAndRender(() => {
    const item = layout.controllers.find((controller) => controller.id === input.dataset.controllerName); if (item) item.name = input.value.trim() || 'Controller';
  })));
  document.querySelectorAll<HTMLInputElement>('[data-supply-amps]').forEach((input) => input.addEventListener('change', () => updateAndRender(() => {
    const item = layout.supplies.find((supply) => supply.id === input.dataset.supplyAmps); if (item) item.amps = clamp(Number(input.value), 0.1, 200);
  })));
  document.querySelectorAll<HTMLSelectElement>('[data-supply-volts]').forEach((input) => input.addEventListener('change', () => updateAndRender(() => {
    const item = layout.supplies.find((supply) => supply.id === input.dataset.supplyVolts); if (item) item.volts = Number(input.value);
  })));
}

function changeSegment(action: (segment: Segment) => void): void {
  const segment = layout.segments.find((item) => item.id === activeSegmentId);
  if (segment) updateAndRender(() => action(segment));
}

function placeFromPointer(event: Event): void {
  if (activeTool === 'select') {
    const item = (event.target as Element).closest<SVGElement>('[data-select-item]')?.dataset.selectItem;
    if (item) selectPlanItem(item, false);
    else toast('Choose a path, controller, or supply on the plan.');
    return;
  }
  const pointer = event as MouseEvent;
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  placeAt({ x: clamp(Math.round((pointer.clientX - box.left) / box.width * 100), 0, 100), y: clamp(Math.round((pointer.clientY - box.top) / box.height * 100), 0, 100) });
}

function placeAt(point: Point): void {
  if (activeTool === 'segment') {
    drawingPoints.push(point); renderRoute(false); return;
  }
  if (activeTool === 'controller') {
    if (!paid && layout.controllers.length >= 1) return toast('The free plan includes one controller. Studio adds more.');
    updateAndRender(() => {
      const id = crypto.randomUUID();
      layout.controllers.push({ id, name: `Controller ${layout.controllers.length + 1}`, point });
      selectedItem = `controller:${id}`;
      if (layout.controllers.length === 1) {
        layout.segments.forEach((segment) => {
          if (!segment.controllerId || !layout.controllers.some((controller) => controller.id === segment.controllerId)) segment.controllerId = id;
        });
      }
    });
  } else if (activeTool === 'supply') {
    updateAndRender(() => {
      const id = crypto.randomUUID();
      layout.supplies.push({ id, name: `Supply ${layout.supplies.length + 1}`, point, volts: layout.voltage, amps: 10 });
      selectedItem = `supply:${id}`;
    });
  } else {
    toast('Choose what to place first.');
  }
}

function finishSegment(): void {
  if (drawingPoints.length < 2) return toast('Add at least two points to finish a segment.');
  const id = crypto.randomUUID();
  updateAndRender(() => {
    layout.segments.push({ id, name: `Segment ${layout.segments.length + 1}`, points: [...drawingPoints], pixels: 60, color: palette[layout.segments.length % palette.length], direction: 'forward', injection: 'none', controllerId: layout.controllers[0]?.id ?? '' });
    activeSegmentId = id; selectedItem = `segment:${id}`; drawingPoints = []; activeTool = 'select';
  });
}

function selectPlanItem(value: string, focusControl: boolean): void {
  selectedItem = value;
  const [kind, id] = value.split(':');
  if (kind === 'segment') activeSegmentId = id;
  renderRoute(false);
  requestAnimationFrame(() => {
    const target = kind === 'segment'
      ? document.querySelector<HTMLElement>('#segment-name')
      : kind === 'controller'
        ? document.querySelector<HTMLElement>(`[data-controller-name="${CSS.escape(id)}"]`)
        : document.querySelector<HTMLElement>(`[data-supply-amps="${CSS.escape(id)}"]`);
    if (focusControl) target?.focus();
    toast(`${kind === 'segment' ? 'Segment' : kind === 'controller' ? 'Controller' : 'Supply'} selected.`);
  });
}

function clearDemoStorage(): void {
  localStorage.removeItem(DEMO_KEY);
  localStorage.removeItem(DEMO_LICENSE_KEY);
  localStorage.removeItem(DEMO_LICENSE_CACHE_KEY);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function toast(message: string): void {
  const element = document.querySelector<HTMLElement>('#toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  window.setTimeout(() => element.classList.remove('show'), 3500);
}

function exportSvg(): void {
  const checks = runChecks(layout);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="${escapeHtml(layout.name)} labeled LED plan"><rect width="1200" height="800" fill="#f5f1df"/><text x="50" y="55" font-family="sans-serif" font-size="28" fill="#07110f">${escapeHtml(layout.name)}</text><g transform="translate(50 85) scale(1.1)">${planSvg(layout).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g><text x="50" y="770" font-family="sans-serif" font-size="16" fill="#07110f">${layout.segments.reduce((n, s) => n + s.pixels, 0)} pixels · ${totalCurrent(layout).toFixed(1)} A estimate · ${checks.filter((c) => c.level === 'warn').length} warnings · Not electrical advice</text></svg>`;
  download(`${slug(layout.name)}.svg`, svg, 'image/svg+xml');
  toast('Labeled SVG downloaded.');
}

function exportSummary(): void {
  const powerPointLabel = (value: Segment['injection']) => value === 'both' ? 'power points at both ends' : value === 'start' ? 'power point at data start' : 'no power point marked';
  const text = [`${layout.name} — parts summary`, '', `Voltage: ${layout.voltage} V`, `Pixels: ${layout.segments.reduce((n, s) => n + s.pixels, 0)}`, `Estimated current: ${totalCurrent(layout).toFixed(1)} A`, `Estimated power: ${totalWatts(layout).toFixed(0)} W`, '', 'Segments:', ...layout.segments.map((s) => `- ${s.name}: ${s.pixels} pixels, ${segmentCurrent(s, layout).toFixed(1)} A, ${powerPointLabel(s.injection)}`), '', 'Supplies:', ...layout.supplies.map((s) => `- ${s.name}: ${s.volts} V, ${s.amps} A stated`), '', 'Planning estimate only. Confirm wire size, fusing, voltage drop, and mains work.'].join('\n');
  download(`${slug(layout.name)}-parts.txt`, text, 'text/plain');
}

function exportPlan(): void {
  const project = JSON.stringify({ format: 'led-layout-checker', version: 1, layout }, null, 2);
  download(`${slug(layout.name)}.led-plan.json`, project, 'application/json');
  toast('Editable plan JSON downloaded.');
}

async function prepareImport(input: HTMLInputElement): Promise<void> {
  const message = document.querySelector<HTMLElement>('#import-message');
  const trigger = document.querySelector<HTMLButtonElement>('#import-trigger');
  const file = input.files?.[0];
  if (!file || !message || !trigger) return;
  try {
    if (file.size > 1_000_000) throw new Error('Choose a plan JSON file smaller than 1 MB.');
    const parsed = JSON.parse(await file.text()) as unknown;
    pendingImport = parseProject(parsed);
    const preview = document.querySelector<HTMLElement>('#import-preview');
    if (preview) preview.textContent = `${pendingImport.name}: ${countLabel(pendingImport.segments.length, 'segment')}, ${countLabel(pendingImport.controllers.length, 'controller')}, and ${countLabel(pendingImport.supplies.length, 'supply')}.`;
    message.textContent = '';
    const dialog = document.querySelector<HTMLDialogElement>('#import-dialog');
    dialog?.showModal();
    document.querySelector<HTMLButtonElement>('#confirm-import')?.focus();
  } catch (error) {
    pendingImport = null;
    message.textContent = error instanceof Error ? error.message : 'This file is not a valid LED Layout Checker plan.';
    trigger.focus();
  } finally {
    input.value = '';
  }
}

function parseProject(value: unknown): Layout {
  if (!isRecord(value) || value.format !== 'led-layout-checker' || value.version !== 1 || !isRecord(value.layout)) {
    throw new Error('This file is not a version 1 LED Layout Checker plan.');
  }
  const candidate = value.layout;
  const point = (item: unknown): item is Point => isRecord(item) && finiteRange(item.x, 0, 100) && finiteRange(item.y, 0, 100);
  const controllersOk = Array.isArray(candidate.controllers) && candidate.controllers.every((item) => isRecord(item)
    && nonEmpty(item.id) && nonEmpty(item.name) && point(item.point));
  const suppliesOk = Array.isArray(candidate.supplies) && candidate.supplies.every((item) => isRecord(item)
    && nonEmpty(item.id) && nonEmpty(item.name) && point(item.point) && (item.volts === 5 || item.volts === 12) && finiteRange(item.amps, 0.1, 200));
  const segmentsOk = Array.isArray(candidate.segments) && candidate.segments.every((item) => isRecord(item)
    && nonEmpty(item.id) && nonEmpty(item.name) && typeof item.color === 'string'
    && (item.direction === 'forward' || item.direction === 'reverse')
    && (item.injection === 'none' || item.injection === 'start' || item.injection === 'both')
    && typeof item.controllerId === 'string' && finiteRange(item.pixels, 1, 5000)
    && Array.isArray(item.points) && item.points.length >= 2 && item.points.every(point));
  if (!nonEmpty(candidate.name) || (candidate.voltage !== 5 && candidate.voltage !== 12)
    || !finiteRange(candidate.milliAmpsPerPixel, 1, 100) || !finiteRange(candidate.brightness, 1, 100)
    || typeof candidate.updatedAt !== 'string' || !segmentsOk || !controllersOk || !suppliesOk) {
    throw new Error('This plan file has missing or invalid layout data. Choose an exported plan JSON file.');
  }
  return cloneLayout(candidate as unknown as Layout);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function countLabel(count: number, noun: string): string {
  const plural = noun === 'supply' ? 'supplies' : `${noun}s`;
  return `${count} ${count === 1 ? noun : plural}`;
}

function finiteRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function closeImportDialog(): void {
  pendingImport = null;
  document.querySelector<HTMLDialogElement>('#import-dialog')?.close();
  document.querySelector<HTMLButtonElement>('#import-trigger')?.focus();
}

function confirmImport(): void {
  if (!pendingImport) return;
  snapshot();
  layout = cloneLayout(pendingImport);
  pendingImport = null;
  activeSegmentId = layout.segments[0]?.id ?? '';
  selectedItem = activeSegmentId ? `segment:${activeSegmentId}` : layout.controllers[0] ? `controller:${layout.controllers[0].id}` : '';
  saveLayout('Imported plan saved');
  document.querySelector<HTMLDialogElement>('#import-dialog')?.close();
  renderRoute(false);
  requestAnimationFrame(() => {
    document.querySelector<HTMLButtonElement>('#import-trigger')?.focus();
    toast('Imported plan replaced the current plan.');
  });
}

function download(filename: string, content: string, type: string): void {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([content], { type }));
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'led-plan';
}

async function restoreLicense(): Promise<void> {
  const input = document.querySelector<HTMLInputElement>('#license-token');
  const message = document.querySelector<HTMLElement>('#license-message');
  const token = input?.value.trim();
  if (!message) return;
  if (!token) {
    message.textContent = 'Enter your license token, then verify again.';
    input?.setAttribute('aria-invalid', 'true');
    input?.focus();
    return;
  }
  input?.removeAttribute('aria-invalid');
  message.textContent = 'Checking license…';
  try {
    const response = await fetch(`${BILLING_BASE}/verify?license=${encodeURIComponent(token)}`);
    const result = await response.json() as { valid: boolean; reason?: string };
    if (!result.valid) { message.textContent = 'That license is not active. Check the token and try again.'; return; }
    const [tokenKey, cacheKey] = licenseKeys();
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(cacheKey, JSON.stringify({ token, valid: true, checkedAt: Date.now() }));
    paid = true; licenseNotice = ''; renderRoute(false); toast('Studio license verified.');
  } catch {
    message.textContent = 'The license service could not be reached. Check your connection and try again.';
  }
}

async function checkStoredLicense(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const returned = params.get('license');
  const [tokenKey, cacheKey] = licenseKeys();
  if (returned) {
    localStorage.setItem(tokenKey, returned);
    params.delete('license');
    history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
  }
  const token = returned || localStorage.getItem(tokenKey);
  if (!token) return;
  const cached = safeCache(localStorage.getItem(cacheKey));
  const matchingCache = cached?.token === token ? cached : null;
  if (matchingCache) {
    paid = matchingCache.valid;
    licenseNotice = matchingCache.valid ? '' : 'This license is no longer active.';
    if (isPlannerPath()) renderRoute(false);
  }
  if (!returned && matchingCache && Date.now() - matchingCache.checkedAt < 86_400_000) return;
  try {
    const response = await fetch(`${BILLING_BASE}/verify?license=${encodeURIComponent(token)}`);
    const result = await response.json() as { valid: boolean };
    paid = result.valid;
    licenseNotice = result.valid ? '' : 'This license is no longer active.';
    localStorage.setItem(cacheKey, JSON.stringify({ token, valid: result.valid, checkedAt: Date.now() }));
    if (isPlannerPath()) renderRoute(false);
  } catch { /* The free planner and cached verdict keep working offline. */ }
}

function safeCache(raw: string | null): { token: string; valid: boolean; checkedAt: number } | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as { token?: unknown; valid?: unknown; checkedAt?: unknown };
    return typeof value.token === 'string' && typeof value.valid === 'boolean' && typeof value.checkedAt === 'number'
      ? { token: value.token, valid: value.valid, checkedAt: value.checkedAt }
      : null;
  } catch { return null; }
}

window.addEventListener('popstate', () => { renderRoute(); void checkStoredLicense(); });
renderRoute(Boolean(location.hash));
void checkStoredLicense();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
