/* Crown Dental Care · Invisalign Day landing page
 * Vanilla JS, no dependencies. Loaded with `defer`.
 * Sections: config, attribution capture, countdown, message match, sitelink scroll,
 * CTA routing, accordion, form validation + submit, tracking (dataLayer only, no PII in plain text).
 */
(function () {
  'use strict';

  var CONFIG = {
    thankYouUrl: 'invisalign-day/thank-you/index.html',
    attributionKeys: ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'],
    storageKey: 'cdc_invisalign_day_attrib',
    enhancedConversionKey: 'cdc_invisalign_day_ec',
    // MESSAGE MATCH: ?ag=<key> swaps the H1 and the first sentence of the subhead.
    messageMatch: {
      core:     { h1: 'Save $2,100 on Invisalign at Invisalign Day',       lead: 'One day only, Saturday, November 21.' },
      cost:     { h1: 'Invisalign in Rockville for $4,940 on Nov 21',      lead: 'Invisalign Day is Saturday, November 21, one day only.' },
      aligners: { h1: 'Clear Aligners in Rockville: $2,100 Off',           lead: 'Invisalign clear aligners, one day only, Saturday, November 21.' },
      consult:  { h1: 'Book Your Free Invisalign Consultation',            lead: 'Reserve a free consult for Invisalign Day, Saturday, November 21.' }
    },
    // SITELINKS: ?s=<key> smooth-scrolls to the matching section on load.
    sitelinks: { offer: 'offer', form: 'reserve', financing: 'financing', doctor: 'doctor', insurance: 'insurance', faq: 'faq' }
  };

  var dataLayer = (window.dataLayer = window.dataLayer || []);
  var params = new URLSearchParams(window.location.search);
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Attribution capture (gclid / gbraid / wbraid / utm_*) ---------- */
  function readStoredAttribution() {
    try { return JSON.parse(sessionStorage.getItem(CONFIG.storageKey) || '{}'); } catch (e) { return {}; }
  }
  function captureAttribution() {
    var stored = readStoredAttribution();
    var fresh = false;
    CONFIG.attributionKeys.forEach(function (k) {
      var v = params.get(k);
      if (v) { stored[k] = v.slice(0, 256); fresh = true; }
    });
    if (params.get('ag')) { stored.ad_group_variant = params.get('ag').slice(0, 64); fresh = true; }
    if (!stored.landing_page) { stored.landing_page = window.location.href.slice(0, 1024); }
    if (!stored.referrer && document.referrer) { stored.referrer = document.referrer.slice(0, 512); }
    if (fresh || !sessionStorage.getItem(CONFIG.storageKey)) {
      try { sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(stored)); } catch (e) { /* storage blocked, fine */ }
    }
    return stored;
  }
  function fillHiddenFields(form, attrib) {
    Object.keys(attrib).forEach(function (k) {
      var input = form.querySelector('input[type="hidden"][name="' + k + '"]');
      if (input) input.value = attrib[k];
    });
  }

  /* ---------- Countdown to Nov 21, 8:30 AM Eastern ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function initCountdown(el) {
    var start = new Date(el.getAttribute('data-countdown-start')).getTime();
    var end = new Date(el.getAttribute('data-countdown-end')).getTime();
    var units = {};
    ['d', 'h', 'm', 's'].forEach(function (u) {
      var span = el.querySelector('[data-unit="' + u + '"]');
      if (!span) return;
      var label = span.querySelector('small');
      units[u] = { span: span, labelText: label ? label.textContent : u };
    });
    function render(text) { el.textContent = text; }
    function tick() {
      var now = Date.now();
      if (now >= end) { render('Invisalign Day has ended. Call us about current Invisalign pricing.'); return false; }
      if (now >= start) { render('Invisalign Day is happening now!'); return false; }
      var diff = Math.floor((start - now) / 1000);
      var d = Math.floor(diff / 86400), h = Math.floor((diff % 86400) / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
      var values = { d: d, h: pad(h), m: pad(m), s: pad(s) };
      Object.keys(units).forEach(function (u) {
        var small = document.createElement('small');
        small.textContent = units[u].labelText;
        units[u].span.textContent = values[u];
        units[u].span.appendChild(small);
      });
      return true;
    }
    if (tick()) {
      var timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 1000);
    }
  }

  /* ---------- Message match (?ag=) ---------- */
  function applyMessageMatch() {
    var key = (params.get('ag') || 'core').toLowerCase();
    var variant = CONFIG.messageMatch[key];
    if (!variant) return;
    var h1 = document.querySelector('[data-h1]');
    var lead = document.querySelector('[data-subhead-lead]');
    if (h1) h1.textContent = variant.h1;
    if (lead) lead.textContent = variant.lead;
  }

  /* ---------- Sitelink deep-links (?s=) ---------- */
  function scrollToId(id, behavior) {
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : (behavior || 'smooth'), block: 'start' });
  }
  function applySitelinkScroll() {
    var s = (params.get('s') || '').toLowerCase();
    var id = CONFIG.sitelinks[s];
    if (!id) return;
    // Wait a frame so fonts/layout settle, then scroll.
    window.requestAnimationFrame(function () { setTimeout(function () { scrollToId(id); }, 50); });
  }

  /* ---------- CTA routing: scroll to the nearest form and focus its first field ---------- */
  function initCtas() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.lead-form'));
    document.querySelectorAll('[data-cta]').forEach(function (cta) {
      cta.addEventListener('click', function (e) {
        if (!forms.length) return;
        e.preventDefault();
        var y = window.scrollY + (cta.getBoundingClientRect().top);
        var nearest = forms.reduce(function (best, f) {
          var fy = window.scrollY + f.getBoundingClientRect().top;
          return (!best || Math.abs(fy - y) < Math.abs(best.y - y)) ? { form: f, y: fy } : best;
        }, null).form;
        var card = nearest.closest('[id]') || nearest;
        card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        var first = nearest.querySelector('input[name="first_name"]');
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, reduceMotion ? 0 : 500);
        dataLayer.push({ event: 'cta_click', cta_text: (cta.textContent || '').trim().slice(0, 60) });
      });
    });
  }

  /* ---------- Phone click tracking ---------- */
  function initTelTracking() {
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () {
        dataLayer.push({ event: 'phone_click', link_location: a.getAttribute('data-location') || 'unknown' });
      });
    });
  }

  /* ---------- FAQ accordion (keyboard accessible) ---------- */
  function initAccordion(root) {
    var triggers = Array.prototype.slice.call(root.querySelectorAll('.faq-trigger'));
    function setOpen(btn, open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = !open;
    }
    triggers.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        setOpen(btn, !open);
        if (!open) dataLayer.push({ event: 'faq_open', faq_question: btn.textContent.trim().slice(0, 80) });
      });
      btn.addEventListener('keydown', function (e) {
        var next;
        if (e.key === 'ArrowDown') next = triggers[(i + 1) % triggers.length];
        else if (e.key === 'ArrowUp') next = triggers[(i - 1 + triggers.length) % triggers.length];
        else if (e.key === 'Home') next = triggers[0];
        else if (e.key === 'End') next = triggers[triggers.length - 1];
        if (next) { e.preventDefault(); next.focus(); }
      });
    });
  }

  /* ---------- Form validation ---------- */
  var rules = {
    first_name: function (v) { return v.trim().length >= 1 ? '' : 'Please enter your first name.'; },
    phone: function (v) {
      var digits = v.replace(/\D/g, '');
      if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
      return /^[2-9]\d{9}$/.test(digits) ? '' : 'Please enter a 10-digit US mobile number.';
    },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
    preferred_time: function (v) { return v ? '' : 'Please choose a time window.'; },
    consent: function (v, field) { return field.checked ? '' : 'Please check the box so we can contact you about your appointment.'; }
  };
  function errorEl(field) { return document.getElementById(field.getAttribute('aria-describedby')); }
  function showError(field, msg) {
    var el = errorEl(field);
    if (el) { el.textContent = msg; el.classList.toggle('is-visible', !!msg); }
    if (field.type !== 'checkbox') field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validateField(field) {
    var rule = rules[field.name];
    if (!rule) return true;
    var msg = rule(field.value, field);
    showError(field, msg);
    return !msg;
  }
  function normalizePhoneE164(v) {
    var digits = v.replace(/\D/g, '');
    if (digits.length === 10) digits = '1' + digits;
    return '+' + digits;
  }
  function formatPhoneDisplay(v) {
    var digits = v.replace(/\D/g, '');
    if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
    if (digits.length !== 10) return v;
    return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
  }

  /* ---------- Enhanced conversions: hash locally, never store or send plain text ---------- */
  function sha256Hex(str) {
    if (!(window.crypto && window.crypto.subtle && window.TextEncoder)) return Promise.resolve(null);
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    }).catch(function () { return null; });
  }
  function storeHashedUserData(email, phone) {
    return Promise.all([sha256Hex(email.trim().toLowerCase()), sha256Hex(normalizePhoneE164(phone))]).then(function (hashes) {
      var payload = {};
      if (hashes[0]) payload.sha256_email_address = hashes[0];
      if (hashes[1]) payload.sha256_phone_number = hashes[1];
      try { sessionStorage.setItem(CONFIG.enhancedConversionKey, JSON.stringify(payload)); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Submit ---------- */
  function isPlaceholder(url) { return !url || /^\[.*\]$/.test(url.trim()); }
  function submitLead(form, data) {
    var endpoint = form.getAttribute('action');
    if (isPlaceholder(endpoint)) {
      // [FORM_ENDPOINT_URL] not set yet: log and continue so the funnel can be QA'd end to end.
      console.warn('Lead form endpoint is still a placeholder. Set the form action to your CRM/webhook URL.');
      return Promise.resolve();
    }
    return fetch(endpoint, { method: 'POST', body: data, credentials: 'omit', keepalive: true }).then(function (res) {
      if (!res.ok) throw new Error('Lead endpoint responded ' + res.status);
    });
  }
  function initForm(form, attrib) {
    fillHiddenFields(form, attrib);
    var fields = Array.prototype.slice.call(form.querySelectorAll('input[name], select[name]')).filter(function (f) { return rules[f.name]; });
    var formError = form.querySelector('[data-form-error]');
    var button = form.querySelector('button[type="submit"]');
    var label = button.querySelector('[data-btn-label]');
    var phone = form.querySelector('input[name="phone"]');

    fields.forEach(function (f) {
      var evt = (f.tagName === 'SELECT' || f.type === 'checkbox') ? 'change' : 'blur';
      f.addEventListener(evt, function () { validateField(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true' || f.type === 'checkbox') validateField(f); });
    });
    phone.addEventListener('blur', function () { phone.value = formatPhoneDisplay(phone.value); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (formError) { formError.textContent = ''; formError.classList.remove('is-visible'); }
      var firstInvalid = null;
      fields.forEach(function (f) { if (!validateField(f) && !firstInvalid) firstInvalid = f; });
      if (firstInvalid) { firstInvalid.focus(); return; }
      if (form.querySelector('input[name="website"]').value) { return; } // honeypot tripped: silently drop

      button.disabled = true;
      if (label) label.textContent = 'Reserving your spot…';
      var data = new FormData(form);
      data.delete('website');
      data.set('phone', formatPhoneDisplay(phone.value));
      data.set('phone_e164', normalizePhoneE164(phone.value));
      data.set('submitted_at', new Date().toISOString());

      storeHashedUserData(data.get('email'), phone.value)
        .then(function () { return submitLead(form, data); })
        .then(function () {
          // No form values in the event: the thank-you page view is the Google Ads conversion.
          dataLayer.push({ event: 'generate_lead', form_location: form.getAttribute('data-location') || 'unknown' });
          window.location.assign(new URL(CONFIG.thankYouUrl, window.location.href).href);
        })
        .catch(function (err) {
          console.error(err);
          button.disabled = false;
          if (label) label.textContent = 'Reserve My Free Spot';
          if (formError) {
            formError.textContent = 'Something went wrong sending your request. Please try again or call us.';
            formError.classList.add('is-visible');
          }
        });
    });
  }

  /* ---------- Boot ---------- */
  var attrib = captureAttribution();
  applyMessageMatch();
  document.querySelectorAll('[data-countdown]').forEach(initCountdown);
  document.querySelectorAll('.lead-form').forEach(function (f) { initForm(f, attrib); });
  document.querySelectorAll('[data-accordion]').forEach(initAccordion);
  initCtas();
  initTelTracking();
  if (document.readyState === 'complete') applySitelinkScroll();
  else window.addEventListener('load', applySitelinkScroll);
})();
