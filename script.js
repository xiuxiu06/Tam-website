gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

document.addEventListener('DOMContentLoaded', () => {
  // Try to create the ScrollSmoother (fail gracefully if not available)
  let smoother = null;
  try {
    smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 2, effects: true, normalizeScroll: true });
  } catch (e) {}

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // Small entrance for generic boxes
  gsap.from('.box', { duration: 1, y: 100, opacity: 0, stagger: 0.3 });

  // Horizontal scroller setup
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

    // Pin projects header while horizontal scroll runs
    const projectsHeader = $('#projects-header');
    if (projectsHeader) {
      ScrollTrigger.create({ trigger: horizontalContainer, start: 'top top', end: () => '+=' + (horizontalSectionsWrap.offsetWidth - window.innerWidth), pin: '#projects-header', pinSpacing: false });
    }
  }

  // Per-section animations and video autoplay/pause
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

  // Video lazy load + play overlay
  $$('.project-video').forEach(pv => {
    const video = pv.querySelector('video');
    const src = video ? video.querySelector('source[data-src]') : null;
    const btn = pv.querySelector('.play-overlay');
    const load = () => { if (src && !src.src) { src.src = src.getAttribute('data-src'); video.load(); } };
    if (btn && video) btn.addEventListener('click', () => { load(); btn.style.display = 'none'; video.play().catch(() => {}); });
  });

  // Tech chips: temporary active state
  const TECH_ACTIVE_DURATION = 1400;
  $$('.tech-tag').forEach(tag => {
    if (!tag.hasAttribute('role')) tag.setAttribute('role', 'button');
    if (!tag.hasAttribute('tabindex')) tag.setAttribute('tabindex', '0');
    tag.setAttribute('aria-pressed', 'false');
    const activate = () => { if (tag._t) clearTimeout(tag._t); tag.classList.add('active'); tag.setAttribute('aria-pressed', 'true'); tag._t = setTimeout(() => { tag.classList.remove('active'); tag.setAttribute('aria-pressed', 'false'); tag._t = null; }, TECH_ACTIVE_DURATION); };
    tag.addEventListener('click', activate); tag.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });

  // Running banner
  const runningBanner = $('#running-banner');
  if (runningBanner) {
    const l1 = runningBanner.querySelector('.line1');
    const l2 = runningBanner.querySelector('.line2');
    const extend = (line) => { const children = Array.from(line.children); if (!children.length) return; while (line.scrollWidth < window.innerWidth * 2.2) children.forEach(ch => line.appendChild(ch.cloneNode(true))); };
    extend(l1); extend(l2); gsap.set(l1, { xPercent: 0 }); gsap.set(l2, { xPercent: -50 }); gsap.timeline({ scrollTrigger: { trigger: runningBanner, start: 'top center', end: '+=800', scrub: true } }).to(l1, { xPercent: -50, ease: 'none' }, 0).to(l2, { xPercent: 0, ease: 'none' }, 0);
  }

  // Nav behavior: mobile toggle + link scrolling (uses smoother when available)
  (function navBehavior() {
    const menuBtn = $('#menu');
    const navEl = $('nav');
    const links = $$('nav .links a');
    if (menuBtn && navEl) {
      // normalize menu button attributes
      menuBtn.setAttribute('role', 'button');
      if (!menuBtn.hasAttribute('aria-expanded')) menuBtn.setAttribute('aria-expanded', 'false');
      const updateMenuIcon = (open) => {
        // swap icon classes if using boxicons
        const icon = menuBtn.querySelector('i');
        if (icon) {
          icon.classList.toggle('bx-menu-right', !open);
          icon.classList.toggle('bx-x', open);
        }
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      };
      menuBtn.addEventListener('click', (ev) => {
        const open = navEl.classList.toggle('menu-open');
        updateMenuIcon(open);
        // toggle body class to prevent background scrolling when menu open
        document.body.classList.toggle('menu-open', open);
        // move focus to first link when opening
        if (open) {
          const first = navEl.querySelector('.links a'); if (first) first.focus();
        } else {
          menuBtn.focus();
        }
      });

      // close menu on ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navEl.classList.contains('menu-open')) {
          navEl.classList.remove('menu-open'); updateMenuIcon(false); document.body.classList.remove('menu-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // click outside to close (only when menu is open)
      document.addEventListener('click', (e) => {
        if (!navEl.classList.contains('menu-open')) return;
        if (e.target.closest('nav')) return; // clicked inside nav
        navEl.classList.remove('menu-open'); updateMenuIcon(false); document.body.classList.remove('menu-open');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      });
    }

    const findIdInsensitive = (id) => { if (!id) return null; const e = document.getElementById(id); if (e) return e; const lower = id.toLowerCase(); return $$('[id]').find(el => el.id && el.id.toLowerCase() === lower) || null; };
    const scrollTo = (el) => { if (!el) return; const hasSmoother = !!smoother; const current = hasSmoother ? smoother.scrollTop() : (window.pageYOffset || document.documentElement.scrollTop || 0); const r = el.getBoundingClientRect(); const elTopDoc = r.top + current; const elCenter = elTopDoc + r.height / 2; const viewportCenter = (window.innerHeight || document.documentElement.clientHeight) / 2; const navH = $('nav') ? $('nav').offsetHeight : 0; const target = Math.max(0, elCenter - viewportCenter - navH / 2); if (hasSmoother) smoother.scrollTo(target, true, 'auto'); else window.scrollTo({ top: target, behavior: 'smooth' }); };

    links.forEach(a => a.addEventListener('click', e => { const href = a.getAttribute('href'); if (!href || !href.startsWith('#')) return; e.preventDefault(); const id = href.slice(1).trim(); const target = findIdInsensitive(id); if (!target) return; if (navEl.classList.contains('menu-open')) { navEl.classList.remove('menu-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false'); } try { history.pushState(null, '', '#' + id); } catch (err) {} scrollTo(target); }));

    // Wire the standalone Contact button in the nav to the same smooth-scroll behavior
    const navContactBtn = $('nav .nav-btn');
    if (navContactBtn) {
      navContactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = 'contact';
        const target = findIdInsensitive(id);
        if (!target) return;
        if (navEl.classList.contains('menu-open')) {
          navEl.classList.remove('menu-open');
          if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        }
        try { history.pushState(null, '', '#' + id); } catch (err) {}
        scrollTo(target);
      });
    }

  // Also wire any in-page anchors outside the main nav links (e.g. About -> Contact) to use smooth scrolling
  const allAnchors = Array.from(document.querySelectorAll('a[href^="#"]'));
  const pageAnchors = allAnchors.filter(a => !a.closest('nav .links'));
    pageAnchors.forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();
        const id = href.slice(1).trim();
        const target = findIdInsensitive(id);
        if (!target) return;
        if (navEl.classList.contains('menu-open')) {
          navEl.classList.remove('menu-open');
          if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        }
        try { history.pushState(null, '', '#' + id); } catch (err) {}
        scrollTo(target);
      });
    });
  })();

  // Hide nav on scroll down, show on scroll up
  (function hideNavOnScroll() { const nav = $('nav'); if (!nav) return; let last = (smoother && smoother.scrollTop) ? smoother.scrollTop() : (window.pageYOffset || document.documentElement.scrollTop || 0); let hidden = false; const TH = 3; gsap.ticker.add(() => { const current = (smoother && smoother.scrollTop) ? smoother.scrollTop() : (window.pageYOffset || document.documentElement.scrollTop || 0); const d = current - last; if (Math.abs(d) < 0.5) return; if (d > TH && !hidden) { nav.classList.add('nav-hidden'); hidden = true; } else if (d < -TH && hidden) { nav.classList.remove('nav-hidden'); hidden = false; } last = current; }); })();

});
