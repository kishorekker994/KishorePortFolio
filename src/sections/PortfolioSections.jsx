import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, ArrowUp, Check, CheckCheck, ChevronDown, ChevronRight, Code2, Copy, Database, FileCode2, GitBranch, Globe2, Layers3, MapPin, Minus, MoveRight, Plane, Plus, Radio, Route, Search, ShieldCheck, Sparkles, Terminal, Users, Workflow, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { feature } from 'topojson-client';
import { airportRoute, destinations, mapPath } from '../scenes/travelMap';
import { certifications, education, experience, impact, leadership, personal, personalProjects, projects, technologies } from '../data/resume';

const chapters = [
  ['intro', 'Introduction'], ['experience', 'Experience'], ['traveltech', 'Travel technology'], ['apiflow', 'API flow'], ['pricing', 'Pricing services'], ['rapidreprice', 'Rapid Reprice'], ['impact', 'Impact'], ['technology', 'Technology'], ['architecture', 'Architecture'], ['howibuild', 'How I build'], ['leadership', 'Leadership'], ['inmotion', 'In motion'], ['beyond', 'Beyond enterprise'], ['projects', 'Selected projects'], ['contact', 'Contact'],
];

export function PortfolioNavigation() {
  const menuRef = useRef(null);
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        let current = 0;
        chapters.forEach(([id], index) => {
          if (document.getElementById(id)?.getBoundingClientRect().top <= window.innerHeight * 0.4) current = index;
        });
        setActive(current);
      });
    };
    const close = event => {
      if (event.type === 'keydown' && event.key === 'Escape') {
        if (menuRef.current?.open) { menuRef.current.open = false; menuRef.current.querySelector('summary').focus(); }
      } else if (event.type === 'pointerdown' && !menuRef.current?.contains(event.target)) menuRef.current.open = false;
    };
    window.addEventListener('scroll', update, { passive: true });
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close); };
  }, []);
  return <header className={`flight-nav ${scrolled ? 'is-scrolled' : ''}`}><nav className="folio-container flight-nav-inner" aria-label="Main navigation">
    <a className="wordmark" href="#intro" aria-label="Kishore Kumar, back to top"><span className="wordmark-symbol">k<span>.</span></span><span>KISHORE KUMAR<small>ENGINEERING IN MOTION</small></span></a>
    <div className="flight-nav-location"><span className="status-dot" /> CHENNAI, IN <span className="nav-coordinate">13.08 N / 80.27 E</span></div>
    <details className="chapter-menu" ref={menuRef}><summary><span className="chapter-current">{String(active + 1).padStart(2, '0')} / 15</span> Index <ChevronDown size={15} /></summary><div className="chapter-dropdown"><div className="dropdown-heading"><span>FLIGHT INDEX</span><span>15 CHAPTERS</span></div><div className="chapter-grid">{chapters.map(([id, label], index) => <a key={id} href={`#${id}`} aria-current={active === index ? 'location' : undefined} onClick={() => { menuRef.current.open = false; document.getElementById(id)?.focus({ preventScroll: true }); }}><span>{String(index + 1).padStart(2, '0')}</span>{label}<ArrowUpRight size={14} /></a>)}</div></div></details>
    <a href={`mailto:${personal.email}`} className="nav-contact">Let&apos;s talk <ArrowUpRight size={17} /></a>
  </nav><div className="chapter-progress" aria-hidden="true">{chapters.map(([id], index) => <span key={id} className={index <= active ? 'is-passed' : ''} />)}</div></header>;
}

function Chapter({ number, label, note }) {
  return <div className="chapter-label"><span>{number} / {label}</span><span>{note}</span></div>;
}

function Heading({ title, accent, children }) {
  return <div className="section-heading" data-reveal><h2>{title}{accent && <><br /><em>{accent}</em></>}</h2>{children && <p>{children}</p>}</div>;
}

function Section({ id, className = '', children }) {
  return <section id={id} tabIndex={-1} className={`folio-section ${className}`}><div className="folio-container">{children}</div></section>;
}

Chapter.propTypes = { number: PropTypes.string.isRequired, label: PropTypes.string.isRequired, note: PropTypes.string };
Heading.propTypes = { title: PropTypes.string.isRequired, accent: PropTypes.string, children: PropTypes.node };
Section.propTypes = { id: PropTypes.string.isRequired, className: PropTypes.string, children: PropTypes.node };

