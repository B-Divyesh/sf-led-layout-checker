import './styles.css';
import { runChecks, segmentCurrent, totalCurrent, totalWatts } from './calculations';
import { emptyLayout, sampleLayout, type Layout, type Point, type Segment } from './model';

const app = document.querySelector<HTMLDivElement>('#app')!;
const REAL_KEY = 'led-layout-checker:layout:v1';
const DEMO_KEY = 'demo:led-layout-checker:layout:v1';
const LICENSE_KEY = 'sb_license:led-layout-checker';
const LICENSE_CACHE_KEY = 'sb_license_check:led-layout-checker';
const BUILD_ID = 'v1.0.0';
const BILLING_BASE = 'https://api.sociobot.in/api/v1/products/led-layout-checker';
const palette = ['#168a67', '#d45a49', '#a66f00', '#5368c9', '#8a4ba3'];

type Tool = 'select' | 'segment' | 'controller' | 'supply';

let layout: Layout = emptyLayout();
let demoMode = false;
let activeTool: Tool = 'select';
let activeSegmentId = '';
let drawingPoints: Point[] = [];
let motionPaused = false;
let undoStack: Layout[] = [];
let paid = false;
let licenseNotice = '';
let saveTimer = 0;

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

function isPlannerPath(path = location.pathname): boolean {
  return path === '/planner' || path === '/demo';
}

