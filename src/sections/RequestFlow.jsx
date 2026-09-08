import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Database, Globe2, Layers3, Play, RotateCcw, Route, ShieldCheck } from 'lucide-react';

const stages = [
  { name: 'Client', kind: 'TRAVEL PORTAL', icon: Globe2, title: 'One request. A world of possibilities.', detail: 'A travel agent submits an itinerary through the booking portal. Structured inputs begin the journey through the platform.', code: '<AirPriceRequest>\n  <Origin>MAA</Origin>\n  <Destination>LHR</Destination>\n  <Cabin>Economy</Cabin>\n</AirPriceRequest>' },
  { name: 'API gateway', kind: 'UNIVERSAL API', icon: ShieldCheck, title: 'A consistent entry point.', detail: 'Universal API connects the travel portal to backend services, with structured XML messages across platform and vendor systems.', code: '<UniversalAPI>\n  <Service>AirPrice</Service>\n  <Protocol>SOAP</Protocol>\n  <Payload>AirPriceRequest</Payload>\n</UniversalAPI>' },
  { name: 'Service layer', kind: 'SPRING BOOT', icon: Layers3, title: 'Orchestrated, not entangled.', detail: 'Java and Spring Boot services coordinate integrations and keep service responsibilities clear and testable.', code: 'AirPriceService\n  -> validate(request)\n  -> resolveItinerary(request)\n  -> pricingService.calculate()\n  -> assembleResponse()' },
  { name: 'Business rules', kind: 'PRICING ENGINE', icon: Route, title: 'Travel complexity, made explicit.', detail: 'Pricing and repricing workflows apply the relevant rules to the itinerary, keeping business logic separate from transport and data access.', code: 'Pricing workflow\n  > Resolve fare conditions\n  > Evaluate itinerary changes\n  > Apply applicable rules\n  > Build pricing result' },
  { name: 'Data access', kind: 'SQL', icon: Database, title: 'The right data. In context.', detail: 'The data access layer supports SQL queries, troubleshooting and reporting for the pricing and travel platform services.', code: 'Data access\n  > Retrieve itinerary context\n  > Query pricing records\n  > Map service data\n  > Return structured result' },
  { name: 'Response', kind: 'XML / SOAP', icon: Check, title: 'Ready for the next decision.', detail: 'The result returns as a structured response, completing the integration journey back to the travel portal.', code: '<AirPriceResponse>\n  <Itinerary>MAA - LHR</Itinerary>\n  <Result>Pricing solution</Result>\n  <Status>Complete</Status>\n</AirPriceResponse>' },
];

export default function RequestFlow() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const sectionRef = useRef(null);
  const selected = stages[active];

  useEffect(() => {
    if (!running || active === stages.length - 1) return;
    const timer = setTimeout(() => setActive(value => value + 1), 1100);
    return () => clearTimeout(timer);
  }, [active, running]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setRunning(false);
    });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const completed = running && active === stages.length - 1;

  return (
    <section ref={sectionRef} id="apiflow" className="folio-section request-section" aria-labelledby="request-title">
      <div className="folio-container">
        <div className="chapter-label"><span>04 / CONNECTIVITY</span><span>REQUEST TO RESPONSE</span></div>
        <div className="section-heading" data-reveal>
          <h2 id="request-title">Behind every booking.<br /><em>A connected system.</em></h2>
          <p>Enterprise integrations, from the first API call to the final response. Java services that keep travel moving.</p>
        </div>
        <div className="request-console" data-reveal>
          <div className="request-toolbar">
            <span><span className="status-dot" /> UAPI / AIR PRICING</span><span className="request-demo">ILLUSTRATIVE REQUEST</span>
            <button className="icon-command" aria-label={completed ? 'Replay request' : running ? 'Reset request' : 'Run request'} onClick={() => { setActive(0); setRunning(!running || completed); }}>{running ? <RotateCcw size={17} /> : <Play size={17} />}<span>{completed ? 'Replay' : running ? 'Reset' : 'Run request'}</span></button>
          </div>
          <div className="request-path" role="tablist" aria-label="Request stages">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return <button key={stage.name} role="tab" id={`request-tab-${index}`} aria-selected={active === index} aria-controls="request-detail" tabIndex={active === index ? 0 : -1} className={`request-stop ${active === index ? 'is-active' : ''} ${index < active ? 'is-complete' : ''}`} onClick={() => { setActive(index); setRunning(false); }} onKeyDown={event => {
                const next = event.key === 'ArrowRight' ? (index + 1) % stages.length : event.key === 'ArrowLeft' ? (index + stages.length - 1) % stages.length : event.key === 'Home' ? 0 : event.key === 'End' ? stages.length - 1 : null;
                if (next !== null) { event.preventDefault(); setRunning(false); setActive(next); document.getElementById(`request-tab-${next}`).focus(); }
              }}><span className="request-stop-number">0{index + 1}</span><span className="request-stop-icon"><Icon size={23} strokeWidth={1.5} /></span><strong>{stage.name}</strong><small>{stage.kind}</small></button>;
            })}
          </div>
          <div id="request-detail" role="tabpanel" aria-labelledby={`request-tab-${active}`} className="request-detail" tabIndex={0}>
            <div className="request-explanation" key={selected.name}><span className="folio-eyebrow">STAGE 0{active + 1} / 06</span><h3>{selected.title}</h3><p>{selected.detail}</p><span className="request-stack">SOAP <span>/</span> XML <span>/</span> Spring Boot <ArrowUpRight size={16} /></span></div>
            <div className="request-payload"><div><span>MESSAGE PREVIEW</span><span>EXAMPLE</span></div><pre><code>{selected.code}</code></pre></div>
          </div>
          <div className="request-status" role="status"><span>{completed ? 'Response received' : running ? `Processing: ${selected.name}` : `Inspecting: ${selected.name}`}</span><span>JAVA BACKEND / TRAVELPORT</span></div>
        </div>
      </div>
    </section>
  );
}