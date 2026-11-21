# 04 — Pricing model, offers and quotation governance

## Principle

The wizard produces an **illustrative planning range**, not a quote or payment request. The user's budget preference is not necessarily the amount the studio will charge. Price depends on real requirements, integrations, security, design depth, testing, revision limits, recurring services, third-party licenses and the final contract.

## Implemented calculator

`public/planner-model.js` normalizes the selected project and computes a base allowance, additional-page allowance, selected-feature allowances and a high-range contingency. A category-specific base differentiates simple sites from Ecommerce, SaaS and Custom App work. Complex technical features widen the high range. Values are **planning assumptions** maintained in code/CMS, not externally verified competitors' prices.

Published data comes from `site.creatorPricing`; `lib/cms-api.mjs` validates it before publishing and merges defaults for legacy published states. The UI recalculates after relevant project changes. It does not silently substitute the visitor's budget as the offer price.

## Team-editable controls

In Studio Control → Settings:

- Starting allowance for non-specialized/simple cases.
- Allowance per extra page beyond four.
- Standard feature allowance.
- Upper planning contingency percentage.
- Category starting allowances for Business, Portfolio, Agency, Ecommerce, Restaurant, Editorial, Education, Community, SaaS/platform and Custom App.

**Operations:** review actual time/cost data, adjust a *draft*, have a second person review category pricing, publish the change, then test a business brief, a shop brief and a custom-app brief. Verify displayed figures on `/create/`. Maintain a dated internal pricing decisions log.

## Larger budgets

The creator accepts preferences up to ₹15 lakh for platforms/custom apps, with smaller maxima for simple websites and intermediate limits for stores. These are selection bounds, **not** maximum studio prices.

## Published promotions

The team can optionally publish a creator promotion with: enabled toggle, title, eligibility/terms, optional promo code, advertised percentage and expiration. It is **disabled by default**. Terms must be specific and truthful; never advertise invented savings.

A visible promotion is not automatically applied to the calculator. A visitor may request offer review with their enquiry. The studio must determine eligibility, dates, exclusions, stackability and the written quote. A code in a public offer is a **marketing code** and is never a client portal secret.

## Offers and consumer-friendly copy

Allowed: “Ask our team about a leaner first release,” “Scope can be phased,” “A current offer may be available subject to terms,” “Prices are estimates until the team confirms scope.”

Avoid: “Guaranteed lowest price,” “Only today” without real expiry, “Automatic 40% off” without valid approved terms, “Your final price is ₹X,” “Every estimate can be reduced,” or fabricated comparison to competitors.

The final written proposal should itemize development, design, add-ons, applicable tax, support, hosting, third-party licenses, payment timing, revisions and acceptance conditions.

## Commercial review checklist

Confirm the requirements, screen count and roles; price custom integrations separately; specify accessibility and security deliverables; document assumptions, exclusions, changes and quote validity; record any discount approver and offer ID; secure client acceptance through the agreed process. A PDF downloaded from Create is **not** evidence of binding acceptance.
