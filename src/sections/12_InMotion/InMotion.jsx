import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './InMotion.css';

gsap.registerPlugin(ScrollTrigger);

export default function InMotion() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pinned depth-scrolling timeline: reveals MOVE, then AT, then SCALE in stepped scrollytelling
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=2200',
          pin: true,
          scrub: 0.8,
        },
      });

      // Step 1: MOVE sweeps in from the left with dynamic horizontal momentum
      tl.fromTo(
        '.im__word-move',
        { x: -90, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        0.05
      );

      // Step 2: AT sweeps in from below with vertical power
      tl.fromTo(
        '.im__word-at',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        0.36
      );

      // Step 3: SCALE. sweeps in from the right with high-velocity snap
      tl.fromTo(
        '.im__word-scale',
        { x: 90, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        0.68
      );

      // Supporting tagline arrives as all words unite
      tl.fromTo(
        '.im__tagline',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        0.82
      );

      // Hold all 3 words together in a single page before unpinning
      tl.to({}, { duration: 0.6 }, 0.95);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="inmotion" className="im">
      <div className="container im__content">
        <div className="section-number">IN MOTION</div>

        <div className="im__words">
          <div className="im__word im__word-move display-xl">MOVE</div>
          <div className="im__word im__word-at display-xl">AT</div>
          <div className="im__word im__word-scale display-xl">SCALE.</div>
        </div>

        <div className="im__tagline">
          <div className="line-orange" />
          <p className="label label--orange">ENGINEERING IN MOTION.</p>
        </div>
      </div>
    </section>
  );
}
