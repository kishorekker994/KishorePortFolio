import { useEffect, useRef } from 'react';
import './ScrollProgress.css';

export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = Math.min(window.scrollY / Math.max(total, 1), 1);
      if (barRef.current) {
        barRef.current.style.transform = `scaleY(${pct})`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress__track">
        <div ref={barRef} className="scroll-progress__bar" />
      </div>
    </div>
  );
}

