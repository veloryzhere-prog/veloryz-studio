/** Indexable first-response markup. The client SPA replaces <main> after loading.
 * This is normal visible content, not bot-only rendering or hidden keyword text.
 * Keep primary statements aligned with the interactive page content. */
const escapeHtml=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const related=(links:readonly [string,string][])=>'<nav class="seo-first-links" aria-label="Explore VELORYZ Studio">'+
 links.map(([url,label])=>'<a href="'+escapeHtml(url)+'">'+escapeHtml(label)+' ↗</a>').join('')+'</nav>';
const p=(text:string)=>'<p>'+text+'</p>';
const home=()=>`<section class="hero container motion-hero seo-first-hero" aria-labelledby="seo-first-title">
 <div class="hero-topline"><div class="eyebrow hero-studio-tagline">VELORYZ Studio · Independent creative &amp; technology studio</div><span class="small-index">INDIA · ASIA / WORKING EVERYWHERE</span></div>
 <div class="hero-layout"><div class="hero-copy"><div class="hero-chapter">DESIGN × CODE × MOTION</div>
 <h1 id="seo-first-title">Built to be<br><span class="serif">remembered.</span></h1>
 <p class="hero-desc">VELORYZ Studio designs and develops thoughtful websites, product interfaces, brand identities and digital experiences. We bring design, technology and motion together to create work that is clear, considered and distinctive.</p>
 <div class="hero-actions"><a class="button" href="/work">Explore selected work ↗</a><a class="motion-secondary" href="/create">Start a project ↗</a></div></div>
 <div class="hero-art"><img src="/assets/brand/veloryz-mark.svg" width="180" height="166" alt="VELORYZ Studio geometric V mark"></div></div></section>
 <section class="section container seo-first-details">
 <div class="eyebrow">WHAT THE STUDIO BUILDS</div><h2>Design, development and digital experiences.</h2>
 ${p('From the first project brief through launch, VELORYZ Studio works on custom websites, responsive interfaces, brand and identity systems, interactive motion experiences, creative direction, and development for digital products. Every project starts with understanding what the client needs and which deliverables matter.')}
 ${p('Explore our design library and selected work for examples of the studio’s direction. Learn how project stages, estimates, collaboration and reviews work before requesting a tailored proposal. The studio is based in India and collaborating across Asia, and collaborates on digital projects remotely.')}
 <h2>Explore VELORYZ.</h2>
 ${related([['/services','Web design and development'],['/work','Selected work and concepts'],['/design','Design library'],['/process','How projects work'],['/pricing','Pricing and scope'],['/studio','Meet VELORYZ Studio'],['/contact','Contact the studio'],['/create','Create your project']])}
 </section>`;
