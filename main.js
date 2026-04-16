// ================================================================
//  main.js  —  ห้ามแก้ไข
// ================================================================

/* ── Apply theme colours from data.js ── */
(function applyTheme() {
  const r = document.documentElement.style;
  r.setProperty('--gold',   DATA.themeColor);
  r.setProperty('--accent', DATA.accentColor);

  // Derive lighter & dim variants
  function hexToRgb(hex) {
    const h = hex.replace('#','');
    const n = parseInt(h,16);
    return [(n>>16)&255,(n>>8)&255,n&255];
  }
  const [rr,gg,bb] = hexToRgb(DATA.themeColor);
  r.setProperty('--gold-lt',   `rgb(${Math.min(rr+50,255)},${Math.min(gg+50,255)},${Math.min(bb+30,255)})`);
  r.setProperty('--gold-dim',  `rgba(${rr},${gg},${bb},0.14)`);
  r.setProperty('--gold-glow', `rgba(${rr},${gg},${bb},0.26)`);
  r.setProperty('--glass-b',   `rgba(${rr},${gg},${bb},0.16)`);
})();

/* ══════════════════════════════════════════════════
   BACKGROUND PARTICLE CANVAS
══════════════════════════════════════════════════ */
(function initBgCanvas() {
  const cvs = document.getElementById('bg-canvas');
  const ctx = cvs.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }

  function mkParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.7 + 0.1,
      da: (Math.random() - 0.5) * 0.004,
      dx: (Math.random() - 0.5) * 0.18,
      dy: -(Math.random() * 0.28 + 0.06),
    };
  }

  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 130; i++) particles.push(mkParticle());

  function cssColor(alpha) {
    // read computed --gold
    const g = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
    const h = g.replace('#','');
    const n = parseInt(h,16);
    const r=(n>>16)&255, gv=(n>>8)&255, b=n&255;
    return `rgba(${r},${gv},${b},${alpha})`;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.dx; p.y += p.dy;
      p.a = Math.max(0.05, Math.min(0.75, p.a + p.da));
      if (p.y < -4) { Object.assign(p, mkParticle()); p.y = H + 4; }
      if (p.x < -4 || p.x > W + 4) { Object.assign(p, mkParticle()); }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = cssColor(p.a * 0.6);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════
   PAGE NAVIGATION
══════════════════════════════════════════════════ */
let cdInterval = null;

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0 });

  if (id === 'page-menu')      initMenu();
  if (id === 'page-timeline')  initTimeline();
  if (id === 'page-countdown') initCountdown();
  if (id === 'page-stars')     initStars();
  if (id === 'page-cards')     initCards();
}

function goToPage(id) { showPage(id); }

/* ══════════════════════════════════════════════════
   PAGE 1 — LANDING
══════════════════════════════════════════════════ */
(function initLanding() {
  document.getElementById('landing-tagline').textContent = DATA.tagline;
  document.getElementById('landing-names').textContent   = DATA.coupleNames;

  const input = document.getElementById('date-input');

  // Auto-format as user types  →  วว/ดด/ปป
  input.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g,'');
    if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
    if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5);
    e.target.value = v.slice(0,8);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') tryUnlock();
  });
})();

function tryUnlock() {
  const input   = document.getElementById('date-input');
  const errEl   = document.getElementById('lock-error');
  const giftEl  = document.getElementById('gift-wrap');

  if (input.value.trim() === DATA.unlockDate) {
    errEl.textContent = '';
    giftEl.classList.add('opened');
    burstSparks();
    setTimeout(() => showPage('page-menu'), 1900);
  } else {
    errEl.textContent = 'วันที่ไม่ถูกต้อง ลองใหม่อีกครั้งนะ 💛';
    giftEl.classList.remove('shaking');
    void giftEl.offsetWidth;          // reflow
    giftEl.classList.add('shaking');
    input.value = '';
    input.focus();
    setTimeout(() => giftEl.classList.remove('shaking'), 500);
  }
}

function burstSparks() {
  const cont   = document.getElementById('sparks-container');
  const colors = [
    DATA.themeColor, DATA.accentColor,
    '#f0d585', '#ffffff', '#ffcfa0'
  ];
  for (let i = 0; i < 30; i++) {
    const sp = document.createElement('div');
    sp.className = 'spark';
    const angle = (i / 30) * 360;
    const dist  = 55 + Math.random() * 90;
    sp.style.setProperty('--dx', (Math.cos(angle * Math.PI / 180) * dist) + 'px');
    sp.style.setProperty('--dy', (Math.sin(angle * Math.PI / 180) * dist) + 'px');
    sp.style.setProperty('--dur', (0.45 + Math.random() * 0.6) + 's');
    sp.style.background = colors[i % colors.length];
    const sz = (3 + Math.random() * 7) + 'px';
    sp.style.width = sz; sp.style.height = sz;
    cont.appendChild(sp);
    setTimeout(() => sp.remove(), 1200);
  }
}

