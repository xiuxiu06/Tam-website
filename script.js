gsap.registerPlugin(ScrollTrigger, ScrollSmoother, MotionPathPlugin, Physics2DPlugin);

document.addEventListener('DOMContentLoaded', () => {
  let smoother = null;
  try {
    smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 2, effects: true, normalizeScroll: true });
  } catch (e) {}

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  if (document.querySelector('.box')) {
    gsap.from('.box', { duration: 1, y: 100, opacity: 0, stagger: 0.3 });
  }

  const horizontalSections = $$('.horizontal-section');
  const horizontalContainer = $('.horizontal-container');
  const horizontalSectionsWrap = $('.horizontal-sections');

  let horizontalScrollTween = null;
  if (horizontalSections.length && horizontalContainer && horizontalSectionsWrap) {
    horizontalScrollTween = gsap.to(horizontalSections, {
      xPercent: -100 * (horizontalSections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: horizontalContainer,
        pin: true,
        scrub: 1,
        snap: 1 / (horizontalSections.length - 1),
        end: () => '+=' + (horizontalSectionsWrap.offsetWidth - window.innerWidth)
      }
    });

    const projectsHeader = $('#projects-header');
    if (projectsHeader) {
      ScrollTrigger.create({ trigger: horizontalContainer, start: 'top top', end: () => '+=' + (horizontalSectionsWrap.offsetWidth - window.innerWidth), pin: '#projects-header', pinSpacing: false });
    }
  }

  horizontalSections.forEach(section => {
    const box = section.querySelector('.box');
    if (box) gsap.from(box, { scale: 0, rotation: 180, scrollTrigger: { trigger: section, containerAnimation: horizontalScrollTween, start: 'left 80%', end: 'left 20%', scrub: true } });

    const projectCard = section.querySelector('.project-card');
    if (projectCard) {
      const ensureVideoLoaded = (video) => {
        if (!video) return;
        const src = video.querySelector('source[data-src]');
        if (src && !src.src) { src.src = src.getAttribute('data-src'); video.load(); }
      };
      const playVideo = (sec) => { const v = sec.querySelector('video'); const overlay = sec.querySelector('.play-overlay'); if (!v) return; ensureVideoLoaded(v); if (overlay) overlay.style.display = 'none'; v.play().catch(() => {}); };
      const pauseVideo = (sec) => { const v = sec.querySelector('video'); if (v) try { v.pause(); } catch (e) {} };

      gsap.fromTo(projectCard, { y: 40, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: section, containerAnimation: horizontalScrollTween, start: 'left center', end: 'right center', scrub: 0.6, toggleActions: 'play reverse play reverse', onEnter: () => playVideo(section), onEnterBack: () => playVideo(section), onLeave: () => pauseVideo(section), onLeaveBack: () => pauseVideo(section) } });
    }
  });

  $$('.project-video').forEach(pv => {
    const video = pv.querySelector('video');
    const src = video ? video.querySelector('source[data-src]') : null;
    const btn = pv.querySelector('.play-overlay');
    const load = () => { if (src && !src.src) { src.src = src.getAttribute('data-src'); video.load(); } };
    if (btn && video) btn.addEventListener('click', () => { load(); btn.style.display = 'none'; video.play().catch(() => {}); });
  });

  const TECH_ACTIVE_DURATION = 1400;
  $$('.tech-tag').forEach(tag => {
    if (!tag.hasAttribute('role')) tag.setAttribute('role', 'button');
    if (!tag.hasAttribute('tabindex')) tag.setAttribute('tabindex', '0');
    tag.setAttribute('aria-pressed', 'false');
    const activate = () => { if (tag._t) clearTimeout(tag._t); tag.classList.add('active'); tag.setAttribute('aria-pressed', 'true'); tag._t = setTimeout(() => { tag.classList.remove('active'); tag.setAttribute('aria-pressed', 'false'); tag._t = null; }, TECH_ACTIVE_DURATION); };
    tag.addEventListener('click', activate); tag.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });

  const runningBanner = $('#running-banner');
  if (runningBanner) {
    const l1 = runningBanner.querySelector('.line1');
    const l2 = runningBanner.querySelector('.line2');
    const extend = (line) => { const children = Array.from(line.children); if (!children.length) return; while (line.scrollWidth < window.innerWidth * 2.2) children.forEach(ch => line.appendChild(ch.cloneNode(true))); };
    extend(l1); extend(l2); gsap.set(l1, { xPercent: 0 }); gsap.set(l2, { xPercent: -50 }); gsap.timeline({ scrollTrigger: { trigger: runningBanner, start: 'top center', end: '+=800', scrub: true } }).to(l1, { xPercent: -50, ease: 'none' }, 0).to(l2, { xPercent: 0, ease: 'none' }, 0);
  }

  (function navBehavior() {
    const menuBtn = $('#menu');
    const navEl = $('nav');
    const links = $$('nav .links a');
    if (menuBtn && navEl) {
      menuBtn.setAttribute('role', 'button');
      if (!menuBtn.hasAttribute('aria-expanded')) menuBtn.setAttribute('aria-expanded', 'false');
      const updateMenuIcon = (open) => {
        const icon = menuBtn.querySelector('i');
        if (icon) { icon.classList.toggle('bx-menu-right', !open); icon.classList.toggle('bx-x', open); }
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      };
      menuBtn.addEventListener('click', () => { const open = navEl.classList.toggle('menu-open'); updateMenuIcon(open); document.body.classList.toggle('menu-open', open); if (open) { const first = navEl.querySelector('.links a'); if (first) first.focus(); } else menuBtn.focus(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && navEl.classList.contains('menu-open')) { navEl.classList.remove('menu-open'); updateMenuIcon(false); document.body.classList.remove('menu-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false'); } });
      document.addEventListener('click', (e) => { if (!navEl.classList.contains('menu-open')) return; if (e.target.closest('nav')) return; navEl.classList.remove('menu-open'); updateMenuIcon(false); document.body.classList.remove('menu-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false'); });
    }

    const findIdInsensitive = (id) => { if (!id) return null; const e = document.getElementById(id); if (e) return e; const lower = id.toLowerCase(); return $$('[id]').find(el => el.id && el.id.toLowerCase() === lower) || null; };
    const scrollTo = (el) => { if (!el) return; const hasSmoother = !!smoother; const current = hasSmoother ? smoother.scrollTop() : (window.pageYOffset || document.documentElement.scrollTop || 0); const r = el.getBoundingClientRect(); const elTopDoc = r.top + current; const elCenter = elTopDoc + r.height / 2; const viewportCenter = (window.innerHeight || document.documentElement.clientHeight) / 2; const navH = $('nav') ? $('nav').offsetHeight : 0; const target = Math.max(0, elCenter - viewportCenter - navH / 2); if (hasSmoother) smoother.scrollTo(target, true, 'auto'); else window.scrollTo({ top: target, behavior: 'smooth' }); };

    links.forEach(a => a.addEventListener('click', e => { const href = a.getAttribute('href'); if (!href || !href.startsWith('#')) return; e.preventDefault(); const id = href.slice(1).trim(); const target = findIdInsensitive(id); if (!target) return; if (navEl.classList.contains('menu-open')) { navEl.classList.remove('menu-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false'); } try { history.pushState(null, '', '#' + id); } catch (err) {} scrollTo(target); }));

    const navContactBtn = $('nav .nav-btn');
    if (navContactBtn) navContactBtn.addEventListener('click', (e) => { e.preventDefault(); const id = 'contact'; const target = findIdInsensitive(id); if (!target) return; if (navEl.classList.contains('menu-open')) { navEl.classList.remove('menu-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false'); } try { history.pushState(null, '', '#' + id); } catch (err) {} scrollTo(target); });

    const allAnchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    const pageAnchors = allAnchors.filter(a => !a.closest('nav .links'));
    pageAnchors.forEach(a => a.addEventListener('click', (e) => { const href = a.getAttribute('href'); if (!href || !href.startsWith('#')) return; e.preventDefault(); const id = href.slice(1).trim(); const target = findIdInsensitive(id); if (!target) return; if (navEl.classList.contains('menu-open')) { navEl.classList.remove('menu-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false'); } try { history.pushState(null, '', '#' + id); } catch (err) {} scrollTo(target); }));
  })();

  (function hideNavOnScroll() { const nav = $('nav'); if (!nav) return; let last = (smoother && smoother.scrollTop) ? smoother.scrollTop() : (window.pageYOffset || document.documentElement.scrollTop || 0); let hidden = false; const TH = 3; gsap.ticker.add(() => { const current = (smoother && smoother.scrollTop) ? smoother.scrollTop() : (window.pageYOffset || document.documentElement.scrollTop || 0); const d = current - last; if (Math.abs(d) < 0.5) return; if (d > TH && !hidden) { nav.classList.add('nav-hidden'); hidden = true; } else if (d < -TH && hidden) { nav.classList.remove('nav-hidden'); hidden = false; } last = current; }); })();

  const spinEl = $('#spinImage');
  if (spinEl) {
    const stConfig = { trigger: spinEl, start: "top-=400", end: '+=800', scrub: true };
    gsap.to(spinEl, { rotate: -360, ease: 'none', scrollTrigger: stConfig });
    if (smoother) ScrollTrigger.refresh();
  }

  const spinEl2 = $('#spinImage2');
  if (spinEl2) {
    const stConfig = { trigger: spinEl2, start: "top-=1000", end: '+=1500', scrub: true };
    gsap.to(spinEl2, { rotate: -360, ease: 'none', scrollTrigger: stConfig });
    if (smoother) ScrollTrigger.refresh();
  }

  (function initCursor() {
    const media = window.matchMedia && window.matchMedia('(pointer: fine)');
    if (!media || !media.matches) return;

    const cursorWrap = document.querySelector('.custom-cursor');
    if (!cursorWrap) return;
    cursorWrap.setAttribute('aria-hidden', 'true');
    const dot = cursorWrap.querySelector('.cursor-dot');
    const ring = cursorWrap.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let lastX = mouseX, lastY = mouseY;
    const lerp = (a, b, n) => (a + (b - a) * n);

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const tick = () => {
      lastX = lerp(lastX, mouseX, 0.18);
      lastY = lerp(lastY, mouseY, 0.18);
      gsap.set([dot, ring], { x: lastX, y: lastY });
    };
    gsap.ticker.add(tick);

    const onMouseMove = (e) => { cursorWrap.style.display = ''; mouseX = e.clientX; mouseY = e.clientY; };
    const hoverSelector = ['a', 'button', 'input', 'textarea', '.nav-btn', '.tech-tag', '.repo-btn', '.demo-btn', '.menu-toggle'].join(',');
    const onOver = (e) => { if (e.target.closest && e.target.closest(hoverSelector)) cursorWrap.classList.add('hover'); };
    const onOut = (e) => { if (e.target.closest && e.target.closest(hoverSelector)) cursorWrap.classList.remove('hover'); };
    const onMouseDown = (e) => {
      cursorWrap.classList.add('active');
      const r = document.createElement('div');
      r.className = 'cursor-ripple';
      cursorWrap.appendChild(r);
      gsap.set(r, { xPercent: -50, yPercent: -50, x: e.clientX, y: e.clientY, opacity: 0.9, scale: 0.2 });
      gsap.to(r, { duration: 0.55, opacity: 0, scale: 3.0, ease: 'power2.out', onComplete: () => r.remove() });
    };
    const onMouseUp = () => cursorWrap.classList.remove('active');

    const onKeyDown = (e) => { if (e.key === 'Tab') cursorWrap.style.display = 'none'; };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);

    const teardown = () => {
      gsap.ticker.remove(tick);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
    };
    window.addEventListener('pagehide', teardown);
    window.addEventListener('beforeunload', teardown);
  })();
});

