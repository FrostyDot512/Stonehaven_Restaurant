/* ============================================================
   STONEHAVEN RESTAURANT & WINERY — script.js
   Features:
     1. Sticky navbar with scroll class
     2. Hamburger / mobile menu
     3. Scroll-reveal (IntersectionObserver)
     4. Menu tab switcher
     5. Testimonials carousel
     6. Reservation form validation
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAVBAR — scroll class + hamburger
  ---------------------------------------------------------- */
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');
  const overlay     = document.getElementById('mobileOverlay');

  // Add .scrolled when page scrolls past hero
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Toggle mobile menu
  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);

  // Close menu when any nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });


  /* ----------------------------------------------------------
     2. SCROLL-REVEAL — fade + slide elements into view
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // once only
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  // Stagger siblings within the same parent
  const staggerParents = new Set();
  revealEls.forEach(el => staggerParents.add(el.parentElement));

  staggerParents.forEach(parent => {
    const children = parent.querySelectorAll(':scope > .reveal');
    children.forEach((child, i) => {
      if (!child.style.getPropertyValue('--delay')) {
        child.style.setProperty('--delay', `${i * 0.1}s`);
      }
    });
  });

  revealEls.forEach(el => revealObserver.observe(el));

  // Hero elements get a small stagger on page load
  const heroReveals = document.querySelectorAll('#hero .reveal');
  heroReveals.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 300 + i * 160);
  });


  /* ----------------------------------------------------------
     3. MENU TABS
  ---------------------------------------------------------- */
  const tabs   = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.menu-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tab active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show matching panel
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-${target}`) {
          panel.classList.add('active');

          // Re-trigger reveals inside newly active panel
          panel.querySelectorAll('.reveal:not(.visible)').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 80);
          });
        }
      });
    });
  });


  /* ----------------------------------------------------------
     4. TESTIMONIALS CAROUSEL
  ---------------------------------------------------------- */
  const track      = document.getElementById('testimonialTrack');
  const slides     = track ? track.querySelectorAll('.testimonial-slide') : [];
  const dotsWrap   = document.getElementById('tDots');
  const prevBtn    = document.getElementById('tPrev');
  const nextBtn    = document.getElementById('tNext');

  if (slides.length && dotsWrap) {
    let current = 0;
    let autoTimer;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.classList.add('t-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function updateDots() {
      dotsWrap.querySelectorAll('.t-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      updateDots();
    }

    function startAuto() {
      autoTimer = setInterval(() => goTo(current + 1), 5500);
    }
    function stopAuto() {
      clearInterval(autoTimer);
    }

    prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        stopAuto();
        goTo(diff > 0 ? current + 1 : current - 1);
        startAuto();
      }
    });

    startAuto();
  }


  /* ----------------------------------------------------------
     5. RESERVATION FORM VALIDATION
  ---------------------------------------------------------- */
  const form        = document.getElementById('reservationForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    // Helper: show/clear error
    function setError(id, message) {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = message;
        el.classList.toggle('active', !!message);
        const input = document.getElementById(id.replace('err-', 'res-'));
        if (input) input.style.borderColor = message ? '#e07070' : '';
      }
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateForm() {
      let valid = true;

      const name  = form.querySelector('#res-name').value.trim();
      const email = form.querySelector('#res-email').value.trim();
      const date  = form.querySelector('#res-date').value;
      const time  = form.querySelector('#res-time').value;
      const guests = form.querySelector('#res-guests').value;

      // Name
      if (!name || name.length < 2) {
        setError('err-name', 'Please enter your full name.');
        valid = false;
      } else {
        setError('err-name', '');
      }

      // Email
      if (!email || !validateEmail(email)) {
        setError('err-email', 'Please enter a valid email address.');
        valid = false;
      } else {
        setError('err-email', '');
      }

      // Date — must not be in the past
      if (!date) {
        setError('err-date', 'Please select a date.');
        valid = false;
      } else {
        const selected = new Date(date);
        const today    = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
          setError('err-date', 'Please select a future date.');
          valid = false;
        } else {
          setError('err-date', '');
        }
      }

      // Time
      if (!time) {
        setError('err-time', 'Please select a time.');
        valid = false;
      } else {
        setError('err-time', '');
      }

      // Guests
      if (!guests) {
        setError('err-guests', 'Please select the number of guests.');
        valid = false;
      } else {
        setError('err-guests', '');
      }

      return valid;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (validateForm()) {
        // Simulate submission
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        setTimeout(() => {
          formSuccess.style.display = 'block';
          form.reset();
          submitBtn.textContent = 'Confirm Reservation';
          submitBtn.disabled = false;

          // Hide success after 8s
          setTimeout(() => { formSuccess.style.display = 'none'; }, 8000);
        }, 1200);
      }
    });

    // Live validation on blur
    form.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('blur', () => validateForm());
    });
  }


  /* ----------------------------------------------------------
     6. SMOOTH ANCHOR SCROLL (extra safety for older browsers)
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ----------------------------------------------------------
     7. SET MIN DATE for reservation input to today
  ---------------------------------------------------------- */
  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

})();
