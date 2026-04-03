document.addEventListener('DOMContentLoaded', () => {
  animateStats();
});

function animateStats() {
  const els = document.querySelectorAll('.stat-value[data-target]');

  els.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const value = Math.round(eased * target);

      if (target >= 1000) {
        el.textContent = prefix + value.toLocaleString();
      } else {
        el.textContent = prefix + value;
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  });
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
