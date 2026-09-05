import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { leadership } from '../../data/resume.js';
import './Leadership.css';

gsap.registerPlugin(ScrollTrigger);

export default function Leadership() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.lead__headline', { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    gsap.fromTo('.lead__card', { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.lead__grid', start: 'top 88%', once: true },
    });
  }, []);

  return (
    <section ref={sectionRef} id="leadership" className="lead section">
      <div className="container">
        <div className="section-number">LEADERSHIP</div>

        <h2 className="lead__headline display-lg">
          LEAD<br />BY<br />EXAMPLE
        </h2>

        <div className="lead__grid">
          {leadership.map((l, i) => (
            <div key={i} className="lead__card card">
              <div className="lead__card-icon">{l.icon}</div>
              <div className="lead__card-label display-sm">{l.label}</div>
              <p className="body-text lead__card-desc">{l.desc}</p>
            </div>
          ))}
        </div>

        <div className="lead__certs">
          <div className="label" style={{ marginBottom: '1.5rem' }}>CERTIFICATIONS</div>
          <div className="lead__cert-list">
            {[
              { name: 'GitHub Copilot', date: 'Mar 2026' },
              { name: 'Core Java Advanced', date: 'Jul 2025' },
              { name: 'SAFe 5 Practitioner', date: 'Certified' },
            ].map((c, i) => (
              <div key={i} className="lead__cert-item">
                <div className="lead__cert-dot" />
                <div>
                  <div className="lead__cert-name label">{c.name}</div>
                  <div className="label" style={{ opacity: 0.5 }}>{c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
