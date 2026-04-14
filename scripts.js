/* =============================================
   scripts.js — Animated Portfolio
   ============================================= */

'use strict';

// ── Custom Cursor ────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a, button, .project-card, .skill-category, input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    follower.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    follower.classList.remove('hover');
  });
});


// ── Particle Canvas ──────────────────────────
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animFrameId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.35;
    this.speedY = (Math.random() - 0.5) * 0.35;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '139,92,246' : '6,182,212';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${this.color})`;
    ctx.fill();
    ctx.restore();
  }
}

function initParticles(count = 120) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / 120) * 0.12;
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  connectParticles();
  animFrameId = requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();


// ── Dark Particle Canvas (Lower Wrapper) ─────
const darkCanvas = document.getElementById('dark-particle-canvas');
if (darkCanvas) {
  const dCtx = darkCanvas.getContext('2d');
  const lowerWrapper = document.getElementById('lower-wrapper');
  let darkParticles = [];
  let darkAnimFrameId;

  function resizeDarkCanvas() {
    if (!lowerWrapper) return;
    darkCanvas.width = lowerWrapper.offsetWidth;
    darkCanvas.height = lowerWrapper.offsetHeight;
  }
  resizeDarkCanvas();
  window.addEventListener('resize', resizeDarkCanvas);
  window.addEventListener('load', resizeDarkCanvas);
  setInterval(resizeDarkCanvas, 2000); // Check periodically for dynamic content height changes

  class DarkParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * darkCanvas.width;
      this.y = Math.random() * darkCanvas.height;
      this.size = Math.random() * 2 + 1;
      // Very slow random speed
      this.speedX = (Math.random() - 0.5) * 0.15;
      this.speedY = (Math.random() - 0.5) * 0.15;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > darkCanvas.width || this.y < 0 || this.y > darkCanvas.height) {
        this.reset();
      }
    }
    draw() {
      dCtx.save();
      dCtx.globalAlpha = this.opacity;
      dCtx.beginPath();
      dCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      dCtx.fillStyle = '#64748b'; // Subtle slate/gray color for "dark dots"
      dCtx.fill();
      dCtx.restore();
    }
  }

  function initDarkParticles(count = 100) {
    darkParticles = [];
    for (let i = 0; i < count; i++) {
      darkParticles.push(new DarkParticle());
    }
  }

  function connectDarkParticles() {
    for (let i = 0; i < darkParticles.length; i++) {
      for (let j = i + 1; j < darkParticles.length; j++) {
        const dx = darkParticles[i].x - darkParticles[j].x;
        const dy = darkParticles[i].y - darkParticles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          dCtx.save();
          dCtx.globalAlpha = (1 - dist / 140) * 0.15;
          dCtx.strokeStyle = '#475569'; // Dark line color
          dCtx.lineWidth = 0.8;
          dCtx.beginPath();
          dCtx.moveTo(darkParticles[i].x, darkParticles[i].y);
          dCtx.lineTo(darkParticles[j].x, darkParticles[j].y);
          dCtx.stroke();
          dCtx.restore();
        }
      }
    }
  }

  function animateDarkParticles() {
    dCtx.clearRect(0, 0, darkCanvas.width, darkCanvas.height);
    darkParticles.forEach(p => { p.update(); p.draw(); });
    connectDarkParticles();
    darkAnimFrameId = requestAnimationFrame(animateDarkParticles);
  }

  initDarkParticles();
  animateDarkParticles();
}


// ── Navbar scroll behavior ───────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNavLink();
});

function updateActiveNavLink() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}


// ── Mobile Hamburger ─────────────────────────
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  }
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  });
});


// ── Typewriter Effect ────────────────────────
const typewriterEl = document.getElementById('typewriter-text');
const words = [
  'beautiful UIs.',
  'fast APIs.',
  'AI experiences.',
  'mobile apps.',
  'amazing products.',
];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typewriterPaused = false;

function typewrite() {
  if (typewriterPaused) return;

  const currentWord = words[wordIndex];

  if (isDeleting) {
    charIndex--;
    typewriterEl.textContent = currentWord.slice(0, charIndex);
  } else {
    charIndex++;
    typewriterEl.textContent = currentWord.slice(0, charIndex);
  }

  let delay = isDeleting ? 60 : 100;

  if (!isDeleting && charIndex === currentWord.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    delay = 350;
  }

  setTimeout(typewrite, delay);
}

typewrite();


// ── Scroll Reveal (IntersectionObserver) ─────
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


// ── Skill Bar Animations ──────────────────────
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target;
      const targetWidth = fill.getAttribute('data-width') + '%';
      // Small delay to let the card reveal first
      setTimeout(() => {
        fill.style.width = targetWidth;
      }, 300);
      skillObserver.unobserve(fill);
    }
  });
}, { threshold: 0.3 });

skillFills.forEach(fill => skillObserver.observe(fill));


// ── Counter Animation ─────────────────────────
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'));
      if (isNaN(target)) return; // skip static values like 0.5
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

function animateCounter(el, target) {
  let current = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current;
  }, 35);
}


// ── Contact Form (Flask Backend) ─────────────
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const submitBtn = document.getElementById('contact-submit-btn');
const submitText = document.getElementById('submit-text');
const submitIcon = document.getElementById('submit-icon');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('form-name').value.trim();
  const email   = document.getElementById('form-email').value.trim();
  const message = document.getElementById('form-message').value.trim();

  if (!name || !email || !message) {
    shakeForm();
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  submitText.textContent = 'Sending...';
  submitIcon.style.opacity = '0.5';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const result = await response.json();

    if (result.success) {
      contactForm.reset();
      formSuccess.textContent = "🎉 Message sent! I'll get back to you soon.";
      formSuccess.style.color = '#4ade80';
      formSuccess.classList.add('show');
    } else {
      formSuccess.textContent = '⚠️ ' + (result.error || 'Something went wrong. Try again.');
      formSuccess.style.color = '#f87171';
      formSuccess.classList.add('show');
    }
  } catch (err) {
    formSuccess.textContent = '⚠️ Network error. Please try again.';
    formSuccess.style.color = '#f87171';
    formSuccess.classList.add('show');
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = 'Send Message';
    submitIcon.style.opacity = '1';
    setTimeout(() => formSuccess.classList.remove('show'), 5000);
  }
});

function shakeForm() {
  contactForm.style.animation = 'shake 0.5s ease';
  setTimeout(() => contactForm.style.animation = '', 600);
}

// Inject shake keyframes
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
`;
document.head.appendChild(shakeStyle);


// ── Smooth Anchor Scroll ──────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ── Scroll Indicator Hide on Scroll ──────────
const scrollIndicator = document.getElementById('scroll-indicator');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    scrollIndicator.style.opacity = '0';
    scrollIndicator.style.pointerEvents = 'none';
  } else {
    scrollIndicator.style.opacity = '1';
  }
}, { passive: true });


// ── Hero Parallax Tilt ────────────────────────
const heroContent = document.querySelector('.hero-content');
const heroBg = document.querySelector('.hero-bg-image');

document.addEventListener('mousemove', (e) => {
  const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
  const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;

  if (heroContent) {
    heroContent.style.transform = `translate(${xRatio * 6}px, ${yRatio * 4}px)`;
  }
  if (heroBg) {
    heroBg.style.transform = `translate(${xRatio * -10}px, ${yRatio * -6}px) scale(1.05)`;
  }
});