const pages:Record<string,{heading:string;lead:string;details:string;links:readonly [string,string][]}>={
 '/services':{heading:'Design & development services',lead:'VELORYZ Studio builds custom websites, digital products, brand identities, interfaces and motion experiences.',
  details:'Whether you are launching something new or improving an existing digital experience, the VELORYZ team collaborates on project goals, creative direction, technical implementation and clear delivery milestones. Explore our selected work, estimate project scope and start a project brief when ready.',
  links:[['/work','Selected work'],['/process','Our process'],['/create','Start a project']]},
 '/work':{heading:'Selected work and digital concepts',lead:'Explore original VELORYZ Studio projects, visual studies, websites and interactive digital experiences.',
  details:'This collection brings together work in progress, design experiments and clearly identified concept studies. See the thinking behind distinct creative directions, then explore our services or describe what you want to build.',
  links:[['/design','Design library'],['/services','Our services'],['/create','Discuss your project']]},
 '/design':{heading:'Website design library and concepts',lead:'Browse website design directions, ready-to-adapt concepts and creative references from VELORYZ Studio.',
  details:'Explore visual directions for business websites, portfolios, digital products and storytelling experiences. Compare designs and discuss the scope of adapting a direction for your project. Third-party references require their applicable rights and licences.',
  links:[['/work','Selected work'],['/pricing','Pricing'],['/create','Request a design']]},
 '/studio':{heading:'About VELORYZ Studio',lead:'VELORYZ Studio is an independent creative and technology studio based in India and collaborating across Asia.',
  details:'The studio brings design, development, creative direction and product thinking together. Its work ranges from thoughtful websites and brand systems to interactive digital experiences. Its official name is VELORYZ Studio. If you searched for Valoryz, Valories or Valerie’s Studio, you may be looking for VELORYZ.',
  links:[['/services','Studio capabilities'],['/work','Selected work'],['/contact','Contact VELORYZ']]},
 '/process':{heading:'Our website and digital project process',lead:'Understand how VELORYZ Studio plans, designs, develops and reviews client projects.',
  details:'Our process begins with discovery and defining the brief, then moves through design, development, review and launch. The scope, milestones and communication approach are agreed with each client so projects remain understandable and organized.',
  links:[['/services','Services'],['/pricing','Pricing and scope'],['/create','Start a project']]},
 '/pricing':{heading:'Website design and development pricing',lead:'Explore VELORYZ Studio scope, pricing guidance, and options for requesting a tailored digital project.',
  details:'The right budget depends on the project requirements, design direction, technical integrations, content, revisions and delivery schedule. Illustrative estimates are not binding final quotations; the studio discusses an individual scope before work begins.',
  links:[['/services','Services'],['/process','How delivery works'],['/create','Get a proposal']]},
 '/create':{heading:'Create your project with VELORYZ Studio',lead:'Plan a website, digital product, brand identity or interactive design project with the VELORYZ team.',
  details:'Share the type of project, your goals, important features, design references, approximate budget and preferred contact details. The studio reviews requests and discusses the next steps. Submitting a brief does not automatically create a paid order.',
  links:[['/services','Explore services'],['/pricing','Understand pricing'],['/contact','Contact the team']]},
 '/contact':{heading:'Contact VELORYZ Studio',lead:'Talk with the VELORYZ team about custom websites, digital experiences, brand identity and development.',
  details:'VELORYZ Studio is based in India and collaborating across Asia, and works with clients remotely. Describe your goals, share reference links, or begin a structured project request to discuss scope and next steps.',
  links:[['/create','Submit a project request'],['/work','Explore our work'],['/studio','About the studio']]},
 '/book':{heading:'Book a project discovery conversation',lead:'Request a discovery conversation with the VELORYZ Studio team about a website or digital project.',
  details:'Share your preferred time and a short overview of your idea. A requested meeting time is not a confirmed appointment until the studio responds.',
  links:[['/create','Create a project brief'],['/contact','Contact us'],['/services','Services']]}
};
export function renderIndexableBody(path:string,title:string,description:string):string{
 if(path==='/')return home();
 const data=pages[path];
 const heading=data?.heading||title;
 const lead=data?.lead||description;
 const details=data?.details||'Find official VELORYZ Studio information, project guidance and related creative technology services. Explore the site or reach the team for a tailored digital project conversation.';
 const links=data?.links||[['/','VELORYZ Studio home'],['/services','Services'],['/create','Create a project']];
 return '<section class="page-intro container seo-first-route" aria-labelledby="seo-first-title">'+
 '<div class="eyebrow">VELORYZ STUDIO / '+escapeHtml(path.slice(1).replaceAll('/',' · ')||'HOME')+'</div>'+
 '<h1 id="seo-first-title">'+escapeHtml(heading)+'</h1>'+
 '<div class="page-intro-bottom"><p>'+escapeHtml(lead)+'</p></div>'+
 '</section><section class="section container seo-first-details"><h2>Explore your next direction with VELORYZ.</h2>'+
 '<p>'+escapeHtml(details)+'</p>'+related(links)+'</section>';
}
