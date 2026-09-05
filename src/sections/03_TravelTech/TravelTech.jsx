import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './TravelTech.css';

gsap.registerPlugin(ScrollTrigger);

const hubs = [
  { code: 'ORD', name: 'CHICAGO', x: 170, y: 140, role: 'HUB NORTH AMERICA' },
  { code: 'ATL', name: 'ATLANTA', x: 215, y: 185, role: 'DELTA CORE' },
  { code: 'LHR', name: 'LONDON', x: 385, y: 115, role: 'TRAVELPORT HQ' },
  { code: 'FRA', name: 'FRANKFURT', x: 430, y: 125, role: 'EUROPE GATEWAY' },
  { code: 'DXB', name: 'DUBAI', x: 545, y: 195, role: 'MIDDLE EAST' },
  { code: 'SIN', name: 'SINGAPORE', x: 660, y: 275, role: 'ASIA PACIFIC' },
  { code: 'HND', name: 'TOKYO', x: 735, y: 155, role: 'PACIFIC HUB' },
  { code: 'SYD', name: 'SYDNEY', x: 755, y: 355, role: 'OCEANIA' },
];

const flightArcs = [
  { from: [170, 140], to: [385, 115], cp: [270, 70] },  // ORD -> LHR
  { from: [215, 185], to: [385, 115], cp: [300, 110] }, // ATL -> LHR
  { from: [385, 115], to: [430, 125], cp: [405, 110] }, // LHR -> FRA
  { from: [430, 125], to: [545, 195], cp: [490, 140] }, // FRA -> DXB
  { from: [385, 115], to: [545, 195], cp: [460, 130] }, // LHR -> DXB
  { from: [545, 195], to: [660, 275], cp: [610, 220] }, // DXB -> SIN
  { from: [660, 275], to: [735, 155], cp: [715, 210] }, // SIN -> HND
  { from: [170, 140], to: [735, 155], cp: [450, 40] },  // ORD -> HND (Polar)
  { from: [660, 275], to: [755, 355], cp: [720, 310] }, // SIN -> SYD
  { from: [545, 195], to: [755, 355], cp: [660, 310] }, // DXB -> SYD
];

