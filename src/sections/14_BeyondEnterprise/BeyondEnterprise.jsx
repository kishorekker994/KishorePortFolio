import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './BeyondEnterprise.css';

gsap.registerPlugin(ScrollTrigger);

export default function BeyondEnterprise() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 3600px pinned scroll space: each word gets 1200px exclusively.
      // One word is FULLY VISIBLE at a time — zero overlap ever.
      const tl = gsap.timeline();
      
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=6000',
        pin: true,
        animation: tl,
        scrub: 1,
      });

      // ── BEAT 1: BUILD. enters (0→0.12), holds (0.12→0.32), exits (0.32→0.38) ──
      tl.fromTo('.be__word--build',
        { opacity: 0, y: 55, scale: 0.86 },
        { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: 'power3.out' },
        0
      );
      tl.to('.be__word--build', { opacity: 0, y: -55, scale: 0.92, duration: 0.09, ease: 'power3.in' }, 0.30);

      // ── BEAT 2: EXPLORE. enters (0.38→0.50), holds (0.50→0.66), exits (0.66→0.72) ──
      tl.fromTo('.be__word--explore',
        { opacity: 0, y: 55, scale: 0.86 },
        { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: 'power3.out' },
        0.38
      );
      tl.to('.be__word--explore', { opacity: 0, y: -55, scale: 0.92, duration: 0.09, ease: 'power3.in' }, 0.64);

      // ── BEAT 3: SHIP. enters (0.72→0.84), holds to end (0.84→1.0) ──
      tl.fromTo('.be__word--ship',
        { opacity: 0, y: 55, scale: 0.86 },
        { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: 'power3.out' },
        0.72
      );

      // Hold SHIP visible before unpinning
      tl.to({}, { duration: 0.16 }, 0.84);

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

          {/* Exclusive stepped reveal — only ONE word visible at a time */}
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