function navigate(path: string): void {
  history.pushState({}, '', path);
  renderRoute();
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
        <a href="/demo" data-link>Demo</a>
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
  return `${header()}<main id="main">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Preflight for addressable LED art</p>
        <h1 tabindex="-1">Plan LED strips before you solder</h1>
        <p class="lede">For hobbyists building large LED art who need clear data paths and power assumptions.</p>
        <div class="hero-action">
          <a class="button primary" href="/demo" data-link>Try it with sample data</a>
          <span>See a checked 480-pixel arch.</span>
        </div>
        <ul class="plain-facts" aria-label="Product facts">
          <li><span aria-hidden="true">⌂</span> Plans stay in this browser.</li>
          <li><span aria-hidden="true">↯</span> Works offline after your first visit.</li>
          <li><span aria-hidden="true">◇</span> Free planner. Studio is $12 once.</li>
        </ul>
      </div>
      <figure class="hero-art">
        <picture>
          <source srcset="/assets/hero-routing.webp" type="image/webp" />
          <img src="/assets/hero-routing.png" width="1536" height="1024" fetchpriority="high" alt="An abstract LED sculpture plan with mint paths, amber nodes, and coral power branches." />
        </picture>
        <figcaption>Trace data from controller to the last pixel.</figcaption>
      </figure>
    </section>
    <section class="preview-band" aria-labelledby="preview-title">
      <div>
        <p class="eyebrow">The preflight</p>
        <h2 id="preview-title">See each assumption on one plan</h2>
        <p>Draw the shape. Set pixel counts. Mark power entry points. The checks update as you work.</p>
        <a class="text-link" href="/planner" data-link>Start a blank plan →</a>
      </div>
      ${miniPreview()}
    </section>
    <section class="steps" aria-labelledby="steps-title">
      <p class="eyebrow">How it works</p>
      <h2 id="steps-title">From sketch to labeled plan</h2>
      <ol>
        <li><span>01</span><h3>Draw the paths</h3><p>Click along each strip in its real data order.</p></li>
        <li><span>02</span><h3>State the power</h3><p>Add pixel counts, supplies, and injection points.</p></li>
        <li><span>03</span><h3>Check and export</h3><p>Resolve warnings, then download a labeled SVG.</p></li>
      </ol>
    </section>
    <section class="limits" aria-labelledby="limits-title">
      <div><p class="eyebrow">Clear limits</p><h2 id="limits-title">A planning check, not electrical approval</h2></div>
      <p>Current figures use your pixel, brightness, and supply assumptions. Confirm wire size, fusing, voltage drop, and mains work with qualified guidance.</p>
    </section>
    <section class="pricing" aria-labelledby="pricing-title">
      <div>
        <p class="eyebrow">Studio license</p>
        <h2 id="pricing-title">Plan larger builds for $12 once</h2>
        <p>Add multiple controllers and export a parts summary with the labeled SVG. Safety checks and basic SVG export stay free.</p>
      </div>
      <div class="price-action"><strong>$12</strong><span>one-time purchase</span><a class="button light" href="${BILLING_BASE}/checkout">Buy Studio</a></div>
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
  return `<aside class="demo-banner" aria-label="Demo mode">
    <strong>Demo — sample data, nothing is saved to your plans.</strong>
    <div><button class="text-button" id="reset-demo">Reset demo</button><button class="text-button" id="start-real">Start for real</button></div>
  </aside>`;
}

function planner(): string {
  const checks = runChecks(layout);
  const warningCount = checks.filter((check) => check.level === 'warn').length;
  const active = layout.segments.find((segment) => segment.id === activeSegmentId) ?? layout.segments[0];
  if (active && !activeSegmentId) activeSegmentId = active.id;
  return `${header()}${demoMode ? demoBanner() : ''}<main id="main" class="planner-page">
    <section class="planner-heading">
      <div><p class="eyebrow">Layout workspace</p><h1 tabindex="-1">Check your LED layout</h1><p>Edit the plan, then work through every marked assumption.</p></div>
      <div class="heading-actions"><span id="save-status" role="status">Changes save in this browser</span><button id="undo" ${undoStack.length ? '' : 'disabled'}>Undo</button><button class="primary" id="export-svg">Export labeled SVG</button></div>
    </section>
    <section class="workspace" aria-label="LED layout editor">
      <aside class="tool-rail" aria-labelledby="tools-title">
        <h2 id="tools-title">Place</h2>
        <button class="tool ${activeTool === 'select' ? 'active' : ''}" data-tool="select" aria-pressed="${activeTool === 'select'}"><span>↖</span>Select</button>
        <button class="tool ${activeTool === 'segment' ? 'active' : ''}" data-tool="segment" aria-pressed="${activeTool === 'segment'}"><span>⌁</span>Segment</button>
        <button class="tool ${activeTool === 'controller' ? 'active' : ''}" data-tool="controller" aria-pressed="${activeTool === 'controller'}"><span>⬡</span>Controller</button>
        <button class="tool ${activeTool === 'supply' ? 'active' : ''}" data-tool="supply" aria-pressed="${activeTool === 'supply'}"><span>◇</span>Supply</button>
        <div class="keyboard-place">
          <h3>Keyboard point</h3>
          <label>X <input id="point-x" type="number" min="0" max="100" value="50" /></label>
          <label>Y <input id="point-y" type="number" min="0" max="100" value="50" /></label>
          <button id="add-point">Place at coordinates</button>
        </div>
        ${drawingPoints.length ? `<div class="draw-status" role="status"><strong>${drawingPoints.length} points in new segment</strong><button id="finish-segment" ${drawingPoints.length < 2 ? 'disabled' : ''}>Finish segment</button><button id="cancel-draw">Cancel</button></div>` : ''}
      </aside>
      <div class="plan-wrap">
        <div class="plan-toolbar">
          <label>Plan name<input id="layout-name" value="${escapeHtml(layout.name)}" maxlength="70" /></label>
          <button id="motion-toggle" aria-pressed="${motionPaused}">${motionPaused ? 'Play data flow' : 'Pause data flow'}</button>
        </div>
        <div id="plan-canvas" class="plan-canvas" tabindex="0" role="application" aria-label="LED layout plan. Choose a placement tool, then click to place it.">
          ${planSvg(layout)}
        </div>
        <p class="canvas-help">Choose Segment, Controller, or Supply. Then click the plan. Use the coordinate controls for keyboard placement.</p>
      </div>
      <aside class="check-panel" aria-labelledby="checks-title">
        <div class="check-title"><div><p class="eyebrow">Live preflight</p><h2 id="checks-title">${warningCount ? `${warningCount} ${warningCount === 1 ? 'warning' : 'warnings'}` : 'Ready to review'}</h2></div><span class="check-count ${warningCount ? 'has-warnings' : ''}">${warningCount ? '!' : '✓'}</span></div>
        <dl class="totals"><div><dt>Pixels</dt><dd>${layout.segments.reduce((n, segment) => n + segment.pixels, 0)}</dd></div><div><dt>Current</dt><dd>${totalCurrent(layout).toFixed(1)} A</dd></div><div><dt>Power</dt><dd>${totalWatts(layout).toFixed(0)} W</dd></div></dl>
        <ul class="check-list">${checks.map((check) => `<li class="${check.level}"><span aria-hidden="true">${check.level === 'pass' ? '✓' : '!'}</span><div><strong>${escapeHtml(check.title)}</strong><p>${escapeHtml(check.detail)}</p></div></li>`).join('')}</ul>
        <p class="safety-note"><strong>Estimate only.</strong> Confirm wire size, fusing, voltage drop, and mains work with qualified guidance.</p>
      </aside>
    </section>
    <section class="setup" aria-labelledby="setup-title">
      <div class="setup-heading"><div><p class="eyebrow">Plan details</p><h2 id="setup-title">Set the assumptions</h2></div><p>Current uses the values below. A 20% supply margin appears in the checks.</p></div>
      <div class="setup-grid">
        <fieldset><legend>Whole plan</legend>
          <label>LED voltage<select id="voltage"><option value="5" ${layout.voltage === 5 ? 'selected' : ''}>5 V</option><option value="12" ${layout.voltage === 12 ? 'selected' : ''}>12 V</option></select></label>
          <label>Max current per pixel<input id="pixel-current" type="number" min="1" max="100" value="${layout.milliAmpsPerPixel}" /><span>mA</span></label>
          <label>Planned brightness<input id="brightness" type="range" min="1" max="100" value="${layout.brightness}" /><output id="brightness-output">${layout.brightness}%</output></label>
        </fieldset>
        <fieldset><legend>Selected segment</legend>${active ? segmentFields(active) : '<p class="empty-copy">Draw a segment to set its pixel count and power points.</p>'}</fieldset>
        <fieldset><legend>Sources</legend>
          ${layout.controllers.map((controller) => `<div class="source-row"><span class="source-mark controller-mark">C</span><label>${escapeHtml(controller.name)}<input data-controller-name="${controller.id}" value="${escapeHtml(controller.name)}" /></label></div>`).join('') || '<p>No controller placed.</p>'}
          ${layout.supplies.map((supply) => `<div class="source-row"><span class="source-mark supply-mark">P</span><label>${escapeHtml(supply.name)}<input data-supply-amps="${supply.id}" type="number" min="0.1" max="200" step="0.1" value="${supply.amps}" aria-label="${escapeHtml(supply.name)} available amps" /><span>A</span></label></div>`).join('') || '<p>No supply placed.</p>'}
          <button id="add-controller" class="secondary">Add controller ${paid ? '' : '· Studio'}</button>
        </fieldset>
      </div>
    </section>
    ${studioSection()}
  </main>${footer()}<div id="toast" class="toast" role="status" aria-live="polite"></div>`;
}

function segmentFields(segment: Segment): string {
  return `<label>Segment<select id="active-segment">${layout.segments.map((item) => `<option value="${item.id}" ${item.id === segment.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label>
    <label>Name<input id="segment-name" value="${escapeHtml(segment.name)}" maxlength="40" /></label>
    <label>Pixel count<input id="segment-pixels" type="number" min="1" max="5000" value="${segment.pixels}" /></label>
    ${paid ? `<label>Controller<select id="segment-controller">${layout.controllers.map((controller) => `<option value="${controller.id}" ${controller.id === segment.controllerId ? 'selected' : ''}>${escapeHtml(controller.name)}</option>`).join('')}</select></label>` : ''}
    <label>Data direction<select id="segment-direction"><option value="forward" ${segment.direction === 'forward' ? 'selected' : ''}>Start → end</option><option value="reverse" ${segment.direction === 'reverse' ? 'selected' : ''}>End → start</option></select></label>
    <label>Power enters<select id="segment-injection"><option value="none" ${segment.injection === 'none' ? 'selected' : ''}>Not marked</option><option value="start" ${segment.injection === 'start' ? 'selected' : ''}>Data start</option><option value="both" ${segment.injection === 'both' ? 'selected' : ''}>Both ends</option></select></label>
    <p class="field-result">Estimated segment current: <strong>${segmentCurrent(segment, layout).toFixed(1)} A</strong></p>`;
}

function studioSection(): string {
  return `<section class="studio-panel" aria-labelledby="studio-title">
    <div><p class="eyebrow">Optional Studio</p><h2 id="studio-title">Multiple controllers and a parts summary</h2><p>$12 once. The free planner keeps its safety checks and labeled SVG export.</p></div>
    <div class="studio-actions">${paid ? `<span class="license-active">✓ Studio active</span><button id="export-summary">Export parts summary</button>` : `<a class="button light" href="${BILLING_BASE}/checkout">Buy Studio for $12</a>${licenseNotice ? `<p class="license-notice">${escapeHtml(licenseNotice)}</p>` : ''}<details><summary>Have a license?</summary><label>License token<input id="license-token" autocomplete="off" /></label><button id="verify-license">Verify license</button><p id="license-message" role="status"></p></details>`}</div>
  </section>`;
}

function planSvg(value: Layout): string {
  const markerDefs = palette.map((color, index) => `<marker id="arrow-${index}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="${color}"/></marker>`).join('');
  const segments = value.segments.map((segment, index) => {
    const points = segment.direction === 'reverse' ? [...segment.points].reverse() : segment.points;
    const coords = points.map((point) => `${point.x * 10},${point.y * 6}`).join(' ');
    const first = points[0];
    const last = points.at(-1)!;
    const color = palette[index % palette.length];
    return `<g class="plan-segment ${segment.id === activeSegmentId ? 'selected' : ''}" data-segment-id="${segment.id}">
      <polyline points="${coords}" stroke="${color}" marker-end="url(#arrow-${index % palette.length})" />
      ${points.map((point, pointIndex) => `<circle cx="${point.x * 10}" cy="${point.y * 6}" r="${pointIndex === 0 ? 7 : 4}" fill="${color}" />`).join('')}
      <circle class="data-spark ${motionPaused ? 'paused' : ''}" cx="${first.x * 10}" cy="${first.y * 6}" r="7" fill="#ffd166"><animateMotion dur="2.4s" repeatCount="indefinite" path="${polylinePath(points)}" /></circle>
      <text x="${first.x * 10 + 10}" y="${first.y * 6 - 10}">START · ${escapeHtml(segment.name)} · ${segment.pixels}px</text>
      <text x="${last.x * 10 + 10}" y="${last.y * 6 + 20}">END</text>
      ${injectionMarks(segment, points, color)}
    </g>`;
  }).join('');
  const drawing = drawingPoints.length ? `<g class="drawing-segment"><polyline points="${drawingPoints.map((point) => `${point.x * 10},${point.y * 6}`).join(' ')}"/>${drawingPoints.map((point) => `<circle cx="${point.x * 10}" cy="${point.y * 6}" r="6"/>`).join('')}</g>` : '';
  const controllers = value.controllers.map((controller) => `<g class="controller-shape"><polygon points="${hexPoints(controller.point.x * 10, controller.point.y * 6, 15)}"/><text x="${controller.point.x * 10 + 20}" y="${controller.point.y * 6 + 5}">${escapeHtml(controller.name)}</text></g>`).join('');
  const supplies = value.supplies.map((supply) => `<g class="supply-shape"><path d="M${supply.point.x * 10} ${supply.point.y * 6 - 14}l14 14-14 14-14-14z"/><text x="${supply.point.x * 10 + 20}" y="${supply.point.y * 6 + 5}">${escapeHtml(supply.name)} · ${supply.amps}A</text></g>`).join('');
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
  return `${header()}<main id="main" class="text-page"><p class="eyebrow">${privacy ? 'Privacy' : 'Terms'}</p><h1 tabindex="-1">${title}</h1>${privacy ? `
    <p>LED Layout Checker stores your plan and license token in this browser. It does not send plan data to our servers.</p>
    <h2>What leaves your browser</h2><p>Opening checkout or verifying a license contacts the Sociobot billing service. Checkout is handled by Sociobot and its merchant of record.</p>
    <h2>Demo data</h2><p>Demo changes use a separate browser key. “Start for real” removes that demo copy.</p>
    <h2>Delete your data</h2><p>Clear this site’s browser storage to remove plans and license data.</p>` : `
    <p>This tool provides conservative estimates from the values you enter. It is not electrical advice or certification.</p>
    <h2>Your responsibility</h2><p>Confirm supply sizing, wire gauge, fusing, voltage drop, connectors, and mains work with qualified guidance.</p>
    <h2>Studio purchase</h2><p>Studio is a $12 one-time license. Sociobot and Dodo are the merchant of record. Approved refunds revoke the license.</p>
    <h2>No warranty</h2><p>The software is provided “as is” under the MIT License. Stop if a check conflicts with qualified advice.</p>`}<a class="button primary" href="/planner" data-link>Open the planner</a></main>${footer()}`;
}

function notFound(): string {
  return `${header()}<main id="main" class="not-found"><div class="broken-path" aria-hidden="true"><span>1</span><i></i><span>?</span></div><p class="eyebrow">404 · open circuit</p><h1 tabindex="-1">This path does not connect</h1><p>The page may have moved. Your saved plan is still in this browser.</p><a class="button primary" href="/planner" data-link>Return to the planner</a></main>${footer()}`;
}

function renderRoute(focusHeading = true): void {
  const path = location.pathname.replace(/\/$/, '') || '/';
  demoMode = path === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
  if (isPlannerPath(path)) layout = loadLayout();
  const pages: Record<string, () => string> = {
    '/': landing,
    '/planner': planner,
    '/demo': planner,
    '/privacy': () => legalPage('privacy'),
    '/terms': () => legalPage('terms'),
  };
  app.innerHTML = (pages[path] ?? notFound)();
  document.title = path === '/' ? 'LED Layout Checker — plan strips before soldering' : path === '/demo' ? 'Demo — LED Layout Checker' : path === '/privacy' ? 'Privacy — LED Layout Checker' : path === '/terms' ? 'Terms — LED Layout Checker' : path === '/planner' ? 'Planner — LED Layout Checker' : 'Page not found — LED Layout Checker';
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://led-layout-checker.sociobot.in${path}`);
  bindCommon();
  if (isPlannerPath(path)) bindPlanner();
  if (focusHeading) requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('h1');
    heading?.focus({ preventScroll: true });
    const status = document.querySelector<HTMLElement>('#route-status');
    if (status) status.textContent = heading?.textContent ?? 'Page changed';
  });
}