export function Intro() {
  return <section id="intro" tabIndex={-1} className="flight-hero" data-flight-from="0" data-flight-to="1">
    <div className="hero-grid" aria-hidden="true" /><div className="hero-horizon" aria-hidden="true" />
    <div className="folio-container hero-content"><div className="hero-overline"><span className="status-dot" /> TECHNICAL LEAD & JAVA BACKEND ENGINEER</div>
      <div className="hero-copy" data-depth="55"><h1>Kishore<br /><span>Kumar<span className="hero-period">.</span></span></h1><p>Engineering the systems<br />that move the world.</p><div className="hero-actions"><a className="round-link" href="#traveltech"><span><ArrowDown size={21} /></span>Explore my work</a><a className="text-link" href="#experience">11+ years of engineering <ArrowUpRight size={15} /></a></div></div>
      <div className="aircraft-caption"><span className="crosshair" aria-hidden="true" /><span>BOEING 787 / DREAMLINER<small>GLOBAL TRAVEL. CONNECTED SYSTEMS.</small></span></div>
      <div className="hero-bottom"><div><span className="folio-eyebrow">CURRENTLY</span><strong>Technical Lead at TCS</strong><span>Travelport platform services</span></div><div className="hero-bottom-coordinate"><MapPin size={15} /><span>Chennai, India<br /><small>13.08 N / 80.27 E</small></span></div><a href="#experience" className="hero-scroll" aria-label="Continue to experience"><span>01 / 15</span><ArrowDown size={18} /></a></div>
    </div>
  </section>;
}

export function Experience() {
  const [role, setRole] = useState(0);
  const roles = experience[0].roles;
  return <Section id="experience" className="experience-section"><Chapter number="02" label="THE JOURNEY" note="2015 - PRESENT" /><Heading title="Built over a decade." accent="Still moving forward.">One organization. A global travel platform. A journey from the fundamentals to leading enterprise engineering.</Heading>
    <div className="career-layout" data-reveal><div className="career-summary"><span className="career-number">11<span>+</span></span><span className="folio-eyebrow">YEARS AT TATA CONSULTANCY SERVICES</span><div className="career-client"><Globe2 size={20} /><div>Travelport, LP<small>Travel & airline technology</small></div></div></div>
      <div className="career-timeline">{roles.map((item, index) => <div key={item.title} className={`career-role ${role === index ? 'is-open' : ''}`}><button aria-expanded={role === index} aria-controls={`role-${index}`} onClick={() => setRole(role === index ? -1 : index)}><span className="career-marker" /><span className="career-date">{item.period}</span><span className="career-role-title">{item.title}<small>{item.stream}</small></span>{role === index ? <Minus size={18} /> : <Plus size={18} />}</button><div id={`role-${index}`} hidden={role !== index} className="career-description"><ul>{item.responsibilities.map(text => <li key={text}>{text}</li>)}</ul></div></div>)}</div>
    </div><div className="education-strip" data-reveal><span className="folio-eyebrow">FOUNDATION / {education.period}</span><strong>{education.degree}</strong><span>{education.college} / {education.cgpa} CGPA</span></div>
  </Section>;
}

