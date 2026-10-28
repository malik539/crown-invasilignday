# Crown Dental Care · Invisalign Day landing page

Single-purpose Google Ads landing page (plus thank-you page) for Invisalign Day, Saturday, November 21.
Static HTML + compiled Tailwind CSS + one dependency-free JS file. No framework, no build step at runtime.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The landing page (serve at `/invisalign-day/` or the site root). |
| `invisalign-day/thank-you/index.html` | Thank-you page at `/invisalign-day/thank-you/` (the Google Ads conversion page). |
| `css/site.css` | Compiled, purged Tailwind (~15 KB). Rebuild with `npm run build` after editing HTML classes. |
| `src/tailwind.css` | Tailwind source: design tokens, button, form, FAQ and trust-strip components. |
| `js/main.js` | Countdown, message match (`?ag=`), sitelink scroll (`?s=`), form validation/submit, attribution capture, dataLayer events. |
| `img/README.md` | The three real photos needed and their sizes. |

## Run locally

```bash
npm install
npm run build        # compiles css/site.css
npm run serve        # http://localhost:3000
```

Asset paths are relative, so the pages work opened directly from disk, served from the site root, or from a subfolder (e.g. GitHub Pages).

## Launch checklist (every `[BRACKETED]` placeholder is visible on the page until replaced)

- [x] Phone set to 301-450-6730 (`tel:+13014506730`) on both pages and in the calendar event.
- [x] Google rating set to 4.9 stars from 696 reviews (trust strip and reviews section). Update the count before launch if it changes.
- [x] Twelve verified Google reviews added verbatim in the reviews ticker (first name + last initial).
- [ ] `[OPTIONAL DR. QUOTE]`: fill in, or delete the `<blockquote>` in the Meet Dr. Nguyen section.
- [ ] `[CONDITIONS ...]` for free whitening (offer tile) and `[WHITENING CONDITIONS ...]` (FAQ 8).
- [ ] `[ELIGIBILITY ...]` (FAQ 2) and `[ELIGIBILITY TERMS]` (footer): attendees on Nov 21 only, or anyone who books by Nov 21.
- [ ] `[FORM_ENDPOINT_URL]`: the `action` attribute on both `<form>` tags (CRM webhook / GoHighLevel inbound webhook). Until set, submits log a console warning and still redirect so the funnel can be QA'd.
- [ ] `[CANONICAL_URL]` in the `<head>`.
- [ ] `GTM-XXXXXXX` in the head and body snippets on both pages.
- [x] Real photos and logo supplied (see `img/README.md`).
- [ ] Event date/year: countdown and calendar times are set for Nov 21, 2026 (`data-countdown-start` / `data-countdown-end` in `index.html`, `startUtc` / `endUtc` in the thank-you page). Change if the year differs.

## Form submission

Both forms post the same fields as `multipart/form-data` to the `action` URL via `fetch`:

`first_name, phone, phone_e164, email, preferred_time, consent, gclid, gbraid, wbraid, utm_source, utm_medium, utm_campaign, utm_term, utm_content, ad_group_variant, landing_page, referrer, form_location, offer, submitted_at`

A honeypot field (`website`) is stripped before sending; bots that fill it are dropped silently. No CAPTCHA by design. If spam appears, add invisible reCAPTCHA in `submitLead()` in `js/main.js`.

On success the page pushes `generate_lead` (no form values) to the dataLayer and redirects to `invisalign-day/thank-you/index.html` (relative to the landing page).

## Tracking (GTM)

| Event | Where | Payload |
| --- | --- | --- |
| `phone_click` | every `tel:` link, both pages | `link_location` |
| `cta_click` | every gold CTA that scrolls to the form | `cta_text` |
| `faq_open` | FAQ accordion | `faq_question` |
| `generate_lead` | successful submit, before redirect | `form_location` |
| `lead_confirmed` | thank-you page, pushed before GTM loads | `user_data: { sha256_email_address, sha256_phone_number }` |
| `add_to_calendar` | thank-you page | `method` |

Google Ads conversion: fire on the thank-you page view (Page Path contains `/invisalign-day/thank-you`).
Enhanced conversions for leads: in the Google Ads conversion tag enable "Include user-provided data", choose "Data Layer variable", and point it at a Data Layer Variable named `user_data`. The values are already SHA-256 hashed (lowercase email, E.164 phone), which Google accepts as-is. No plain-text PII ever reaches the dataLayer.

## Message match and sitelinks

- `?ag=core|cost|aligners|consult` swaps the H1 and the first sentence of the subhead (see `CONFIG.messageMatch` in `js/main.js`).
- `?s=offer|form|financing|doctor|insurance|faq` smooth-scrolls to that section on load.

## Design tokens

Navy `#0B2B5C` · Invisalign blue `#1E73BE` · Sky `#5BB8F5` · Gold `#F2B632` (all primary buttons, navy text) · Light gray `#F4F6FA`.
Headings Montserrat 700/800, body Inter (17px on mobile), Kaushan Script only for the word "Day" in the event lockup.