function bindCommon(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    navigate(new URL(link.href).pathname);
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
  document.querySelector('#add-point')?.addEventListener('click', () => {
    const x = Number((document.querySelector<HTMLInputElement>('#point-x'))?.value);
    const y = Number((document.querySelector<HTMLInputElement>('#point-y'))?.value);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) return toast('Use coordinates from 0 to 100.');
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
    localStorage.removeItem(DEMO_KEY); layout = sampleLayout(); undoStack = []; saveLayout('Demo reset'); renderRoute(false);
  });
  document.querySelector('#start-real')?.addEventListener('click', () => {
    localStorage.removeItem(DEMO_KEY); navigate('/planner');
  });
  document.querySelector('#export-svg')?.addEventListener('click', exportSvg);
  document.querySelector('#export-summary')?.addEventListener('click', exportSummary);
  document.querySelector('#motion-toggle')?.addEventListener('click', () => { motionPaused = !motionPaused; renderRoute(false); });
  document.querySelector('#add-controller')?.addEventListener('click', () => {
    if (!paid) return toast('Studio adds multiple controllers. Enter a license below or buy Studio.');
    activeTool = 'controller'; toast('Controller tool selected. Click the plan to place it.'); renderRoute(false);
  });
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
}

function changeSegment(action: (segment: Segment) => void): void {
  const segment = layout.segments.find((item) => item.id === activeSegmentId);
  if (segment) updateAndRender(() => action(segment));
}