export function TravelTech() {
  const [destination, setDestination] = useState('LHR');
  const [land, setLand] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/models/world-land.json', { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Map unavailable');
      return response.json();
    }).then(topology => setLand(mapPath(feature(topology, topology.objects.land)))).catch(() => {});
    return () => controller.abort();
  }, []);
  const selected = destinations.find(item => item.code === destination);
  return <Section id="traveltech" className="travel-section"><Chapter number="03" label="DOMAIN EXPERTISE" note="CONNECTED BY CODE" /><Heading title="The world is connected." accent="So is the backend.">Travel technology is more than a booking. It is the orchestration of integrations, pricing, rules, and reliable delivery.</Heading>
    <div className="travel-map" data-reveal><div className="map-header"><span><Radio size={15} /> TRAVEL NETWORK</span><label className="select-control">Destination <select value={destination} onChange={event => setDestination(event.target.value)}>{destinations.filter(item => item.code !== 'MAA').map(item => <option key={item.code} value={item.code}>{item.name} / {item.code}</option>)}</select><ChevronDown size={14} /></label></div>
      <div className="map-surface"><div className="map-grid" aria-hidden="true" />
        <svg className="route-overlay" viewBox="0 0 1000 500" preserveAspectRatio="none" role="img" aria-label={`World map showing the route from Chennai to ${selected.name}`}><path className="map-land" d={land} /><path key={destination} className="map-route" d={airportRoute(selected)} /></svg>
        {destinations.map(item => <div key={item.code} data-airport={item.code} className={`map-city ${item.code === destination || item.code === 'MAA' ? 'is-selected' : ''}`} style={{ left: `${item.x}%`, top: `${item.y}%` }}><span /><div className="map-city-label"><strong>{item.code}</strong><small>{item.name}</small></div></div>)}
      </div>
      <div className="map-route-label"><span className="folio-eyebrow">ILLUSTRATIVE NETWORK ROUTE</span><strong>MAA <MoveRight size={30} /> {destination}</strong><span>Chennai to {selected.name}</span></div>
      <div className="domain-services">{projects.map((project, index) => <a key={project.id} href={`#${['apiflow', 'pricing', 'rapidreprice'][index]}`}><span>0{index + 1}</span><div><strong>{project.name}</strong><small>{project.years} / {project.streams}</small></div><ArrowUpRight size={20} /></a>)}</div>
    </div>
  </Section>;
}

const fareLayers = [
  ['Fare calculation', 'Base fare and taxes', 'Establish the fare foundation and compute the applicable taxes.'], ['Rule engine', 'Conditions and restrictions', 'Evaluate fare conditions and restrictions for the selected itinerary.'], ['Surcharges', 'Carrier and airport fees', 'Account for applicable carrier, fuel and airport-related surcharges.'], ['Commission', 'Agency and markup logic', 'Apply agency-specific commission and markup logic.'], ['Availability', 'Class and inventory', 'Validate the requested booking class against available inventory.'], ['Final price', 'Structured fare response', 'Assemble the pricing result for the consuming service.'],
];

export function Pricing() {
  const [active, setActive] = useState(0);
  return <Section id="pricing" className="pricing-section"><Chapter number="05" label="PRICING PLATFORM" note="3 YEARS / AD + MPS" /><Heading title="Every fare has a story." accent="Every rule matters.">Backend pricing services, SQL troubleshooting, service testing and application support for Travelport.</Heading>
    <div className="fare-layout" data-reveal><div className="fare-ticket" data-depth="25"><div className="ticket-head"><Plane size={23} /><span>PRICING WORKSHEET<small>PLATFORM SERVICES</small></span><span className="ticket-stamp">JAVA</span></div><div className="ticket-route"><div><strong>MAA</strong><span>CHENNAI</span></div><div className="ticket-route-line"><Plane size={21} /></div><div><strong>LHR</strong><span>LONDON</span></div></div><div className="ticket-perforation" /><div className="ticket-body"><span className="folio-eyebrow">LAYER 0{active + 1} / 06</span><h3>{fareLayers[active][0]}</h3><p>{fareLayers[active][2]}</p><div className="ticket-code"><span>SOAP / XML</span><span>ILLUSTRATIVE WORKFLOW</span></div><div className="ticket-barcode" aria-hidden="true" /></div></div>
      <div className="fare-steps">{fareLayers.map(([title, subtitle], index) => <button key={title} className={active === index ? 'is-active' : ''} aria-pressed={active === index} onClick={() => setActive(index)}><span>0{index + 1}</span><div><strong>{title}</strong><small>{subtitle}</small></div><ArrowUpRight size={20} /></button>)}</div>
    </div>
  </Section>;
}

const repriceModes = {
  Date: ['Travel date revised', 'Check fare validity', 'Re-evaluate fare difference', 'Return revised itinerary'],
  Route: ['Itinerary revised', 'Validate new route', 'Apply relevant fare rules', 'Return revised itinerary'],
  Cabin: ['Booking class revised', 'Check class availability', 'Recalculate applicable fare', 'Return revised itinerary'],
};

