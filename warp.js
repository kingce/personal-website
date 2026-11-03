/*
 * Page-to-page warp: the page melts into a gaussian blur while an SVG
 * displacement map ripples it, then whites out. The next page starts
 * white and resolves back out of the blur.
 *
 *   Warp.out(el, href)   blur `el` away, then go to href
 *   Warp.in(el)          if we arrived by warp, resolve `el` back in
 *
 * Pages add `warp-in` to <html> in their head when sessionStorage has
 * the flag, and hide [data-warp] until Warp.in takes over, so there's
 * no flash of the sharp page first.
 */
;(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const NS = 'http://www.w3.org/2000/svg'
  let disp, turb, veil

  const setup = () => {
    if (disp) return
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true')
    svg.style.position = 'absolute'
    svg.innerHTML =
      '<filter id="dk-warp" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="7" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>'
    document.body.append(svg)
    disp = svg.querySelector('feDisplacementMap'); turb = svg.querySelector('feTurbulence')
    veil = document.createElement('div')
    veil.setAttribute('aria-hidden', 'true')
    veil.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:2147482000'
    document.body.append(veil)
  }

  // e: 0 = sharp, 1 = fully melted and white.
  const frame = (el, e, t) => {
    disp.setAttribute('scale', (e * 160).toFixed(1))
    turb.setAttribute('baseFrequency', `${(0.005 + e * 0.004 + Math.sin(t / 90) * 0.0008).toFixed(4)} ${(0.011 + e * 0.012).toFixed(4)}`)
    el.style.filter = e > 0.002 ? `url(#dk-warp) blur(${(e * 30).toFixed(2)}px) saturate(${(1 + e * 0.8).toFixed(2)}) brightness(${(1 + e * 0.25).toFixed(2)})` : ''
    el.style.transform = e > 0.002 ? `scale(${(1 + e * 0.07).toFixed(4)})` : ''
    veil.style.opacity = Math.max(0, (e - 0.4) / 0.6).toFixed(3)
  }
  const run = (el, from, to, dur, ease) => new Promise((done) => {
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur)
      frame(el, from + (to - from) * ease(p), now)
      if (p < 1) requestAnimationFrame(tick)
      else done()
    }
    requestAnimationFrame(tick)
  })
  const easeIn = (p) => p * p * p
  const easeOut = (p) => 1 - Math.pow(1 - p, 4)

  let busy = false
  window.Warp = {
    out(el, href) {
      if (busy) return
      if (reduced || !el) { location.href = href; return }
      busy = true; setup()
      try { sessionStorage.setItem('dk-warp', '1') } catch {}
      el.style.willChange = 'filter, transform'
      run(el, 0, 1, 950, easeIn).then(() => { location.href = href })
    },
    in(el) {
      const html = document.documentElement
      let flagged = false
      try { flagged = sessionStorage.getItem('dk-warp') === '1'; sessionStorage.removeItem('dk-warp') } catch {}
      if (!flagged || reduced || !el) { html.classList.remove('warp-in'); return Promise.resolve() }
      setup(); frame(el, 1, 0)
      html.classList.remove('warp-in')
      return run(el, 1, 0, 1300, easeOut).then(() => { el.style.willChange = ''; frame(el, 0, 0) })
    },
  }
  // Back button from the next page: don't come back to a melted page.
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return
    busy = false
    document.querySelectorAll('[data-warp]').forEach((el) => { el.style.filter = ''; el.style.transform = '' })
    if (veil) veil.style.opacity = 0
  })
})()
