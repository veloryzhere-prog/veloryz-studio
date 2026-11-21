# 08 — QA plan, accessibility requirements and release gates

## Automated commands

From `VELORYZ-Studio/`:

```sh
npm run test:creator
npm run test:project-ai
npm run test:all
npm run build
```

These checks require a compatible Node version and installed project dependencies; do not interpret a source syntax check as a passing production build.

## Functional regression matrix

| ID | Scenario | Required result |
| --- | --- | --- |
| NAV-01 | Open /create/ directly | Welcome screen only, no original guided project panel below |
| NAV-02 | Click Start a project | Discover question opens in same tab |
| NAV-03 | On each question click **top Continue** | One screen advances, never a hidden bottom button |
| NAV-04 | Click top Back | Previous question restored without data loss |
| NAV-05 | Browser Back/Forward | URL and screen remain in sync |
| NAV-06 | Return from Review/Edit | Changed answer persists and Review shortcut works |
| NAV-07 | Enter a malformed email | Inline validation, no request submitted |
| NAV-08 | Submit with valid consent | Actual POST succeeds, server reference shown |
| NAV-09 | API fails/timeout | Visible error; draft preserved and safe retry possible |
| NAV-10 | Completed request | Draft cleared, reference remains visible on confirmation |
| LIB-01 | Open studio template library | 12 concepts and category/search controls present |
| LIB-02 | Open external reference | Original credited URL opens without granting a license |
| COST-01 | Business versus app budget | Distinct category baselines, clear nonbinding language |
| COST-02 | Published promotion | Accurate eligibility/expiry, opt-in only, no auto deduction |
| AI-01 | Widget on Welcome | Button visible at bottom-left and opens |
| AI-02 | Wizard route transition | Panel remounts after navigation; chat history retained in page memory |
| AI-03 | Working model | Verified live answer from the intended provider, not another persona |
| AI-04 | No model/503 | Honest offline status and labeled prewritten guidance |
| AI-05 | Contact-data boundary | Email input not automatically included in AI context |
| PORTAL-01 | Confirmation copy | Reference distinguished from separate invitation |
| PORTAL-02 | 12-hour copy | No guaranteed 12-hour delivery or immediate token |
| PORTAL-03 | Visit /client/ | Portal expects a real team-issued invite, not project reference |
| ISO-01 | Create route | Legacy expert launcher, old planner, footer and offer widgets hidden |
| ISO-02 | Exit Create | Other routes still show their original navigation/widgets as intended |

## Browser/device matrix

Desktop: recent Chrome, Edge, Firefox and Safari where supported. Mobile: iOS Safari and Android Chrome; test portrait and landscape, virtual keyboard open, 320/375/430 px widths, touch hit areas, 200% and 400% zoom. Test keyboard-only navigation and a screen reader on at least one desktop/mobile setup.

## Accessibility review

Target WCAG 2.2 AA where applicable. Examine:
- SC 2.4.11: focused elements not entirely obscured by sticky top bar — https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum
- Focus visibility; contrast; logical tab order; name/role/value; form errors and assistance; landmark structure; reduced motion; accessible dialog/panel behavior.
- AI messages have a live log and their provenance labeled; do not move keyboard focus unexpectedly on rerender.
- No icon-only button without a meaningful accessible name.

## Release gate

**Ready to deploy** only when code review and automated tests pass, asset version hashes are refreshed, release notes list changes and rollback target is recorded.

**Ready to declare live** only after checking the deployed `/create/` HTML, stylesheet and scripts, visiting in a real browser, completing a test enquiry against real backend, checking Project AI provider availability, and confirming no legacy content below the wizard.

**Ready to promise email delivery** only after a real test invitation shows accepted provider status **and** recipient inbox receipt for a verified sending domain. Even then, do not guarantee a specific time without operational capacity and monitoring.

## What was and was not verified at code authoring

Source syntax, markup assertions and simulated journeys may pass without proving hosting has deployed. A test stub returning `{reference:'VZ-EXAMPLE-123'}` is not an actual production enquiry. Model-binding stubs are not live AI evidence. Record real browser screenshots/results in a release checklist before changing these statuses.
