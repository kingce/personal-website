const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const gsapApi = window.gsap;

const projects = [
  {
    slug: "place",
    name: "PLACE",
    years: "2023-present",
    visual: "visual-place",
    summary:
      "Designing product experiences for the future of home ownership, from agent workflows to consumer-facing decision moments.",
    notes:
      "Placeholder notes for strategy, product definition, core flows, prototypes, and interaction design across the home ownership journey.",
  },
  {
    slug: "loupe",
    name: "Swaap x Loupe",
    years: "2025-Present",
    visual: "visual-loupe",
    summary:
      "Democratizing entrepeneurship by redefining the future of live selling.",
    notes:
      "Placeholder notes for discovery, IA, workflow design, prototype loops, and system-level interaction patterns.",
  },
  {
    slug: "areapro",
    name: "AreaPro",
    years: "2023-present",
    visual: "visual-areapro",
    summary:
      "Helping real estate agents become experts in real estate market data through design and AI.",
    notes:
      "Placeholder notes for interaction models, data display, notification logic, and prototype-driven product alignment.",
  },
  {
    slug: "books",
    name: "Books",
    years: "Select Favorites",
    visual: "visual-nest",
    summary:
      "All the unapologetic bangers that I've encountered in my literary journey - from design to philosophy to SFF.",
    notes:
      "Placeholder notes for journey mapping, task hierarchy, mobile patterns, and lightweight product storytelling.",
  },
  {
    slug: "writing",
    name: "Writing",
    years: "2020-present",
    visual: "visual-writing",
    summary:
      "Select works ranging from short fiction to design essays to thoughts scribbled on napkins for later.",
    notes:
      "Placeholder notes for dashboard structure, audit moments, action states, and high-confidence interaction design.",
  },
  {
    slug: "haven",
    name: "Haven",
    years: "2021-2022",
    visual: "visual-haven",
    summary:
      "A placeholder customer portal for simplifying high-consideration home decisions and support moments.",
    notes:
      "Placeholder notes for service design, account surfaces, progress states, and consumer-facing product clarity.",
  },
  {
    slug: "compass",
    name: "Compass",
    years: "2021",
    visual: "visual-compass",
    summary:
      "A placeholder planning tool for helping teams understand priorities, milestones, and dependencies.",
    notes:
      "Placeholder notes for planning workflows, shared context, timeline views, and lightweight collaboration.",
  },
  {
    slug: "foundation",
    name: "Foundation",
    years: "2020-2021",
    visual: "visual-foundation",
    summary:
      "A placeholder design system effort focused on durable components, interaction patterns, and accessibility.",
    notes:
      "Placeholder notes for component strategy, token structure, documentation, and scalable product craft.",
  },
  {
    slug: "key",
    name: "Key",
    years: "2020",
    visual: "visual-key",
    summary:
      "A placeholder onboarding experience designed to make complex setup feel direct and confidence-building.",
    notes:
      "Placeholder notes for first-run flows, empty states, guided setup, and activation metrics.",
  },
  {
    slug: "orchard",
    name: "Orchard",
    years: "2019-2020",
    visual: "visual-orchard",
    summary:
      "A placeholder insights surface for turning scattered product signals into focused next steps.",
    notes:
      "Placeholder notes for information hierarchy, analytics patterns, filtering, and decision support.",
  },
];

let page = document.querySelector("[data-router-view]");
let isNavigating = false;
let needsRouteRender = false;
let cursor = null;
let carouselCleanup = null;
let pendingMindOpen = false;
let statusGliderX = null;
let statusGliderY = null;
let statusGliderActiveTween = null;

const gliderDefaults = {
  quickStretchX: 1.3,
  fullStretchX: 1.26,
  quickSquashY: 0.85,
  fullSquashY: 0.89,
  settleX: 1,
  settleY: 1.1,
  quickStretchDuration: 0.35,
  fullStretchDuration: 0.27,
  quickSettleDuration: 0.3,
  fullSettleDuration: 0.04,
  returnDuration: 0.26,
  stretchEase: "circ.out",
  settleEase: "circ.out",
  returnEase: "circ.out",
};

let gliderSettings = { ...gliderDefaults };

const cursorDefaults = {
  dotDelay: 0.12,
  badgeDelay: 0.34,
  curvePower: 1.65,
  badgeOffsetX: 0,
  badgeOffsetY: 0,
};

let cursorSettings = { ...cursorDefaults };

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const dragPrompt = "⟷";
const dragActivePrompt = "⟷";
const caseStudyPrompt = "see more";
let cursorBadgeText = dragPrompt;
let cursorBadgeTween = null;

function setCursorBadgeText(text, shouldAnimate = true) {
  const badge = qs(".cursor-badge");
  const badgeText = qs(".cursor-badge__text") || badge;
  if (!badgeText) {
    return;
  }

  const shouldRevealSameText = shouldAnimate === "reveal" && cursorBadgeText === text;
  if (cursorBadgeText === text && !shouldRevealSameText) {
    return;
  }

  if (!shouldAnimate || prefersReducedMotion || !gsapApi) {
    cursorBadgeText = text;
    badgeText.textContent = text;
    badgeText.style.opacity = "1";
    badgeText.style.transform = "translateY(0)";
    return;
  }

  cursorBadgeTween?.kill();

  const fromY = "120%";
  cursorBadgeTween = gsapApi
    .timeline()
    .to(badgeText, {
      y: text === dragActivePrompt ? "-120%" : "120%",
      opacity: 0,
      duration: shouldRevealSameText ? 0 : 0.14,
      ease: "power2.out",
    }, 0)
    .call(() => {
      cursorBadgeText = text;
      badgeText.textContent = text;
    })
    .set(badgeText, {
      y: fromY,
      opacity: 0,
    })
    .to(badgeText, {
      y: "0%",
      opacity: 1,
      duration: 0.38,
      ease: "power3.out",
    });
}

