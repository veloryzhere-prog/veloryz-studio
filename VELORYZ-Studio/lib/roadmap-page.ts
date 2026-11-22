/** Public, accurate project-process roadmap. Stages are descriptive, not launch promises. */
export function renderRoadmapPage():string{
 const stages=[
 ['01','Discover','Discuss the project goals, audience, constraints and useful success criteria. Agree on how requirements and scope will be recorded.'],
 ['02','Define & design','Plan information architecture, create design directions and review accessibility and brand consistency.'],
 ['03','Build & integrate','Implement approved functionality, protected server integrations, responsive behavior and content workflows.'],
 ['04','Review & harden','Test permissions, input validation, data access, security headers, media handling, performance and accessibility.'],
 ['05','QA & launch','Check mobile and desktop journeys, verify deployment settings, confirm redirects, canonical URLs and the public XML sitemap.'],
 ['06','Handover & improve','Document ownership, deployment, backups and support arrangements. Prioritize further improvements based on evidence and feedback.']
 ];
 const items=stages.map(x=>'<article class="review-card"><span class="review-kicker">PHASE '+x[0]+'</span><h2>'+x[1]+'</h2><p class="review-copy">'+x[2]+'</p></article>').join('');
 return [
 '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
 '<title>Project roadmap & quality checks — VELORYZ Studio</title>',
 '<meta name="description" content="Explore the VELORYZ Studio project roadmap, from discovery through design, security reviews, accessibility, publishing and handover.">',
 '<link rel="canonical" href="https://veloryz.online/roadmap.html"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/lenis-vendored.css"><link rel="stylesheet" href="/reviews.css"><script src="/lenis-vendored.js?v=1.3.27" defer></script><script src="/smooth-scroll.js?v=20261122-global-v2" defer></script></head>',
 '<body><a class="review-skip" href="#roadmap-main">Skip to content</a>',
 '<header class="reviews-header"><a class="reviews-brand" href="/"><span class="reviews-mark">V</span><span>VELORYZ<small>STUDIO / INDIA · ASIA</small></span></a>',
 '<nav aria-label="Primary"><a href="/work/">Work</a><a href="/process/">Process</a><a href="/docs/index.html">Docs</a><a href="/reviews.html">Reviews</a><a href="/contact/">Contact</a></nav><a class="reviews-nav-cta" href="/create/">Start a project ↗</a></header>',
 '<main class="reviews-layout" id="roadmap-main"><div class="review-hero-mark" aria-hidden="true">V</div><div class="reviews-content">',
 '<div class="review-kicker">THE STUDIO / PRACTICE & TRANSPARENCY</div><h1>From first idea<br><em>to a dependable launch.</em></h1>',
 '<p class="review-lead">Our project roadmap outlines the checkpoints that help us deliver thoughtful websites and digital products. Exact work, timing and responsibilities are agreed for each project.</p>',
 '<div class="review-controls"><a href="/docs/studio/index.html" class="review-primary">Read the documentation ↗</a><a href="/sitemap.xml" class="review-secondary">Explore XML sitemap</a></div>',
 '<section class="reviews-panel"><div class="review-kicker">THE SIX PHASES</div><h2>Work with clarity.</h2><p class="review-note">A planning reference, not a guarantee that every project needs the same phases or that a security test proves zero vulnerabilities.</p>',
 '<div class="review-feed">'+items+'</div></section>',
 '<section class="reviews-panel"><h2>Transparency & responsible reporting</h2>',
 '<p class="review-note">If you spot a security or privacy issue, email the studio directly rather than including sensitive details in a public review. We assess and prioritize credible reports and keep personal project material out of public responses.</p>',
 '<a class="review-primary" href="mailto:veloryz.here@gmail.com?subject=Responsible%20Security%20Disclosure">Report a security concern ↗</a></section>',
 '</div></main><footer class="reviews-footer"><span>VELORYZ Studio · India · Asia</span><div><a href="/privacy/">Privacy</a><a href="/reviews.html">Reviews</a><a href="/sitemap/">Site map</a></div></footer></body></html>'
 ].join('');
}