if (document.querySelector('#rect') && document.querySelector('#path')) {
  gsap.to('#rect', {
    duration: 5,
    repeat: 12,
    repeatDelay: 3,
    yoyo: true,
    ease: 'power1.inOut',
    motionPath: { path: '#path', align: '#path', autoRotate: true, alignOrigin: [0.5, 0.5] }
  });
}

const grid = document.querySelector('.grid');
const rows = grid ? [...grid.querySelectorAll('.row')] : [...document.querySelectorAll('.row')];
const cells = grid ? [...grid.querySelectorAll('.cell')] : [...document.querySelectorAll('.cell')];

let clicked = false;
let reset_all = false;

const pull_distance = 120;

const updateCellPositions = () => {
  cells.forEach((cell) => {
    const rect = cell.getBoundingClientRect();
    cell.center_position = {
      x: (rect.left + rect.right) / 2,
      y: (rect.top + rect.bottom) / 2,
    };
  });
};

const handleCellClick = (e, i) => {
  if (clicked) return;
  clicked = true;

  gsap.to('.cell', {
    duration: 1.6,
    physics2D: {
      velocity: 'random(400, 1000)',
      angle: 'random(250, 290)',
      gravity: 2000
    },
    stagger: {
      grid: [rows.length, rows[0].children.length],
      from: i,
      amount: 0.3
    },
    onComplete: function () { this.timeScale(-1.3); },
    onReverseComplete: () => { clicked = false; reset_all = true; handlePointerMove(); },
  });
};

