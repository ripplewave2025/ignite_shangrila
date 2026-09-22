(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('.menu-toggle');
  var navLinks = Array.from(document.querySelectorAll('.site-nav a'));
  var revealItems = Array.from(document.querySelectorAll('.reveal'));
  var sections = Array.from(document.querySelectorAll('main section[id]'));
  var reserveDialog = document.getElementById('reserve-dialog');
  var reserveForm = document.getElementById('reserve-form');
  var circleForm = document.getElementById('inner-circle-form');
  var toast = document.querySelector('.toast');
  var toastTimer;

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 32);
  }

  function closeMenu() {
    if (!header || !menuToggle) return;
    header.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  function showToast(title, message) {
    if (!toast) return;
    var strong = toast.querySelector('strong');
    var span = toast.querySelector('span');
    if (strong) strong.textContent = title;
    if (span) span.textContent = message;
    toast.setAttribute('aria-hidden', 'false');
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
      toast.setAttribute('aria-hidden', 'true');
    }, 4400);
  }

  function setReserveType(type) {
    if (!reserveForm || !type) return;
    var map = {
      birthday: 'private',
      afterparty: 'private'
    };
    var value = map[type] || type;
    var radio = reserveForm.querySelector('input[name="reserveType"][value="' + value + '"]');
    if (radio) radio.checked = true;

    var occasion = reserveForm.querySelector('select[name="occasion"]');
    if (!occasion) return;
    if (type === 'birthday') occasion.value = 'Birthday';
    if (type === 'afterparty') occasion.value = 'Private celebration';
    if (type === 'private') occasion.value = 'Private celebration';
  }

  function openReserve(type) {
    if (!reserveDialog) return;
    setReserveType(type);
    if (typeof reserveDialog.showModal === 'function') {
      reserveDialog.showModal();
      document.body.classList.add('dialog-open');
      window.setTimeout(function () {
        var first = reserveDialog.querySelector('input[name="name"]');
        if (first) first.focus();
      }, 80);
    }
  }

  function closeReserve() {
    if (!reserveDialog || !reserveDialog.open) return;
    reserveDialog.close();
    document.body.classList.remove('dialog-open');
  }

  if (menuToggle && header) {
    menuToggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.querySelectorAll('[data-open-reserve]').forEach(function (button) {
    button.addEventListener('click', function () {
      openReserve(button.getAttribute('data-reserve-type'));
    });
  });

  document.querySelectorAll('[data-close-reserve]').forEach(function (button) {
    button.addEventListener('click', closeReserve);
  });

  if (reserveDialog) {
    reserveDialog.addEventListener('close', function () {
      document.body.classList.remove('dialog-open');
    });

    reserveDialog.addEventListener('click', function (event) {
      var rect = reserveDialog.getBoundingClientRect();
      var clickedBackdrop = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (clickedBackdrop) closeReserve();
    });
  }

  if (reserveForm) {
    var dateInput = reserveForm.querySelector('input[type="date"]');
    if (dateInput) {
      var today = new Date();
      var localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      dateInput.min = localDate;
    }

    reserveForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!reserveForm.reportValidity()) return;
      closeReserve();
      showToast('Reservation flow works.', 'The live version would now alert the venue and send a confirmation. No data was stored.');
      reserveForm.reset();
    });
  }

  if (circleForm) {
    circleForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = circleForm.querySelector('input[type="email"]');
      if (email && email.value && !email.checkValidity()) {
        email.reportValidity();
        return;
      }
      showToast('Inner Circle preview complete.', 'The live system would record only the permissions selected. Nothing here was stored.');
    });
  }

  document.querySelectorAll('.visit__faq details').forEach(function (details) {
    details.addEventListener('toggle', function () {
      if (!details.open) return;
      document.querySelectorAll('.visit__faq details').forEach(function (other) {
        if (other !== details) other.open = false;
      });
    });
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { threshold: 0.25, rootMargin: '-20% 0px -55% 0px' });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}());
