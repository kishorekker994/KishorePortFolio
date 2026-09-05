import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { personal } from '../../data/resume.js';
import './Contact.css';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.contact__line1', { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    gsap.fromTo('.contact__line2', { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    gsap.fromTo('.contact__info', { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, delay: 0.2,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    // Fade-in final tagline
    gsap.fromTo('.contact__tagline', { opacity: 0 }, {
      opacity: 1, duration: 0.6, delay: 0.3,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    // Horizon line draw
    gsap.fromTo('.contact__horizon', { scaleX: 0 }, {
      scaleX: 1, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="contact section">
      {/* Horizon */}
      <div className="contact__horizon-wrap" aria-hidden="true">
        <div className="contact__horizon" />
        <div className="contact__horizon-glow" />
      </div>

      <div className="container">
        <div className="section-number">CONTACT</div>

        <div className="contact__headline">
          <div className="contact__line1 display-xl">LET'S BUILD</div>
          <div className="contact__line2 display-xl contact__line2--outline">WHAT'S NEXT.</div>
        </div>

        <div className="contact__info">
          <div className="contact__identity">
            <div className="display-sm contact__name">{personal.fullName}</div>
            <div className="label label--orange">TECHNICAL LEAD · JAVA BACKEND ENGINEER</div>
          </div>

          <div className="contact__links">
            <a href={`mailto:${personal.email}`} className="contact__link" data-cursor="EMAIL">
              <div className="label">EMAIL</div>
              <div className="contact__link-val">{personal.email}</div>
            </a>
            <a href={`tel:${personal.phone}`} className="contact__link" data-cursor="CALL">
              <div className="label">PHONE</div>
              <div className="contact__link-val">{personal.phone}</div>
            </a>
            <div className="contact__link">
              <div className="label">LOCATION</div>
              <div className="contact__link-val">Chennai, India</div>
            </div>
          </div>

          <a href={`mailto:${personal.email}`} className="btn btn--primary contact__cta" data-cursor="LET'S GO">
            START THE CONVERSATION
            <span className="contact__cta-arrow">→</span>
          </a>
        </div>

        <div className="contact__footer">
          <div className="contact__tagline label label--orange">ENGINEERING IN MOTION.</div>
          <div className="label contact__copy">© 2026 KISHORE KUMAR PRAKASH BABU</div>
        </div>
      </div>
    </section>
  );
}