export default function TravelTech() {
  const sectionRef = useRef(null);

  useEffect(() => {
    // Early trigger so information is fully revealed as soon as user arrives
    gsap.fromTo('.tt__headline', { y: 35, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%' },
    });

    gsap.fromTo('.tt__sub, .tt__project-pill', { y: 25, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
    });

    gsap.fromTo('.tt__network-panel', { scale: 0.96, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
    });

    gsap.fromTo('.tt__flight-arc', { strokeDashoffset: 600 }, {
      strokeDashoffset: 0, duration: 1.4, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' },
    });

    gsap.fromTo('.tt__hub-node', { scale: 0, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(2)',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    });
  }, []);

  return (
    <section ref={sectionRef} id="traveltech" className="tt section">
      <div className="container">
        <div className="section-number">TRAVEL TECHNOLOGY</div>

        <div className="tt__layout">
          <div className="tt__text">
            <h2 className="tt__headline display-lg">
              GLOBAL<br />TRAVEL<br />PLATFORM
            </h2>
            <p className="tt__sub body-text">
              11+ YEARS ARCHITECTING THE BACKEND ENGINES THAT CONNECT 400+ AIRLINES ACROSS THE GLOBE.
            </p>

            <div className="tt__projects">
              {[
                { name: 'UNIVERSAL API (UAPI)', years: '4+ YRS', metric: 'HIGH-VOLUME SOAP / XML' },
                { name: 'PRICING PLATFORM', years: '3 YRS', metric: 'LOW-LATENCY FARE ENGINE' },
                { name: 'RAPID REPRICE', years: '4 YRS', metric: 'REAL-TIME TICKET RE-ISSUANCE' },
              ].map((p) => (
                <div key={p.name} className="tt__project-pill">
                  <div className="tt__project-info">
                    <span className="tt__project-name">{p.name}</span>
                    <span className="tt__project-metric">{p.metric}</span>
                  </div>
                  <span className="label label--orange">{p.years}</span>
                </div>
              ))}
            </div>

            {/* Live Telemetry Stats */}
            <div className="tt__stats-grid">
              <div className="tt__stat-box">
                <div className="tt__stat-num display-sm">400+</div>
                <div className="tt__stat-label label">AIRLINES CONNECTED</div>
              </div>
              <div className="tt__stat-box">
                <div className="tt__stat-num display-sm">1.2B+</div>
                <div className="tt__stat-label label">DAILY SEARCH QUERIES</div>
              </div>
              <div className="tt__stat-box">
                <div className="tt__stat-num display-sm">&lt;120MS</div>
                <div className="tt__stat-label label">CORE SERVICE LATENCY</div>
              </div>
            </div>
          </div>

          {/* Premium Global Aviation Flight Network Visualizer */}
          <div className="tt__map-wrap">
            <div className="tt__network-panel card">
              <div className="tt__network-header">
                <div className="tt__network-title">
                  <span className="tt__radar-pulse" />
                  <span className="label label--orange">TRAVELPORT GDS · LIVE GLOBAL AIR NETWORK</span>
                </div>
                <span className="label" style={{ color: 'var(--royal-blue, #0B308A)' }}>OPERATIONAL 24/7</span>
              </div>

              <svg viewBox="0 0 880 440" className="tt__network-svg" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Subtle Aviation Radial Glow */}
                  <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F47A24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#F47A24" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0B308A" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#F47A24" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#0B308A" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Radar Grid Lat/Long Rings */}
                <g className="tt__radar-grid" stroke="rgba(11, 48, 138, 0.08)" strokeWidth="1">
                  <circle cx="440" cy="220" r="80" fill="none" />
                  <circle cx="440" cy="220" r="160" fill="none" strokeDasharray="4 4" />
                  <circle cx="440" cy="220" r="240" fill="none" />
                  <circle cx="440" cy="220" r="320" fill="none" strokeDasharray="6 6" />
                  <line x1="0" y1="220" x2="880" y2="220" />
                  <line x1="440" y1="0" x2="440" y2="440" />
                </g>

                {/* Great-Circle Flight Corridors */}
                {flightArcs.map((arc, i) => (
                  <g key={`arc-${i}`}>
                    {/* Background Track */}
                    <path
                      d={`M ${arc.from[0]} ${arc.from[1]} Q ${arc.cp[0]} ${arc.cp[1]} ${arc.to[0]} ${arc.to[1]}`}
                      fill="none"
                      stroke="rgba(11, 48, 138, 0.12)"
                      strokeWidth="1.5"
                    />
                    {/* Animated Active Route */}
                    <path
                      className="tt__flight-arc"
                      d={`M ${arc.from[0]} ${arc.from[1]} Q ${arc.cp[0]} ${arc.cp[1]} ${arc.to[0]} ${arc.to[1]}`}
                      fill="none"
                      stroke="url(#arcGrad)"
                      strokeWidth="2"
                      strokeDasharray="600"
                      strokeDashoffset="600"
                    />
                  </g>
                ))}

                {/* Global Hub Nodes */}
                {hubs.map((hub) => (
                  <g key={hub.code} className="tt__hub-node" transform={`translate(${hub.x}, ${hub.y})`}>
                    {/* Outer Radar Ping */}
                    <circle r="14" fill="url(#hubGlow)" className="tt__ping-circle" />
                    <circle r="4.5" fill="#0B308A" stroke="#F47A24" strokeWidth="2" />
                    
                    {/* Hub Badge */}
                    <rect x="-18" y="-24" width="36" height="15" rx="3" fill="#061F5C" />
                    <text x="0" y="-14" textAnchor="middle" fill="#FFF8EF" fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight="bold">
                      {hub.code}
                    </text>
                    <text x="0" y="16" textAnchor="middle" fill="#0B308A" fontSize="7.5" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.08em">
                      {hub.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Bottom Network Status Bar */}
              <div className="tt__network-footer">
                <span className="label">GLOBAL DISTRIBUTION SYSTEM (GDS) ROUTING MATRIX</span>
                <span className="label label--orange">TRANS-CONTINENTAL SOAPS ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