function placeFromPointer(event: Event): void {
  if (activeTool === 'select') return;
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
    updateAndRender(() => layout.controllers.push({ id: crypto.randomUUID(), name: `Controller ${layout.controllers.length + 1}`, point }));
  } else if (activeTool === 'supply') {
    updateAndRender(() => layout.supplies.push({ id: crypto.randomUUID(), name: `Supply ${layout.supplies.length + 1}`, point, volts: layout.voltage, amps: 10 }));
  } else {
    toast('Choose what to place first.');
  }
}

function finishSegment(): void {
  if (drawingPoints.length < 2) return toast('Add at least two points to finish a segment.');
  const id = crypto.randomUUID();
  updateAndRender(() => {
    layout.segments.push({ id, name: `Segment ${layout.segments.length + 1}`, points: [...drawingPoints], pixels: 60, color: palette[layout.segments.length % palette.length], direction: 'forward', injection: 'none', controllerId: layout.controllers[0]?.id ?? '' });
    activeSegmentId = id; drawingPoints = []; activeTool = 'select';
  });
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
  const text = [`${layout.name} — parts summary`, '', `Voltage: ${layout.voltage} V`, `Pixels: ${layout.segments.reduce((n, s) => n + s.pixels, 0)}`, `Estimated current: ${totalCurrent(layout).toFixed(1)} A`, `Estimated power: ${totalWatts(layout).toFixed(0)} W`, '', 'Segments:', ...layout.segments.map((s) => `- ${s.name}: ${s.pixels} pixels, ${segmentCurrent(s, layout).toFixed(1)} A, power ${s.injection}`), '', 'Supplies:', ...layout.supplies.map((s) => `- ${s.name}: ${s.volts} V, ${s.amps} A stated`), '', 'Planning estimate only. Confirm wire size, fusing, voltage drop, and mains work.'].join('\n');
  download(`${slug(layout.name)}-parts.txt`, text, 'text/plain');
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
  if (!token || !message) return;
  message.textContent = 'Checking license…';
  try {
    const response = await fetch(`${BILLING_BASE}/verify?license=${encodeURIComponent(token)}`);
    const result = await response.json() as { valid: boolean; reason?: string };
    if (!result.valid) { message.textContent = 'That license is not active. Check the token and try again.'; return; }
    localStorage.setItem(LICENSE_KEY, token);
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ valid: true, checkedAt: Date.now() }));
    paid = true; licenseNotice = ''; renderRoute(false); toast('Studio license verified.');
  } catch {
    message.textContent = 'The license service could not be reached. Check your connection and try again.';
  }
}

async function checkStoredLicense(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const returned = params.get('license');
  if (returned) {
    localStorage.setItem(LICENSE_KEY, returned);
    params.delete('license');
    history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
  }
  const token = returned || localStorage.getItem(LICENSE_KEY);
  if (!token) return;
  const cached = safeCache(localStorage.getItem(LICENSE_CACHE_KEY));
  if (cached) {
    paid = cached.valid;
    licenseNotice = cached.valid ? '' : 'This license is no longer active.';
    if (isPlannerPath()) renderRoute(false);
  }
  if (cached && Date.now() - cached.checkedAt < 86_400_000) return;
  try {
    const response = await fetch(`${BILLING_BASE}/verify?license=${encodeURIComponent(token)}`);
    const result = await response.json() as { valid: boolean };
    paid = result.valid;
    licenseNotice = result.valid ? '' : 'This license is no longer active.';
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    if (isPlannerPath()) renderRoute(false);
  } catch { /* The free planner and cached verdict keep working offline. */ }
}

function safeCache(raw: string | null): { valid: boolean; checkedAt: number } | null {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

window.addEventListener('popstate', () => renderRoute());
renderRoute(false);
void checkStoredLicense();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