export function RapidReprice() {
  const [mode, setMode] = useState('Date');
  return <Section id="rapidreprice" className="reprice-section"><Chapter number="06" label="RAPID REPRICE" note="4 YEARS / DOMAIN DEPTH" /><Heading title="Plans change." accent="Systems adapt.">The complexity behind a simple change of plans. Reprice workflows, integration testing, defect analysis and release support.</Heading>
    <div className="reprice-board" data-reveal><div className="reprice-top"><span className="folio-eyebrow">ITINERARY CHANGE / ILLUSTRATIVE WORKFLOW</span><div className="segmented-control" role="group" aria-label="Itinerary change type">{Object.keys(repriceModes).map(item => <button key={item} aria-pressed={mode === item} onClick={() => setMode(item)}>{item}</button>)}</div></div><div className="reprice-journey"><div className="itinerary-state"><span className="folio-eyebrow">ORIGINAL BOOKING</span><strong>MAA <ArrowRight size={24} /> LHR</strong><span>Confirmed itinerary</span><div className="itinerary-lines" aria-hidden="true"><span /><span /><span /></div></div><div className="reprice-transfer"><Route size={32} /><span>{mode.toUpperCase()} CHANGE</span><div className="transfer-line" /></div><div className="itinerary-state revised" key={mode}><span className="folio-eyebrow">REVISED BOOKING</span><strong>MAA <ArrowRight size={24} /> {mode === 'Route' ? 'DXB' : 'LHR'}</strong><span>{mode === 'Date' ? 'Updated travel date' : mode === 'Route' ? 'Updated destination' : 'Updated cabin class'}</span><div className="itinerary-lines" aria-hidden="true"><span /><span /><span /></div></div></div><ol className="reprice-checks">{repriceModes[mode].map((text, index) => <li key={text}><span>0{index + 1}</span><Check size={16} />{text}</li>)}</ol></div>
    <div className="expertise-strip"><span><Workflow size={18} /> Reprice workflows</span><span><ShieldCheck size={18} /> SOAP UI validation</span><span><GitBranch size={18} /> Release support</span></div>
  </Section>;
}

export function Impact() {
  return <Section id="impact" className="impact-section"><Chapter number="07" label="MEASURABLE IMPACT" note="PRODUCTION SUPPORT" /><div className="impact-layout"><div data-reveal><span className="impact-number"><span data-count="80">80</span><span>%</span></span><h2>Less backlog.<br /><em>More momentum.</em></h2><p>{impact.description}</p><span className="impact-source">TRAVELPORT / MAINTENANCE & PRODUCTION SUPPORT</span></div><div className="impact-chart" data-reveal><div className="chart-caption"><span>BACKLOG INDEX</span><span>BASELINE = 100</span></div><div className="chart-grid"><div className="impact-bar before"><span>100</span><div /><small>BEFORE</small></div><div className="impact-chart-arrow"><ArrowDown size={28} /><span>-80%</span></div><div className="impact-bar after"><span>20</span><div data-grow /><small>AFTER</small></div></div><p>Relative index illustrating the reported 80% reduction.</p><div className="impact-method"><span>01 / Triage</span><span>02 / Prioritize</span><span>03 / Resolve</span></div></div></div></Section>;
}

const technologyGroups = { JAVA: 'Backend', 'Spring Boot': 'Backend', SOAP: 'Integration', XML: 'Integration', SQL: 'Data', Maven: 'Delivery', Jenkins: 'Delivery', GitHub: 'Delivery', 'GitHub Actions': 'Delivery', JIRA: 'Delivery', JavaScript: 'Frontend', 'HTML/CSS': 'Frontend', 'SOAP UI': 'Integration', 'AI Tools': 'Tools' };
const technologyDetails = { JAVA: 'The foundation of enterprise backend services, domain logic and platform integrations.', 'Spring Boot': 'Service development and backend application architecture for travel technology.', SOAP: 'Structured service integration across platform and vendor systems.', XML: 'Message schemas and payloads for enterprise service contracts.', SQL: 'Queries, reporting, troubleshooting and data access optimization.', Maven: 'Dependency management and repeatable application builds.', Jenkins: 'Build automation and continuous delivery pipelines.', GitHub: 'Source control, collaboration and code review.', 'GitHub Actions': 'Workflow automation for build and delivery.', JIRA: 'Sprint planning, delivery tracking and issue coordination.', JavaScript: 'Interactive web applications and independent product development.', 'HTML/CSS': 'Responsive interfaces and accessible web foundations.', 'SOAP UI': 'Integration testing and SOAP service validation.', 'AI Tools': 'AI-assisted development and experimentation with engineering workflows.' };
const groupIcons = { Backend: Terminal, Integration: Workflow, Data: Database, Delivery: GitBranch, Frontend: Code2, Tools: Sparkles };

