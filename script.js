/* ============================================================
   STONEHAVEN RESTAURANT & WINERY — script.js
   Features:
     1. Sticky navbar with scroll class
     2. Hamburger / mobile menu
     3. Scroll-reveal (IntersectionObserver)
     4. Hero image slider (auto + dots)
     5. Testimonials carousel
     6. Reservation form validation
     7. Smooth anchor scroll
     8. Min date for reservation
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAVBAR — scroll class + hamburger
  ---------------------------------------------------------- */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const overlay   = document.getElementById('mobileOverlay');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));


  /* ----------------------------------------------------------
     2. HERO IMAGE SLIDER
     - Smooth crossfade with subtle ken burns zoom
     - 4.5 s per slide, 1.4 s transition
  ---------------------------------------------------------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots   = document.querySelectorAll('.hero-dot');

  if (heroSlides.length) {
    let currentSlide = 0;
    let sliderTimer;

    function goToSlide(index) {
      heroSlides[currentSlide].classList.remove('active');
      heroDots[currentSlide].classList.remove('active');
      currentSlide = (index + heroSlides.length) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
      heroDots[currentSlide].classList.add('active');
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function startSlider() {
      sliderTimer = setInterval(nextSlide, 4500);
    }

    // Dot click
    heroDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(sliderTimer);
        goToSlide(i);
        startSlider();
      });
    });

    startSlider();
  }


  /* ----------------------------------------------------------
     3. SCROLL-REVEAL
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  // Stagger siblings
  const staggerParents = new Set();
  revealEls.forEach(el => staggerParents.add(el.parentElement));
  staggerParents.forEach(parent => {
    parent.querySelectorAll(':scope > .reveal').forEach((child, i) => {
      if (!child.style.getPropertyValue('--delay')) {
        child.style.setProperty('--delay', `${i * 0.1}s`);
      }
    });
  });

  revealEls.forEach(el => revealObserver.observe(el));

  // Hero elements stagger on load
  document.querySelectorAll('#hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 400 + i * 180);
  });


  /* ----------------------------------------------------------
     4. TESTIMONIALS CAROUSEL
  ---------------------------------------------------------- */
  const track    = document.getElementById('testimonialTrack');
  const slides   = track ? track.querySelectorAll('.testimonial-slide') : [];
  const dotsWrap = document.getElementById('tDots');
  const prevBtn  = document.getElementById('tPrev');
  const nextBtn  = document.getElementById('tNext');

  if (slides.length && dotsWrap) {
    let current = 0;
    let autoTimer;

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

    function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 5500); }
    function stopAuto()  { clearInterval(autoTimer); }

    prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

    // Touch/swipe
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
      let valid  = true;
      const name   = form.querySelector('#res-name').value.trim();
      const email  = form.querySelector('#res-email').value.trim();
      const date   = form.querySelector('#res-date').value;
      const time   = form.querySelector('#res-time').value;
      const guests = form.querySelector('#res-guests').value;

      if (!name || name.length < 2) {
        setError('err-name', 'Please enter your full name.'); valid = false;
      } else { setError('err-name', ''); }

      if (!email || !validateEmail(email)) {
        setError('err-email', 'Please enter a valid email address.'); valid = false;
      } else { setError('err-email', ''); }

      if (!date) {
        setError('err-date', 'Please select a date.'); valid = false;
      } else {
        const selected = new Date(date);
        const today    = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
          setError('err-date', 'Please select a future date.'); valid = false;
        } else { setError('err-date', ''); }
      }

      if (!time)   { setError('err-time', 'Please select a time.'); valid = false; }
      else         { setError('err-time', ''); }

      if (!guests) { setError('err-guests', 'Please select the number of guests.'); valid = false; }
      else         { setError('err-guests', ''); }

      return valid;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (validateForm()) {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;
        setTimeout(() => {
          formSuccess.style.display = 'block';
          form.reset();
          submitBtn.textContent = 'Confirm Reservation';
          submitBtn.disabled = false;
          setTimeout(() => { formSuccess.style.display = 'none'; }, 8000);
        }, 1200);
      }
    });

    form.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('blur', () => validateForm());
    });
  }


  /* ----------------------------------------------------------
     6. SMOOTH ANCHOR SCROLL
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
     7. SET MIN DATE for reservation input
  ---------------------------------------------------------- */
  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date();
    dateInput.min = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');
  }

})();
