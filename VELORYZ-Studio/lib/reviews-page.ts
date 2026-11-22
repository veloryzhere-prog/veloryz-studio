/** Real SSR HTML, accessible without the main SPA. */
export function renderReviewsPage(admin=false):string{
 const publicBody=[
  '<div class="review-kicker">COMMUNITY / EXPERIENCES / VELORYZ</div>',
  '<h1>Good work deserves<br><em>real feedback.</em></h1>',
  '<p class="review-lead">Explore public feedback about VELORYZ Studio and share your experience. Reviews are human-moderated before publication. We never create fictional testimonials.</p>',
  '<div class="review-controls"><a class="review-primary" href="#share-review">Share your experience ↗</a><a class="review-secondary" href="/work/">Explore our work</a></div>',
  '<section class="reviews-panel" aria-labelledby="public-reviews-title"><div class="reviews-panel-head"><div><div class="review-kicker">01 / THE COMMUNITY</div><h2 id="public-reviews-title">Published reviews</h2></div><span class="review-stat" id="review-stat" aria-live="polite">Loading…</span></div>',
  '<p class="review-note">Comments are moderated for safety and relevance, but are not independently verified as completed client purchases.</p>',
  '<div id="review-feed" class="review-feed" aria-live="polite"><p class="review-muted">Loading feedback…</p></div></section>',
  '<section id="share-review" class="reviews-panel review-form-panel" aria-labelledby="review-form-title">',
  '<div class="review-kicker">02 / YOUR EXPERIENCE</div><h2 id="review-form-title">Leave a review</h2>',
  '<p class="review-note">Only share your own experience. Do not include confidential project details, phone numbers, emails or passwords. Your chosen name and approved feedback will be public.</p>',
  '<form id="review-form"><div class="review-field"><label for="review-name">Display name *</label><input id="review-name" name="name" autocomplete="nickname" minlength="2" maxlength="60" required placeholder="How should we credit you?"></div>',
  '<fieldset class="review-rating"><legend>Your rating *</legend><div class="review-rating-options">',
  '<label><input name="rating" type="radio" value="5" required><span>★★★★★</span><small>5 of 5</small></label>',
  '<label><input name="rating" type="radio" value="4"><span>★★★★☆</span><small>4 of 5</small></label>',
  '<label><input name="rating" type="radio" value="3"><span>★★★☆☆</span><small>3 of 5</small></label>',
  '<label><input name="rating" type="radio" value="2"><span>★★☆☆☆</span><small>2 of 5</small></label>',
  '<label><input name="rating" type="radio" value="1"><span>★☆☆☆☆</span><small>1 of 5</small></label>',
  '</div></fieldset><div class="review-field"><label for="review-body">Your feedback *</label><textarea id="review-body" name="review" minlength="25" maxlength="800" rows="5" required placeholder="What went well? What could we improve?"></textarea><small>25–800 characters.</small></div>',
  '<div class="review-honeypot" aria-hidden="true"><label for="review-website">Website</label><input id="review-website" name="website" tabindex="-1" autocomplete="off"></div>',
  '<label class="review-confirm"><input name="confirm" type="checkbox" required><span>I confirm this reflects my genuine experience and understand that my display name and approved feedback may be shown publicly.</span></label>',
  '<button id="review-submit" class="review-primary" type="submit">Submit for moderation ↗</button><p id="review-form-status" class="review-status" role="status" aria-live="polite"></p>',
  '</form></section>'
 ].join('');
 const adminBody=[
  '<div class="review-kicker">STUDIO CONTROL / TRUST</div><h1>Review moderation<span class="review-period">.</span></h1>',
  '<p class="review-lead">Approve genuine community feedback before publication. Remove inappropriate reviews at any time.</p>',
  '<div class="review-controls"><a class="review-primary" href="/admin/">Back to Studio Control ↗</a><a class="review-secondary" href="/reviews.html">Public reviews</a></div>',
  '<section class="reviews-panel"><div class="reviews-panel-head"><h2>Submission queue</h2><span id="review-admin-summary">Loading…</span></div>',
  '<div id="review-admin-list" class="review-feed" aria-live="polite"><p class="review-muted">Checking admin session…</p></div></section>'
 ].join('');
 const title=admin?'Review moderation — VELORYZ Studio Control':'Reviews & feedback — VELORYZ Studio';
 return [
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
  '<title>'+title+'</title>',
  '<meta name="description" content="Read genuine, moderated VELORYZ Studio reviews, or share your experience with our India-based creative technology studio.">',
  '<meta name="robots" content="'+(admin?'noindex,nofollow':'index,follow')+'">',
  admin?'':'<link rel="canonical" href="https://veloryz.online/reviews.html">',
  '<meta property="og:title" content="Reviews & feedback — VELORYZ Studio"><meta property="og:type" content="website">',
  '<meta property="og:url" content="https://veloryz.online/reviews.html">',
  '<link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/reviews.css"><script src="/reviews.js" defer></script></head>',
  '<body data-reviews-admin="'+(admin?'true':'false')+'"><a class="review-skip" href="#review-main">Skip to content</a>',
  '<header class="reviews-header"><a class="reviews-brand" href="/"><span class="reviews-mark">V</span><span>VELORYZ<small>STUDIO / INDIA · ASIA</small></span></a>',
  '<nav aria-label="Primary"><a href="/work/">Work</a><a href="/services/">Services</a><a href="/docs/">Docs</a><a href="/reviews.html">Reviews</a><a href="/contact/">Contact</a></nav>',
  '<a class="reviews-nav-cta" href="/create/">Start a project ↗</a></header>',
  '<main id="review-main" class="reviews-layout"><div class="review-hero-mark" aria-hidden="true">V</div><div class="reviews-content">',
  admin?adminBody:publicBody,
  '</div></main><footer class="reviews-footer"><span>© VELORYZ Studio · India · Asia · Remote collaboration</span>',
  '<div><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/sitemap.xml">Sitemap</a></div></footer></body></html>'
 ].join('');
}
