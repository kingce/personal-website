/*
 * Dot-matrix cursor, from Studio Coven. Two fixed pools of round pixels
 * rearrange between arrow, hand, I-beam and hourglass, taking a breath
 * on the way (out from the tip, then back in). Over anything clickable
 * the fill lights up, rippling out from the tip.
 *
 * Shared by every page. Colours come from custom properties, so a page
 * can reskin it:  --dc-outline, --dc-fill, --dc-lit, --dc-glow, --dc-shade.
 * `data-cursor="arrow|hand|text|wait|drag"` forces a shape.
 * Mouse and trackpad only: touch, reduced motion and forced colours keep
 * the native cursor.
 *
 *   const cursor = DotCursor({ busy: true }); … cursor.ready()
 */
;(() => {
  const CSS = `
html.has-dot-cursor, html.has-dot-cursor * { cursor: none !important; }
.dc {
  --pitch: 2.5px; --dot: 1.75px; --breath: 0.5;
  --dc-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dc-ease-in: cubic-bezier(0.64, 0, 0.78, 0);
  --dc-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  position: fixed; left: 0; top: 0; z-index: 2147483000; pointer-events: none;
  opacity: 0; transition: opacity 144ms var(--dc-ease-out); will-change: transform;
}
.dc.is-shown { opacity: 1; }
.dc-body { transform-origin: 0 0; transition: transform 233ms var(--dc-ease-out); }
.dc-body.is-down { transform: scale(0.9); }
.dc-dot { position: absolute; left: 0; top: 0; transform: translate(calc(var(--x) * var(--pitch)), calc(var(--y) * var(--pitch))); transition: transform 610ms var(--dc-ease-in-out), opacity 233ms var(--dc-ease-out); }
.dc-dot.is-spare { opacity: 0; }
.dc-dot b { position: relative; display: block; width: var(--dot); height: var(--dot); margin: calc((var(--pitch) - var(--dot)) / 2); border-radius: 50%; }
.breath-0 .dc-dot b { animation: dc-breath-0 610ms both; }
.breath-1 .dc-dot b { animation: dc-breath-1 610ms both; }
@keyframes dc-breath-0 {
  0% { transform: none; animation-timing-function: var(--dc-ease-out); }
  45% { transform: translate(calc(var(--mx) * var(--pitch) * var(--breath)), calc(var(--my) * var(--pitch) * var(--breath))); animation-timing-function: var(--dc-ease-in-out); }
  100% { transform: none; }
}
@keyframes dc-breath-1 {
  0% { transform: none; animation-timing-function: var(--dc-ease-out); }
  45% { transform: translate(calc(var(--mx) * var(--pitch) * var(--breath)), calc(var(--my) * var(--pitch) * var(--breath))); animation-timing-function: var(--dc-ease-in-out); }
  100% { transform: none; }
}
.dc-o b { background: var(--dc-outline, #030712); transition: background 233ms var(--dc-ease-out); }
.dc-f b { background: var(--dc-fill, #D1D5DB); transition: background 233ms var(--dc-ease-out); }
.dc-f u { position: absolute; inset: 0; border-radius: 50%; background: var(--dc-lit, #fff); box-shadow: 0 0 3px 1px var(--dc-glow, rgb(255 255 255 / 0.55)); opacity: 0; transition: opacity 144ms var(--dc-ease-in); transition-delay: calc(var(--r) * 3ms); }
.is-lit .dc-f u { opacity: 1; transition-timing-function: var(--dc-ease-out); transition-delay: calc(var(--r) * 13ms); }
.dc-shade { filter: drop-shadow(0 0 3px var(--dc-halo, rgb(255 255 255 / 0.9))) drop-shadow(0 0 14px var(--dc-halo-wide, rgb(255 255 255 / 0.6))); opacity: 0; transition: opacity 144ms var(--dc-ease-in); }
.is-lit .dc-shade { opacity: 0.8; transition-timing-function: var(--dc-ease-out); }
.dc-s b { width: var(--pitch); height: var(--pitch); margin: 0; background: var(--dc-shade, #030712); box-shadow: 0 0 4px var(--dc-shade, #030712); }
`

  const SHAPES = {
    arrow: { hot: [0, 0], rows: ['#','##','#.#','#..#','#...#','#....#','#.....#','#......#','#.......#','#........#','#.....#####','#..#..#','#.# #..#','##  #..#','#    #..#','     #..#','      ##'] },
    hand: { hot: [5, 0], rows: ['     ##','    #..#','    #..#','    #..#','    #..###','    #..#..###','    #..#..#..##',' ## #..#..#..#.#','#..##..........#','#...#..........#',' #.............#','  #............#','  #...........#','   #..........#','   #.........#','    #........#','    #........#','    ##########'] },
    text: { hot: [3, 8], rows: ['### ###','#..#..#',' ##.##','  #.#','  #.#','  #.#','  #.#','  #.#','  #.#','  #.#','  #.#','  #.#','  #.#',' ##.##','#..#..#','### ###'] },
    // Left-right double arrow: things you drag sideways rather than click into.
    drag: { hot: [10, 5], rows: ['     #         #','    ##         ##','   #.#         #.#','  #..###########..#',' #.................#','#...................#',' #.................#','  #..###########..#','   #.#         #.#','    ##         ##','     #         #'] },
    wait: { hot: [5, 8], rows: ['###########','#.........#','###########',' #.......#',' #.#.#.#.#','  #.#.#.#','   #...#','    #.#','    #.#','   #...#','  #..#..#',' #..###..#',' #.#####.#','###########','#.........#','###########'] },
  }
  const parse = ({ hot, rows }) => {
    const outline = [], fill = []
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row[x] === '#') outline.push([x - hot[0], y - hot[1]])
        else if (row[x] === '.') fill.push([x - hot[0], y - hot[1]])
      }
    })
    return { outline, fill }
  }
  const CURSORS = Object.fromEntries(Object.entries(SHAPES).map(([k, v]) => [k, parse(v)]))
  const POOL = {
    outline: Math.max(...Object.values(CURSORS).map((c) => c.outline.length)),
    fill: Math.max(...Object.values(CURSORS).map((c) => c.fill.length)),
  }
  const park = (n) => Array.from({ length: n }, () => [0, 0])
  // Every dot is always in use: each target cell takes its nearest free
  // dot, leftovers stack on the nearest cell until a bigger shape needs them.
  // Leftovers are listed in next.spare so they can fade out: stacked lit
  // dots would add their glows up into bright blobs.
  const morph = (pool, to) => {
    const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
    const next = new Array(pool.length), free = new Set(pool.map((_, i) => i))
    const order = to.map((_, j) => j).sort((a, b) => to[a][1] - to[b][1] || to[a][0] - to[b][0])
    for (const j of order) {
      let best = -1
      for (const i of free) if (best < 0 || dist(pool[i], to[j]) < dist(pool[best], to[j])) best = i
      if (best < 0) break
      free.delete(best); next[best] = to[j]
    }
    for (const i of free) {
      let best = to[0]
      for (const t of to) if (dist(pool[i], t) < dist(pool[i], best)) best = t
      next[i] = best
    }
    next.spare = free
    return next
  }

  const TEXT = 'input:not([type]), input[type="text"], input[type="email"], textarea, [contenteditable="true"]'
  const CLICK = 'a[href], button:not(:disabled), [role="button"], [role="tab"], [role="switch"], [role="slider"], label[for], select, summary, [data-click]'

  window.DotCursor = ({ busy = false } = {}) => {
    const html = document.documentElement
    const ok =
      matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !matchMedia('(forced-colors: active)').matches &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    const noop = { ready() {}, set() {}, hold() {}, el: null, pos: { x: -1e4, y: -1e4 } }
    if (!ok) return noop

    const style = document.createElement('style'); style.textContent = CSS; document.head.append(style)
    html.classList.add('has-dot-cursor')
    const root = document.createElement('div'); root.className = 'dc'; root.setAttribute('aria-hidden', 'true')
    const body = document.createElement('div'); body.className = 'dc-body breath-0'
    const shade = document.createElement('div'); shade.className = 'dc-shade'
    body.append(shade); root.append(body); document.body.append(root)
    const make = (layer, parent) => {
      const i = document.createElement('i'); i.className = `dc-dot dc-${layer}`
      const b = document.createElement('b'); if (layer === 'f') b.append(document.createElement('u'))
      i.append(b); parent.append(i); return i
    }
    const els = {
      so: Array.from({ length: POOL.outline }, () => make('s', shade)),
      sf: Array.from({ length: POOL.fill }, () => make('s', shade)),
      o: Array.from({ length: POOL.outline }, () => make('o', body)),
      f: Array.from({ length: POOL.fill }, () => make('f', body)),
    }
    let pools = { outline: park(POOL.outline), fill: park(POOL.fill) }, breath = 0, current = ''
    const place = (el, to, from) => {
      el.style.setProperty('--x', to[0]); el.style.setProperty('--y', to[1])
      el.style.setProperty('--mx', (from[0] + to[0]) / 2); el.style.setProperty('--my', (from[1] + to[1]) / 2)
      el.style.setProperty('--r', Math.round(Math.hypot(to[0], to[1])))
    }
    const set = (shape) => {
      if (shape === current || !CURSORS[shape]) return
      current = shape
      const from = pools
      pools = { outline: morph(from.outline, CURSORS[shape].outline), fill: morph(from.fill, CURSORS[shape].fill) }
      const spare = (els, s, i) => els.forEach((e) => e[i].classList.toggle('is-spare', s.has(i)))
      pools.outline.forEach((to, i) => { place(els.o[i], to, from.outline[i]); place(els.so[i], to, from.outline[i]); spare([els.o, els.so], pools.outline.spare, i) })
      pools.fill.forEach((to, i) => { place(els.f[i], to, from.fill[i]); place(els.sf[i], to, from.fill[i]); spare([els.f, els.sf], pools.fill.spare, i) })
      breath++
      body.classList.toggle('breath-0', breath % 2 === 0); body.classList.toggle('breath-1', breath % 2 === 1)
      body.classList.toggle('is-lit', shape === 'hand' || shape === 'drag')
    }
    let held = null
    const shapeFor = (el) => {
      if (busy) return 'wait'
      if (held) return held
      if (!el || !el.closest) return 'arrow'
      const forced = el.closest('[data-cursor]')
      if (forced && CURSORS[forced.dataset.cursor]) return forced.dataset.cursor
      if (el.closest(TEXT)) return 'text'
      if (el.closest(CLICK)) return 'hand'
      return 'arrow'
    }
    const pos = { x: -1e4, y: -1e4 }
    let shown = false, last = null
    const show = (v) => { if (v !== shown) { shown = v; root.classList.toggle('is-shown', v) } }
    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return show(false)
      pos.x = e.clientX; pos.y = e.clientY
      root.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      show(true)
    }, { passive: true })
    document.addEventListener('pointerover', (e) => { last = e.target; set(shapeFor(e.target)) })
    document.addEventListener('pointerout', (e) => { if (!e.relatedTarget) show(false) })
    addEventListener('pointerdown', () => body.classList.add('is-down'))
    addEventListener('pointerup', () => body.classList.remove('is-down'))
    addEventListener('blur', () => body.classList.remove('is-down'))
    addEventListener('keydown', (e) => {
      if (!(e.metaKey || e.ctrlKey || e.altKey || e.key === 'Shift' || e.key === 'Tab')) show(false)
    })
    set(shapeFor(null))
    return {
      el: root, pos,
      ready() { busy = false; current = ''; set(shapeFor(last)) },
      busy() { busy = true; set('wait') },
      // Keep a shape whatever's underneath (e.g. mid-drag, when pointer
      // capture stops hover events); hold(null) lets go.
      hold(shape) { held = shape; set(shapeFor(last)) },
      set,
    }
  }
})()
