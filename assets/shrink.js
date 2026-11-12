// Shrink home page: small enhancements only. Everything reads and links without it.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  const root = document.documentElement;

  // Bar: pill at the top of the page, full bar once scrolled.
  const bar = document.querySelector('.bar');
  const scene = document.querySelector('.scene');
  const fly = document.querySelector('.ufo-fly');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    bar && bar.classList.toggle('is-open', y > 24);
    // The saucer leaves up and to the right as the hero scrolls away.
    if (fly && scene && !still) {
      const r = scene.getBoundingClientRect();
      const gone = Math.min(Math.max((-r.top + 80) / (r.height * 0.8), 0), 1);
      fly.style.setProperty('--away', gone.toFixed(3));
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // The saucer leans toward the pointer.
  if (fly && !still && !touch) {
    addEventListener('pointermove', (e) => {
      fly.style.setProperty('--px', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
    }, { passive: true });
  }

  // Stars.
  document.querySelectorAll('.stars').forEach((sky) => {
    const n = Number(sky.dataset.stars || 40);
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      const size = 1 + rnd() * 2.2;
      s.style.cssText = `left:${(rnd() * 100).toFixed(2)}%;top:${(rnd() * 100).toFixed(2)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;animation-delay:${(-rnd() * 4).toFixed(2)}s`;
      sky.appendChild(s);
    }
  });

  // The size tag counts down while the beam is on: megabytes leave, the photo stays.
  const tag = document.querySelector('[data-size]');
  if (tag) {
    const out = tag.querySelector('span');
    const from = 4800, to = 487;
    const show = (kb) => { out.textContent = kb >= 1000 ? (kb / 1000).toFixed(1) + ' MB' : Math.round(kb) + ' KB'; };
    if (still) { show(to); tag.classList.add('is-done'); }
    else {
      show(from);
      const start = performance.now() + 2100, length = 2600;
      const step = (now) => {
        const t = Math.min(Math.max((now - start) / length, 0), 1);
        const eased = 1 - Math.pow(1 - t, 3);
        show(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(step); else tag.classList.add('is-done');
      };
      requestAnimationFrame(step);
    }
  }

  // Reveal on entering the view.
  const seen = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      seen.unobserve(entry.target);
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-in]').forEach((el) => seen.observe(el));

  // Percent counter on the result card.
  const pct = document.querySelector('[data-count]');
  if (pct) {
    const target = Number(pct.dataset.count);
    if (still) pct.textContent = target;
    else {
      const once = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        once.disconnect();
        const start = performance.now() + 900;
        const step = (now) => {
          const t = Math.min(Math.max((now - start) / 900, 0), 1);
          pct.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.6 });
      once.observe(pct);
    }
  }
  root.classList.add('js');
})();