function hideCursorBadgeText() {
  const badgeText = qs(".cursor-badge__text");
  if (!badgeText || prefersReducedMotion || !gsapApi) {
    if (badgeText) {
      badgeText.style.opacity = "0";
      badgeText.style.transform = "translateY(110%)";
    }
    return;
  }

  cursorBadgeTween?.kill();
  cursorBadgeTween = gsapApi.to(badgeText, {
    y: "120%",
    opacity: 0,
    duration: 0.18,
    ease: "power2.in",
  });
}

function easeFollower(current, target, delay, curvePower, deltaSeconds) {
  const safeDelay = Math.max(delay, 0.01);
  const baseProgress = 1 - Math.exp(-deltaSeconds / safeDelay);
  const curvedProgress = 1 - Math.pow(1 - baseProgress, Math.max(curvePower, 0.1));
  return current + (target - current) * curvedProgress;
}

function roundCursorSetting(value) {
  return Number(value.toFixed(3));
}

function cursorSettingsJson() {
  return JSON.stringify(
    {
      dotDelay: roundCursorSetting(cursorSettings.dotDelay),
      badgeDelay: roundCursorSetting(cursorSettings.badgeDelay),
      curvePower: roundCursorSetting(cursorSettings.curvePower),
      badgeOffsetX: roundCursorSetting(cursorSettings.badgeOffsetX),
      badgeOffsetY: roundCursorSetting(cursorSettings.badgeOffsetY),
    },
    null,
    2,
  );
}

function projectBySlug(slug) {
  return projects.find((project) => project.slug === slug) || projects[0];
}

function routeFromHash() {
  const route = window.location.hash.replace(/^#/, "") || "/";
  return route.startsWith("/") ? route : `/${route}`;
}

function normalizedRoute() {
  const route = routeFromHash();
  return route === "/case-studies" ? "/" : route;
}

function setTheme(theme, options = {}) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("portfolio-theme", nextTheme);
  qsa(".theme-toggle").forEach((button) => {
    button.setAttribute(
      "aria-label",
      nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
    );
  });

  if (!options.animate || prefersReducedMotion || !gsapApi) {
    return;
  }

  const wash = qs(".theme-wash");
  if (!wash) return;

  const color = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  document.body.classList.add("theme-is-changing");
  wash.style.setProperty("--theme-wash-color", color);
  gsapApi.killTweensOf(wash);
  gsapApi
    .timeline({
      onComplete: () => {
        document.body.classList.remove("theme-is-changing");
      },
    })
    .set(wash, {
      opacity: 0.72,
      scale: 0,
    })
    .to(wash, {
      scale: 72,
      opacity: 0.18,
      duration: 0.72,
      ease: "power4.out",
    })
    .to(
      wash,
      {
        opacity: 0,
        duration: 0.48,
        ease: "power2.out",
      },
      "-=0.18",
    )
    .set(wash, { scale: 0 });
}

function initTheme() {
  const saved = localStorage.getItem("portfolio-theme");
  const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(saved || system);

  qsa(".theme-toggle").forEach((button) => {
    if (button.dataset.themeBound === "true") return;
    button.dataset.themeBound = "true";
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      setTheme(next, { animate: true });
    });
  });
}

