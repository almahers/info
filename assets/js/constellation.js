(() => {
  const canvas = document.getElementById('constellation');
  if (!canvas) return;
  const context = canvas.getContext('2d', { alpha: true });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const state = { particles: [], width: 0, height: 0, dpr: 1, active: true, frame: 0, pointer: { x: -9999, y: -9999, active: false } };
  const palette = ['#7ba7ff', '#b48cff', '#6de8ff'];

  function particleCount() {
    const density = finePointer.matches ? 15500 : 24500;
    const cap = finePointer.matches ? 112 : 58;
    return Math.min(cap, Math.max(28, Math.floor((state.width * state.height) / density)));
  }
  function createParticle() {
    const speed = reducedMotion.matches ? 0 : .18 + Math.random() * .26;
    return { x: Math.random() * state.width, y: Math.random() * state.height, vx: (Math.random() - .5) * speed, vy: (Math.random() - .5) * speed, radius: .65 + Math.random() * 1.25, color: palette[Math.floor(Math.random() * palette.length)] };
  }
  function resize() {
    state.width = window.innerWidth; state.height = window.innerHeight; state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(state.width * state.dpr); canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`; canvas.style.height = `${state.height}px`;
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.particles = Array.from({ length: particleCount() }, createParticle);
    draw();
  }
  function move(particle) {
    if (!reducedMotion.matches) {
      particle.x += particle.vx; particle.y += particle.vy;
      if (particle.x < -10 || particle.x > state.width + 10) particle.vx *= -1;
      if (particle.y < -10 || particle.y > state.height + 10) particle.vy *= -1;
      if (state.pointer.active && finePointer.matches) {
        const dx = particle.x - state.pointer.x; const dy = particle.y - state.pointer.y; const distance = Math.hypot(dx, dy) || 1;
        const radius = 145;
        if (distance < radius) { const force = ((radius - distance) / radius) * .75; particle.vx += (dx / distance) * force; particle.vy += (dy / distance) * force; }
      }
      particle.vx *= .986; particle.vy *= .986;
      const maxSpeed = .72; const speed = Math.hypot(particle.vx, particle.vy);
      if (speed > maxSpeed) { particle.vx = (particle.vx / speed) * maxSpeed; particle.vy = (particle.vy / speed) * maxSpeed; }
    }
  }
  function draw() {
    context.clearRect(0, 0, state.width, state.height);
    const linkDistance = finePointer.matches ? 138 : 108;
    for (let i = 0; i < state.particles.length; i += 1) {
      const a = state.particles[i];
      for (let j = i + 1; j < state.particles.length; j += 1) {
        const b = state.particles[j]; const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < linkDistance) { context.strokeStyle = `rgba(117, 159, 255, ${(1 - distance / linkDistance) * .18})`; context.lineWidth = .6; context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke(); }
      }
      context.fillStyle = a.color; context.globalAlpha = .62; context.beginPath(); context.arc(a.x, a.y, a.radius, 0, Math.PI * 2); context.fill(); context.globalAlpha = 1;
    }
  }
  function animate() { if (!state.active) return; state.particles.forEach(move); draw(); if (!reducedMotion.matches) state.frame = requestAnimationFrame(animate); }
  function pointerMove(event) { if (!finePointer.matches) return; state.pointer.x = event.clientX; state.pointer.y = event.clientY; state.pointer.active = true; }
  window.addEventListener('pointermove', pointerMove, { passive: true });
  window.addEventListener('pointerleave', () => { state.pointer.active = false; });
  window.addEventListener('blur', () => { state.pointer.active = false; });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => { state.active = !document.hidden; if (state.active && !reducedMotion.matches) { cancelAnimationFrame(state.frame); animate(); } });
  reducedMotion.addEventListener('change', resize); finePointer.addEventListener('change', resize);
  resize(); if (!reducedMotion.matches) animate();
})();
