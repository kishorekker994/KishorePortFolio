import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HowIBuild.css';

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    phase: '01',
    word: 'DISCOVER',
    role: 'DOMAIN & CONSTRAINTS',
    desc: 'Understanding the travel domain architecture — Travelport platform rules, airline business rules, SOAP schema contracts, and legacy mainframe transaction boundaries before writing code.',
    color: '#0B308A',
    tags: ['Travelport Platform', 'SOAP / XML Contracts', 'Airline Business Rules', 'Legacy Mainframes'],
  },
  {
    phase: '02',
    word: 'DESIGN',
    role: 'SYSTEM ARCHITECTURE',
    desc: 'Architecting resilient Java backend services, Spring Boot microservices, high-concurrency XML parsers, and deterministic state machines for complex airline ticket modifications.',
    color: '#F47A24',
    tags: ['Java Backend', 'Spring Boot Microservices', 'High-Concurrency XML', 'State Machines'],
  },
  {
    phase: '03',
    word: 'BUILD',
    role: 'ENGINEERING EXECUTION',
    desc: 'Implementing enterprise-grade backend systems — Rapid Reprice pricing engine, automated test suites, multi-threaded request pipelines, and automated Jenkins CI/CD pipelines.',
    color: '#0B308A',
    tags: ['Rapid Reprice Core', 'SOAP / REST Services', 'Jenkins CI/CD', 'Automated Testing'],
  },
  {
    phase: '04',
    word: 'DELIVER',
    role: 'RELEASE & STABILIZATION',
    desc: 'Production release, QA regression validation, rigorous code reviews, stakeholder coordination, and 24/7 SLA stabilization across Agile sprint cycles.',
    color: '#F47A24',
    tags: ['Global Airline Scale', 'Production QA', '24/7 SLA Defense', 'Agile Delivery'],
  },
];

export default function HowIBuild() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pinned depth-scrolling timeline: 6000px scroll space provides ~5 deliberate scrolls between phases
      const tl = gsap.timeline();
      
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=6000',
        pin: true,
        animation: tl,
        scrub: 1,
      });

      // Card 0 (DISCOVER) is visible initially in CSS.
      // After ~5 scrolls: Card 1 (DESIGN) animates in
      tl.fromTo('.hib__stage-1',
        { opacity: 0, y: 60, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        0.28
      );

      // After next ~5 scrolls: Card 2 (BUILD) animates in
      tl.fromTo('.hib__stage-2',
        { opacity: 0, y: 60, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        0.58
      );

      // After next ~5 scrolls: Card 3 (DELIVER) animates in
      tl.fromTo('.hib__stage-3',
        { opacity: 0, y: 60, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        0.84
      );

      // Subtle parallax response as subsequent cards arrive
      tl.to('.hib__stage-0', { y: -6, duration: 0.5 }, 0.32)
        .to('.hib__stage-1', { y: -6, duration: 0.5 }, 0.62);

      // Hold all 4 cards completed on screen before unpinning
      tl.to({}, { duration: 0.4 }, 0.96);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="howibuild" className="hib">
      <div className="container hib__container">
        <div className="hib__header">
          <div className="section-number">HOW I BUILD</div>
          <h2 className="hib__headline display-lg">
            SYSTEMATIC ARCHITECTURE
          </h2>
        </div>

        {/* 4 Cards Grid Stage */}
        <div className="hib__parallax-stage">
          {stages.map((s, i) => (
            <div
              key={s.phase}
              className={`hib__stage hib__stage-${i} ${i === 0 ? 'hib__stage--initial' : ''}`}
            >
              <div className="hib__stage-line" style={{ background: s.color }} />

              <div className="hib__stage-top">
                <span className="label" style={{ color: s.color, fontWeight: 800 }}>
                  PHASE {s.phase} · {s.role}
                </span>
              </div>

              <h3 className="hib__stage-word display-md" style={{ color: s.color }}>
                {s.word}
              </h3>

              <p className="hib__stage-desc body-text">{s.desc}</p>

              <div className="hib__stage-tags">
                {s.tags.map((t, idx) => (
                  <span key={idx} className="hib__stage-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