const handlePointerMove = (e = { clientX: -pull_distance * 2, clientY: -pull_distance * 2 }) => {
  if (clicked) return;
  // Ensure positions are available (useful after client-side navigation or layout shifts)
  if (!cells || !cells.length) return;
  if (!cells[0].center_position) updateCellPositions();

  const { clientX: pointer_x, clientY: pointer_y } = e || { clientX: -pull_distance * 2, clientY: -pull_distance * 2 };
  cells.forEach((cell) => {
    const diff_x = pointer_x - cell.center_position.x;
    const diff_y = pointer_y - cell.center_position.y;
    const distance = Math.sqrt(diff_x * diff_x + diff_y * diff_y);

    if (distance < pull_distance) {
      const percent = 1 - Math.min(distance / pull_distance, 1);
      const strength = 0.95;
      cell.pulled = true;
      gsap.to(cell, { duration: 0.18, x: diff_x * percent * strength, y: diff_y * percent * strength, ease: 'power2.out' });
    } else {
      if (!cell.pulled) return;
      cell.pulled = false;
      gsap.to(cell, { duration: 1, x: 0, y: 0, ease: "elastic.out(1, 0.3)" });
    }
  });

  if (reset_all) {
    reset_all = false;
    gsap.to(cells, { duration: 1, x: 0, y: 0, ease: "elastic.out(1, 0.3)" });
  }
};

