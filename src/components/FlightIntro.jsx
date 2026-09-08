import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plane } from 'lucide-react';

export default function FlightIntro({ onComplete }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(onComplete, reduced ? 0 : 900);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return <div className="flight-intro" aria-hidden="true"><span className="flight-intro-brand">Kishore Kumar<span>.</span></span><div className="flight-intro-track"><Plane size={20} /></div><span className="folio-eyebrow">ENGINEERING IN MOTION</span></div>;
}
FlightIntro.propTypes = { onComplete: PropTypes.func.isRequired };