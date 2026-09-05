import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experience } from '../../data/resume.js';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger);

const timeline = [
  { year: '2015', label: 'ASSISTANT SYSTEM ENGINEER', role: 'ILP Training & Core Platform', color: '#0B308A' },
  { year: '2020', label: 'SYSTEM ENGINEER', role: 'Maintenance & Production Support', color: '#F47A24' },
  { year: '2023 – PRESENT', label: 'TECHNICAL LEAD & ASSOCIATE CONSULTANT', role: 'Architecture & Application Development', color: '#0B308A' },
];

export default function Experience() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    gsap.fromTo('.exp__headline', { x: -40, opacity: 0 }, {
      x: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', once: true },
    });

    gsap.fromTo('.exp__company', { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    // Animate path draw
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength?.() || 500;
      gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(pathRef.current, {
        strokeDashoffset: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
      });
    }

    // Animate nodes
    nodesRef.current.forEach((node, i) => {
      if (!node) return;
      gsap.fromTo(node, { scale: 0, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.4, delay: i * 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
      });
    });

    // Roles reveal
    gsap.fromTo('.exp__role-item', { x: 20, opacity: 0 }, {
      x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.exp__roles', start: 'top 88%', once: true },
    });
  }, []);

  const exp = experience[0];

  return (
    <section ref={sectionRef} id="experience" className="exp section">
      <div className="container">
        <div className="section-number">EXPERIENCE</div>

        <div className="exp__top">
          <h2 className="exp__headline display-lg">
            <span>11+</span>
            <br />
            <span>YEARS</span>
          </h2>

          <div className="exp__company-block">
            <div className="exp__company label label--orange">TATA CONSULTANCY SERVICES</div>
            <div className="exp__client label">CLIENT: TRAVELPORT, LP</div>
            <div className="exp__period label" style={{ marginTop: '0.5rem' }}>Jun 2015 – Present · Chennai, India</div>
          </div>
        </div>

        {/* Route Timeline */}
        <div className="exp__timeline">
          <svg className="exp__path-svg" viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
            <path
              ref={pathRef}
              d="M 0,50 C 150,50 200,20 300,50 C 400,80 500,20 600,50 C 700,80 800,20 900,50 L 1000,50"
              stroke="#F47A24"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.6"
            />
          </svg>

          <div className="exp__nodes">
            {timeline.map((t, i) => (
              <div key={i} className="exp__node-wrap" ref={(el) => (nodesRef.current[i] = el)}>
                <div className="exp__node" style={{ borderColor: t.color }}>
                  <div className="exp__node-dot" style={{ background: t.color }} />
                </div>
                <div className="exp__node-info">
                  <div className="label label--orange">{t.year}</div>
                  <div className="exp__node-label">{t.label}</div>
                  <div className="label" style={{ color: 'rgba(21,21,21,0.4)' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roles */}
        <div className="exp__roles">
          {exp.roles.map((role, i) => (
            <div key={i} className="exp__role-item card">
              <div className="exp__role-header">
                <div>
                  <div className="exp__role-title display-sm">{role.title}</div>
                  <div className="label label--orange">{role.stream}</div>
                </div>
                <div className="label exp__role-period">{role.period}</div>
              </div>
              <ul className="exp__role-list">
                {role.responsibilities.slice(0, 3).map((r, j) => (
                  <li key={j} className="body-text exp__resp-item">
                    <span className="exp__bullet" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
