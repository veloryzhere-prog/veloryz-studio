/** VELORYZ editorial review experience. Static HTML is indexable; real review content is fetched and safely inserted. */
export function renderReviewsPage(admin=false):string{
 const services=['Website & development','Brand & identity','Product & UX','Planning & consultation','Other'];
 const stars=[5,4,3,2,1].map(n=>
  '<label class="vz-review-choice"><input type="radio" name="rating" value="'+n+'" '+(n===5?'required':'')+'><span aria-hidden="true">'+
  '★'.repeat(n)+'☆'.repeat(5-n)+'</span><small>'+n+' '+(n===1?'star':'stars')+'</small></label>').join('');
 const page=admin?[
  '<div class="review-kicker">STUDIO CONTROL / COMMUNITY TRUST</div>',
  '<h1>Every voice.<br><em>Carefully considered.</em></h1>',
  '<p class="review-lead">Read every submission in full, including criticism. Publish relevant genuine experiences, reject spam, and never let AI make final moderation decisions.</p>',
  '<div class="review-controls"><a class="review-primary" href="/admin/">← Studio Control</a><a class="review-secondary" href="/reviews.html">Public review page ↗</a></div>',
  '<section class="reviews-panel"><div class="reviews-panel-head"><div><span class="review-kicker">MODERATION / REAL SUBMISSIONS</span><h2>Review queue</h2></div><span id="review-admin-summary" class="review-stat">Checking session…</span></div>',
  '<div id="review-admin-filters" class="review-filter-bar"><label for="review-admin-filter">Show</label><select id="review-admin-filter"><option value="pending">Needs attention</option><option value="all">All submissions</option><option value="approved">Published</option><option value="rejected">Rejected</option></select></div>',
  '<div id="review-admin-list" class="review-feed" aria-live="polite"><div class="review-empty">Loading the owner moderation queue…</div></div></section>'
 ].join(''):[
  '<section class="feedback-hub" aria-labelledby="public-reviews-title">',
  '<header class="feedback-heading"><div><p class="feedback-label">VELORYZ / COMMUNITY</p><h1 id="public-reviews-title">Community Feedback</h1><p class="feedback-description">Read real community feedback and share your own experience. Reviews are approved by a human before appearing publicly.</p></div><button type="button" class="review-primary feedback-start" id="review-start">Start Rating <span aria-hidden="true">↗</span></button></header>',
  '<div class="feedback-overview" aria-label="Community rating summary"><div class="feedback-average"><strong id="review-average" aria-label="Average rating">—</strong><div><span class="review-stars" aria-hidden="true">★★★★★</span><small id="review-average-label">Loading feedback…</small></div></div><div id="review-rating-distribution" class="review-distribution" aria-label="Published review counts by star rating"></div></div>',
  '<div class="feedback-toolbar"><div class="feedback-rating-tabs" role="group" aria-label="Filter reviews by rating"><button class="feedback-rating-chip is-selected" type="button" data-review-rating="all" aria-pressed="true">All ratings</button>',
  ...[5,4,3,2,1].map(n=>'<button class="feedback-rating-chip" type="button" data-review-rating="'+n+'" aria-pressed="false">'+n+' <span aria-hidden="true">★</span></button>'),
  '</div><div class="feedback-tools"><label for="review-sort">Sort</label><select id="review-sort"><option value="newest">Newest first</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></div></div>',
  '<div class="feedback-feed-meta"><strong id="review-stat" aria-live="polite">Loading approved reviews…</strong><output id="review-results" aria-live="polite"></output></div>',
  '<div id="review-feed" class="review-feed feedback-feed" aria-live="polite"><p class="feedback-loading">Loading community feedback…</p></div>',
  '<div class="feedback-footnote">Only approved comments are published. Reviews reflect the authors’ opinions and are not independently verified as purchases.</div>',
  '</section>',
  '<section id="share-review" class="feedback-form-sheet" aria-labelledby="review-form-title" hidden>',
  '<div class="feedback-form-top"><div><p class="feedback-label">SHARE AN EXPERIENCE</p><h2 id="review-form-title">Start Rating</h2><p>Write what you genuinely think. Both positive and critical feedback are welcome.</p></div><button type="button" class="feedback-close" id="review-close" aria-label="Close rating form">×</button></div>',
  '<form id="review-form" novalidate><fieldset class="review-rating"><legend>Your rating <i>*</i></legend><div class="review-rating-options">'+stars+'</div></fieldset>',
  '<div class="review-field"><label for="review-name">Display name <i>*</i></label><input id="review-name" name="name" autocomplete="nickname" minlength="2" maxlength="60" required placeholder="Your name or nickname"></div>',
  '<div class="review-field"><label for="review-body">Your feedback <i>*</i></label><textarea id="review-body" name="review" minlength="25" maxlength="800" rows="5" required placeholder="How was your experience with VELORYZ?"></textarea><div class="review-field-foot"><small>25–800 characters. Avoid private information.</small><span id="review-character-count">0 / 800</span></div></div>',
  '<details class="feedback-more"><summary>Add more details (optional)</summary><div class="feedback-extra-fields"><div class="review-field"><label for="review-service">Experience type</label><select id="review-service" name="service"><option value="Other" selected>General feedback</option>',
  ...services.filter(x=>x!=='Other').map(x=>'<option value="'+x+'">'+x+'</option>'),
  '</select></div>',
  '<div class="review-field"><label for="review-headline">Short title</label><input id="review-headline" name="headline" maxlength="90" placeholder="Summarize your experience"></div>',
  '<div class="review-field"><label for="review-highlights">What worked well?</label><textarea id="review-highlights" name="highlights" maxlength="300" rows="2" placeholder="Optional highlights"></textarea></div>',
  '<div class="review-field"><label for="review-improvement">What could improve?</label><textarea id="review-improvement" name="improvement" maxlength="300" rows="2" placeholder="Optional suggestions"></textarea></div></div></details>',
  '<details class="feedback-more feedback-ai-disclosure"><summary>Optional AI writing help</summary><div class="review-ai-panel"><strong>VELORYZ Review AI</strong><p>The assistant can polish wording you already wrote. It cannot create experiences or publish reviews.</p><div class="review-ai-actions"><label for="review-ai-tone">Style</label><select id="review-ai-tone"><option value="natural">Natural</option><option value="clear">Clear</option><option value="detailed">Detailed</option></select><button id="review-ai-button" class="review-secondary" type="button">Polish my wording</button></div><p id="review-ai-status" class="review-ai-status" role="status" aria-live="polite">Only when you click Polish is your draft sent to the Gemini service. Do not enter confidential details.</p><div id="review-ai-preview" class="review-ai-preview" hidden><blockquote id="review-ai-suggestion"></blockquote><div class="review-ai-actions"><button class="review-primary" id="review-ai-use" type="button">Use this text</button><button class="review-secondary" id="review-ai-dismiss" type="button">Keep mine</button></div></div></div></details>',
  '<div class="review-honeypot" aria-hidden="true"><label for="review-website">Website</label><input id="review-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>',
  '<label class="review-confirm"><input type="checkbox" name="confirm" required><span>This is my own genuine experience. I agree that my display name, rating and approved feedback may be public.</span></label>',
  '<div class="feedback-form-actions"><button class="review-primary" id="review-submit" type="submit">Submit Review ↗</button><span>Reviews appear after human moderation.</span></div><p id="review-form-status" class="review-status" role="status" aria-live="polite"></p></form></section>'
].join('');
 const title=admin?'Review moderation — VELORYZ Studio Control':'Reviews & feedback — VELORYZ Studio';
 return [
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
  '<title>'+title+'</title><meta name="description" content="Read genuine, human-moderated VELORYZ Studio reviews and share detailed, authentic feedback. India · Asia.">',
  '<meta name="robots" content="'+(admin?'noindex,nofollow':'index,follow')+'">',
  admin?'':'<link rel="canonical" href="https://veloryz.online/reviews.html">',
  '<meta property="og:title" content="Real experiences & community reviews — VELORYZ Studio"><meta property="og:type" content="website">',
  '<meta property="og:url" content="https://veloryz.online/reviews.html">',
  '<link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/lenis-vendored.css"><link rel="stylesheet" href="/reviews.css?v=20261122-editorial-v2"><script src="/lenis-vendored.js?v=1.3.27" defer></script><script src="/smooth-scroll.js?v=20261122-global-v2" defer></script><script src="/reviews.js?v=20261122-editorial-v2" defer></script></head>',
  '<body data-reviews-admin="'+(admin?'true':'false')+'"><a class="review-skip" href="#review-main">Skip to content</a>',
  '<header class="reviews-header"><a class="reviews-brand" href="/" aria-label="VELORYZ Studio home"><img src="/assets/brand/veloryz-mark.svg" width="40" height="40" alt=""><span>VELORYZ<small>INDEPENDENT CREATIVE STUDIO</small></span></a>',
  '<nav aria-label="Main navigation"><a href="/work/">Work</a><a href="/design/">Designs</a><a href="/services/">Services</a><a href="/docs/index.html">Docs</a><a href="/reviews.html" '+(admin?'':'aria-current="page"')+'>Reviews</a></nav>',
  '<a class="reviews-nav-cta" href="/create/">Start a project ↗</a></header>',
  '<main id="review-main" class="reviews-layout"><div class="reviews-content">'+page+'</div></main>',
  '<footer class="reviews-footer"><span>© VELORYZ Studio · India · Asia · Working everywhere</span><div><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/contact/">Contact</a><a href="/sitemap.xml">Sitemap</a></div></footer>',
  '</body></html>'
 ].join('');
}