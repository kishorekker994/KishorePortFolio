import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Intro.css';

gsap.registerPlugin(ScrollTrigger);

export default function Intro() {
  const sectionRef = useRef(null);
  const k1Ref = useRef(null);
  const k2Ref = useRef(null);
  const tagRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(k1Ref.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' })
      .fromTo(k2Ref.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }, '-=0.9')
      .fromTo([tagRef.current, subRef.current], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.6')
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .fromTo(scrollIndicatorRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.2');

    // Parallax on scroll
    gsap.to('.intro__headline', {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    return () => { tl.kill(); };
  }, []);

  const scrollToWork = () => {
    const el = document.getElementById('experience');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section ref={sectionRef} id="intro" className="intro section">
      {/* Background grid */}
      <div className="intro__grid-bg" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="intro__grid-col" />
        ))}
      </div>

      {/* Flight data labels */}
      <div className="intro__data-labels" aria-hidden="true">
        <span className="label intro__label">TRAVEL TECHNOLOGY · ACTIVE</span>
        <span className="label intro__label">ENTERPRISE SCALE · ONLINE</span>
      </div>

      <div className="container intro__content">
        <div className="intro__headline">
          <div className="section-number">INTRO</div>

          <h1 className="intro__name">
            <div ref={k1Ref} className="intro__name-line display-xl">KISHORE</div>
            <div ref={k2Ref} className="intro__name-line display-xl">KUMAR</div>
          </h1>

          <div className="intro__divider">
            <div className="line-orange" />
          </div>

          <div ref={tagRef} className="intro__tag">
            <span className="label label--orange">TECHNICAL LEAD</span>
            <span className="intro__sep">·</span>
            <span className="label label--orange">JAVA BACKEND ENGINEER</span>
          </div>

          <p ref={subRef} className="intro__years body-text">
            11+ YEARS BUILDING ENTERPRISE TRAVEL TECHNOLOGY
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="intro__cta-row">
            <button className="btn btn--primary intro__cta" onClick={scrollToWork} data-cursor="EXPLORE">
              VIEW MY WORK
              <span className="intro__cta-arrow">→</span>
            </button>
            <a href="/Kishore_Kumar_Prakash_Babu_Resume.pdf" className="btn intro__cta-secondary" data-cursor="DOWNLOAD" download>
              DOWNLOAD RESUME
              <span className="intro__cta-icon">↓</span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollIndicatorRef} className="intro__scroll-indicator" aria-hidden="true">
        <div className="intro__scroll-line" />
        <span className="intro__scroll-label">SCROLL</span>
      </div>

      {/* Corner coordinates */}
      <div className="intro__corner" aria-hidden="true">
        <span className="label">13.1147° N · 80.1018° E · AVADI, CHENNAI</span>
        <span className="label">ALT: 35,000 FT</span>
      </div>
    </section>
  );
}
