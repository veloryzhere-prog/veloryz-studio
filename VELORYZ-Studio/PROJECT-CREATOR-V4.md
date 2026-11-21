# Project Creator V4 — focused wizard and design guide

## Design direction
A refined white-first interface for VELORYZ Studio, drawing on the quiet, document-like visual styling of Bonsai and Dubsado and the one-question-at-a-time interaction of Typeform. The template-library question draws on the useful search/filter patterns of Framer Marketplace and Mobbin without copying their source, media or assets.

The existing homepage, handmade 3D V sculptures, Playground and other pages are unchanged. On /create/ the global header, footer and floating contact control are hidden and a dedicated minimal navigation bar reuses the official VELORYZ wordmark.

## How to start
- Open /create/. The only primary action is Start a project.
- It opens /create/?question=discover, then updates the same tab's URL on each question.
- Every question is a distinct full-screen view with visible progress, Back/Continue, and keyboard Enter support.
- Changing a selection does not discard the rest of the brief. Session storage saves a draft locally; Continue your saved brief resumes at the last question.
- Browser Back/Forward navigate question history in the same tab.

## Questions
1. Discover: What type of project?
2. Starting point: Choose from 12 original VELORYZ concept presets, browse 26 credited Framer/Webflow references, or start blank.
3. Visual direction: Minimal, Editorial, Bold, or Immersive.
4. Color mood: Select a palette or let the studio decide.
5. Optional inspiration URL: A single input field, skippable.
6. Core pages/screens: Select 1, 4, 6, 8, or 12.
7. Main project goal: Required.
8. Relevant feature groups: Content, Experience, plus category-specific Commerce, Operations and App features. Several capabilities can be selected within a single question.
9. Conditional detail questions: Account roles, checkout type, booking workflow, API providers, etc., only when selected.
10. Existing materials: Select any assets or skip.
11. Budget preference: Live slider, quick amounts, price range and explanation.
12. Launch preference: Timing window, subject to written studio approval.
13. Priority: Speed, craft, lean release or balance.
14. Name: Required.
15. Email: Required and validated.
16. Final review: Document-style project summary, proposal download, explicit consent and submission.

The exact path is dynamic. A portfolio is not forced through every SaaS integration question.

## Visual and performance specification
Primary color white (#fff), secondary areas light grey and soft green, charcoal foreground, restrained lavender/plum accents. The header references the official Main-Dark-Ink-Transparent.webp brand asset in public/assets/brand/official. No new WebGL or scroll interception. All previews are original CSS concepts and do not claim third-party template licenses. Motion is reduced when requested; cards, buttons and fields use visible keyboard focus. Mobile uses single-column choices, horizontal category filters and sticky navigation.

## Pricing / PDF
The published site.creatorPricing settings in Studio Control (base allowance, extra page allowance, standard feature allowance, upper-range contingency percentage) feed into the creator. The estimate is illustrative, not a guaranteed price; sophisticated features require owner review. Choosing a target budget never silently changes pricing.

The dependency-free PDF generator now uses a white/sage design aligned to the creator. V4 generates a four-page proposal with its selected capabilities and conditional answers. Downloading does not submit an enquiry.

## Enquiries and client portal
The final Send action requires goal, name, email and explicit consent. It POSTs to /api/enquiries using the existing secure validation and an idempotent request ID. Studio Control recognizes Creator V3 and V4 enquiry formats and shows a structured summary. The owner can convert the enquiry into a private client project, then separately generate an invitation. Submission does NOT issue a client code, activate an account, confirm an official quotation, or collect payment.

## QA and limitations
The JavaScript was syntax checked, the dynamic questionnaire and enquiry path simulated, the PDF passes format checks, and a Node regression suite was added at tools/test-creator-v4.mjs. The hosting deployment, production screenshots and a live server enquiry still need verification.

## V4.2: Project AI, team consultation, offers and follow-up

- The creator uses team-led language. After a successful submission the screen shows the server-issued **project reference** immediately, then explains the private invitation process. The reference is **not** a login code.
- **Invitation / activation code**: The team first reviews the request, creates a private client workspace and generates a separate random invitation. Only then does the configured provider attempt email delivery. A request submission itself does NOT email an invitation.
- Visitors are encouraged to check email and spam over the next 12 hours for updates. This is a check-in window, NOT a guaranteed 12-hour response or email-delivery SLA. Studio Control flags new requests waiting over 12 hours for follow-up.
- After receiving the real invitation code, clients open /client/, redeem it for a private session and may message the team inside their project workspace.
- Budget screens link to team WhatsApp and email for scope and price discussions. They do not automatically send a message, guarantee a discount or form a binding quote.
- Category base allowances now differ for Business, Portfolio, Ecommerce, Agency, SaaS/platform, Custom App, Restaurant, Editorial, Education and Community. Studio Control → Settings contains configurable amounts. Technical scope may increase the estimated range.
- Custom apps and platforms support budget preferences up to INR 15 lakh. A visitor can edit individual answers directly from the final review and return to the review.
- Optional creator promotions can be published in Studio Control, with eligibility text, optional code and percentage, and expiry. They are OFF by default and NEVER automatically deducted from the estimate. The visitor can request offer review in the eventual quote.
- Separate VELORYZ Project AI appears inside the wizard. Its /api/project-ai route calls a real configured Gemini/OpenAI or Workers AI model. It is independent of all persona bots, rate limited, scope restricted and does not receive visitors' email. It reports unavailable instead of inventing replies when providers are not connected.
- Run npm run test:creator and npm run test:project-ai, or npm run test:all from VELORYZ-Studio. The deployed backend and actual email delivery are not certified by source-level checks.
