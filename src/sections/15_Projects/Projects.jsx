import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { personalProjects } from '../../data/resume.js';
import './Projects.css';

gsap.registerPlugin(ScrollTrigger);

const projectColors = ['#F47A24', '#E8A06C', '#151515'];

const projectVisuals = [
  // Fusion — elevator/corporate
  <svg key="fusion" viewBox="0 0 200 120" className="proj__visual-svg">
    <rect x="20" y="20" width="160" height="80" rx="2" fill="none" stroke="#F47A24" strokeWidth="1" opacity="0.3"/>
    <rect x="30" y="30" width="60" height="60" rx="1" fill="rgba(244,122,36,0.1)" stroke="#F47A24" strokeWidth="0.8" opacity="0.6"/>
    <rect x="110" y="30" width="60" height="28" rx="1" fill="rgba(244,122,36,0.07)" stroke="#F47A24" strokeWidth="0.5" opacity="0.4"/>
    <rect x="110" y="64" width="60" height="26" rx="1" fill="rgba(244,122,36,0.07)" stroke="#F47A24" strokeWidth="0.5" opacity="0.4"/>
    <line x1="95" y1="40" x2="110" y2="40" stroke="#F47A24" strokeWidth="0.5" opacity="0.4"/>
    <line x1="95" y1="80" x2="110" y2="80" stroke="#F47A24" strokeWidth="0.5" opacity="0.4"/>
    <text x="60" y="64" textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#F47A24" fontFamily="Bebas Neue" opacity="0.8">LIFT</text>
  </svg>,
  // Route54 — restaurant
  <svg key="route54" viewBox="0 0 200 120" className="proj__visual-svg">
    <rect x="15" y="15" width="170" height="90" rx="3" fill="none" stroke="#E8A06C" strokeWidth="1" opacity="0.3"/>
    <rect x="25" y="25" width="70" height="40" rx="1" fill="rgba(232,160,108,0.1)" stroke="#E8A06C" strokeWidth="0.7" opacity="0.5"/>
    <rect x="105" y="25" width="70" height="40" rx="1" fill="rgba(232,160,108,0.1)" stroke="#E8A06C" strokeWidth="0.7" opacity="0.5"/>
    <rect x="25" y="75" width="150" height="22" rx="1" fill="rgba(232,160,108,0.07)" stroke="#E8A06C" strokeWidth="0.5" opacity="0.4"/>
    <circle cx="60" cy="45" r="8" fill="none" stroke="#E8A06C" strokeWidth="0.8" opacity="0.6"/>
    <circle cx="140" cy="45" r="8" fill="none" stroke="#E8A06C" strokeWidth="0.8" opacity="0.6"/>
    <text x="100" y="87" textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#E8A06C" fontFamily="Bebas Neue" opacity="0.8">ROUTE54</text>
  </svg>,
  // Finance — dashboard
  <svg key="finance" viewBox="0 0 200 120" className="proj__visual-svg">
    <rect x="10" y="10" width="180" height="100" rx="2" fill="none" stroke="#151515" strokeWidth="1" opacity="0.15"/>
    {[20,40,60,80].map((h, i) => (
      <rect key={i} x={20 + i * 40} y={110 - h} width="28" height={h} rx="1"
        fill={`rgba(244,122,36,${0.2 + i * 0.15})`} stroke="#F47A24" strokeWidth="0.5" opacity="0.7"/>
    ))}
    <polyline points="20,50 60,30 100,55 140,20 180,35"
      fill="none" stroke="#F47A24" strokeWidth="1.2" opacity="0.6" strokeLinecap="round"/>
    <text x="100" y="15" textAnchor="middle" fontSize="6" fill="#151515" fontFamily="JetBrains Mono" opacity="0.5">FINANCE TRACKER</text>
  </svg>,
];

export default function Projects() {
  const sectionRef = useRef(null);

  useEffect(() => {
    personalProjects.forEach((_, i) => {
      const direction = i % 2 === 0 ? -1 : 1;
      gsap.fromTo(`.proj__card-${i}`, {
        x: 60 * direction,
        opacity: 0,
        scale: 0.95,
      }, {
        x: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out',
        scrollTrigger: {
          trigger: `.proj__card-${i}`,
          start: 'top 88%',
          once: true,
        },
      });
    });
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="proj section">
      <div className="container">
        <div className="section-number">PERSONAL PROJECTS</div>

        <h2 className="proj__headline display-lg">
          PRODUCTS<br />I BUILT
        </h2>

        <div className="proj__cards">
          {personalProjects.map((p, i) => (
            <div key={i} className={`proj__card proj__card-${i}`}
              style={{ '--accent': projectColors[i] }}>
              <div className="proj__card-inner">
                <div className="proj__card-header">
                  <div className="proj__card-num label" style={{ color: 'var(--accent)' }}>
                    FEATURED PROJECT
                  </div>
                  <div className="label proj__card-type">{p.type}</div>
                </div>

                <div className="proj__visual">
                  {projectVisuals[i]}
                </div>

                <div className="proj__card-body">
                  <h3 className="proj__card-title display-sm">
                    {p.name}<br />{p.subtitle}
                  </h3>
                  <p className="body-text proj__card-desc">{p.description}</p>
                </div>

                <div className="proj__card-footer">
                  <div className="proj__card-tag label">AI-ASSISTED DEVELOPMENT</div>
                  <div className="proj__card-bar" style={{ background: 'var(--accent)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
