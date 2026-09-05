import { useEffect, useRef } from 'react';
import './Preloader.css';

export default function Preloader({ onComplete }) {
  const preloaderRef = useRef(null);
  const lineRef = useRef(null);
  const statusRef = useRef(null);

  const messages = [
    'INITIALIZING TRAVEL SYSTEM',
    'LOADING AIRCRAFT',
    'CALIBRATING FLIGHT PATH',
    'SYSTEM READY',
  ];

  useEffect(() => {
    let current = 0;
    const el = statusRef.current;
    const bar = lineRef.current;

    function next() {
      if (!el) return;
      el.style.opacity = 0;
      el.style.transform = 'translateY(8px)';
      setTimeout(() => {
        if (!el) return;
        el.textContent = messages[current];
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
        if (bar) {
          bar.style.transition = 'width 0.7s cubic-bezier(0.16,1,0.3,1)';
          bar.style.width = `${((current + 1) / messages.length) * 100}%`;
        }
        current++;
        if (current < messages.length) {
          setTimeout(next, 800);
        } else {
          setTimeout(() => {
            if (preloaderRef.current) {
              preloaderRef.current.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
              preloaderRef.current.style.opacity = 0;
              preloaderRef.current.style.transform = 'translateY(-100%)';
              setTimeout(onComplete, 700);
            }
          }, 600);
        }
      }, 300);
    }

    setTimeout(next, 300);
  }, [onComplete]);

  return (
    <div ref={preloaderRef} className="preloader">
      <div className="preloader__inner">
        <div className="preloader__brand">
          <span className="preloader__name">KISHORE KUMAR</span>
          <span className="preloader__role">TECHNICAL LEAD · JAVA BACKEND ENGINEER</span>
        </div>

        <div className="preloader__aircraft">
          <svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="preloader__plane-svg">
            {/* Flight corridor radar track */}
            <line x1="0" y1="50" x2="240" y2="50" stroke="#F47A24" strokeWidth="0.75" strokeDasharray="6 4" opacity="0.3"/>
            
            {/* Boeing 787 Commercial Jet Top Silhouette */}
            {/* Main Fuselage */}
            <path d="M215 50 C210 48, 195 46, 170 46 L80 46 C65 46, 35 47, 20 49 L15 50 L20 51 C35 53, 65 54, 80 54 L170 54 C195 54, 210 52, 215 50 Z" fill="#0B308A" stroke="#F47A24" strokeWidth="1.2"/>
            
            {/* Swept Wings */}
            <path d="M145 46 L105 10 C100 6, 95 6, 94 9 L90 12 C93 16, 115 46, 120 46 Z" fill="#0B308A" stroke="#F47A24" strokeWidth="1"/>
            <path d="M145 54 L105 90 C100 94, 95 94, 94 91 L90 88 C93 84, 115 54, 120 54 Z" fill="#0B308A" stroke="#F47A24" strokeWidth="1"/>
            
            {/* Twin Turbofan Engines */}
            <rect x="110" y="32" width="22" height="7" rx="3.5" fill="#061F5C" stroke="#F47A24" strokeWidth="0.8"/>
            <rect x="110" y="61" width="22" height="7" rx="3.5" fill="#061F5C" stroke="#F47A24" strokeWidth="0.8"/>
            
            {/* Horizontal Tail Stabilizers */}
            <path d="M38 47 L20 28 C18 26, 15 27, 16 30 L22 47 Z" fill="#0B308A" stroke="#F47A24" strokeWidth="0.8"/>
            <path d="M38 53 L20 72 C18 74, 15 73, 16 70 L22 53 Z" fill="#0B308A" stroke="#F47A24" strokeWidth="0.8"/>
            
            {/* Navigation & Strobe Lights */}
            <circle cx="92" cy="10" r="2" fill="#F47A24"/>
            <circle cx="92" cy="90" r="2" fill="#F47A24"/>
            <circle cx="215" cy="50" r="2.5" fill="#FFF8EF"/>
          </svg>
        </div>

        <div className="preloader__status-wrap">
          <div ref={statusRef} className="preloader__status">INITIALIZING TRAVEL SYSTEM</div>
          <div className="preloader__bar-track">
            <div ref={lineRef} className="preloader__bar" style={{ width: '0%' }} />
          </div>
        </div>

        <div className="preloader__coords">
          <span>13.1147° N</span>
          <span>80.1018° E</span>
          <span style={{ color: 'var(--orange)', marginLeft: '0.4rem' }}>AVADI, CHENNAI</span>
        </div>
      </div>
    </div>
  );
}
