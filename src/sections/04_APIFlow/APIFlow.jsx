import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './APIFlow.css';

gsap.registerPlugin(ScrollTrigger);

const layers = [
  { label: 'CLIENT', sub: 'TRAVEL AGENT / PORTAL', icon: '◈' },
  { label: 'API GATEWAY', sub: 'UNIVERSAL API (UAPI)', icon: '⬡' },
  { label: 'SERVICE LAYER', sub: 'SPRING BOOT SERVICES', icon: '◈' },
  { label: 'BUSINESS LOGIC', sub: 'PRICING · REPRICE · RULES', icon: '⬡' },
  { label: 'DATABASE', sub: 'SQL · DATA ACCESS LAYER', icon: '◈' },
  { label: 'RESPONSE', sub: 'XML · SOAP · JSON', icon: '⬡' },
];

export default function APIFlow() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.api__headline', { x: -40, opacity: 0 }, {
      x: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    gsap.fromTo('.api__layer', { x: 30, opacity: 0 }, {
      x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
    });

    gsap.fromTo('.api__connector', { scaleY: 0 }, {
      scaleY: 1, duration: 0.35, stagger: 0.08, ease: 'power2.out', transformOrigin: 'top',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
    });

    // Data packet animation
    gsap.fromTo('.api__packet', {
      y: -10, opacity: 0,
    }, {
      y: '100vh', opacity: [0, 1, 1, 0],
      duration: 2, stagger: { each: 0.5, repeat: -1 },
      ease: 'none',
    });
  }, []);

  return (
    <section ref={sectionRef} id="apiflow" className="api section">
      <div className="container">
        <div className="section-number">API FLOW</div>

        <div className="api__layout">
          <div className="api__text">
            <h2 className="api__headline display-lg">
              API<br />FLOW
            </h2>
            <p className="body-text" style={{ opacity: 0.6, maxWidth: 280 }}>
              Enterprise-grade integration architecture powering global travel platform communication.
            </p>
            <div className="api__tech-tags">
              {['SOAP', 'XML', 'Spring Boot', 'SOAP UI', 'SQL'].map(t => (
                <span key={t} className="api__tag label">{t}</span>
              ))}
            </div>
          </div>

          <div className="api__pipeline">
            {layers.map((l, i) => (
              <div key={i}>
                <div className="api__layer card">
                  <div className="api__layer-icon">{l.icon}</div>
                  <div className="api__layer-content">
                    <div className="api__layer-label display-sm">{l.label}</div>
                    <div className="label" style={{ opacity: 0.5, marginTop: '0.2rem' }}>{l.sub}</div>
                  </div>
                  <div className="api__layer-num label">{String(i + 1).padStart(2, '0')}</div>
                </div>
                {i < layers.length - 1 && (
                  <div className="api__connector">
                    <div className="api__connector-line" />
                    <div className="api__packet" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
