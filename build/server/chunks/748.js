"use strict";exports.id=748,exports.ids=[748],exports.modules={5748:(e,i,t)=>{t.d(i,{B:()=>h,IF:()=>E,LO:()=>L,N8:()=>f,R9:()=>N,ZS:()=>S,a6:()=>O,ck:()=>p,fN:()=>y,g2:()=>v,s5:()=>b,th:()=>T,ty:()=>g});var r=t(5315),o=t.n(r),a=t(2048),s=t.n(a),n=t(5467);let l=o().join(process.cwd(),"data"),d=o().join(l,"portfolio.db");s().existsSync(l)||s().mkdirSync(l,{recursive:!0});let c=null;function m(){var e;return c||((e=c=new n.DatabaseSync(d)).exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      subrole TEXT NOT NULL,
      location TEXT NOT NULL,
      experience TEXT NOT NULL,
      timezone TEXT NOT NULL,
      email TEXT NOT NULL,
      availability TEXT NOT NULL,
      headline TEXT NOT NULL,
      intro TEXT NOT NULL,
      bio TEXT NOT NULL,
      avatarUrl TEXT NOT NULL,
      stats TEXT NOT NULL,
      socials TEXT NOT NULL,
      skills TEXT NOT NULL,
      pillars TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      badge TEXT,
      image TEXT NOT NULL,
      tags TEXT NOT NULL,
      summary TEXT NOT NULL,
      outcome TEXT,
      client TEXT,
      timeline TEXT,
      problem TEXT,
      solution TEXT,
      results TEXT,
      liveUrl TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS process_steps (
      id TEXT PRIMARY KEY,
      stepNumber TEXT NOT NULL,
      badge TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      initials TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      quote TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      createdAt TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      serviceType TEXT NOT NULL,
      budget TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new'
    );
  `),function(e){if(0===e.prepare("SELECT COUNT(*) as count FROM profiles;").get().count&&(console.log("Seeding initial profile into SQLite..."),e.prepare(`
      INSERT INTO profiles (
        id, name, role, subrole, location, experience, timezone, email,
        availability, headline, intro, bio, avatarUrl, stats, socials, skills, pillars
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `).run("default-profile","[Your Name]","Freelance Web Designer & Developer","Design & Code","[City, Country]","5+ Years Experience","UTC-5 (EST) / Global Flexibility","hello@yourname.dev","Available for new projects \xb7 Q1/Q2 Booking","Designing & building high-converting websites that elevate your brand.","Hi, I'm [Your Name] — an independent freelance web designer and full-stack developer based in [City, Country]. I partner with ambitious businesses and founders to craft bespoke, ultra-fast websites that look stunning and drive measurable growth.","I bridge the gap between creative visual design and robust Next.js code. With over 5+ years of experience, I turn complex business ideas into high-converting, accessible digital flagships.","/images/avatar.svg",JSON.stringify([{value:"5+",label:"Years of Experience"},{value:"40+",label:"Websites Delivered"},{value:"99.8%",label:"Client Satisfaction"},{value:"100%",label:"On-Time Delivery"}]),JSON.stringify({github:"https://github.com",linkedin:"https://linkedin.com",twitter:"https://twitter.com",dribbble:"https://dribbble.com"}),JSON.stringify(["Next.js 14","React","TypeScript","Tailwind CSS","Figma","Node.js","SQLite / SQL","REST APIs","Shopify Liquid","WordPress / CMS","SEO Optimization","WCAG 2.1 AA"]),JSON.stringify([{title:"User-Centric Intent",desc:"Layout, hierarchy, and micro-interactions planned around conversion."},{title:"Speed as a Feature",desc:"Blazing-fast load times, 95+ Core Web Vitals, zero bloat."},{title:"Radical Reliability",desc:"Fixed milestones, weekly Loom updates, no surprise costs."},{title:"Inclusive & Accessible",desc:"Engineered according to WCAG 2.1 AA accessibility guidelines."}]))),0===e.prepare("SELECT COUNT(*) as count FROM process_steps;").get().count){console.log("Seeding process steps into SQLite...");let i=e.prepare(`
      INSERT INTO process_steps (id, stepNumber, badge, title, description, deliverables, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `);for(let e of[{id:"step-1",stepNumber:"01",badge:"Week 1",title:"Discovery & Strategy",description:"We unpack your business objectives, target demographics, brand identity, and site architecture to build a watertight creative strategy.",deliverables:"Creative brief, sitemap, content outline, technical roadmap.",sort_order:1},{id:"step-2",stepNumber:"02",badge:"Weeks 2–3",title:"Wireframing & UI Design",description:"I produce clickable Figma wireframes and high-fidelity mockups. You see and test how the site looks on desktop and mobile before writing any code.",deliverables:"Clickable Figma prototype, visual design system, 2 review rounds.",sort_order:2},{id:"step-3",stepNumber:"03",badge:"Weeks 4–5",title:"Clean Development",description:"I write clean, semantic, and performant Next.js code. Features, animations, CMS fields, and contact forms are tested across Safari, Chrome, iOS, and Android.",deliverables:"Private staging URL for review, cross-browser validation, accessibility audit.",sort_order:3},{id:"step-4",stepNumber:"04",badge:"Week 6 & Beyond",title:"Launch & Handover",description:"We execute a seamless launch: domain configuration, SSL, SEO metadata setup, and analytics integration. Plus, 30 days of post-launch warranty support.",deliverables:"Live production deployment, video CMS walkthrough tutorial, 30-day warranty.",sort_order:4}])i.run(e.id,e.stepNumber,e.badge,e.title,e.description,e.deliverables,e.sort_order)}if(0===e.prepare("SELECT COUNT(*) as count FROM services;").get().count){console.log("Seeding services into SQLite...");let i=e.prepare(`
      INSERT INTO services (id, title, price, description, deliverables, sort_order)
      VALUES (?, ?, ?, ?, ?, ?);
    `);for(let e of[{id:"serv-1",title:"Website Design (UI/UX)",price:"From $1,800",description:"Visually striking, brand-aligned interfaces crafted to engage visitors and guide them effortlessly toward inquiry or purchase. No cookie-cutter templates.",deliverables:JSON.stringify(["User research & intuitive wireframing","Interactive Figma prototypes (desktop & mobile)","Design system (typography, palette, components)","Conversion rate optimization (CRO) focus"]),sort_order:1},{id:"serv-2",title:"Website Development",price:"From $2,400",description:"Modern, robust code engineered for blazing-fast load speeds, clean semantics, and effortless scalability. Built using Next.js, React, and accessible markup.",deliverables:JSON.stringify(["Semantic HTML5, CSS3/Tailwind & modern JavaScript","CMS integrations (WordPress, Webflow, Sanity)","95+ Google Lighthouse speed & Core Web Vitals","Custom animations, interactive forms & APIs"]),sort_order:2},{id:"serv-3",title:"Responsive Redesigns",price:"From $1,500",description:"Transform an outdated, sluggish, or mobile-unfriendly site into a modern digital flagship that restores user confidence and boosts your search rankings.",deliverables:JSON.stringify(["Full UX & technical performance audit","Mobile-first responsive architecture overhaul","Asset compression & load-speed remediation","SEO preservation & 301 redirect management"]),sort_order:3},{id:"serv-4",title:"Ongoing Support & Care",price:"From $250/mo",description:"Total peace of mind after launch. I handle ongoing security updates, content updates, performance checks, and technical troubleshooting so you can focus on business.",deliverables:JSON.stringify(["24/7 uptime monitoring & cloud backups","Plugin, theme & framework security patching","Monthly design tweaks & content updates","Dedicated priority email & Slack channel"]),sort_order:4}])i.run(e.id,e.title,e.price,e.description,e.deliverables,e.sort_order)}if(0===e.prepare("SELECT COUNT(*) as count FROM projects;").get().count){console.log("Seeding projects into SQLite...");let i=e.prepare(`
      INSERT INTO projects (
        id, title, category, badge, image, tags, summary, outcome,
        client, timeline, problem, solution, results, liveUrl, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);for(let e of[{id:"proj-1",title:"Apex Analytics — Performance Telemetry Platform",category:"development web-design",badge:"B2B SaaS",image:"/images/project-1.svg",tags:JSON.stringify(["UI/UX Design","React","TypeScript"]),summary:"End-to-end design system and responsive front-end customer portal for a high-growth cloud telemetry service, featuring real-time data streaming and custom charts.",outcome:"Result: +34% user retention, sub-100ms render speeds",client:"Apex Analytics Corp. (Series A Startup)",timeline:"6 Weeks",problem:"Apex needed to replace an uninspired internal dashboard with an enterprise-grade customer portal that could handle real-time data streaming without lagging.",solution:"Designed and engineered a modular dashboard with customizable KPI widgets, dark mode optimizations, and high-performance SVG chart rendering.",results:JSON.stringify(["+34% increase in daily active user retention","Sub-100ms dashboard widget render latency","Helped close 12 new enterprise pilot contracts"]),liveUrl:"https://example.com/apex-preview",sort_order:1},{id:"proj-2",title:"Lumina Maison — Luxury Architectural Goods",category:"ecommerce web-design",badge:"E-Commerce",image:"/images/project-2.svg",tags:JSON.stringify(["Shopify","Editorial UI","Liquid"]),summary:"Bespoke digital boutique combining tactile editorial typography, curated storytelling galleries, and an optimized frictionless mobile slide-out bag.",outcome:"Result: +62% mobile conversion, +$85 Average Order Value",client:"Lumina Maison Studio (Milan & New York)",timeline:"5 Weeks",problem:"The client had exquisite handcrafted home objects but suffered from a generic e-commerce template with a clunky mobile checkout flow.",solution:"Crafted an editorial-style e-commerce layout emphasizing tactile photography, warm minimalist typography, and a frictionless slide-out bag checkout.",results:JSON.stringify(["+62% mobile checkout conversion rate","Average order value (AOV) increased by $85","Featured on multiple design inspiration galleries"]),liveUrl:"https://example.com/lumina-preview",sort_order:2},{id:"proj-3",title:"Aura Health — Telehealth & Patient Portal",category:"development",badge:"HealthTech",image:"/images/project-3.svg",tags:JSON.stringify(["Next.js","HIPAA Ready","WebRTC"]),summary:"A secure, accessible appointment booking engine and telemedicine video interface engineered for patient privacy and frictionless smartphone accessibility.",outcome:"Result: Sub-3 min booking flow, 100% WCAG AA compliant",client:"Aura Health Technologies",timeline:"8 Weeks",problem:"Patients faced excessive friction scheduling virtual doctor appointments and accessing confidential health vitals on smartphones.",solution:"Architected a mobile-first, HIPAA-compliant patient dashboard with one-tap appointment booking, secure file uploads, and encrypted video consultation integration.",results:JSON.stringify(["Average appointment booking time cut down to under 3 minutes","100% WCAG 2.1 AA accessibility compliance audit passed","4.9 / 5 rating from over 2,000 active patients"]),liveUrl:"https://example.com/aura-preview",sort_order:3},{id:"proj-4",title:"Kinetix Digital — Creative Design Agency",category:"web-design",badge:"Agency",image:"/images/project-4.svg",tags:JSON.stringify(["WebGL","Animations","Dark Mode"]),summary:"High-impact brand identity and interactive portfolio experience showcasing award-winning spatial design, interactive 3D geometry, and smooth transitions.",outcome:"Result: Awwwards Site of the Day nominee, 2x inbound inquiries",client:"Kinetix Studio",timeline:"4 Weeks",problem:"A creative agency needed a daring digital portfolio to showcase their cutting-edge 3D and interaction design capabilities to international brands.",solution:"Built an immersive, dark-mode agency showcase featuring smooth page transitions, typography animations, and optimized WebGL interactive elements.",results:JSON.stringify(["Nominated for Awwwards Site of the Day","Organic inbound project inquiries doubled within 60 days","Maintained a 95+ Google Lighthouse performance score despite rich media"]),liveUrl:"https://example.com/kinetix-preview",sort_order:4},{id:"proj-5",title:"Vanguard Wealth — Private Advisory Web App",category:"development",badge:"Fintech",image:"/images/project-5.svg",tags:JSON.stringify(["Fintech Security","React","Charts"]),summary:"High-net-worth investor portal featuring interactive asset allocation modeling, automated tax-loss rebalancing metrics, and institutional security standards.",outcome:"Result: 100/100 Core Web Vitals, $80M client assets onboarded",client:"Vanguard Private Advisory Group",timeline:"7 Weeks",problem:"High-net-worth clients required a secure, intuitive digital hub to view real-time portfolio allocations, tax-loss harvesting stats, and advisor notes.",solution:"Designed and developed an institutional-grade web portal featuring interactive asset allocation charts, secure document vaults, and multi-factor authentication.",results:JSON.stringify(["Zero security vulnerabilities detected in third-party penetration testing","100/100 Core Web Vitals score across all major browsers","Over $80M in assets onboarded in the first quarter post-launch"]),liveUrl:"https://example.com/vanguard-preview",sort_order:5},{id:"proj-6",title:"Terra Organic — Sustainable DTC Redesign",category:"redesign ecommerce",badge:"Redesign",image:"/images/project-6.svg",tags:JSON.stringify(["Mobile-First","PageSpeed","E-Commerce"]),summary:"Comprehensive overhaul of a sluggish organic beauty shop, rewriting asset pipelines, streamlining one-click checkout, and eliminating render-blocking code.",outcome:"Result: Load time cut from 6.2s to 0.8s, bounce rate down 41%",client:"Terra Organic Naturals",timeline:"4 Weeks",problem:"An organic beauty brand suffered from slow 6.2-second load times on mobile devices, leading to high bounce rates and lost ad dollars.",solution:"Performed a full design overhaul and code refactoring: compressed media pipelines, eliminated render-blocking scripts, and designed an intuitive mobile catalog.",results:JSON.stringify(["Page load time reduced from 6.2s to 0.8s (87% improvement)","Mobile bounce rate dropped by 41%","Core Web Vitals scores went from Failing to all Green"]),liveUrl:"https://example.com/terra-preview",sort_order:6}])i.run(e.id,e.title,e.category,e.badge,e.image,e.tags,e.summary,e.outcome,e.client,e.timeline,e.problem,e.solution,e.results,e.liveUrl,e.sort_order)}if(0===e.prepare("SELECT COUNT(*) as count FROM testimonials;").get().count){console.log("Seeding testimonials into SQLite...");let i=e.prepare(`
      INSERT INTO testimonials (id, name, role, company, initials, rating, quote, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `);for(let e of[{id:"test-1",name:"Alex Morgan",role:"Founder",company:"CloudFlow Analytics",initials:"AM",rating:5,quote:"[Your Name] took our vague ideas and transformed them into a website that genuinely looks like it cost $30k. Our inbound lead quality improved immediately, and our bounce rate dropped by 35% in week one. Working together was seamless.",sort_order:1},{id:"test-2",name:"Elena Rostova",role:"Creative Director",company:"Lumina Maison",initials:"ER",rating:5,quote:"Finding someone who understands luxury visual design AND can write fast, clean code is nearly impossible. [Your Name] exceeded every expectation for Lumina Maison. The mobile checkout is lightning fast and our customers love it.",sort_order:2},{id:"test-3",name:"David Chen",role:"VP of Growth",company:"Horizon Capital",initials:"DC",rating:5,quote:"Every single deadline was hit ahead of schedule. The weekly Loom check-ins were fantastic, and [Your Name]’s proactive suggestions for conversion rate optimization made a huge difference to our bottom line. Highly recommended!",sort_order:3}])i.run(e.id,e.name,e.role,e.company,e.initials,e.rating,e.quote,e.sort_order)}}(e)),c}function u(){let e=m(),i=e.prepare("SELECT * FROM profiles WHERE id = ?;").get("default-profile"),t=i?{id:i.id,name:i.name,role:i.role,subrole:i.subrole,location:i.location,experience:i.experience,timezone:i.timezone,email:i.email,availability:i.availability,headline:i.headline,intro:i.intro,bio:i.bio,avatarUrl:i.avatarUrl,stats:JSON.parse(i.stats||"[]"),socials:JSON.parse(i.socials||"{}"),skills:JSON.parse(i.skills||"[]"),pillars:JSON.parse(i.pillars||"[]")}:{name:"[Your Name]",role:"Freelance Web Designer & Developer",subrole:"Design & Code",location:"[City, Country]",experience:"5+ Years Experience",timezone:"UTC-5",email:"hello@yourname.dev",availability:"Available for projects",headline:"Designing & building high-converting websites",intro:"",bio:"",avatarUrl:"/images/avatar.svg",stats:[],socials:{},skills:[],pillars:[]},r=e.prepare("SELECT * FROM projects ORDER BY sort_order ASC, rowid ASC;").all().map(e=>({id:e.id,title:e.title,category:e.category,badge:e.badge||void 0,image:e.image,tags:JSON.parse(e.tags||"[]"),summary:e.summary,outcome:e.outcome||void 0,client:e.client||void 0,timeline:e.timeline||void 0,problem:e.problem||void 0,solution:e.solution||void 0,results:e.results?JSON.parse(e.results):void 0,liveUrl:e.liveUrl||void 0,sort_order:e.sort_order})),o=e.prepare("SELECT * FROM services ORDER BY sort_order ASC, rowid ASC;").all().map(e=>({id:e.id,title:e.title,price:e.price,description:e.description,deliverables:JSON.parse(e.deliverables||"[]"),sort_order:e.sort_order}));return{profile:t,projects:r,services:o,processSteps:e.prepare("SELECT * FROM process_steps ORDER BY sort_order ASC, rowid ASC;").all().map(e=>({id:e.id,stepNumber:e.stepNumber,badge:e.badge,title:e.title,description:e.description,deliverables:e.deliverables,sort_order:e.sort_order})),testimonials:e.prepare("SELECT * FROM testimonials ORDER BY sort_order ASC, rowid ASC;").all().map(e=>({id:e.id,name:e.name,role:e.role,company:e.company,initials:e.initials,rating:e.rating,quote:e.quote,sort_order:e.sort_order})),inquiries:e.prepare("SELECT * FROM inquiries ORDER BY createdAt DESC;").all().map(e=>({id:e.id,createdAt:e.createdAt,name:e.name,email:e.email,company:e.company||void 0,serviceType:e.serviceType,budget:e.budget,message:e.message,status:e.status||"new"}))}}function p(e){let i=m(),t={...u().profile,...e};return i.prepare(`
    UPDATE profiles SET
      name = ?, role = ?, subrole = ?, location = ?, experience = ?, timezone = ?,
      email = ?, availability = ?, headline = ?, intro = ?, bio = ?, avatarUrl = ?,
      stats = ?, socials = ?, skills = ?, pillars = ?
    WHERE id = 'default-profile';
  `).run(t.name,t.role,t.subrole,t.location,t.experience,t.timezone,t.email,t.availability,t.headline,t.intro,t.bio,t.avatarUrl,JSON.stringify(t.stats),JSON.stringify(t.socials),JSON.stringify(t.skills),JSON.stringify(t.pillars)),t}function g(e,i){let t=m(),r=t.prepare("SELECT * FROM projects WHERE id = ?;").get(e);if(!r)return null;let o=JSON.parse(r.tags||"[]"),a=r.results?JSON.parse(r.results):null,s=void 0!==i.title?i.title:r.title,n=void 0!==i.category?i.category:r.category,l=void 0!==i.badge?i.badge:r.badge,d=void 0!==i.image?i.image:r.image,c=void 0!==i.tags?JSON.stringify(i.tags):JSON.stringify(o),u=void 0!==i.summary?i.summary:r.summary,p=void 0!==i.outcome?i.outcome:r.outcome,g=void 0!==i.client?i.client:r.client,T=void 0!==i.timeline?i.timeline:r.timeline,b=void 0!==i.problem?i.problem:r.problem,v=void 0!==i.solution?i.solution:r.solution,y=void 0!==i.results?JSON.stringify(i.results):a?JSON.stringify(a):null,E=void 0!==i.liveUrl?i.liveUrl:r.liveUrl;return t.prepare(`
    UPDATE projects SET
      title = ?, category = ?, badge = ?, image = ?, tags = ?, summary = ?,
      outcome = ?, client = ?, timeline = ?, problem = ?, solution = ?, results = ?, liveUrl = ?
    WHERE id = ?;
  `).run(s,n,l,d,c,u,p,g,T,b,v,y,E,e),{id:e,title:s,category:n,badge:l||void 0,image:d,tags:JSON.parse(c),summary:u,outcome:p||void 0,client:g||void 0,timeline:T||void 0,problem:b||void 0,solution:v||void 0,results:y?JSON.parse(y):void 0,liveUrl:E||void 0}}function T(e){return m().prepare("DELETE FROM projects WHERE id = ?;").run(e).changes>0}function b(e){let i=m();i.exec("DELETE FROM services;");let t=i.prepare(`
    INSERT INTO services (id, title, price, description, deliverables, sort_order)
    VALUES (?, ?, ?, ?, ?, ?);
  `);return e.forEach((e,i)=>{let r=e.id||`serv-${i+1}`;t.run(r,e.title,e.price,e.description,JSON.stringify(e.deliverables||[]),i+1)}),e}function v(e){let i=m();i.exec("DELETE FROM process_steps;");let t=i.prepare(`
    INSERT INTO process_steps (id, stepNumber, badge, title, description, deliverables, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `);return e.forEach((e,i)=>{let r=e.id||`step-${i+1}`;t.run(r,e.stepNumber,e.badge,e.title,e.description,e.deliverables,i+1)}),e}function y(e,i){let t=m(),r=t.prepare("SELECT * FROM testimonials WHERE id = ?;").get(e);if(!r)return null;let o=void 0!==i.name?i.name:r.name,a=void 0!==i.role?i.role:r.role,s=void 0!==i.company?i.company:r.company,n=void 0!==i.initials?i.initials:r.initials,l=void 0!==i.rating?i.rating:r.rating,d=void 0!==i.quote?i.quote:r.quote;return t.prepare(`
    UPDATE testimonials SET name = ?, role = ?, company = ?, initials = ?, rating = ?, quote = ?
    WHERE id = ?;
  `).run(o,a,s,n,l,d,e),{id:e,name:o,role:a,company:s,initials:n,rating:l,quote:d}}function E(e){return m().prepare("DELETE FROM testimonials WHERE id = ?;").run(e).changes>0}function N(e){return m().prepare("DELETE FROM inquiries WHERE id = ?;").run(e).changes>0}let f=u,h=function(e){let i=m(),t=`proj-${Date.now()}`;return i.prepare(`
    INSERT INTO projects (
      id, title, category, badge, image, tags, summary, outcome,
      client, timeline, problem, solution, results, liveUrl, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `).run(t,e.title,e.category,e.badge||null,e.image||"/images/project-1.svg",JSON.stringify(e.tags||[]),e.summary,e.outcome||null,e.client||null,e.timeline||null,e.problem||null,e.solution||null,e.results?JSON.stringify(e.results):null,e.liveUrl||null,e.sort_order||0),{id:t,...e}},S=function(e){let i=m(),t=`test-${Date.now()}`;return i.prepare(`
    INSERT INTO testimonials (id, name, role, company, initials, rating, quote, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `).run(t,e.name,e.role,e.company,e.initials,e.rating,e.quote,e.sort_order||0),{id:t,...e}},L=function(e){let i=m(),t=`inq-${Date.now()}`,r=new Date().toISOString();return i.prepare(`
    INSERT INTO inquiries (id, createdAt, name, email, company, serviceType, budget, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `).run(t,r,e.name,e.email,e.company||null,e.serviceType,e.budget,e.message,"new"),{id:t,createdAt:r,name:e.name,email:e.email,company:e.company,serviceType:e.serviceType,budget:e.budget,message:e.message,status:"new"}};function O(){return u().inquiries}}};