# 07 — Copyright, design ownership and third-party licensing plan

**Purpose:** a practical rights checklist for VELORYZ projects, template inspirations, source code, fonts, media, branding and deliverables. **This is a planning document, not legal advice or a signed agreement.** Have qualified counsel adapt contracts and verify the applicable jurisdiction.

## Rights principles

1. **Original work:** record who actually created code, UI layouts, illustrations, logos, product copy and media. Employment/commission terms affect rights. A file in the repository is not, by itself, a complete chain-of-title record.
2. **External reference ≠ license:** Framer, Webflow, Mobbin, Bonsai, Dubsado and marketplace listings may inspire general visual direction. Do not copy distinctive layouts, CSS, source files, images, fonts, screenshots, logos or a paid template without an appropriate license.
3. **Client-provided material:** require the client to confirm they have rights or permissions to use submitted logos, photographs, brand copy, music, datasets, testimonials and trademarks.
4. **Third-party dependencies:** preserve applicable OSS notices and license files. Check each font, asset, icon, animation library, package and template under its own terms, including attribution and redistribution.
5. **Ownership transfer:** do not promise “full ownership” solely because a deposit or quote is paid. Define transferred rights and retained rights in a signed statement/contract; consider pre-existing tools and third-party licenses separately.
6. **AI-generated output:** do not assume generated content is exclusive, noninfringing or protectable. Review outputs for similarity, identifiable brands, permissions and provider terms before commercial use.

## Source files requiring evidence review

| Asset/component | Current observation | Required action |
| --- | --- | --- |
| Official VELORYZ logo & wordmark | Files under `public/assets/brand/official/` | Verify studio authorship/assignment and any underlying stock elements; keep provenance record |
| Handcrafted homepage/Playground 3D V structures | Existing source/models and `public/assets/brand/` | Preserve unmodified per product brief; document author, source mesh and licensed textures |
| 12 original Creator visual concepts | CSS previews / preset data in `creator-v4.js` | Confirm original implementation; do not claim they are third-party licensed templates |
| 26 marketplace inspiration links | Named, credited external URLs in template library | Link to originals, disclose references are not purchased/installed; revisit broken links |
| Fonts | `public/assets/font-license.txt` | Audit exact families, formats and weight usage; retain notices and any distribution limits |
| 3D and frontend libraries | `public/assets/brand/THREE-LICENSE.txt`, package dependencies | Run license audit and preserve required notices |
| Design preview media | `public/assets/designs/` (including license folder) | Record author, license URL, purchase receipt, restrictions and expiration where relevant |
| User-supplied media | Collected during production projects | Obtain rights warranty or actual license; use only for agreed purpose |
| Third-party branding/screenshots | External URLs and product examples | Avoid uploading unchanged third-party screenshots into template previews without permission |

## Copyright / contract checklist (to adapt with counsel)

Include in each client agreement:
- Parties, project identity, deliverables and acceptance criteria.
- Exactly which intellectual-property rights are assigned or licensed; exclusive/nonexclusive scope, territories, duration, permitted uses, changes and sublicensing.
- Whether assignment is conditional on full payment and which pre-existing libraries, internal methods and reusable components remain with the studio.
- Terms for source-code handoff, hosting access, credentials, domain names and repositories.
- Third-party components: license responsibility, fees, attribution, availability, renewals and restrictions.
- Client warranties for supplied assets and consequences of infringement claims.
- Portfolio/showcase permissions, confidentiality, privacy and publicity rights.
- Revision/change requests, termination, refunds, maintenance and disputed deliverables.
- AI-assisted content review and human approval before publication.
- Signed instrument requirements and record retention.

**India-specific note:** Sections 17–19 of the Indian Copyright Act, 1957 address first ownership, assignment and the mode/form of assignment. In particular, do not rely on an informal “all rights included” line where a properly documented transfer is needed. Consult the statute and a lawyer for applicability:
- Official IP India statute overview: https://ipindia.gov.in/acts/copyright-act-1957
- Assignment of copyright (Section 18): https://ipindia.gov.in/acts/copyright-act-1957/section-18-4
- Mode of assignment (Section 19): https://ipindia.gov.in/acts/copyright-act-1957/section-19-2

## Asset-rights register template (internal)

For each asset, track: `asset_id | project | filename/URL | creator/owner | acquired_on | source | license_type | license_text_or_receipt | attribution | redistribution_allowed | commercial_use_allowed | derivative_allowed | expiry | reviewer | status`.

Status should be **Unverified**, **Cleared**, **Restricted** or **Blocked**. Only use or publish assets marked **Cleared** after evidence review. Do not invent missing license approvals. Keep the register in an access-controlled team location; store purchase receipts separately from the public repo.

## External design-reference rules

Use title and original link for discovery; write original descriptions; never pass off a concept sketch as a screenshot of the linked product; never claim a marketplace license is included by choosing it in the wizard. If a client wants an actual marketplace template, purchase or obtain the proper license and document the approved usage before importing it.

## Suggested public-facing clause for legal review

“Third-party templates, fonts, photography, plugins and other licensed components are subject to their respective rights and fees. The studio will identify any material third-party dependencies and the rights granted to the client in the project agreement.”

This is draft language requiring legal approval; it is not automatically part of the website's terms.