const technologyContexts = {
  Backend: ['REQUEST', 'RESPONSE'],
  Integration: ['CLIENT', 'SERVICE'],
  Data: ['QUERY', 'RESULT'],
  Delivery: ['SOURCE', 'RELEASE'],
  Frontend: ['INPUT', 'INTERFACE'],
  Tools: ['IDEA', 'ITERATION'],
};

function TechnologySignal({ name }) {
  const category = technologyGroups[name];
  const [input, output] = technologyContexts[category];
  const Icon = groupIcons[category];
  return <div className="technology-signal" aria-label={`${name}: ${input.toLowerCase()} to ${output.toLowerCase()}`}>
    <span className="signal-label signal-label-input">{input}</span>
    <span className="signal-endpoint signal-endpoint-input"><span /></span>
    <div className="signal-track signal-track-input" aria-hidden="true"><span /></div>
    <div className="signal-core"><Icon size={28} strokeWidth={1.4} /></div>
    <div className="signal-track signal-track-output" aria-hidden="true"><span /></div>
    <span className="signal-endpoint signal-endpoint-output"><span /></span>
    <span className="signal-label signal-label-output">{output}</span>
    <span className="signal-category">{category.toUpperCase()}</span>
  </div>;
}

TechnologySignal.propTypes = { name: PropTypes.string.isRequired };

export function Technology() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('JAVA');
  const filtered = technologies.filter(item => (category === 'All' || technologyGroups[item.name] === category) && item.name.toLowerCase().includes(query.toLowerCase()));
  return <Section id="technology" className="technology-section"><Chapter number="08" label="THE TOOLKIT" note="BUILT FOR THE WORK" /><Heading title="A considered stack." accent="Not a collection of logos.">Tools chosen for the problem, from Java services and structured integrations to automated delivery and independent web products.</Heading>
    <div className="technology-toolbar"><div className="filter-tabs" role="group" aria-label="Technology category">{['All', 'Backend', 'Integration', 'Data', 'Delivery', 'Frontend', 'Tools'].map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="technology-search"><Search size={16} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a technology" aria-label="Find a technology" /></label></div>
    <div className="technology-explorer" data-reveal><div className="technology-grid">{filtered.map(item => { const Icon = groupIcons[technologyGroups[item.name]]; return <button key={item.name} className={`technology-item ${selected === item.name ? 'is-selected' : ''}`} aria-pressed={selected === item.name} onClick={() => setSelected(item.name)}><Icon size={23} strokeWidth={1.5} /><span><strong>{item.name}</strong><small>{technologyGroups[item.name]}</small></span><ArrowUpRight size={15} /></button>; })}{!filtered.length && <div className="technology-empty"><Search size={24} /><p>No technologies match &quot;{query}&quot;.</p><button className="text-link" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters <X size={16} /></button></div>}</div><aside className="technology-inspector"><div className="inspector-top"><span>STACK / DETAILS</span><span className="status-dot" /></div><TechnologySignal name={selected} /><span className="folio-eyebrow">{technologyGroups[selected]}</span><h3>{selected}</h3><p>{technologyDetails[selected]}</p><div className="inspector-footer"><span>{selected === 'JAVA' ? 'CORE LANGUAGE' : 'ENGINEERING TOOLKIT'}</span><ArrowUpRight size={18} /></div></aside></div>
    <div className="certification-row">{certifications.map(item => <div key={item.name}><ShieldCheck size={20} /><span>{item.name}<small>{item.date}</small></span><Check size={16} /></div>)}</div>
  </Section>;
}

