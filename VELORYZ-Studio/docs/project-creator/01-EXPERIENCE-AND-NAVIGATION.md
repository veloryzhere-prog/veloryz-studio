# 01 — Experience and navigation specification

## Product goal and boundaries

The Create page at `/create/` is a dedicated, quiet, mostly white project intake experience. Its job is to collect one clear decision at a time, produce a nonbinding estimate and structured PDF, and submit a brief for team review. It must not act like a homepage, an automatically approved quotation, or a client portal.

The primary visual inspiration is professional document-oriented software (clean white surfaces and calm typography) with one-question-per-screen pacing. This project uses original code and preview illustrations; it does not claim to reproduce third-party CSS or assets.

## Screens and sequence

1. **Welcome:** one primary **Start a project** button, official VELORYZ logo, short intro, saved-draft option when available.
2. **Discover:** select the category (e.g. business, portfolio, store, SaaS, custom app). One category selection advances.
3. **Template:** select among original VELORYZ concepts, credited external marketplace links, or **Start with a blank canvas**. The external links do not confer a template license.
4. **Style / palette:** choose visual direction and color mood. Optional custom reference URL follows.
5. **Pages and goal:** choose number of major pages/screens; describe the project outcome (minimum ten characters).
6. **Conditional capabilities:** Content, Experience, Commerce, Operations and App feature groups appear according to category. Some selected features trigger one additional scoping question.
7. **Existing materials:** select brand kit, text, images or existing site; skippable.
8. **Budget:** pick a budget preference, see category-aware planning ranges and transparent assumptions. App budgets can be higher than simple-site budgets.
9. **Timeline / priorities:** preferred launch window and tradeoff (speed, craft, lean first release, balance).
10. **Contact:** name, valid email, consent.
11. **Review:** editable answers, early price range, discussion links, proposed PDF and Send button.
12. **Success:** only after the server confirms the request; show the server-issued reference and the separate later invitation workflow.

The number of screens varies with category and selected capabilities. Do not promise a fixed question count.

## Navigation contract

- On every question, the **top sticky bar** contains Back and Continue (or **Send my project** on Review). There is **no bottom Continue bar**.
- The same tab URL changes using `?question=<step>`; URL Back and Forward should restore the corresponding question.
- Pressing Enter advances from appropriate text fields, but never intercepts multiline text input or marketplace search.
- The final Review has **Edit** shortcuts. After editing, a **Review** shortcut returns without replaying all questions.
- Validation failures remain in the current question and show a visible error; no silent skipping.
- A request may only display the success panel when the server responds successfully. Never generate a fake reference or access code in the browser.
- The browser tab stores draft progress in `sessionStorage`; successful submission removes the saved draft. This is not cross-device synchronization.

## Layout and isolation

`public/app.js` marks the creator route with `body.v4-creator-page` and avoids mounting older site chat and campaign widgets there. `public/creator-v4.css` hides the original site header/footer and legacy guided-project elements **only on the Create route while the wizard is mounted**. The homepage 3D V structures and Playground are not modified.

The VELORYZ Project AI launcher is at the **bottom-left corner**, separate from top navigation, with a visible open/close state and keyboard focus. It is accessible from the welcome screen and steps. The AI panel is an optional helper; if the AI is unavailable, the core creator must remain usable.

## Responsive and accessible behavior

- The top action bar becomes two rows on small screens; Back and Continue remain visible.
- Prevent the sticky header from entirely obscuring focused elements, as covered by WCAG 2.2 SC 2.4.11: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum
- Use visible focus styles, readable label+input relationships, `role=alert` for errors, and progressive keyboard navigation.
- Respect reduced-motion preferences. Avoid scroll hijacking and overlay competition with mobile keyboards.
- Test touch targets, long descriptions, zoom at 200%/400%, narrow widths, viewport changes and assistive technologies.

## Acceptance criteria

A new visitor can choose a category, continue, navigate back, resume a tab draft, modify features, change price preference, download the proposal, and submit using the server API. The old “Create your project” panel must not appear beneath this wizard. The AI button must open from the left without blocking top navigation.
