/*
 * The calm site's shared behaviour (home, about): the dot cursor, rolling
 * links, reveals, the clock, the theme key, and the doorway to the
 * playground. Load after cursor.js.
 */
;(() => {
  const html = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]

  // The shared cursor lives in cursor.js; the page still works without it.
  // Kept on window so a page can hold a shape (the reel, mid-drag).
  if (window.DotCursor) window.dotCursor = DotCursor()

  /* Rolling links: each letter gets a twin to roll in. */
  $$('[data-roll]').forEach((el) => {
    const t = el.textContent
    // The letters are hidden from screen readers, so the link carries the name.
    const a = el.closest('a')
    if (a && !a.hasAttribute('aria-label')) a.setAttribute('aria-label', t)
    else el.setAttribute('aria-label', t)
    el.innerHTML = [...t].map((c, i) => `<span style="--ri:${i}" data-c="${c}" aria-hidden="true">${c}</span>`).join('')
  })

  /* Glitch: now and then a marked element slips for a beat. Copies are made
     after the rolls are built, so they match the real thing letter for letter. */
  if (!reduced) $$('[data-glitch]').forEach((h) => {
    const s = $('.line > span', h) || h
    const copies = ['a', 'b'].map((k) => {
      const c = document.createElement('span')
      c.className = `glitch glitch-${k}`
      c.innerHTML = s.innerHTML
      c.setAttribute('aria-hidden', 'true'); c.inert = true
      return c
    })
    s.append(...copies)
    const burst = () => {
      if (!document.hidden) {
        h.classList.add('glitching')
        setTimeout(() => h.classList.remove('glitching'), 610)
      }
      setTimeout(burst, 3500)
    }
    setTimeout(burst, 3500)
  })

  /* Decode: on reveal, each letter appears as gibberish, cycles for a beat,
     then settles on the real one, left to right. Runs after the rolls are
     built, so PLACE decodes letter by letter too. */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>/\\[]{}=+?'
  $$('[data-decode]').forEach((el) => {
    if (reduced) return el.classList.add('ready')
    const nodes = [], chars = []
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    while (walk.nextNode()) nodes.push(walk.currentNode)
    nodes.forEach((n) => {
      if (!n.data.trim() || n.parentElement.closest('.ne')) return
      const frag = document.createDocumentFragment()
      for (const c of n.data) {
        // Spaces stay plain text, so the lines still wrap where they did.
        if (/\s/.test(c)) { frag.append(c); continue }
        const s = document.createElement('span')
        s.className = 'ch wait'; s.textContent = c
        frag.append(s); chars.push(s)
      }
      n.replaceWith(frag)
    })
    el.classList.add('ready')

    const run = () => {
      const t0 = performance.now(), STEP = 13, CYCLE = 377, TICK = 34
      let last = 0
      const frame = (now) => {
        const t = now - t0, tick = now - last > TICK
        if (tick) last = now
        let busy = false
        chars.forEach((s, i) => {
          const start = i * STEP
          if (t < start) { busy = true; return }
          if (t < start + CYCLE) {
            busy = true
            if (s.classList.contains('wait')) s.classList.replace('wait', 'scr')
            if (tick || !s.dataset.s) s.dataset.s = GLYPHS[Math.random() * GLYPHS.length | 0]
            return
          }
          if (s.className !== 'ch') { s.className = 'ch'; delete s.dataset.s }
        })
        if (busy) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }
    // Start with the page's reveal, at the same beat the lines used to rise.
    const host = el.closest('[data-reveal]')
    if (!host) return run()
    const mo = new MutationObserver(() => {
      if (host.classList.contains('in')) { mo.disconnect(); setTimeout(run, 144) }
    })
    mo.observe(host, { attributes: true, attributeFilter: ['class'] })
  })

  /* Reveals: wait for the fonts, so lines don't rise in a fallback face. */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
  }), { rootMargin: '0px 0px -10% 0px' })
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 610))])
    .then(() => { splitLines(); $$('[data-reveal]').forEach((el) => io.observe(el)) })

  /* Lines: paragraphs are split into the lines they actually wrap to, each
     rising out of its own mask. Once the last one lands they're stitched
     back together, so the text rewraps freely on resize. */
  function splitLines() {
    const ps = $$('[data-lines]')
    let n = 0, last = null
    ps.forEach((p) => {
      if (reduced) return p.classList.add('ready')
      // Words become spans to measure; links and other elements stay whole.
      ;[...p.childNodes].forEach((node) => {
        if (node.nodeType !== 3) return
        const frag = document.createDocumentFragment()
        node.data.split(/(\s+)/).forEach((w) => {
          if (!w) return
          if (/^\s+$/.test(w)) return frag.append(w)
          const s = document.createElement('span'); s.className = 'w'; s.textContent = w
          frag.append(s)
        })
        node.replaceWith(frag)
      })
      const lh = parseFloat(getComputedStyle(p).lineHeight)
      const rows = []
      let top = null
      ;[...p.childNodes].forEach((node) => {
        if (node.nodeType === 1) {
          const t = node.getBoundingClientRect().top
          if (top === null || t > top + lh / 2) { rows.push([]); top = t }
        }
        if (!rows.length) rows.push([])
        rows[rows.length - 1].push(node)
      })
      p.textContent = ''
      rows.forEach((row) => {
        const line = document.createElement('span'); line.className = 'line'
        last = document.createElement('span'); last.style.setProperty('--i', n++)
        last.append(...row); line.append(last); p.append(line)
      })
      p.classList.add('ready')
    })
    if (!last) return
    last.offsetHeight // settle the hidden state before the reveal starts
    // Only the last line's own slide counts; a link's hover fade bubbles up too.
    const done = (e) => {
      if (e.target !== last || e.propertyName !== 'transform') return
      last.removeEventListener('transitionend', done)
      ps.forEach((p) => {
        $$('.line', p).forEach((l) => l.replaceWith(...l.firstChild.childNodes))
        $$('.w', p).forEach((w) => w.replaceWith(w.textContent))
        p.normalize()
      })
    }
    last.addEventListener('transitionend', done)
  }

  /* Clock */
  const clock = $('.clock')
  if (clock) {
    // Always Bellingham time, whoever's looking.
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Los_Angeles' })
    const tick = () => { clock.textContent = 'Bellingham, WA :: ' + fmt.format(new Date()) }
    tick(); setInterval(tick, 1000)
  }

  /* Arriving by warp: resolve out of the blur. */
  window.Warp?.in($('[data-warp]'))

  /* Dreamatorium link: aqua cursor and a bubble hint that trails above;
     clicking melts the page into a blur on the way out. */
  const links = $$('[data-playground]')
  if (!links.length) return
  const hint = document.createElement('div'); hint.className = 'hint'; hint.setAttribute('aria-hidden', 'true')
  hint.textContent = 'lets fucking go!1'
  document.body.append(hint)
  let hx = 0, hy = 0, tx = 0, ty = 0, on = false, raf = 0
  const follow = () => {
    hx += (tx - hx) * 0.16; hy += (ty - hy) * 0.16
    // Sits centred above the cursor, growing up out of it.
    hint.style.transform = `translate3d(${hx}px, ${hy}px, 0) translate(-50%, calc(-100% - 21px)) scale(${on ? 1 : 0.6})`
    if (on || Math.abs(tx - hx) > 0.5) raf = requestAnimationFrame(follow)
  }
  links.forEach((pg) => {
    pg.addEventListener('pointerenter', (e) => {
      html.classList.add('aero-hint')
      if (reduced || e.pointerType === 'touch') return
      on = true; tx = hx = e.clientX; ty = hy = e.clientY
      hint.classList.add('on'); cancelAnimationFrame(raf); follow()
    })
    pg.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY })
    pg.addEventListener('pointerleave', () => { html.classList.remove('aero-hint'); on = false; hint.classList.remove('on') })
    pg.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || !window.Warp) return
      e.preventDefault()
      on = false; hint.classList.remove('on')
      Warp.out($('[data-warp]'), pg.href)
    })
  })
  addEventListener('pageshow', () => html.classList.remove('aero-hint'))
})()
