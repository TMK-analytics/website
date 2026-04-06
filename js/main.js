// ========================
// HAMBURGER MENU TOGGLE
// ========================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ========================
// ACTIVE NAV LINK
// ========================
const currentPage = window.location.pathname.split('/').pop();
const navAnchors = document.querySelectorAll('.nav-links a');

navAnchors.forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// ========================
// HELIX ANIMATION
// ========================
const helixCanvas = document.getElementById('helixCanvas');
if (helixCanvas) {
  const ctx = helixCanvas.getContext('2d');
  let t = 0;
  let W, H;

  function resizeHelix() {
    W = helixCanvas.offsetWidth;
    H = helixCanvas.offsetHeight;
    helixCanvas.width = W;
    helixCanvas.height = H;
  }

  resizeHelix();
  window.addEventListener('resize', resizeHelix);

  function getPoint(i, strand, steps) {
    const freq = 2.2;
    const amp = H * 0.32;
    const angle = -0.18;
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);
    const progress = i / steps;
    const offset = strand === 0 ? 0 : Math.PI;
    const wave = Math.sin(progress * Math.PI * freq * 2 + t + offset) * amp;
    const tiltShift = progress * H * sinA * 0.5;
    return {
      x: progress * (W + 80) - 40 + (-sinA * wave),
      y: H / 2 + cosA * wave - tiltShift,
      depth: (Math.sin(progress * Math.PI * freq * 2 + t + offset) + 1) / 2
    };
  }

  function drawHelix() {
    ctx.clearRect(0, 0, W, H);
    const steps = 120;
    const rungCount = 26;

    // Rungs
    for (let r = 0; r <= rungCount; r++) {
      const idx = (r / rungCount) * steps;
      const p0 = getPoint(idx, 0, steps);
      const p1 = getPoint(idx, 1, steps);
      const alpha = 0.08 + ((p0.depth + p1.depth) / 2) * 0.2;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(80, 180, 255, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Strands
    for (let strand = 0; strand < 2; strand++) {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const p = getPoint(i, strand, steps);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(26, 130, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(80, 200, 255, 0.5)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Nodes with binary characters
    for (let strand = 0; strand < 2; strand++) {
      for (let r = 0; r <= rungCount; r++) {
        const idx = (r / rungCount) * steps;
        const p = getPoint(idx, strand, steps);
        const key = `${strand}-${r}`;

        const radius = 2 + p.depth * 2;
        const alpha = 0.35 + p.depth * 0.65;

        // Node dark backing
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10, 40, 80, ${alpha * 0.8})`;
        ctx.fill();

        // Node glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 140, 255, ${alpha})`;
        ctx.shadowColor = 'rgba(120, 210, 255, 0.9)';
        ctx.shadowBlur = 7 * p.depth;
        ctx.fill();
        ctx.shadowBlur = 0;

      }
    }

    t += 0.004;
    requestAnimationFrame(drawHelix);
  }

  drawHelix();
}

// ========================
// FLIP CARDS
// ========================
const flipCards = document.querySelectorAll('.flip-card');

flipCards.forEach(card => {
  let touchStartX = 0;
  let touchStartY = 0;

  // Desktop click
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });

  // Mobile touch with scroll guard
  card.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  card.addEventListener('touchend', (e) => {
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (dx < 50 && dy < 50) {
      card.classList.toggle('flipped');
    }
  });
});

// ========================
// MOBILE TAP HINT (shows once)
// ========================
function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

if (isTouchDevice() && !localStorage.getItem('tapHintSeen')) {
  const hint = document.createElement('div');
  hint.className = 'tap-hint';
  hint.textContent = 'Tap cards to explore';
  document.body.appendChild(hint);

  setTimeout(() => {
    hint.classList.add('hidden');
    setTimeout(() => hint.remove(), 500);
  }, 3000);

  localStorage.setItem('tapHintSeen', 'true');
}