const architectureLayers = [
  { title: 'Client layer', tag: 'EXPERIENCE', icon: Globe2, detail: 'Travel portals and GDS consumers initiate requests through a clear service contract.', tech: 'Travel portal / GDS consumer' },
  { title: 'Service layer', tag: 'ORCHESTRATION', icon: Layers3, detail: 'Spring Boot services coordinate requests and define cohesive application responsibilities.', tech: 'Java / Spring Boot' },
  { title: 'Business logic', tag: 'DOMAIN', icon: Workflow, detail: 'Pricing, repricing and fare rules are expressed separately from transport and persistence.', tech: 'Pricing / Reprice / Rules' },
  { title: 'Integration layer', tag: 'CONNECTIVITY', icon: GitBranch, detail: 'SOAP and XML connect platform and vendor APIs through structured messages.', tech: 'SOAP / XML / Vendor APIs' },
  { title: 'Database layer', tag: 'PERSISTENCE', icon: Database, detail: 'SQL data access supports services, reporting and production troubleshooting.', tech: 'SQL / Data access / Reporting' },
];

export function Architecture() {
  const [active, setActive] = useState(1);
  const selected = architectureLayers[active];
  const Icon = selected.icon;
  return <Section id="architecture" className="architecture-section"><Chapter number="09" label="SYSTEMS THINKING" note="SEPARATION OF CONCERNS" /><Heading title="Complex systems." accent="Clear boundaries.">A layered view of enterprise travel architecture. Each responsibility has its place, and every connection has a contract.</Heading><div className="architecture-layout" data-reveal><div className="architecture-diagram">{architectureLayers.map((item, index) => { const LayerIcon = item.icon; return <button key={item.title} className={`architecture-slab ${active === index ? 'is-active' : ''}`} aria-pressed={active === index} onClick={() => setActive(index)} style={{ '--layer': index }}><span>0{index + 1}</span><LayerIcon size={22} /><strong>{item.title}</strong><small>{item.tag}</small><ChevronRight size={18} /></button>; })}<span className="architecture-baseline">REQUEST / PROCESS / RESPOND</span></div><div className="architecture-note" key={selected.title}><Icon size={40} strokeWidth={1.3} /><span className="folio-eyebrow">BOUNDARY 0{active + 1}</span><h3>{selected.title}</h3><p>{selected.detail}</p><span className="architecture-tech">{selected.tech}</span><div className="architecture-principles"><span><Check size={14} /> Clear ownership</span><span><Check size={14} /> Testable responsibilities</span><span><Check size={14} /> Explicit contracts</span></div></div></div></Section>;
}

const buildStages = [
  { title: 'Discover', subtitle: 'Start with the right questions.', icon: Search, detail: 'Understand the travel domain, business rules, integration contracts and production constraints before writing code.', tags: ['Domain context', 'SOAP / XML contracts', 'Business rules'] },
  { title: 'Design', subtitle: 'Make the boundaries clear.', icon: Layers3, detail: 'Shape Java backend services around coherent responsibilities, explicit interfaces and the behavior the system needs to support.', tags: ['Service architecture', 'Data flows', 'Failure scenarios'] },
  { title: 'Build', subtitle: 'Turn decisions into working systems.', icon: Code2, detail: 'Implement and integrate services, review changes with the team, validate workflows and automate repeatable builds.', tags: ['Java / Spring Boot', 'SOAP UI', 'Maven / Jenkins'] },
  { title: 'Deliver', subtitle: 'Own the journey into production.', icon: GitBranch, detail: 'Coordinate releases, support QA and regression validation, and close the loop through production support and stakeholder feedback.', tags: ['Release support', 'Quality assurance', 'Team coordination'] },
];

export function HowIBuild() {
  return <Section id="howibuild" className="build-section"><Chapter number="10" label="THE PROCESS" note="INTENT TO IMPLEMENTATION" /><div className="build-layout"><div className="build-intro"><span className="folio-eyebrow">FOUR PHASES. ONE STANDARD.</span><h2>Good systems<br />start with<br /><em>good decisions.</em></h2><p>Engineering is a sequence of deliberate choices. Here is how I move from a problem to a production-ready solution.</p><div className="build-orbit" aria-hidden="true"><span /><span /><Code2 size={38} strokeWidth={1} /></div></div><div className="build-stages">{buildStages.map((stage, index) => { const Icon = stage.icon; return <article className="build-step" key={stage.title} data-reveal><div className="build-step-top"><span>PHASE 0{index + 1}</span><Icon size={24} strokeWidth={1.5} /></div><h3>{stage.title}<span>.</span></h3><strong>{stage.subtitle}</strong><p>{stage.detail}</p><div className="build-step-tags">{stage.tags.map(tag => <span key={tag}>{tag}</span>)}</div></article>; })}</div></div></Section>;
}

