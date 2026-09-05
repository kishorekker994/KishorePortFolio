import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { technologies } from '../../data/resume.js';
import './Technology.css';

gsap.registerPlugin(ScrollTrigger);

export default function Technology() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.tech__headline', { y: 35, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    gsap.fromTo('.tech__node', { scale: 0, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 0.5, stagger: { each: 0.04, from: 'center' },
      ease: 'back.out(2)',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
    });

    gsap.fromTo('.tech__connection', { strokeDashoffset: 200 }, {
      strokeDashoffset: 0, duration: 0.6, stagger: 0.03,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
    });

    // Pulsing core
    gsap.to('.tech__core-ring', {
      r: 55, opacity: 0.2, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
    });
  }, []);

  // Build constellation positions (centered)
  const CX = 50, CY = 50;
  const nodes = technologies.map((t) => ({
    ...t,
    cx: CX + t.x * 18,
    cy: CY + t.y * 18,
  }));

  return (
    <section ref={sectionRef} id="technology" className="tech section">
      <div className="container">
        <div className="section-number">TECHNOLOGY</div>

        <h2 className="tech__headline display-lg">
          TECH<br />STACK
        </h2>

        <div className="tech__layout">
          <div className="tech__constellation">
            <svg viewBox="0 0 100 100" className="tech__svg" preserveAspectRatio="xMidYMid meet">
              {/* Grid circles */}
              {[20, 36, 52].map((r) => (
                <circle key={r} cx={CX} cy={CY} r={r} fill="none"
                  stroke="rgba(21,21,21,0.05)" strokeWidth="0.3" />
              ))}

              {/* Animated outer ring */}
              <circle className="tech__core-ring" cx={CX} cy={CY} r={48}
                fill="none" stroke="#F47A24" strokeWidth="0.3" opacity="0.1" />

              {/* Connections from center to satellites */}
              {nodes.filter(n => !n.core).map((n, i) => (
                <line
                  key={i}
                  className="tech__connection"
                  x1={CX} y1={CY}
                  x2={n.cx} y2={n.cy}
                  stroke="#F47A24"
                  strokeWidth="0.4"
                  strokeDasharray="200"
                  strokeDashoffset="200"
                  opacity="0.3"
                />
              ))}

              {/* Satellite nodes */}
              {nodes.filter(n => !n.core).map((n, i) => (
                <g key={i} className="tech__node" transform={`translate(${n.cx}, ${n.cy})`}>
                  <circle r="3.5" fill="#F8E4CF" stroke="#F47A24" strokeWidth="0.6" opacity="0.8" />
                  <circle r="1.5" fill="#F47A24" opacity="0.7" />
                  <text
                    x="0" y="-5.5"
                    textAnchor="middle"
                    fontSize="2.8"
                    fill="#151515"
                    opacity="0.7"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.1"
                  >{n.name}</text>
                </g>
              ))}

              {/* Core node — JAVA */}
              <g className="tech__node">
                <circle cx={CX} cy={CY} r="10" fill="#151515" />
                <circle cx={CX} cy={CY} r="13" fill="none" stroke="#F47A24" strokeWidth="0.6" opacity="0.4" />
                <text
                  x={CX} y={CY + 1.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="5"
                  fill="#F8E4CF"
                  fontFamily="Bebas Neue, sans-serif"
                  letterSpacing="0.5"
                >JAVA</text>
              </g>
            </svg>
          </div>

          <div className="tech__marquee-container">
            <div className="tech__marquee">
              <div className="tech__marquee-track">
                {/* Loop 3 times to ensure enough content for seamless scrolling */}
                {[...technologies, ...technologies, ...technologies].map((t, i) => (
                  <div key={i} className="tech__marquee-item">
                    <span className="tech__marquee-dot" />
                    <span className="display-md tech__marquee-text">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="tech__marquee tech__marquee--reverse">
              <div className="tech__marquee-track">
                {/* Second row scrolling in reverse */}
                {[...technologies, ...technologies, ...technologies].reverse().map((t, i) => (
                  <div key={i} className="tech__marquee-item">
                    <span className="tech__marquee-dot" />
                    <span className="display-md tech__marquee-text">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
