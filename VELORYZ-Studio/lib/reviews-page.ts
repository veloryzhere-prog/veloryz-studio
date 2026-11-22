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
  '<section class="review-intro" aria-labelledby="reviews-h1"><div class="review-kicker"><span class="review-kicker-dot"></span>THE PEOPLE / THE PROJECTS / THE EXPERIENCE</div>',
  '<div class="review-hero-grid"><div><h1 id="reviews-h1">Your words.<br><em>Our next chapter.</em></h1>',
  '<p class="review-lead">Real experiences shape better work. Explore what people have shared about VELORYZ—and tell us what felt right, what surprised you, and what we could do better.</p>',
  '<div class="review-controls"><a class="review-primary" href="#share-review">Tell your story <span aria-hidden="true">↗</span></a><a class="review-secondary" href="#public-reviews-title">Explore feedback ↓</a></div></div>',
  '<div class="review-hero-art" aria-hidden="true"><div class="review-hero-orbit"></div><img src="/assets/brand/veloryz-mark.svg" width="180" height="180" alt=""><span>EVERY EXPERIENCE MATTERS · VELORYZ</span></div></div>',
  '<div class="review-hero-foot"><span>INDEPENDENT CREATIVE & TECHNOLOGY STUDIO</span><span>INDIA · ASIA / WORKING EVERYWHERE</span><span>SCROLL TO EXPLORE ↓</span></div></section>',
  '<section class="reviews-panel reviews-public-panel" aria-labelledby="public-reviews-title"><div class="reviews-panel-head"><div><div class="review-kicker">01 / OUR COMMUNITY</div><h2 id="public-reviews-title">Experience, unfiltered by hype.</h2></div><span id="review-stat" class="review-stat" aria-live="polite">Loading published reviews…</span></div>',
  '<p class="review-note">Only human-moderated and approved reviews appear here. We do not invent quotes, delete honest criticism just for being negative, or claim that submissions are independently purchase-verified.</p>',
  '<div class="review-score-layout"><div class="review-overall-score"><strong id="review-average">—</strong><span class="review-stars" aria-label="Average score when available">★★★★★</span><small id="review-average-label">Awaiting real public feedback</small></div><div id="review-rating-distribution" class="review-distribution" aria-label="Rating breakdown"></div><a class="review-score-action" href="#share-review">Your experience<br><strong>belongs here ↗</strong></a></div>',
  '<div class="review-section-divider"><span>STORIES, NOT SLOGANS</span><span>02 / EXPLORE REVIEWS</span></div>',
  '<div class="review-filter-bar"><label for="review-filter-rating">Filter</label><select id="review-filter-rating"><option value="all">All ratings</option><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><label for="review-sort">Sort</label><select id="review-sort"><option value="newest">Most recent</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select><output id="review-results" aria-live="polite"></output></div>',
  '<div id="review-feed" class="review-feed" aria-live="polite"><div class="review-empty">Gathering genuine public reviews…</div></div></section>',
  '<section class="review-writing-stage" id="share-review" aria-labelledby="review-form-title"><div class="review-form-intro"><span class="review-kicker">03 / THE NEXT VOICE</span><h2 id="review-form-title">Tell it the way<br><em>you experienced it.</em></h2><p>Your story helps other visitors make an informed choice and helps our team improve. We welcome balanced, detailed feedback—not just praise.</p>',
  '<div class="review-writing-note"><span>✳</span><div><strong>AI writing partner, human experience.</strong><p>Our optional assistant can make your own wording clearer. It never writes a fictional experience, submits for you, or automatically approves a review.</p></div></div></div>',
  '<div class="reviews-panel review-form-panel"><div class="review-form-progress"><span>YOUR EXPERIENCE</span><span>ABOUT 2 MINUTES</span></div>',
  '<form id="review-form" novalidate><div class="review-form-row"><div class="review-field"><label for="review-name">Your display name <i>*</i></label><input id="review-name" name="name" autocomplete="nickname" minlength="2" maxlength="60" required placeholder="Your name or public nickname"></div>',
  '<div class="review-field"><label for="review-service">What did you explore? <i>*</i></label><select id="review-service" name="service" required><option value="" disabled selected>Select an experience</option>',
  ...services.map(x=>'<option value="'+x+'">'+x+'</option>'),
  '</select></div></div>',
  '<fieldset class="review-rating"><legend>How would you rate the overall experience? <i>*</i></legend><div class="review-rating-options">'+stars+'</div></fieldset>',
  '<div class="review-field"><label for="review-headline">One-line summary</label><input id="review-headline" name="headline" maxlength="90" placeholder="A short headline for your review (optional)"></div>',
  '<div class="review-form-row"><div class="review-field"><label for="review-highlights">What stood out?</label><textarea id="review-highlights" name="highlights" maxlength="300" rows="3" placeholder="Something that worked well, a helpful detail, or a moment you remember."></textarea></div>',
  '<div class="review-field"><label for="review-improvement">What could be better?</label><textarea id="review-improvement" name="improvement" maxlength="300" rows="3" placeholder="Anything the team could improve? Constructive feedback is welcome."></textarea></div></div>',
  '<div class="review-field"><label for="review-body">Tell your story <i>*</i></label><textarea id="review-body" name="review" minlength="25" maxlength="800" rows="6" required placeholder="Tell us what you actually experienced. Be specific, honest, and as detailed as you like."></textarea><div class="review-field-foot"><small>Write at least 25 characters. Avoid private project information and contact details.</small><span id="review-character-count">0 / 800</span></div></div>',
  '<div class="review-ai-panel"><div class="review-ai-head"><div class="review-ai-symbol" aria-hidden="true">✳</div><div><strong>VELORYZ Review AI</strong><p>Polish the words you already wrote. Nothing is generated without your request.</p></div><span class="review-ai-pill">OPTIONAL</span></div>',
  '<div class="review-ai-actions"><label for="review-ai-tone">Writing style</label><select id="review-ai-tone"><option value="natural">Natural & authentic</option><option value="clear">Clear & professional</option><option value="detailed">Thoughtful & detailed</option></select><button type="button" id="review-ai-button" class="review-secondary">✳ Polish my wording</button></div>',
  '<p class="review-ai-status" id="review-ai-status" role="status" aria-live="polite">Only if you click Polish, your draft and optional notes are sent to the Gemini service. Remove confidential details first. You approve every edit and the review is never published automatically.</p>',
  '<div id="review-ai-preview" class="review-ai-preview" hidden><span class="review-kicker">AI DRAFT / CHECK EVERY DETAIL</span><blockquote id="review-ai-suggestion"></blockquote><div class="review-ai-actions"><button id="review-ai-use" type="button" class="review-primary">Use this wording</button><button id="review-ai-dismiss" type="button" class="review-secondary">Keep my original</button></div></div></div>',
  '<div class="review-honeypot" aria-hidden="true"><label for="review-website">Website</label><input id="review-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>',
  '<label class="review-confirm"><input type="checkbox" name="confirm" required><span>I confirm this is my genuine experience. I understand that my public name, rating and approved feedback may appear on the website. No review is published automatically.</span></label>',
  '<div class="review-submit-row"><button type="submit" id="review-submit" class="review-primary">Submit my review <span aria-hidden="true">↗</span></button><span>HUMAN MODERATION · NO AUTOMATIC PUBLISHING</span></div>',
  '<p id="review-form-status" class="review-status" role="status" aria-live="polite"></p></form></div></section>',
  '<section class="review-outro"><div class="review-kicker">A BETTER EXPERIENCE, TOGETHER</div><h2>Your perspective<br><em>makes the difference.</em></h2><p>Every thoughtful review—positive or critical—helps our work grow.</p><a href="/work/" class="review-secondary">Explore the studio ↗</a></section>'
 ].join('');
 const title=admin?'Review moderation — VELORYZ Studio Control':'Reviews & feedback — VELORYZ Studio';
 return [
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
  '<title>'+title+'</title><meta name="description" content="Read genuine, human-moderated VELORYZ Studio reviews and share detailed, authentic feedback. India · Asia.">',
  '<meta name="robots" content="'+(admin?'noindex,nofollow':'index,follow')+'">',
  admin?'':'<link rel="canonical" href="https://veloryz.online/reviews.html">',
  '<meta property="og:title" content="Real experiences & community reviews — VELORYZ Studio"><meta property="og:type" content="website">',
  '<meta property="og:url" content="https://veloryz.online/reviews.html">',
  '<link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/reviews.css?v=20261122-editorial-v2"><script src="/reviews.js?v=20261122-editorial-v2" defer></script></head>',
  '<body data-reviews-admin="'+(admin?'true':'false')+'"><a class="review-skip" href="#review-main">Skip to content</a>',
  '<header class="reviews-header"><a class="reviews-brand" href="/" aria-label="VELORYZ Studio home"><img src="/assets/brand/veloryz-mark.svg" width="40" height="40" alt=""><span>VELORYZ<small>INDEPENDENT CREATIVE STUDIO</small></span></a>',
  '<nav aria-label="Main navigation"><a href="/work/">Work</a><a href="/design/">Designs</a><a href="/services/">Services</a><a href="/docs/index.html">Docs</a><a href="/reviews.html" '+(admin?'':'aria-current="page"')+'>Reviews</a></nav>',
  '<a class="reviews-nav-cta" href="/create/">Start a project ↗</a></header>',
  '<main id="review-main" class="reviews-layout"><div class="reviews-content">'+page+'</div></main>',
  '<footer class="reviews-footer"><span>© VELORYZ Studio · India · Asia · Working everywhere</span><div><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/contact/">Contact</a><a href="/sitemap.xml">Sitemap</a></div></footer>',
  '</body></html>'
 ].join('');
}