export function Leadership() {
  const [open, setOpen] = useState(0);
  const icons = [Users, Globe2, FileCode2, ShieldCheck, GitBranch, Workflow, RouteIcon, Layers3];
  return <Section id="leadership" className="leadership-section"><Chapter number="11" label="PEOPLE & PRACTICE" note="BEYOND THE CODE" /><Heading title="Lead the work." accent="Lift the team.">Technical leadership lives in the everyday: a thoughtful code review, a clear customer conversation, a well-coordinated release.</Heading><div className="leadership-layout"><div className="leadership-statement" data-depth="30"><Users size={40} strokeWidth={1} /><p>Strong engineering<br />is a <em>team sport.</em></p><span>TECHNICAL LEAD / SCRUM MASTER</span></div><div className="leadership-list">{leadership.map((item, index) => { const Icon = icons[index]; return <div key={item.label} className={`leadership-item ${open === index ? 'is-open' : ''}`}><button aria-expanded={open === index} aria-controls={`lead-detail-${index}`} onClick={() => setOpen(open === index ? -1 : index)}><span>0{index + 1}</span><Icon size={18} /><strong>{item.label.toLowerCase()}</strong>{open === index ? <Minus size={17} /> : <Plus size={17} />}</button><p id={`lead-detail-${index}`} hidden={open !== index}>{item.desc}</p></div>; })}</div></div></Section>;
}

function RouteIcon(props) { return <Workflow {...props} />; }

export function InMotion() {
  return <section id="inmotion" tabIndex={-1} className="motion-section" data-flight-from="4" data-flight-to="5"><div className="folio-container"><Chapter number="12" label="ENGINEERING IN MOTION" note="04 / CRUISE" /><div className="motion-type" data-depth="75"><span>Built to</span><h2>move<span>.</span></h2></div><div className="motion-footer"><span>FROM A SINGLE REQUEST<br />TO CONNECTED TRAVEL SYSTEMS.</span><span>JAVA / TRAVEL / ENGINEERING</span></div></div><div className="motion-rules" aria-hidden="true"><span /><span /><span /></div></section>;
}

export function BeyondEnterprise() {
  return <Section id="beyond" className="beyond-section"><Chapter number="13" label="THE INDEPENDENT SIDE" note="CURIOSITY, IN PRACTICE" /><div className="beyond-layout"><div data-reveal><h2>Enterprise discipline.<br /><em>Independent spirit.</em></h2><p>Outside the Travelport platform, I conceptualize, design and build full-stack web applications, exploring modern tools and AI-assisted engineering workflows.</p><a href="#projects" className="round-link"><span><ArrowDown size={20} /></span>Independent projects</a></div><div className="experiment-board" data-reveal><div className="experiment-top"><Terminal size={18} /><span>PERSONAL WORKSPACE</span><span className="status-dot" /></div><div className="experiment-line"><span>01</span><strong>Build<span>_</span></strong><small>Turn an idea into a working product.</small></div><div className="experiment-line"><span>02</span><strong>Explore<span>_</span></strong><small>Question assumptions. Try new tools.</small></div><div className="experiment-line"><span>03</span><strong>Ship<span>_</span></strong><small>Make something people can use.</small></div><div className="experiment-bottom"><Sparkles size={15} /> AI-ASSISTED. ENGINEER-LED.</div></div></div></Section>;
}

const projectAssets = [
  { image: '/projects/fusion-website.webp', alt: 'Fusion Elevators and Escalators website showing its elevator presentation, product navigation and consultation enquiry', imageNote: 'FEATURED PROJECT / WEBSITE SCREENSHOT', category: 'Websites', tone: 'fusion', linkLabel: 'Product & service pages', features: ['Product and service presentation', 'Responsive layouts', 'Contact and enquiry section'] },
  { image: '/projects/route54-dashboard.webp', alt: 'Route54 restaurant admin dashboard showing active orders, menu items and cooking status', imageNote: 'ORDER MANAGEMENT / APP SCREENSHOT', category: 'Applications', tone: 'route54', linkLabel: 'A complete ordering journey', features: ['Menu browsing', 'Shopping cart and checkout', 'Order placement workflow'] },
  { image: '/projects/kasuflow-dashboard.webp', alt: 'KasuFlow dashboard with fictional sample balances, activity counts and insurance details', imageNote: 'DASHBOARD / SAMPLE DATA', category: 'Applications', tone: 'finance', linkLabel: <a href="https://finsync-app-2gcy.onrender.com/dashboard" target="_blank" rel="noopener noreferrer">Visit KasuFlow <ArrowUpRight size={14} aria-hidden="true" /></a>, features: ['Income and expense records', 'Personal budget management', 'Category summaries and dashboards'] },
];

