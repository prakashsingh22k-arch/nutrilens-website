/**
 * NutriLens: AI Calorie Counter — Interactive Controller & Single CONFIG Source
 * Pure vanilla JS — works both as static files and under Vite dev/build.
 */
(function () {
  'use strict';

  /* ========================================================================
     0. CENTRALIZED CONFIG — Edit these values before publishing
     ======================================================================== */
  // Paste your official Google Play Store URL when live (e.g. "https://play.google.com/store/apps/details?id=com.yourapp").
  // Leave "" to keep hero/CTA Play Store buttons in disabled "Coming soon to Google Play" state.
  var PLAY_STORE_URL = '';

  var CONFIG = {
    PLAY_STORE_URL: PLAY_STORE_URL,

    // Official support & data-deletion email used everywhere on the site
    SUPPORT_EMAIL: 'prakashsingh22k@gmail.com',

    // USD baseline pricing (local currency is shown inside Google Play at checkout)
    PRICES: {
      monthly: 'US$3.99',
      yearly: 'US$19.99',
      yearlyMonthlyEquivalent: '~US$1.67/month',
      yearlySavingsBadge: 'Save 58%',
      localPriceNote: 'Local price is shown in Google Play',
      renewalNote: 'Auto-renews until cancelled. Cancel anytime in Google Play > Subscriptions.'
    },

    // Daily plan allowances displayed across Pricing cards and comparison tables
    PLAN_LIMITS: {
      free: {
        scansPerDay: '5 AI scans/day',
        voiceLogsPerDay: '3 voice logs/day',
        aiChatsPerDay: 'Not included'
      },
      proMonthly: {
        scansPerDay: '50 AI scans/day (fair use)',
        voiceLogsPerDay: '20 voice logs/day',
        aiChatsPerDay: '15 chats/day'
      },
      proYearly: {
        scansPerDay: '50 AI scans/day (fair use)',
        voiceLogsPerDay: '20 voice logs/day',
        aiChatsPerDay: '40 chats/day'
      }
    },

    // 11 supported app & logging languages
    SUPPORTED_LANGUAGES: [
      'English',
      'Spanish (Español)',
      'French (Français)',
      'German (Deutsch)',
      'Italian (Italiano)',
      'Portuguese (Português)',
      'Dutch (Nederlands)',
      'Polish (Polski)',
      'Hindi (हिन्दी)',
      'Japanese (日本語)',
      'Korean (한국어)'
    ],

    // App screenshot frames — add relative/CDN image paths to `imageSrc` when ready.
    // Empty `imageSrc` (or a failed load) renders the styled Android UI mock screen.
    SCREENSHOTS: [
      {
        id: 'scan',
        badge: '01 · AI Scan',
        title: 'AI Photo Scan & Portion Estimate',
        caption: 'Detect multi-item meals with AI confidence, NutriLens Score, and estimated calories & macros.',
        imageSrc: 'assets/aistudio/Screenshot_2026-11-11-17-35-35-24_40deb401b9ffe8e1df2f1cc5ba480b12_2_b9c039db.jpg',
        mockType: 'scan'
      },
      {
        id: 'diary',
        badge: '02 · Diary',
        title: 'On-Device Daily Food Diary',
        caption: 'Track daily calorie intake, macro progress bars, weight goal, Quick Add Meal, and CSV export on your device.',
        imageSrc: 'assets/aistudio/IMG_20261113_074949_cc56cf97.jpg',
        mockType: 'diary'
      },
      {
        id: 'meals',
        badge: '03 · Pro Meals',
        title: '7-Day AI Meal Planner & Recipes',
        caption: 'Personalized 7-day meal plans, grocery lists, and schedule reminders tailored to your calorie goal and diet.',
        imageSrc: 'assets/aistudio/IMG_20261113_075020_cc072d52.jpg',
        mockType: 'meals'
      },
      {
        id: 'targets',
        badge: '04 · Targets',
        title: 'Mifflin-St Jeor Targets & BMI',
        caption: 'Calculate estimated daily calorie & macro targets from your biometrics alongside a visual BMI guide.',
        imageSrc: 'assets/aistudio/IMG_20261113_075037_60f2d730.jpg',
        mockType: 'targets'
      }
    ]
  };

  window.NUTRILENS_CONFIG = CONFIG;

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================================
     1. Theme Management (Dark Mode default; Light Mode optional)
     ======================================================================== */
  var rootEl = document.documentElement;

  function getInitialTheme() {
    try {
      var saved = localStorage.getItem('nutrilens_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (e) {
      // Ignore storage errors
    }
    return 'dark';
  }

  function applyTheme(theme) {
    var isDark = theme !== 'light';
    rootEl.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      rootEl.classList.add('dark');
    } else {
      rootEl.classList.remove('dark');
    }

    var toggleBtns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < toggleBtns.length; i++) {
      var btn = toggleBtns[i];
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        isDark ? 'Switch to light theme' : 'Switch to dark theme'
      );
      var labelSpan = btn.querySelector('[data-theme-label]');
      if (labelSpan) {
        labelSpan.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      }
    }
  }

  var currentTheme = getInitialTheme();
  applyTheme(currentTheme);
  window.setTimeout(function () {
    rootEl.classList.add('theme-transitions');
  }, 50);

  document.addEventListener('click', function (e) {
    var toggleBtn = e.target.closest('[data-theme-toggle]');
    if (!toggleBtn) return;
    currentTheme = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('nutrilens_theme', currentTheme);
    } catch (err) {
      // Ignore storage errors
    }
    applyTheme(currentTheme);
  });

  /* ========================================================================
     2. Hydrate Play Store CTAs, CONFIG Prices/Limits, Languages & Screenshots
     ======================================================================== */
  function hydratePlayStoreButtons() {
    var url = (PLAY_STORE_URL || CONFIG.PLAY_STORE_URL || '').trim();
    var btns = document.querySelectorAll('[data-play-store-btn]');
    var headerActions = document.querySelectorAll('.header-actions');

    for (var h = 0; h < headerActions.length; h++) {
      headerActions[h].classList.toggle('has-play-store', Boolean(url));
    }

    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var alwaysVisible = btn.getAttribute('data-play-visible') === 'always';
      var labelTarget = btn.querySelector('[data-play-label]') || btn;

      if (!url) {
        if (alwaysVisible) {
          btn.removeAttribute('hidden');
          btn.removeAttribute('href');
          btn.removeAttribute('target');
          btn.removeAttribute('rel');
          btn.setAttribute('aria-disabled', 'true');
          btn.setAttribute('aria-label', 'Coming soon to Google Play');
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-secondary');
          labelTarget.textContent = 'Coming soon to Google Play';
        } else {
          btn.setAttribute('hidden', '');
          btn.removeAttribute('href');
          btn.removeAttribute('aria-disabled');
        }
      } else {
        btn.removeAttribute('hidden');
        btn.removeAttribute('aria-disabled');
        btn.setAttribute('aria-label', 'Get it on Google Play');
        if (alwaysVisible) {
          btn.classList.remove('btn-secondary');
          btn.classList.add('btn-primary');
        }
        if (btn.tagName === 'A') {
          btn.setAttribute('href', url);
          btn.setAttribute('target', '_blank');
          btn.setAttribute('rel', 'noopener noreferrer');
        }
        labelTarget.textContent = 'Get it on Google Play';
      }
    }
  }

  function hydrateConfigBindings() {
    var priceBindings = {
      monthly: CONFIG.PRICES.monthly,
      yearly: CONFIG.PRICES.yearly,
      yearlyEquiv: CONFIG.PRICES.yearlyMonthlyEquivalent,
      yearlyBadge: CONFIG.PRICES.yearlySavingsBadge,
      localPriceNote: CONFIG.PRICES.localPriceNote,
      renewalNote: CONFIG.PRICES.renewalNote
    };

    var priceEls = document.querySelectorAll('[data-config-price]');
    for (var i = 0; i < priceEls.length; i++) {
      var key = priceEls[i].getAttribute('data-config-price');
      if (key && priceBindings[key]) {
        priceEls[i].textContent = priceBindings[key];
      }
    }

    var limitEls = document.querySelectorAll('[data-config-limit]');
    for (var j = 0; j < limitEls.length; j++) {
      var path = (limitEls[j].getAttribute('data-config-limit') || '').split('.');
      if (path.length === 2 && CONFIG.PLAN_LIMITS[path[0]] && CONFIG.PLAN_LIMITS[path[0]][path[1]]) {
        limitEls[j].textContent = CONFIG.PLAN_LIMITS[path[0]][path[1]];
      }
    }

    var langLists = document.querySelectorAll('[data-languages-list]');
    for (var k = 0; k < langLists.length; k++) {
      var target = langLists[k];
      var mode = target.getAttribute('data-languages-list') || 'chips';
      if (mode === 'inline') {
        target.textContent = CONFIG.SUPPORTED_LANGUAGES.join(', ');
      } else {
        target.innerHTML = '';
        for (var l = 0; l < CONFIG.SUPPORTED_LANGUAGES.length; l++) {
          var chip = document.createElement('span');
          chip.className = 'diet-chip';
          chip.textContent = CONFIG.SUPPORTED_LANGUAGES[l];
          target.appendChild(chip);
        }
      }
    }
  }

  function buildMockScreenshotMarkup(mockType) {
    if (mockType === 'scan') {
      return (
        '<div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);">' +
          '<span>8:00 AM · Scan</span><span class="text-mint">Camera AI</span>' +
        '</div>' +
        '<div class="scan-bounding-box" style="margin:0.75rem 0;text-align:center;">' +
          '<span style="font-size:2rem;display:block;">🥗</span>' +
          '<div style="font-size:0.86rem;font-weight:700;color:var(--text);">Salmon &amp; Quinoa Bowl</div>' +
          '<div class="mono text-mint" style="font-size:1.1rem;font-weight:700;">~540 kcal (est.)</div>' +
        '</div>' +
        '<div class="macro-grid">' +
          '<div class="macro-cell"><span class="macro-label">Protein</span><span class="macro-val text-protein">38g</span></div>' +
          '<div class="macro-cell"><span class="macro-label">Carbs</span><span class="macro-val text-carbs">42g</span></div>' +
          '<div class="macro-cell"><span class="macro-label">Fats</span><span class="macro-val text-fats">22g</span></div>' +
        '</div>'
      );
    }
    if (mockType === 'diary') {
      return (
        '<div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);">' +
          '<span>Today · On-Device</span><span class="text-mint">1,520 / 2,050</span>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:0.5rem;margin:0.65rem 0;">' +
          '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:0.5rem 0.65rem;font-size:0.78rem;display:flex;justify-content:space-between;">' +
            '<span>🍳 Oats &amp; Eggs · 8:00 AM</span><span class="mono text-mint">420 kcal</span>' +
          '</div>' +
          '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:0.5rem 0.65rem;font-size:0.78rem;display:flex;justify-content:space-between;">' +
            '<span>🥗 Salmon Bowl · 1:15 PM</span><span class="mono text-mint">540 kcal</span>' +
          '</div>' +
          '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:0.5rem 0.65rem;font-size:0.78rem;display:flex;justify-content:space-between;">' +
            '<span>💧 Water Tracker</span><span class="mono" style="color:var(--primary);">1.75 / 2.5 L</span>' +
          '</div>' +
        '</div>' +
        '<div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--muted);">Diary stored locally on your device</div>'
      );
    }
    if (mockType === 'meals') {
      return (
        '<div style="display:flex;justify-content:space-between;align-items:center;font-family:var(--font-mono);font-size:0.72rem;">' +
          '<span class="text-muted">7-Day AI Meal Plan</span><span class="pro-badge">PRO</span>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:0.5rem;margin:0.65rem 0;">' +
          '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:0.5rem 0.65rem;font-size:0.78rem;">' +
            '<div style="font-weight:700;color:var(--text);">Day 1 · High Protein · Mediterranean</div>' +
            '<div class="text-muted" style="font-size:0.72rem;">3 meals + 1 snack · ~1,980 kcal (est.)</div>' +
          '</div>' +
          '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:0.5rem 0.65rem;font-size:0.78rem;">' +
            '<div style="font-weight:700;color:var(--text);">🛒 Auto Grocery List Ready</div>' +
            '<div class="text-muted" style="font-size:0.72rem;">18 items grouped by aisle · Recipes included</div>' +
          '</div>' +
        '</div>' +
        '<div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--mint);">AI estimates — always check labels</div>'
      );
    }
    return (
      '<div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);">' +
        '<span>Targets · Mifflin-St Jeor</span><span style="color:var(--primary);">BMI ~22.9</span>' +
      '</div>' +
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:0.7rem;margin:0.65rem 0;text-align:center;">' +
        '<div style="font-size:0.74rem;color:var(--muted);">Daily Energy Target (est.)</div>' +
        '<div class="mono text-mint" style="font-size:1.3rem;font-weight:700;">~2,050 kcal</div>' +
      '</div>' +
      '<div class="macro-grid">' +
        '<div class="macro-cell"><span class="macro-label">Protein</span><span class="macro-val text-protein">154g</span></div>' +
        '<div class="macro-cell"><span class="macro-label">Carbs</span><span class="macro-val text-carbs">205g</span></div>' +
        '<div class="macro-cell"><span class="macro-label">Fats</span><span class="macro-val text-fats">68g</span></div>' +
      '</div>'
    );
  }

  function renderScreenshotGallery() {
    var container = document.getElementById('screenshots-gallery');
    if (!container) return;

    container.innerHTML = '';
    for (var i = 0; i < CONFIG.SCREENSHOTS.length; i++) {
      var item = CONFIG.SCREENSHOTS[i];
      var card = document.createElement('article');
      card.className = 'screenshot-phone-card';
      card.setAttribute('data-reveal', '');
      card.style.setProperty('--reveal-delay', i * 75 + 'ms');

      var header = document.createElement('div');
      header.innerHTML =
        '<div class="phone-notch" style="margin-bottom:0.55rem"></div>' +
        '<span class="card-index" style="margin-bottom:0.25rem">' + item.badge + '</span>';

      var screenFrame = document.createElement('div');
      screenFrame.className = 'screenshot-screen-frame';

      if (item.imageSrc && item.imageSrc.trim() !== '') {
        screenFrame.classList.add('has-image');
        var img = document.createElement('img');
        img.src = item.imageSrc;
        img.alt = item.title + ' — NutriLens Android app screen';
        img.className = 'screenshot-img';
        (function (frame, fallbackType) {
          img.onerror = function () {
            frame.classList.remove('has-image');
            frame.innerHTML = buildMockScreenshotMarkup(fallbackType);
          };
        })(screenFrame, item.mockType);
        screenFrame.appendChild(img);
      } else {
        screenFrame.innerHTML = buildMockScreenshotMarkup(item.mockType);
      }

      var footer = document.createElement('div');
      footer.innerHTML =
        '<h3 class="card-title" style="font-size:1rem;margin-bottom:0.25rem">' + item.title + '</h3>' +
        '<p class="card-text" style="font-size:0.84rem">' + item.caption + '</p>';

      card.appendChild(header);
      card.appendChild(screenFrame);
      card.appendChild(footer);
      container.appendChild(card);
    }
  }

  hydratePlayStoreButtons();
  hydrateConfigBindings();
  renderScreenshotGallery();

  /* ========================================================================
     3. Mobile Navigation Hamburger Drawer
     ======================================================================== */
  var mobileBtn = document.getElementById('mobile-menu-btn');
  var mobileDrawer = document.getElementById('mobile-nav-drawer');

  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', function () {
      var expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
      var nextState = !expanded;
      mobileBtn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
      if (nextState) {
        mobileDrawer.classList.add('is-open');
        mobileDrawer.removeAttribute('hidden');
      } else {
        mobileDrawer.classList.remove('is-open');
        mobileDrawer.setAttribute('hidden', '');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileBtn.getAttribute('aria-expanded') === 'true') {
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('is-open');
        mobileDrawer.setAttribute('hidden', '');
        mobileBtn.focus();
      }
    });
  }

  /* ========================================================================
     4. 3D Phone Mouse Tilt, Background Orb Parallax, Count-Up & Scroll Reveal
     ======================================================================== */
  var heroStage = document.querySelector('.hero-stage');
  var phone3dWrap = document.querySelector('.phone-3d-wrap');
  var canHoverDesktop = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (heroStage && phone3dWrap && canHoverDesktop && !prefersReducedMotion) {
    heroStage.addEventListener('mousemove', function (e) {
      var rect = heroStage.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      phone3dWrap.style.setProperty('--ry', (x * 11).toFixed(2) + 'deg');
      phone3dWrap.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg');
    });

    heroStage.addEventListener('mouseleave', function () {
      phone3dWrap.style.setProperty('--ry', '0deg');
      phone3dWrap.style.setProperty('--rx', '0deg');
    });
  }

  // Subtle parallax on glowing background orbs
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !prefersReducedMotion) {
    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          var scrollY = window.scrollY || window.pageYOffset || 0;
          for (var i = 0; i < parallaxEls.length; i++) {
            var speed = parseFloat(parallaxEls[i].getAttribute('data-parallax')) || 0.08;
            parallaxEls[i].style.transform = 'translate3d(0, ' + (scrollY * speed).toFixed(1) + 'px, 0)';
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // Count-up animation on floating food card numbers
  function runCountUp(el) {
    var target = parseFloat(el.getAttribute('data-countup')) || 0;
    var suffix = el.getAttribute('data-countup-suffix') || '';
    var prefix = el.getAttribute('data-countup-prefix') || '';
    if (prefersReducedMotion || !target) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var duration = 700;
    var startTime = performance.now();
    function step(now) {
      var progress = Math.max(0, Math.min(1, (now - startTime) / duration));
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  var countUpEls = document.querySelectorAll('[data-countup]');
  for (var cu = 0; cu < countUpEls.length; cu++) {
    runCountUp(countUpEls[cu]);
  }

  // Scroll Reveal Observer
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      for (var r = 0; r < revealEls.length; r++) {
        revealEls[r].classList.add('is-revealed');
      }
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          for (var e = 0; e < entries.length; e++) {
            if (entries[e].isIntersecting) {
              entries[e].target.classList.add('is-revealed');
              observer.unobserve(entries[e].target);
            }
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
      );
      for (var idx = 0; idx < revealEls.length; idx++) {
        observer.observe(revealEls[idx]);
      }
    }
  }

  /* ========================================================================
     5. Interactive Hero Phone Mockup (Bottom Nav Tabs + AI Scan Demo)
     ======================================================================== */
  var MEAL_SAMPLES = {
    salmon: {
      emoji: '🥗',
      name: 'Grilled Salmon & Quinoa Bowl',
      kcal: 540,
      kj: 2259,
      portionG: 340,
      portionOz: 12.0,
      proteinG: 38,
      proteinOz: 1.3,
      carbsG: 42,
      carbsOz: 1.5,
      fatG: 22,
      fatOz: 0.8,
      micros: 'Est. Fiber 6g · Iron 18% DV · Omega-3 1.8g'
    },
    avocado: {
      emoji: '🥑',
      name: 'Avocado Toast & Poached Eggs',
      kcal: 460,
      kj: 1925,
      portionG: 265,
      portionOz: 9.3,
      proteinG: 19,
      proteinOz: 0.7,
      carbsG: 34,
      carbsOz: 1.2,
      fatG: 27,
      fatOz: 1.0,
      micros: 'Est. Fiber 8g · Potassium 14% DV · Vit D 15% DV'
    },
    oats: {
      emoji: '🥣',
      name: 'Berry Protein Oatmeal Bowl',
      kcal: 390,
      kj: 1632,
      portionG: 310,
      portionOz: 10.9,
      proteinG: 26,
      proteinOz: 0.9,
      carbsG: 52,
      carbsOz: 1.8,
      fatG: 8,
      fatOz: 0.3,
      micros: 'Est. Fiber 9g · Calcium 22% DV · Vit C 25% DV'
    }
  };

  var selectedMealKey = 'salmon';
  var selectedUnitMode = 'metric';

  function renderHeroMealPreview() {
    var meal = MEAL_SAMPLES[selectedMealKey];
    if (!meal) return;

    var emojiEl = document.getElementById('demo-meal-emoji');
    var titleEl = document.getElementById('demo-meal-title');
    var energyEl = document.getElementById('demo-meal-energy');
    var portionEl = document.getElementById('demo-meal-portion');
    var proteinEl = document.getElementById('demo-meal-protein');
    var carbsEl = document.getElementById('demo-meal-carbs');
    var fatEl = document.getElementById('demo-meal-fat');
    var microsEl = document.getElementById('demo-meal-micros');

    if (!titleEl) return;

    if (emojiEl) emojiEl.textContent = meal.emoji;
    titleEl.textContent = meal.name;

    if (selectedUnitMode === 'metric') {
      if (energyEl) energyEl.textContent = '~' + meal.kcal + ' kcal (est.)';
      if (portionEl) portionEl.textContent = 'Est. portion: ~' + meal.portionG + ' g';
      if (proteinEl) proteinEl.textContent = '~' + meal.proteinG + ' g';
      if (carbsEl) carbsEl.textContent = '~' + meal.carbsG + ' g';
      if (fatEl) fatEl.textContent = '~' + meal.fatG + ' g';
    } else {
      if (energyEl) energyEl.textContent = '~' + meal.kj + ' kJ (est.)';
      if (portionEl) portionEl.textContent = 'Est. portion: ~' + meal.portionOz + ' oz';
      if (proteinEl) proteinEl.textContent = '~' + meal.proteinOz + ' oz';
      if (carbsEl) carbsEl.textContent = '~' + meal.carbsOz + ' oz';
      if (fatEl) fatEl.textContent = '~' + meal.fatOz + ' oz';
    }
    if (microsEl) {
      microsEl.textContent = meal.micros;
    }
  }

  var PHONE_TAB_LABELS = {
    scan: 'Scan · AI Camera',
    diary: 'Diary · On-Device',
    progress: 'Progress · Trends',
    meals: 'Meals · 7-Day Plan',
    targets: 'Targets · Mifflin-St Jeor'
  };

  document.addEventListener('click', function (e) {
    var mealBtn = e.target.closest('[data-meal-select]');
    if (mealBtn) {
      selectedMealKey = mealBtn.getAttribute('data-meal-select') || 'salmon';
      var allMealBtns = document.querySelectorAll('[data-meal-select]');
      for (var i = 0; i < allMealBtns.length; i++) {
        var active = allMealBtns[i] === mealBtn;
        allMealBtns[i].setAttribute('aria-pressed', active ? 'true' : 'false');
        allMealBtns[i].classList.toggle('is-active', active);
      }
      renderHeroMealPreview();
    }

    var unitBtn = e.target.closest('[data-unit-mode]');
    if (unitBtn) {
      selectedUnitMode = unitBtn.getAttribute('data-unit-mode') || 'metric';
      var allUnitBtns = document.querySelectorAll('[data-unit-mode]');
      for (var j = 0; j < allUnitBtns.length; j++) {
        var isUnitActive = allUnitBtns[j] === unitBtn;
        allUnitBtns[j].setAttribute('aria-pressed', isUnitActive ? 'true' : 'false');
        allUnitBtns[j].classList.toggle('is-active', isUnitActive);
      }
      renderHeroMealPreview();
    }

    var phoneTabBtn = e.target.closest('[data-phone-tab]');
    if (phoneTabBtn) {
      var targetTab = phoneTabBtn.getAttribute('data-phone-tab') || 'scan';
      var allTabBtns = document.querySelectorAll('[data-phone-tab]');
      for (var t = 0; t < allTabBtns.length; t++) {
        var isTabActive = allTabBtns[t] === phoneTabBtn;
        allTabBtns[t].setAttribute('aria-selected', isTabActive ? 'true' : 'false');
        allTabBtns[t].classList.toggle('is-active', isTabActive);
      }

      var views = document.querySelectorAll('[data-phone-view]');
      for (var v = 0; v < views.length; v++) {
        if (views[v].getAttribute('data-phone-view') === targetTab) {
          views[v].removeAttribute('hidden');
        } else {
          views[v].setAttribute('hidden', '');
        }
      }

      var screenLabel = document.getElementById('phone-screen-label');
      if (screenLabel && PHONE_TAB_LABELS[targetTab]) {
        screenLabel.textContent = PHONE_TAB_LABELS[targetTab];
      }
    }
  });

  /* ========================================================================
     6. Accessible FAQ Accordions & Search/Category Filter
     ======================================================================== */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.faq-trigger');
    if (!trigger) return;

    var expanded = trigger.getAttribute('aria-expanded') === 'true';
    var panelId = trigger.getAttribute('aria-controls');
    var panel = panelId ? document.getElementById(panelId) : null;

    trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    if (panel) {
      if (expanded) {
        panel.setAttribute('hidden', '');
      } else {
        panel.removeAttribute('hidden');
      }
    }
  });

  var faqSearchInput = document.getElementById('faq-search-input');
  var faqCategoryBtns = document.querySelectorAll('[data-faq-category]');
  var faqItems = document.querySelectorAll('[data-faq-item]');
  var faqCountStatus = document.getElementById('faq-count-status');
  var activeFaqCategory = 'all';

  function filterFaqItems() {
    if (!faqItems.length) return;
    var query = faqSearchInput ? faqSearchInput.value.toLowerCase().trim() : '';
    var visibleCount = 0;

    for (var i = 0; i < faqItems.length; i++) {
      var item = faqItems[i];
      var cat = (item.getAttribute('data-faq-item') || '').toLowerCase();
      var text = (item.textContent || '').toLowerCase();
      var matchesCat = activeFaqCategory === 'all' || cat === activeFaqCategory;
      var matchesQuery = !query || text.indexOf(query) !== -1;

      if (matchesCat && matchesQuery) {
        item.removeAttribute('hidden');
        visibleCount++;
      } else {
        item.setAttribute('hidden', '');
      }
    }

    if (faqCountStatus) {
      faqCountStatus.textContent =
        'Showing ' + visibleCount + ' of ' + faqItems.length + ' questions';
    }
  }

  if (faqCategoryBtns.length) {
    for (var c = 0; c < faqCategoryBtns.length; c++) {
      faqCategoryBtns[c].addEventListener('click', function () {
        activeFaqCategory = this.getAttribute('data-faq-category') || 'all';
        for (var j = 0; j < faqCategoryBtns.length; j++) {
          var isSelected = faqCategoryBtns[j] === this;
          faqCategoryBtns[j].setAttribute('aria-pressed', isSelected ? 'true' : 'false');
          faqCategoryBtns[j].classList.toggle('is-active', isSelected);
        }
        filterFaqItems();
      });
    }
  }

  if (faqSearchInput) {
    faqSearchInput.addEventListener('input', filterFaqItems);
  }

  /* ========================================================================
     7. Features Page: Mifflin-St Jeor Daily Macro & Calorie Target Calculator
        + Metric/Imperial Unit & BMI Converter
     ======================================================================== */
  var calcSexEl = document.getElementById('calc-sex');
  var calcAgeEl = document.getElementById('calc-age');
  var calcWeightEl = document.getElementById('calc-weight-kg');
  var calcHeightEl = document.getElementById('calc-height-cm');
  var calcActivityEl = document.getElementById('calc-activity');
  var calcGoalEl = document.getElementById('calc-goal');
  var calcDietEl = document.getElementById('calc-diet');
  var calcEnergyEl = document.getElementById('calc-energy-kcal');
  var calcPortionEl = document.getElementById('calc-portion-g');

  var ACTIVITY_MULT = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  var GOAL_ADJ = { lose: -400, maintain: 0, gain: 300 };
  var DIET_RATIOS = {
    balanced: { p: 0.25, c: 0.45, f: 0.3 },
    high_protein: { p: 0.35, c: 0.35, f: 0.3 },
    low_carb: { p: 0.3, c: 0.25, f: 0.45 },
    keto: { p: 0.25, c: 0.08, f: 0.67 }
  };

  function updateFeaturesCalculators() {
    var kg = Math.max(30, Math.min(300, parseFloat(calcWeightEl && calcWeightEl.value) || 70));
    var cm = Math.max(100, Math.min(250, parseFloat(calcHeightEl && calcHeightEl.value) || 175));
    var kcal = Math.max(0, parseFloat(calcEnergyEl && calcEnergyEl.value) || 540);
    var g = Math.max(0, parseFloat(calcPortionEl && calcPortionEl.value) || 340);

    // Metric <-> Imperial + BMI
    var lb = (kg * 2.20462).toFixed(1);
    var totalInches = cm / 2.54;
    var ft = Math.floor(totalInches / 12);
    var inches = Math.round(totalInches - ft * 12);
    if (inches === 12) {
      ft += 1;
      inches = 0;
    }
    var kj = Math.round(kcal * 4.184);
    var oz = (g / 28.3495).toFixed(1);
    var heightM = cm / 100;
    var bmi = (kg / (heightM * heightM)).toFixed(1);

    var outWeight = document.getElementById('out-weight-conv');
    var outHeight = document.getElementById('out-height-conv');
    var outEnergy = document.getElementById('out-energy-conv');
    var outPortion = document.getElementById('out-portion-conv');
    var outBmi = document.getElementById('out-bmi-est');

    if (outWeight) outWeight.textContent = kg + ' kg = ' + lb + ' lb';
    if (outHeight) outHeight.textContent = cm + ' cm = ' + ft + ' ft ' + inches + ' in';
    if (outEnergy) outEnergy.textContent = '~' + kcal + ' kcal = ~' + kj + ' kJ (est.)';
    if (outPortion) outPortion.textContent = '~' + g + ' g = ~' + oz + ' oz (est.)';
    if (outBmi) outBmi.textContent = 'Estimated BMI: ~' + bmi + ' (general reference estimate)';

    // Mifflin-St Jeor Daily Macro & Calorie Target Calculator
    if (calcSexEl && calcAgeEl && calcActivityEl && calcGoalEl && calcDietEl) {
      var sex = calcSexEl.value === 'female' ? 'female' : 'male';
      var age = Math.max(15, Math.min(100, parseFloat(calcAgeEl.value) || 30));
      var sexOffset = sex === 'male' ? 5 : -161;
      var bmr = Math.round(10 * kg + 6.25 * cm - 5 * age + sexOffset);
      var tdee = Math.round(bmr * (ACTIVITY_MULT[calcActivityEl.value] || 1.375));
      var targetKcal = Math.max(1200, Math.round(tdee + (GOAL_ADJ[calcGoalEl.value] || 0)));
      var ratios = DIET_RATIOS[calcDietEl.value] || DIET_RATIOS.balanced;

      var proteinG = Math.round((targetKcal * ratios.p) / 4);
      var carbsG = Math.round((targetKcal * ratios.c) / 4);
      var fatsG = Math.round((targetKcal * ratios.f) / 9);

      var outBmr = document.getElementById('out-bmr-est');
      var outTdee = document.getElementById('out-tdee-est');
      var outTarget = document.getElementById('out-target-kcal');
      var outProt = document.getElementById('out-target-protein');
      var outCarb = document.getElementById('out-target-carbs');
      var outFat = document.getElementById('out-target-fats');

      if (outBmr) outBmr.textContent = '~' + bmr + ' kcal/day';
      if (outTdee) outTdee.textContent = '~' + tdee + ' kcal/day';
      if (outTarget) outTarget.textContent = '~' + targetKcal + ' kcal/day (est.)';
      if (outProt) outProt.textContent = '~' + proteinG + ' g';
      if (outCarb) outCarb.textContent = '~' + carbsG + ' g';
      if (outFat) outFat.textContent = '~' + fatsG + ' g';
    }
  }

  var calcInputs = [
    calcSexEl,
    calcAgeEl,
    calcWeightEl,
    calcHeightEl,
    calcActivityEl,
    calcGoalEl,
    calcDietEl,
    calcEnergyEl,
    calcPortionEl
  ];
  var hasAnyCalc = false;
  for (var ci = 0; ci < calcInputs.length; ci++) {
    if (calcInputs[ci]) {
      hasAnyCalc = true;
      calcInputs[ci].addEventListener('input', updateFeaturesCalculators);
      calcInputs[ci].addEventListener('change', updateFeaturesCalculators);
    }
  }
  if (hasAnyCalc) {
    updateFeaturesCalculators();
  }

  /* ========================================================================
     8. Mailto Contact & Data Deletion Form Validation + Copy Email
     ======================================================================== */
  function attachMailtoFormHandler(formId, feedbackId) {
    var form = document.getElementById(formId);
    var feedback = document.getElementById(feedbackId);
    if (!form || !feedback) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameEl = form.querySelector('[name="name"]');
      var emailEl = form.querySelector('[name="email"]');
      var subjectEl = form.querySelector('[name="subject"]');
      var messageEl = form.querySelector('[name="message"]');

      var name = nameEl ? nameEl.value.trim() : '';
      var email = emailEl ? emailEl.value.trim() : '';
      var subject = subjectEl ? subjectEl.value.trim() : '';
      var message = messageEl ? messageEl.value.trim() : '';

      feedback.removeAttribute('hidden');
      feedback.className = 'form-feedback';

      if (!name) {
        feedback.classList.add('is-error');
        feedback.textContent = 'Please enter your name before continuing.';
        if (nameEl) nameEl.focus();
        return;
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        feedback.classList.add('is-error');
        feedback.textContent = 'Please enter a valid email address.';
        if (emailEl) emailEl.focus();
        return;
      }

      if (!subject) {
        feedback.classList.add('is-error');
        feedback.textContent = 'Please select or enter a subject.';
        if (subjectEl) subjectEl.focus();
        return;
      }

      if (!message || message.length < 10) {
        feedback.classList.add('is-error');
        feedback.textContent = 'Please enter a message of at least 10 characters.';
        if (messageEl) messageEl.focus();
        return;
      }

      var fullSubject = '[NutriLens] ' + subject;
      var bodyText =
        'Name: ' +
        name +
        '\nEmail: ' +
        email +
        '\nTopic: ' +
        subject +
        '\n\nMessage:\n' +
        message;

      var mailtoHref =
        'mailto:' +
        CONFIG.SUPPORT_EMAIL +
        '?subject=' +
        encodeURIComponent(fullSubject) +
        '&body=' +
        encodeURIComponent(bodyText);

      feedback.classList.add('is-success');
      feedback.innerHTML =
        '<strong>Email draft ready!</strong> Your email client has been triggered for <a href="' +
        mailtoHref +
        '" class="mono">' +
        CONFIG.SUPPORT_EMAIL +
        '</a>. If your mail app did not open automatically, click the email link above.';

      window.location.href = mailtoHref;
    });
  }

  attachMailtoFormHandler('contact-form', 'contact-form-feedback');
  attachMailtoFormHandler('delete-data-form', 'delete-form-feedback');

  document.addEventListener('click', function (e) {
    var copyBtn = e.target.closest('[data-copy-email]');
    if (!copyBtn) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CONFIG.SUPPORT_EMAIL).then(function () {
        copyBtn.textContent = 'Copied: ' + CONFIG.SUPPORT_EMAIL;
        setTimeout(function () {
          copyBtn.textContent = 'Copy Email Address';
        }, 2500);
      });
    } else {
      copyBtn.textContent = CONFIG.SUPPORT_EMAIL;
    }
  });
})();
