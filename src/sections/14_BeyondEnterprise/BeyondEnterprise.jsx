import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './BeyondEnterprise.css';

gsap.registerPlugin(ScrollTrigger);

export default function BeyondEnterprise() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=2000',
          pin: true,
          scrub: 0.8,
        },
      });

      // Initially all 3 words are hidden.
      // Scroll 1: BUILD. stamps in
      tl.fromTo('.be__word--build',
        { opacity: 0, y: 50, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        0.05
      );

      // Scroll 2: EXPLORE. stamps in
      tl.fromTo('.be__word--explore',
        { opacity: 0, y: 50, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        0.38
      );

      // Scroll 3: SHIP. stamps in
      tl.fromTo('.be__word--ship',
        { opacity: 0, y: 50, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        0.70
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="beyond" className="be">
      <div className="container be__container">
        <div className="section-number">BEYOND ENTERPRISE</div>

        <div className="be__layout">
          <div className="be__content-left">
            <h2 className="be__headline display-lg">
              BEYOND<br />ENTERPRISE
            </h2>

            <p className="be__sub body-text">
              Beyond the Travelport enterprise platform — independently conceptualizing, designing, and shipping full-stack web applications with modern AI-assisted engineering workflows.
            </p>

            <div className="be__card card">
              <div className="label label--orange">CORE PHILOSOPHY</div>
              <p className="body-text" style={{ marginTop: '0.5rem', color: 'var(--royal-blue, #0B308A)' }}>
                Mastering enterprise-grade robustness inside the workplace, while aggressively experimenting with state-of-the-art tech, microservices, and AI products outside it.
              </p>
            </div>

          </div>

          {/* Stepped reveal words */}
          <div className="be__words-wrap">
            <div className="be__word be__word--build display-xl">BUILD.</div>
            <div className="be__word be__word--explore display-xl">EXPLORE.</div>
            <div className="be__word be__word--ship display-xl">SHIP.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