function renderHome() {
  return `
    <div class="home-peel-shell">
      <section class="mind-layer" aria-labelledby="case-studies">
        <div class="section-heading">
          <h1 id="case-studies" class="mind-title" data-word-reveal>
            <span class="title-line">
              <span class="word">On</span>
              <span class="word">My</span>
              <span class="word">Desk</span>
            </span>
          </h1>
          <p class="mind-subtitle" data-animate="content">
            An index of what has my attention: work, play, and everything in between.
          </p>
        </div>
        <div class="project-carousel" data-drag-zone>
          <div class="project-track" data-project-track>
            ${projects
              .map(
                (project, index) => `
                  <a class="project-card" href="#/projects/${project.slug}" data-cursor-label="see more" draggable="false">
                    <span class="project-card__reveal reveal-mask">
                      <span class="reveal-item project-card__visual-reveal">
                        <span class="project-visual ${project.visual}" aria-hidden="true"><span>${String(index + 1).padStart(2, "0")}</span></span>
                      </span>
                    </span>
                    <span class="project-meta">
                      <span class="project-name">${project.name}</span>
                      <span class="project-year">${project.years}</span>
                    </span>
                  </a>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="home-sheet hero-section" aria-labelledby="home-title" data-home-sheet>
        <div class="home-visual" aria-hidden="true" data-home-visual="place">
          <span class="home-visual__image home-visual__image--place"></span>
          <span class="home-visual__image home-visual__image--loupe"></span>
          <span class="home-visual__image home-visual__image--coven"></span>
        </div>
        <div class="hero-content home-copy">
          <p id="home-title" class="home-intro" data-line-reveal>
            <span class="title-line"><span class="line-word">Daniel King is a multidisciplinary designer based in Bellingham, WA.</span></span>
          </p>
          <p class="busy-label" data-line-reveal>
            <span class="title-line"><span class="line-word">Currently busy</span></span>
          </p>
          <ul class="busy-list" aria-label="Currently busy with" data-animate="hero-links">
            <li>
              <a class="busy-link" href="#/projects/place" data-home-visual-target="place">
                Designing for the future of home ownership at PLACE
              </a>
            </li>
            <li>
              <a class="busy-link" href="#/projects/loupe" data-home-visual-target="loupe">
                Crafting a community-first live selling experience at Loupe
              </a>
            </li>
            <li>
              <a class="busy-link" href="#/projects/studio-coven" data-home-visual-target="coven">
                Exploring, playing, and breaking things at Studio Coven
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  `;
}

function renderAbout() {
  return `
    <section class="text-page about-page" aria-labelledby="about-title">
      <p class="eyebrow">About</p>
      <h1 id="about-title" class="page-title" data-word-reveal>
        <span class="title-line"><span class="word">Designing</span> <span class="word">quiet,</span></span>
        <span class="title-line"><span class="word">useful</span> <span class="word">systems</span></span>
        <span class="title-line"><span class="word">for</span> <span class="word">real</span> <span class="word">life.</span></span>
      </h1>
      <div class="about-grid" data-animate="content">
        <p>I am a product designer focused on making complex operational tools feel calm, legible, and decisively useful. Right now, I am designing products that help shape the future of home ownership at PLACE.</p>
        <p>This portfolio is intentionally short: a handful of selected projects, each framed around the problem, the product surface, and the design contribution.</p>
      </div>
      <dl class="profile-list" data-animate="content">
        <div><dt>Focus</dt><dd>Product strategy, interaction design, prototyping, design systems</dd></div>
        <div><dt>Tools</dt><dd>Figma, Principle, Framer, HTML, CSS, JavaScript</dd></div>
        <div><dt>Available for</dt><dd>Selected collaborations and product conversations</dd></div>
      </dl>
    </section>
  `;
}

function renderProject(slug) {
  const project = projectBySlug(slug);
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return `
    <article class="project-page">
      <a class="back-link text-link magnetic-link" href="#/">Back to work</a>
      <header class="project-hero">
        <p class="eyebrow">${project.years}</p>
        <h1 class="page-title" data-word-reveal><span class="title-line"><span class="word">${project.name}</span></span></h1>
        <p class="project-summary" data-animate="content">${project.summary}</p>
      </header>
      <div class="project-image-grid" data-animate="content">
        <div class="project-image-placeholder ${project.visual}"><span>${project.name} / 01</span></div>
        <div class="project-image-placeholder ${project.visual}"><span>${project.name} / 02</span></div>
      </div>
      <section class="project-notes" data-animate="content">
        <h2>What I worked on</h2>
        <p>${project.notes}</p>
      </section>
      <nav class="project-pager" aria-label="Project navigation">
        <a class="text-link magnetic-link" href="#/projects/${previous.slug}">Previous</a>
        <a class="text-link magnetic-link" href="#/projects/${next.slug}">Next</a>
      </nav>
    </article>
  `;
}

function viewForRoute(route) {
  if (route === "/case-studies") {
    pendingMindOpen = true;
    route = "/";
  }

  if (route === "/about") {
    document.body.dataset.page = "about";
    document.title = "About | Portfolio";
    return { className: "content-page", html: renderAbout() };
  }

  if (route.startsWith("/projects/")) {
    const slug = route.split("/").filter(Boolean)[1];
    const project = projectBySlug(slug);
    document.body.dataset.page = "project";
    document.title = `${project.name} | Portfolio`;
    return { className: "content-page", html: renderProject(slug) };
  }

  document.body.dataset.page = "home";
  document.title = "Portfolio | Product Design";
  return { className: "", html: renderHome() };
}

function animateIn(scope = document) {
  if (prefersReducedMotion || !gsapApi) {
    qsa(".word", scope).forEach((word) => {
      word.style.transform = "none";
    });
    qsa(".line-word", scope).forEach((line) => {
      line.style.transform = "none";
    });
    return;
  }

  const words = qsa("[data-word-reveal] .word", scope);
  const lines = qsa("[data-line-reveal] .line-word", scope);
  const content = qsa("[data-animate='content'], [data-animate='hero-links']", scope);

  gsapApi.set(words, { yPercent: 116, rotate: 1.5 });
  gsapApi.set(lines, { yPercent: 112, rotate: 0.7 });
  gsapApi.set(content, { y: 24, opacity: 0 });

  const tl = gsapApi.timeline({ defaults: { ease: "power4.out" } });
  tl.to(words, {
    yPercent: 0,
    rotate: 0,
    duration: 1.05,
    stagger: 0.045,
  });

  if (lines.length) {
    tl.to(
      lines,
      {
        yPercent: 0,
        rotate: 0,
        duration: 0.9,
        stagger: 0.08,
      },
      words.length ? "-=0.82" : 0,
    );
  }

  tl.to(
    content,
    {
      y: 0,
      opacity: 1,
      duration: 0.75,
      stagger: 0.08,
    },
    "-=0.68",
  );
}

function animateHomeOut(sheet) {
  if (prefersReducedMotion || !gsapApi || !sheet) {
    return Promise.resolve();
  }

  const lines = qsa("[data-line-reveal] .line-word", sheet);
  const content = qsa("[data-animate='hero-links']", sheet);
  return gsapApi
    .timeline()
    .to(content, { y: 18, opacity: 0, duration: 0.28, ease: "power2.in" })
    .to(lines, { yPercent: -112, rotate: -0.7, duration: 0.42, stagger: 0.04, ease: "power3.in" }, "-=0.16")
    .to(sheet, { opacity: 0, duration: 0.22, ease: "power2.out" }, "-=0.08");
}

function animateMindIn(items, words = [], content = []) {
  if (prefersReducedMotion || !gsapApi) {
    words.forEach((word) => {
      word.style.transform = "none";
    });
    content.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
    });
    items.forEach((item) => {
      item.style.transform = "none";
    });
    return Promise.resolve();
  }

  gsapApi.set(words, { yPercent: 116, rotate: 1.5 });
  gsapApi.set(content, { y: 22, opacity: 0 });
  gsapApi.set(items, { yPercent: 112 });
  return gsapApi
    .timeline({ defaults: { ease: "power4.out" } })
    .to(words, {
      yPercent: 0,
      rotate: 0,
      duration: 1.05,
      stagger: 0.045,
    })
    .to(
      content,
      {
        y: 0,
        opacity: 1,
        duration: 0.72,
      },
      "-=0.72",
    )
    .to(
      items,
      {
        yPercent: 0,
        duration: 0.72,
        stagger: 0.025,
      },
      "-=0.44",
    );
}

function animateMindOut(items, words = [], content = []) {
  if (prefersReducedMotion || !gsapApi) {
    return Promise.resolve();
  }

  return gsapApi
    .timeline()
    .to(content, { y: 16, opacity: 0, duration: 0.24, ease: "power2.in" })
    .to(words, { yPercent: -116, rotate: -1.5, duration: 0.38, stagger: 0.03, ease: "power3.in" }, "-=0.16")
    .to(items, { yPercent: 112, duration: 0.4, stagger: 0.025, ease: "power3.in" }, "-=0.24");
}

function animateOut() {
  if (prefersReducedMotion || !gsapApi || !page) {
    return Promise.resolve();
  }

  return gsapApi.to(page, {
    y: -16,
    opacity: 0,
    duration: 0.34,
    ease: "power2.inOut",
  });
}

function initCursor() {
  const dot = qs(".cursor-dot");
  const badge = qs(".cursor-badge");

  if (!dot || !badge || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  const badgeText = qs(".cursor-badge__text") || badge;
  badgeText.textContent = cursorBadgeText;

  const state = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    dotX: window.innerWidth / 2,
    dotY: window.innerHeight / 2,
    badgeX: window.innerWidth / 2,
    badgeY: window.innerHeight / 2,
    lastTime: performance.now(),
  };

  function render(now) {
    const deltaSeconds = Math.min((now - state.lastTime) / 1000, 0.08);
    state.lastTime = now;
    state.dotX = easeFollower(
      state.dotX,
      state.x,
      cursorSettings.dotDelay,
      cursorSettings.curvePower,
      deltaSeconds,
    );
    state.dotY = easeFollower(
      state.dotY,
      state.y,
      cursorSettings.dotDelay,
      cursorSettings.curvePower,
      deltaSeconds,
    );
    state.badgeX = easeFollower(
      state.badgeX,
      state.x + cursorSettings.badgeOffsetX,
      cursorSettings.badgeDelay,
      cursorSettings.curvePower,
      deltaSeconds,
    );
    state.badgeY = easeFollower(
      state.badgeY,
      state.y + cursorSettings.badgeOffsetY,
      cursorSettings.badgeDelay,
      cursorSettings.curvePower,
      deltaSeconds,
    );

    dot.style.transform = `translate3d(${state.dotX - 5}px, ${state.dotY - 5}px, 0)`;
    badge.style.left = `${state.badgeX}px`;
    badge.style.top = `${state.badgeY}px`;
    cursor.raf = requestAnimationFrame(render);
  }

  window.addEventListener("pointermove", (event) => {
    state.x = event.clientX;
    state.y = event.clientY;
    document.body.classList.add("cursor-ready");
  });

  cursor = { raf: requestAnimationFrame(render) };
}

function initCursorAdminPanel() {
  if (qs("[data-cursor-admin]") || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  const saved = localStorage.getItem("portfolio-cursor-settings");
  if (saved) {
    try {
      cursorSettings = { ...cursorDefaults, ...JSON.parse(saved) };
    } catch {
      cursorSettings = { ...cursorDefaults };
    }
  }

  const panel = document.createElement("aside");
  panel.className = "cursor-admin";
  panel.setAttribute("data-cursor-admin", "");
  panel.innerHTML = `
    <button class="cursor-admin__toggle" type="button" aria-expanded="false">Cursor</button>
    <div class="cursor-admin__panel" aria-label="Cursor follower settings">
      <div class="cursor-admin__header">
        <span>Cursor follower</span>
        <button class="cursor-admin__copy" type="button">Copy JSON</button>
      </div>
      <label>
        <span>Dot delay <strong data-cursor-value="dotDelay"></strong></span>
        <input type="range" min="0.04" max="0.45" step="0.01" data-cursor-setting="dotDelay" />
      </label>
      <label>
        <span>Badge delay <strong data-cursor-value="badgeDelay"></strong></span>
        <input type="range" min="0.08" max="0.9" step="0.01" data-cursor-setting="badgeDelay" />
      </label>
      <label>
        <span>Curve power <strong data-cursor-value="curvePower"></strong></span>
        <input type="range" min="0.5" max="4" step="0.05" data-cursor-setting="curvePower" />
      </label>
      <label>
        <span>Badge X <strong data-cursor-value="badgeOffsetX"></strong></span>
        <input type="range" min="-80" max="80" step="1" data-cursor-setting="badgeOffsetX" />
      </label>
      <label>
        <span>Badge Y <strong data-cursor-value="badgeOffsetY"></strong></span>
        <input type="range" min="-80" max="80" step="1" data-cursor-setting="badgeOffsetY" />
      </label>
      <textarea class="cursor-admin__json" readonly spellcheck="false" aria-label="Cursor settings JSON"></textarea>
      <button class="cursor-admin__reset" type="button">Reset</button>
    </div>
  `;
  document.body.append(panel);

  const toggle = qs(".cursor-admin__toggle", panel);
  const copy = qs(".cursor-admin__copy", panel);
  const reset = qs(".cursor-admin__reset", panel);
  const json = qs(".cursor-admin__json", panel);
  const inputs = qsa("[data-cursor-setting]", panel);

  function syncPanel() {
    inputs.forEach((input) => {
      const key = input.dataset.cursorSetting;
      input.value = cursorSettings[key];
      const value = qs(`[data-cursor-value="${key}"]`, panel);
      if (value) {
        value.textContent = roundCursorSetting(cursorSettings[key]);
      }
    });
    json.value = cursorSettingsJson();
    localStorage.setItem("portfolio-cursor-settings", json.value);
  }

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      cursorSettings[input.dataset.cursorSetting] = Number(input.value);
      syncPanel();
    });
  });

  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(json.value);
      copy.textContent = "Copied";
      window.setTimeout(() => {
        copy.textContent = "Copy JSON";
      }, 1100);
    } catch {
      json.select();
      document.execCommand("copy");
    }
  });

  reset.addEventListener("click", () => {
    cursorSettings = { ...cursorDefaults };
    syncPanel();
  });

  syncPanel();
}

function initCursorZones(scope = document) {
  qsa("[data-drag-zone]", scope).forEach((zone) => {
    zone.addEventListener("pointerenter", () => {
      document.body.classList.add("cursor-drag");
      setCursorBadgeText(dragPrompt, "reveal");
    });

    zone.addEventListener("pointerleave", () => {
      if (!document.body.classList.contains("is-dragging")) {
        document.body.classList.remove("cursor-drag");
        setCursorBadgeText(dragPrompt, false);
        hideCursorBadgeText();
      }
    });
  });

  qsa(".project-card", scope).forEach((card) => {
    card.addEventListener("pointerenter", () => {
      if (!document.body.classList.contains("carousel-armed")) {
        setCursorBadgeText(caseStudyPrompt);
      }
    });

    card.addEventListener("pointerleave", () => {
      if (document.body.classList.contains("cursor-drag")) {
        setCursorBadgeText(dragPrompt);
      }
    });
  });
}

function initMagneticLinks(scope = document) {
  if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  qsa(".magnetic-link", scope).forEach((link) => {
    link.addEventListener("pointermove", (event) => {
      const rect = link.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.24;
      link.style.transform = `translate(${x}px, ${y}px)`;
    });

    link.addEventListener("pointerleave", () => {
      link.style.transform = "";
    });
  });
}

function initCarousel(scope = document) {
  carouselCleanup?.();

  const wrap = qs("[data-drag-zone]", scope);
  const track = qs("[data-project-track]", scope);

  if (!wrap || !track) {
    carouselCleanup = null;
    return;
  }

  let startX = 0;
  let startScroll = 0;
  let targetScroll = wrap.scrollLeft;
  let isDown = false;
  let didDrag = false;
  let didHoldToDrag = false;
  let hasPassedDragThreshold = false;
  let suppressNextClick = false;
  let velocity = 0;
  let previousX = 0;
  let momentum = null;
  let smoothRaf = null;
  let holdTimer = null;
  const dragThreshold = 12;
  const holdThreshold = 180;
  const compressedScale = 0.7;

  function maxScroll() {
    return Math.max(0, wrap.scrollWidth - wrap.clientWidth);
  }

  function clampScroll(value) {
    return Math.max(0, Math.min(maxScroll(), value));
  }

  function setDragScale(isActive) {
    wrap.style.setProperty("--drag-scale", String(isActive ? compressedScale : 1));
    document.body.classList.toggle("carousel-armed", isActive);
    setCursorBadgeText(isActive ? dragActivePrompt : dragPrompt);
    targetScroll = clampScroll(targetScroll);
  }

  function smoothToTarget() {
    targetScroll = clampScroll(targetScroll);
    const distance = targetScroll - wrap.scrollLeft;
    if (Math.abs(distance) < 0.35) {
      wrap.scrollLeft = targetScroll;
      smoothRaf = null;
      return;
    }

    wrap.scrollLeft += distance * 0.22;
    smoothRaf = requestAnimationFrame(smoothToTarget);
  }

  function requestSmoothScroll() {
    if (!smoothRaf) {
      smoothRaf = requestAnimationFrame(smoothToTarget);
    }
  }

  function onPointerDown(event) {
    if (event.button !== 0) return;
    cancelAnimationFrame(momentum);
    cancelAnimationFrame(smoothRaf);
    smoothRaf = null;
    isDown = true;
    didDrag = false;
    didHoldToDrag = false;
    hasPassedDragThreshold = false;
    startX = event.clientX;
    previousX = event.clientX;
    startScroll = wrap.scrollLeft;
    targetScroll = wrap.scrollLeft;
    velocity = 0;
    setDragScale(true);
    holdTimer = window.setTimeout(() => {
      if (isDown) {
        didHoldToDrag = true;
      }
    }, holdThreshold);
  }

  function onPointerMove(event) {
    if (!isDown) return;
    const delta = event.clientX - startX;
    velocity = event.clientX - previousX;
    previousX = event.clientX;

    if (Math.abs(delta) > dragThreshold) {
      hasPassedDragThreshold = true;
      didDrag = true;
    }

    if (hasPassedDragThreshold) {
      if (!wrap.hasPointerCapture(event.pointerId)) {
        wrap.setPointerCapture(event.pointerId);
      }
      document.body.classList.add("is-dragging", "cursor-drag");
      event.preventDefault();
      targetScroll = clampScroll(startScroll - delta * 1.55);
      requestSmoothScroll();
    }
  }

  function onPointerUp(event) {
    if (!isDown) return;
    isDown = false;
    clearTimeout(holdTimer);
    document.body.classList.remove("is-dragging");
    setDragScale(false);
    if (!wrap.matches(":hover")) {
      document.body.classList.remove("cursor-drag");
    }
    if (wrap.hasPointerCapture(event.pointerId)) {
      wrap.releasePointerCapture(event.pointerId);
    }

    if (didDrag || didHoldToDrag) {
      suppressNextClick = true;
    }

    if (!didDrag) {
      return;
    }

    let glide = -velocity * 3.2;
    function coast() {
      if (Math.abs(glide) < 0.2) return;
      targetScroll = clampScroll(targetScroll + glide);
      requestSmoothScroll();
      glide *= 0.92;
      momentum = requestAnimationFrame(coast);
    }
    coast();
  }

  function onClick(event) {
    if (suppressNextClick) {
      event.preventDefault();
      event.stopPropagation();
      suppressNextClick = false;
    }
  }

  function onWheel(event) {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    targetScroll = clampScroll(wrap.scrollLeft + event.deltaX);
    requestSmoothScroll();
  }

  function onNativeDrag(event) {
    event.preventDefault();
  }

  wrap.addEventListener("pointerdown", onPointerDown);
  wrap.addEventListener("pointermove", onPointerMove);
  wrap.addEventListener("pointerup", onPointerUp);
  wrap.addEventListener("pointercancel", onPointerUp);
  wrap.addEventListener("click", onClick, true);
  wrap.addEventListener("dragstart", onNativeDrag);
  wrap.addEventListener("wheel", onWheel, { passive: true });

  carouselCleanup = () => {
    cancelAnimationFrame(momentum);
    cancelAnimationFrame(smoothRaf);
    clearTimeout(holdTimer);
    setDragScale(false);
    wrap.removeEventListener("pointerdown", onPointerDown);
    wrap.removeEventListener("pointermove", onPointerMove);
    wrap.removeEventListener("pointerup", onPointerUp);
    wrap.removeEventListener("pointercancel", onPointerUp);
    wrap.removeEventListener("click", onClick, true);
    wrap.removeEventListener("dragstart", onNativeDrag);
    wrap.removeEventListener("wheel", onWheel);
  };
}

function initHomeVisuals(scope = document) {
  const visual = qs("[data-home-visual]", scope);
  const links = qsa("[data-home-visual-target]", scope);

  if (!visual || !links.length) return;

  links.forEach((link) => {
    const target = link.dataset.homeVisualTarget;
    link.addEventListener("pointerenter", () => {
      visual.dataset.homeVisual = target;
    });
    link.addEventListener("focus", () => {
      visual.dataset.homeVisual = target;
    });
  });
}

function initPeelControls(scope = document) {
  const shell = qs(".home-peel-shell", scope);
  const sheet = qs("[data-home-sheet]", scope);
  const mindLayer = qs(".mind-layer", scope);
  const openButton = qs("[data-mind-open]");
  const homeButton = qs("[data-status-home]");
  const mindRevealItems = qsa(".mind-layer .reveal-item", scope);
  const mindWords = qsa(".mind-layer [data-word-reveal] .word", scope);
  const mindContent = qsa(".mind-layer [data-animate='content']", scope);

  if (!shell || !sheet || !mindLayer || !openButton || !homeButton) {
    return;
  }

  function setMindOpen(isOpen) {
    shell.classList.toggle("mind-open", isOpen);
    openButton.setAttribute("aria-label", "Case studies");
    setActiveStatus(openButton, isOpen);
    setActiveStatus(homeButton, !isOpen);
    sheet.toggleAttribute("aria-hidden", isOpen);
    mindLayer.toggleAttribute("aria-hidden", !isOpen);
  }

  function resetMindReveal() {
    if (prefersReducedMotion || !gsapApi) return;
    gsapApi.set(mindWords, { yPercent: 116, rotate: 1.5 });
    gsapApi.set(mindContent, { y: 22, opacity: 0 });
    gsapApi.set(mindRevealItems, { yPercent: 112 });
  }

  function resetHomeReveal() {
    if (prefersReducedMotion || !gsapApi) return;
    gsapApi.set(qsa("[data-word-reveal] .word", sheet), { yPercent: 116, rotate: 1.5 });
    gsapApi.set(qsa("[data-line-reveal] .line-word", sheet), { yPercent: 112, rotate: 0.7 });
    gsapApi.set(qsa("[data-animate='hero-links']", sheet), { y: 24, opacity: 0 });
  }

  function playHomeReveal() {
    animateIn(sheet);
  }

  function showMindImmediately(shouldAnimate = true) {
    pendingMindOpen = false;
    gsapApi?.killTweensOf([sheet, mindLayer, ...mindWords, ...mindContent, ...mindRevealItems]);
    setMindOpen(true);
    sheet.style.opacity = "0";
    mindLayer.style.opacity = "1";
    mindLayer.style.transform = "none";

    if (shouldAnimate && !prefersReducedMotion && gsapApi) {
      animateMindIn(mindRevealItems, mindWords, mindContent);
    } else {
      mindWords.forEach((word) => {
        word.style.transform = "none";
      });
      mindContent.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      mindRevealItems.forEach((item) => {
        item.style.transform = "none";
      });
    }
  }

  function transitionToMind() {
    if (shell.classList.contains("mind-open")) return;

    if (prefersReducedMotion || !gsapApi) {
      setMindOpen(true);
      sheet.style.opacity = "0";
      mindLayer.style.opacity = "1";
      mindLayer.style.transform = "none";
      mindWords.forEach((word) => {
        word.style.transform = "none";
      });
      mindContent.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      mindRevealItems.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    gsapApi.killTweensOf([sheet, mindLayer, ...mindWords, ...mindContent, ...mindRevealItems]);
    gsapApi.set(mindLayer, { opacity: 1, x: 0 });
    resetMindReveal();

    gsapApi
      .timeline()
      .add(animateHomeOut(sheet))
      .call(() => setMindOpen(true))
      .add(animateMindIn(mindRevealItems, mindWords, mindContent), "-=0.08");
  }

  function transitionToHome() {
    if (!shell.classList.contains("mind-open")) return;

    if (prefersReducedMotion || !gsapApi) {
      setMindOpen(false);
      sheet.style.opacity = "";
      mindLayer.style.opacity = "0";
      mindLayer.style.transform = "";
      resetMindReveal();
      return;
    }

    gsapApi.killTweensOf([sheet, mindLayer, ...mindWords, ...mindContent, ...mindRevealItems]);

    gsapApi
      .timeline()
      .add(animateMindOut(mindRevealItems, mindWords, mindContent))
      .call(resetHomeReveal)
      .call(() => setMindOpen(false))
      .set(sheet, { opacity: 1 })
      .set(mindLayer, { opacity: 0, x: 18 })
      .call(playHomeReveal);
  }

  resetMindReveal();
  if (pendingMindOpen) {
    showMindImmediately(true);
  } else {
    setMindOpen(false);
  }

  openButton.onclick = () => {
    if (openButton.getAttribute("aria-current") === "page") {
      moveStatusGlider(openButton, { quick: true });
      return;
    }

    moveStatusGlider(openButton, { quick: true });
    if (!document.body.matches("[data-page='home']")) {
      pendingMindOpen = true;
      window.location.hash = "#/case-studies";
      return;
    }

    if (shell.classList.contains("mind-open")) {
      transitionToHome();
    } else {
      transitionToMind();
    }
  };

  homeButton.onclick = () => {
    if (homeButton.getAttribute("aria-current") === "page") {
      moveStatusGlider(homeButton, { quick: true });
      return;
    }

    moveStatusGlider(homeButton, { quick: true });
    if (!document.body.matches("[data-page='home']")) {
      window.location.hash = "#/";
      return;
    }

    if (shell.classList.contains("mind-open")) {
      transitionToHome();
    }
  };
}

function initStatusBar() {
  const homeButton = qs("[data-status-home]");
  const caseButton = qs("[data-mind-open]");
  const hasHomeShell = Boolean(qs(".home-peel-shell"));

  if (!homeButton || !caseButton || hasHomeShell) {
    return;
  }

  homeButton.onclick = () => {
    if (homeButton.getAttribute("aria-current") === "page") {
      moveStatusGlider(homeButton, { quick: true });
      return;
    }

    moveStatusGlider(homeButton, { quick: true });
    window.location.hash = "#/";
  };

  caseButton.onclick = () => {
    if (caseButton.getAttribute("aria-current") === "page") {
      moveStatusGlider(caseButton, { quick: true });
      return;
    }

    moveStatusGlider(caseButton, { quick: true });
    pendingMindOpen = true;
    window.location.hash = "#/case-studies";
  };
}

function initStatusPressFeedback() {
  qsa(".status-action").forEach((action) => {
    if (action.dataset.pressBound === "true") return;
    action.dataset.pressBound = "true";
    action.addEventListener("pointerdown", () => {
      moveStatusGlider(action, { quick: true });
    });
    action.addEventListener("click", (event) => {
      if (action.getAttribute("aria-current") !== "page") return;
      event.preventDefault();
      moveStatusGlider(action, { quick: true });
    });
  });
}

function updateHeaderActive(route) {
  const homeButton = qs("[data-status-home]");
  const caseButton = qs("[data-mind-open]");
  const aboutLink = qs(".status-action[href='#/about']");
  const isCaseRoute = route === "/case-studies";
  const isProjectRoute = route.startsWith("/projects/");
  const isHome = route === "/";
  const isAbout = route === "/about";
  const isMindOpen = isCaseRoute || isProjectRoute || Boolean(qs(".home-peel-shell.mind-open"));

  setActiveStatus(homeButton, isHome && !isMindOpen);
  setActiveStatus(caseButton, isMindOpen);
  setActiveStatus(aboutLink, isAbout);
}

function setActiveStatus(element, isActive) {
  if (!element) return;

  if (isActive) {
    if (element.getAttribute("aria-current") === "page") {
      syncStatusGlider(element);
      return;
    }

    qsa(".status-action").forEach((action) => {
      action.classList.remove("is-press-target");
      action.classList.remove("is-press-exit");
    });
    element.setAttribute("aria-current", "page");
    moveStatusGlider(element);
  } else {
    element.removeAttribute("aria-current");
  }
}

function getStatusGliderGeometry(activeElement) {
  return {
    width: Math.round(activeElement.offsetWidth),
    height: Math.round(activeElement.offsetHeight),
    x: Math.round(activeElement.offsetLeft),
    y: Math.round(activeElement.offsetTop),
  };
}

function syncStatusGlider(activeElement) {
  const glider = qs(".status-glider");
  if (!glider || !activeElement) return;

  const { width, height, x, y } = getStatusGliderGeometry(activeElement);
  const isSameTarget =
    statusGliderX !== null &&
    statusGliderY !== null &&
    Math.abs(x - statusGliderX) < 0.5 &&
    Math.abs(y - statusGliderY) < 0.5;

  if (isSameTarget && statusGliderActiveTween?.isActive()) {
    return;
  }

  if (prefersReducedMotion || !gsapApi) {
    glider.style.opacity = "1";
    glider.style.width = `${width}px`;
    glider.style.height = `${height}px`;
    glider.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    statusGliderX = x;
    statusGliderY = y;
    return;
  }

  gsapApi.set(glider, {
    opacity: 1,
    x,
    y,
    width,
    height,
    scaleX: 1,
    scaleY: 1,
  });
}

function getGliderTiming(options = {}) {
  return {
    stretchX: options.quick ? gliderSettings.quickStretchX : gliderSettings.fullStretchX,
    squashY: options.quick ? gliderSettings.quickSquashY : gliderSettings.fullSquashY,
    stretchDuration: options.quick ? gliderSettings.quickStretchDuration : gliderSettings.fullStretchDuration,
    settleDuration: options.quick ? gliderSettings.quickSettleDuration : gliderSettings.fullSettleDuration,
  };
}

function moveStatusGlider(activeElement, options = {}) {
  const bar = qs(".status-bar");
  const glider = qs(".status-glider");

  if (!bar || !glider || !activeElement) return;

  if (options.quick) {
    qsa(".status-action").forEach((action) => {
      action.classList.toggle("is-press-target", action === activeElement);
      action.classList.toggle("is-press-exit", action !== activeElement && action.hasAttribute("aria-current"));
    });
  }

  const { width: targetWidth, height: targetHeight, x, y } = getStatusGliderGeometry(activeElement);
  const isSameTarget =
    statusGliderX !== null &&
    statusGliderY !== null &&
    Math.abs(x - statusGliderX) < 0.5 &&
    Math.abs(y - statusGliderY) < 0.5;

  if (isSameTarget && options.quick && activeElement.classList.contains("is-press-target")) {
    return;
  }

  if (isSameTarget && !options.quick) {
    if (statusGliderActiveTween?.isActive()) {
      return;
    }

    if (!prefersReducedMotion && gsapApi) {
      gsapApi.set(glider, {
        opacity: 1,
        x,
        y,
        width: targetWidth,
        height: targetHeight,
        scaleX: 1,
        scaleY: 1,
      });
    }
    return;
  }

  const direction = statusGliderX === null ? 0 : Math.sign(x - statusGliderX);
  const stretchOrigin = direction < 0 ? "right center" : "left center";
  statusGliderX = x;
  statusGliderY = y;

  if (prefersReducedMotion || !gsapApi) {
    glider.style.opacity = "1";
    glider.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    return;
  }

  gsapApi.killTweensOf(glider);
  const timing = getGliderTiming(options);
  gsapApi.set(glider, { transformOrigin: stretchOrigin });
  statusGliderActiveTween = gsapApi
    .timeline()
    .to(glider, {
      opacity: 1,
      x,
      y,
      width: targetWidth,
      height: targetHeight,
      scaleX: direction === 0 ? 1 : timing.stretchX,
      scaleY: timing.squashY,
      duration: timing.stretchDuration,
      ease: gliderSettings.stretchEase,
    })
    .to(glider, {
      scaleX: gliderSettings.settleX,
      scaleY: gliderSettings.settleY,
      duration: timing.settleDuration,
      ease: gliderSettings.settleEase,
    })
    .to(glider, {
      scaleX: 1,
      scaleY: 1,
      duration: gliderSettings.returnDuration,
      ease: gliderSettings.returnEase,
      onComplete: () => {
        qsa(".status-action").forEach((action) => {
          action.classList.remove("is-press-target", "is-press-exit");
        });
      },
    });
}

window.addEventListener("resize", () => {
  const active = qs(".status-action[aria-current='page']");
  if (active) {
    moveStatusGlider(active);
  }
});

function initPage(scope = document) {
  initTheme();
  initCursorZones(scope);
  initMagneticLinks(scope);
  initCarousel(scope);
  initHomeVisuals(scope);
  initPeelControls(scope);
  initStatusBar();
  initStatusPressFeedback();
  updateHeaderActive(routeFromHash());
  animateIn(scope);
}

async function renderRoute() {
  if (isNavigating) {
    needsRouteRender = true;
    return;
  }

  isNavigating = true;

  do {
    needsRouteRender = false;

    await animateOut();

    const route = routeFromHash();
    const view = viewForRoute(route);
    page.className = view.className;
    page.innerHTML = view.html;
    page.style.opacity = "";
    page.style.transform = "";
    window.scrollTo(0, 0);
    document.body.classList.remove("cursor-drag", "is-dragging");
    document.body.classList.remove("carousel-armed");
    setCursorBadgeText(dragPrompt, false);
    hideCursorBadgeText();
    initPage(page);
  } while (needsRouteRender && routeFromHash() !== route);

  isNavigating = false;
}

window.addEventListener("hashchange", renderRoute);

if (!window.location.hash) {
  window.location.hash = "#/";
}

const initial = viewForRoute(routeFromHash());
page.className = initial.className;
page.innerHTML = initial.html;
initCursorAdminPanel();
initCursor();
initPage(page);