export function Projects() {
  const [filter, setFilter] = useState('All work');
  const [expanded, setExpanded] = useState(null);
  return <Section id="projects" className="projects-section"><Chapter number="14" label="SELECTED PROJECTS" note="IDEAS MADE TANGIBLE" /><Heading title="Beyond the day job." accent="Into the real world.">Independent projects across corporate websites, commerce and personal finance. Different problems, the same attention to the details.</Heading><div className="project-filter"><div className="filter-tabs" role="group" aria-label="Project category">{['All work', 'Websites', 'Applications'].map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="folio-eyebrow">{personalProjects.filter((item, index) => filter === 'All work' || projectAssets[index].category === filter).length} PROJECTS</span></div><div className="project-gallery">{personalProjects.map((project, index) => { const asset = projectAssets[index]; if (filter !== 'All work' && asset.category !== filter) return null; return <article key={project.name} className={`project-showcase ${asset.tone}`}><button className="project-cover" aria-label={`${expanded === index ? 'Close' : 'View'} ${project.name} project details`} aria-expanded={expanded === index} aria-controls={`project-details-${index}`} onClick={() => setExpanded(expanded === index ? null : index)}><img src={asset.image} alt={asset.alt} loading="lazy" /><span className="project-cover-top"><span>0{index + 1} / INDEPENDENT PROJECT</span><span className="project-open-icon">{expanded === index ? <Minus size={22} /> : <ArrowUpRight size={22} />}</span></span><span className="project-cover-name">{project.name}<small>{project.subtitle}</small></span><span className="project-image-note">{asset.imageNote ?? 'CONCEPT IMAGERY'}</span></button><div className="project-meta"><span>{project.type}</span><span>{asset.linkLabel}</span></div><div className="project-details" id={`project-details-${index}`} hidden={expanded !== index}><p>{project.description}</p><ul>{asset.features.map(feature => <li key={feature}><Check size={14} />{feature}</li>)}</ul></div></article>; })}</div></Section>;
}

export function Contact() {
  const [copyState, setCopyState] = useState('idle');
  const copyTimer = useRef();
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  const copyEmail = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(personal.email);
      setCopyState('copied');
    } catch {
      setCopyState('unavailable');
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState('idle'), 5000);
  };
  return <footer id="contact" tabIndex={-1} className="contact-section"><div className="folio-container"><Chapter number="15" label="NEXT DESTINATION" note="LET'S MAKE IT MEANINGFUL" /><div className="contact-heading" data-reveal><h2>Great work starts<br />with a <em>conversation.</em></h2><a className="contact-arrow" href={`mailto:${personal.email}`} aria-label="Email Kishore Kumar"><ArrowUpRight size={64} strokeWidth={1} /></a></div><div className="contact-links"><div><span className="folio-eyebrow">EMAIL</span><div className="email-row"><a href={`mailto:${personal.email}`}>{personal.email}</a><button className="circle-command" title="Copy email address" aria-label="Copy email address" onClick={copyEmail}>{copyState === 'copied' ? <CheckCheck size={18} /> : <Copy size={18} />}</button></div><span className="copy-status" role="status">{copyState === 'copied' ? 'Email copied.' : copyState === 'unavailable' ? 'Clipboard is unavailable on this connection. Select the email to copy, or open it in your email app.' : ''}</span></div><div><span className="folio-eyebrow">PHONE</span><a href={`tel:${personal.phone.replaceAll(' ', '')}`}>{personal.phone}</a></div><div><span className="folio-eyebrow">BASED IN</span><span>Chennai, India</span></div></div><div className="footer-bottom"><a className="footer-signature" href="#intro">Kishore Kumar<span>.</span></a><span>JAVA BACKEND ENGINEER / TECHNICAL LEAD</span><a href="#intro" className="text-link">Back to top <ArrowUp size={16} /></a></div></div></footer>;
}