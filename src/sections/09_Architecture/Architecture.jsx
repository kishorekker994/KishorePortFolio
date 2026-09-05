import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Architecture.css';

gsap.registerPlugin(ScrollTrigger);

const layers = [
  { label: 'CLIENT LAYER', desc: 'Travel portal / GDS consumer', z: 5, y: 0 },
  { label: 'SERVICE LAYER', desc: 'Spring Boot microservices', z: 4, y: 60 },
  { label: 'BUSINESS LOGIC', desc: 'Pricing · Reprice · Rules engine', z: 3, y: 120 },
  { label: 'INTEGRATION LAYER', desc: 'SOAP · XML · Vendor APIs', z: 2, y: 180 },
  { label: 'DATABASE LAYER', desc: 'SQL · Data access · Reporting', z: 1, y: 240 },
];

export default function Architecture() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.arch__headline', { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    gsap.fromTo('.arch__layer', { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.arch__stack', start: 'top 88%', once: true },
    });
  }, []);

  return (
    <section ref={sectionRef} id="architecture" className="arch section">
      <div className="container">
        <div className="section-number">ARCHITECTURE</div>
        <h2 className="arch__headline display-lg">
          ENTERPRISE<br />ARCHITECTURE
        </h2>

        <div className="arch__layout">
          <div className="arch__stack">
            {layers.map((l, i) => (
              <div key={i} className="arch__layer"
                style={{ '--z': l.z, '--offset': i * 8 }}>
                <div className="arch__layer-z label">{String(l.z).padStart(2, '0')}</div>
                <div className="arch__layer-body">
                  <div className="arch__layer-label display-sm">{l.label}</div>
                  <div className="label" style={{ opacity: 0.5 }}>{l.desc}</div>
                </div>
                <div className="arch__layer-bar" style={{ opacity: 0.15 + l.z * 0.12 }} />
              </div>
            ))}
          </div>

          <div className="arch__connectors">
            <svg viewBox="0 0 60 300" className="arch__conn-svg" fill="none">
              {layers.slice(0, -1).map((_, i) => (
                <g key={i}>
                  <line x1="30" y1={20 + i * 56} x2="30" y2={76 + i * 56}
                    stroke="#F47A24" strokeWidth="1" opacity="0.5" strokeDasharray="4 3" />
                  <circle cx="30" cy={48 + i * 56} r="3" fill="#F47A24" opacity="0.5" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