/* ══════════════════════════════════════════════════
   PAGE 2 — MENU
══════════════════════════════════════════════════ */
function initMenu() {
  document.getElementById('menu-title').textContent =
    'ยินดีต้อนรับ ' + DATA.coupleNames;
}

/* ══════════════════════════════════════════════════
   PAGE 3 — TIMELINE
══════════════════════════════════════════════════ */
function initTimeline() {
  document.getElementById('timeline-title').textContent = DATA.timelineTitle;
  const wrap = document.getElementById('timeline-wrap');
  wrap.innerHTML = '';

  DATA.timelineItems.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'tl-item';
    el.style.animationDelay = (i * 0.08) + 's';

    el.innerHTML = `
      <div class="tl-dot">${item.emoji || '💫'}</div>
      <div class="tl-body">
        <p class="tl-date">${item.date}</p>
        <h3 class="tl-title">${item.title}</h3>
        <p class="tl-desc">${item.description}</p>
        ${item.image ? `<img class="tl-img" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.remove()">` : ''}
      </div>
    `;
    wrap.appendChild(el);
  });
}

/* ══════════════════════════════════════════════════
   PAGE 4 — COUNTDOWN
══════════════════════════════════════════════════ */
function initCountdown() {
  document.getElementById('cd-heading').textContent = DATA.countdownTitle;
  document.getElementById('cd-message').textContent = DATA.countdownMessage;

  if (cdInterval) clearInterval(cdInterval);

  function pad(n) { return String(n).padStart(2,'0'); }

  function setNum(id, val) {
    const el = document.getElementById(id);
    const s  = pad(val);
    if (el.textContent !== s) {
      el.textContent = s;
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
    }
  }

  function tick() {
    const diff = new Date(DATA.countdownTarget).getTime() - Date.now();
    if (diff <= 0) {
      ['cd-d','cd-h','cd-m','cd-s'].forEach(id => setNum(id, 0));
      document.getElementById('cd-message').textContent = '🎉 วันนี้คือวันครบรอบ! ขอให้มีความสุขมากๆ';
      clearInterval(cdInterval);
      return;
    }
    setNum('cd-d', Math.floor(diff / 86400000));
    setNum('cd-h', Math.floor((diff % 86400000) / 3600000));
    setNum('cd-m', Math.floor((diff % 3600000)  / 60000));
    setNum('cd-s', Math.floor((diff % 60000)    / 1000));
  }

  tick();
  cdInterval = setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════════
   PAGE 5 — FALLING STARS
══════════════════════════════════════════════════ */
let starsCtx, starsW, starsH, shooters = [], starsRaf;

function initStars() {
  document.getElementById('stars-heading').textContent = DATA.starsTitle;
  document.getElementById('stars-prompt').textContent  = DATA.starsPrompt;

  const wishEl = document.getElementById('wish-text');
  wishEl.textContent = '';
  wishEl.classList.remove('visible');

  const cvs = document.getElementById('stars-canvas');
  starsCtx = cvs.getContext('2d');

  function resizeCvs() {
    starsW = cvs.width  = cvs.offsetWidth  || window.innerWidth;
    starsH = cvs.height = cvs.offsetHeight || window.innerHeight;
  }
  resizeCvs();
  window.addEventListener('resize', resizeCvs);

  shooters = [];
  if (starsRaf) cancelAnimationFrame(starsRaf);
  animateStarFrame();
}

function shootStars() {
  const container = document.querySelector('.stars-body'); // เพิ่มบรรทัดนี้เพื่อหาที่วางข้อความ
  const btn = document.getElementById('wish-btn');
  if (btn) btn.style.display = 'none'; // ซ่อนปุ่มเมื่อกด

  // 1. ระบบดาวตกบน Canvas (คงเดิมแต่ปรับจำนวน)
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      shooters.push({
        x: Math.random() * starsW * 0.4,
        y: Math.random() * starsH * 0.25,
        speed: 9 + Math.random() * 7,
        angle: 32 + Math.random() * 22,
        alpha: 1,
        tail: [],
        size: 1.8 + Math.random() * 1.5,
      });
    }, i * 150);
  }

  // 2. ระบบข้อความโปรยลงมา (ส่วนที่เพิ่มใหม่)
  if (DATA.fallingTexts && DATA.fallingTexts.length > 0) {
    DATA.fallingTexts.forEach((txt, i) => {
      setTimeout(() => {
        const span = document.createElement('span');
        span.className = 'falling-msg'; // ต้องตรงกับชื่อใน style.css
        span.textContent = txt;
        
        // สุ่มตำแหน่งซ้าย-ขวา (15% - 85%) เพื่อไม่ให้ตกขอบจอ
        span.style.left = (Math.random() * 70 + 15) + '%';
        // สุ่มความเร็วในการหล่น (3-5 วินาที)
        span.style.setProperty('--dur', (3 + Math.random() * 2) + 's');
        
        container.appendChild(span);
        
        // ลบ Element ทิ้งเมื่อจบ Animation เพื่อประหยัดแรมมือถือ
        setTimeout(() => span.remove(), 5000);
      }, i * 450); // ทยอยปล่อยออกมาทีละคำ
    });
  }

  // 3. แสดงข้อความอธิษฐานสุดท้าย (คงเดิมแต่ปรับเวลา)
  setTimeout(() => {
    const el = document.getElementById('wish-text');
    if (el) {
      el.textContent = DATA.starsWish;
      el.classList.add('visible');
    }
  }, 3500);
}


  setTimeout(() => {
    const el = document.getElementById('wish-text');
    el.textContent = DATA.starsWish;
    el.classList.add('visible');
  }, 2400);
}

function animateStarFrame() {
  starsRaf = requestAnimationFrame(animateStarFrame);

  if (!document.getElementById('page-stars').classList.contains('active')) return;

  starsCtx.clearRect(0, 0, starsW, starsH);

  // Twinkle static stars
  starsCtx.save();
  for (let i = 0; i < 60; i++) {
    // deterministic positions from index
    const sx  = ((i * 179.3 + 11) % starsW);
    const sy  = ((i * 97.7  + 43) % starsH);
    const a   = 0.1 + (Math.sin(Date.now() / 1400 + i) * 0.5 + 0.5) * 0.35;
    starsCtx.beginPath();
    starsCtx.arc(sx, sy, .8 + (i % 3) * .4, 0, Math.PI * 2);
    starsCtx.fillStyle = `rgba(255,245,200,${a})`;
    starsCtx.fill();
  }
  starsCtx.restore();

  // Shooting stars
  shooters = shooters.filter(s => s.alpha > 0);

  shooters.forEach(s => {
    const rad = s.angle * Math.PI / 180;
    s.x += Math.cos(rad) * s.speed;
    s.y += Math.sin(rad) * s.speed;
    s.alpha -= 0.013;
    s.tail.push({ x: s.x, y: s.y });
    if (s.tail.length > 22) s.tail.shift();

    // Tail
    s.tail.forEach((pt, i) => {
      const a = (i / s.tail.length) * s.alpha * 0.65;
      starsCtx.beginPath();
      starsCtx.arc(pt.x, pt.y, s.size * 0.6, 0, Math.PI * 2);
      starsCtx.fillStyle = `rgba(255,220,130,${a})`;
      starsCtx.fill();
    });

    // Head glow
    const grd = starsCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 12);
    grd.addColorStop(0, `rgba(255,240,180,${s.alpha * 0.7})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, 12, 0, Math.PI * 2);
    starsCtx.fillStyle = grd;
    starsCtx.fill();

    // Head
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    starsCtx.fillStyle = `rgba(255,255,240,${s.alpha})`;
    starsCtx.fill();
  });
}

/* ══════════════════════════════════════════════════
   PAGE 6 — FLIP CARDS
══════════════════════════════════════════════════ */
function initCards() {
  document.getElementById('cards-title').textContent = DATA.cardsTitle;
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';

  DATA.cards.forEach(card => {
    const el = document.createElement('div');
    el.className = 'flip-card';
    el.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-front">
          <span class="fc-emoji">${card.emoji || '❤️'}</span>
          <span class="fc-front-lbl">${card.front}</span>
          <span class="fc-hint">กดเพื่อเปิด</span>
        </div>
        <div class="flip-back">
          <span class="fc-back-text">${card.back}</span>
        </div>
      </div>
    `;
    el.addEventListener('click', () => el.classList.toggle('flipped'));
    grid.appendChild(el);
  });
}

/* ── Start ── */
showPage('page-landing');
