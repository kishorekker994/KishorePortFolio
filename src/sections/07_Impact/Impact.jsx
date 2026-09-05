import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Impact.css';

gsap.registerPlugin(ScrollTrigger);

export default function Impact() {
  const sectionRef = useRef(null);
  const numRef = useRef(null);

  useEffect(() => {
    // Counter animation
    gsap.fromTo({ val: 0 }, { val: 80 }, {
      val: 80,
      duration: 2.5,
      ease: 'power2.out',
      onUpdate: function () {
        if (numRef.current) {
          numRef.current.textContent = Math.floor(this.targets()[0].val) + '%';
        }
      },
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    gsap.fromTo('.impact__label, .impact__desc', { y: 25, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
    });

    // Animated ring
    gsap.fromTo('.impact__ring', { strokeDashoffset: 628 }, {
      strokeDashoffset: 628 * 0.2,
      duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });
  }, []);

  return (
    <section ref={sectionRef} id="impact" className="impact section">
      <div className="container">
        <div className="section-number">IMPACT</div>

        <div className="impact__layout">
          <div className="impact__visual">
            <svg viewBox="0 0 220 220" className="impact__svg">
              <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(21,21,21,0.06)" strokeWidth="1" />
              <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(21,21,21,0.08)" strokeWidth="0.5"
                strokeDasharray="4 6" />
              <circle
                className="impact__ring"
                cx="110" cy="110" r="100"
                fill="none"
                stroke="#F47A24"
                strokeWidth="2"
                strokeDasharray="628"
                strokeDashoffset="628"
                strokeLinecap="round"
                transform="rotate(-90 110 110)"
              />
            </svg>

            <div className="impact__num-wrap">
              <div ref={numRef} className="impact__num display-xl">0%</div>
            </div>
          </div>

          <div className="impact__text">
            <div className="impact__label display-md">
              BACKLOG<br />TICKETS<br />REDUCED
            </div>
            <p className="impact__desc body-text">
              Through systematic triage improvements, productivity tooling, and disciplined Agile workflows across the Travelport maintenance and production support pipeline.
            </p>
            <div className="impact__context">
              <div className="impact__context-item">
                <div className="label label--orange">SYSTEM ENGINEER</div>
                <div className="label">Sep 2015 – Dec 2020</div>
              </div>
              <div className="impact__context-item">
                <div className="label label--orange">QA TESTING</div>
                <div className="label">100% Business Value Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
