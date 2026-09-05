import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './RapidReprice.css';

gsap.registerPlugin(ScrollTrigger);

export default function RapidReprice() {
  const sectionRef = useRef(null);
  const streaksRef = useRef([]);

  useEffect(() => {
    gsap.fromTo('.rr__headline', { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    streaksRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        x: '100vw',
        duration: gsap.utils.random(1.5, 3),
        delay: i * 0.2,
        repeat: -1,
        ease: 'none',
        opacity: gsap.utils.random(0.2, 0.5),
      });
    });
  }, []);

  return (
    <section ref={sectionRef} id="rapidreprice" className="rr section">
      {/* Speed streaks */}
      <div className="rr__streaks" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (streaksRef.current[i] = el)}
            className="rr__streak"
            style={{ top: `${10 + i * 11}%`, width: `${80 + Math.random() * 120}px` }}
          />
        ))}
      </div>

      <div className="container">
        <div className="section-number">RAPID REPRICE</div>

        <h2 className="rr__headline display-lg">
          RAPID<br />REPRICE
        </h2>

        <div className="rr__sub body-text">
          REAL-TIME TRAVEL PRICING TECHNOLOGY · 4 YEARS TOTAL DURATION
        </div>

        <div className="rr__cards">
          {[
            { tag: 'CORE DOMAIN', title: 'REPRICE WORKFLOWS', desc: 'End-to-end ticket repricing logic across airline platforms.' },
            { tag: 'QUALITY ASSURANCE', title: 'INTEGRATION TESTING', desc: 'SOAP UI-based service validation and defect analysis.' },
            { tag: 'PRODUCTION LIFECYCLE', title: 'RELEASE SUPPORT', desc: 'Production deployment and post-release monitoring.' },
          ].map((c, i) => (
            <div key={i} className="rr__card card">
              <div className="label label--orange" style={{ marginBottom: '1rem' }}>{c.tag}</div>
              <div className="rr__card-title display-sm">{c.title}</div>
              <p className="body-text rr__card-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