const init = () => {
  if (!cells || cells.length === 0) {
    console.warn('[physics-grid] No .cell elements found. Grid interaction disabled.');
    return;
  }

  updateCellPositions();
  window.addEventListener('load', () => { updateCellPositions(); setTimeout(updateCellPositions, 300); });
  window.addEventListener('resize', updateCellPositions);
  window.addEventListener('pointermove', handlePointerMove);
  document.body.addEventListener('pointerleave', () => handlePointerMove({ clientX: -pull_distance * 2, clientY: -pull_distance * 2 }));

  cells.forEach((cell, i) => cell.addEventListener('pointerup', (e) => handleCellClick(e, i)));

  const contact = document.querySelector('.contact');
  if (contact) {
    contact.addEventListener('pointerup', (e) => {
      const interactive = e.target.closest && e.target.closest('a, button, input, textarea, select, label, .nav-btn, .tech-tag, .repo-btn, .demo-btn');
      if (interactive) return;

      const px = e.clientX;
      const py = e.clientY;
      let bestIndex = -1;
      let bestDist = Infinity;
      cells.forEach((cell, i) => {
        if (!cell.center_position) return;
        const dx = px - cell.center_position.x;
        const dy = py - cell.center_position.y;
        const d = Math.hypot(dx, dy);
        if (d < bestDist) { bestDist = d; bestIndex = i; }
      });

      if (bestIndex >= 0) handleCellClick(e, bestIndex);
    });
  }

  // Add a subtle 'Click anywhere' prompt and a cursor tooltip to invite interaction
  const clickPrompt = document.createElement('div');
  clickPrompt.className = 'click-prompt';
  clickPrompt.textContent = "Click anywhere";
  document.querySelector('.contact').appendChild(clickPrompt);

  const cursorPrompt = document.createElement('div');
  cursorPrompt.className = 'cursor-prompt';
  cursorPrompt.textContent = 'Click';
  document.body.appendChild(cursorPrompt);

  let promptShown = false;
  const showPrompt = () => {
    if (promptShown) return; promptShown = true;
    clickPrompt.classList.add('visible');
    setTimeout(() => clickPrompt.classList.remove('visible'), 4000);
  };

  let cursorTimer = null;
  const showCursorPrompt = (x, y) => {
    gsap.set(cursorPrompt, { x, y });
    cursorPrompt.classList.add('visible');
    if (cursorTimer) clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => cursorPrompt.classList.remove('visible'), 900);
  };

  // Show prompt when the user first moves into the contact area
  contact.addEventListener('pointerenter', (e) => { showPrompt(); showCursorPrompt(e.clientX, e.clientY); });
  contact.addEventListener('pointermove', (e) => { if (cursorPrompt.classList.contains('visible')) gsap.set(cursorPrompt, { x: e.clientX, y: e.clientY }); });

  // Hide prompts on first click so they don't get in the way
  const hideAllPrompts = () => { clickPrompt.classList.remove('visible'); cursorPrompt.classList.remove('visible'); };
  contact.addEventListener('pointerup', () => { hideAllPrompts(); });
  // ensure positions are accurate after init
  updateCellPositions();
  // refresh positions when ScrollTrigger refreshes (covers smoothers and other layout changes)
  if (window.ScrollTrigger && typeof ScrollTrigger.addEventListener === 'function') {
    ScrollTrigger.addEventListener('refresh', updateCellPositions);
  } else if (window.ScrollTrigger && ScrollTrigger.refresh) {
    // fallback: call once after a short delay in case ScrollTrigger isn't ready yet
    setTimeout(() => { try { ScrollTrigger.refresh(); } catch (e) {} }, 250);
  }
};

init();

