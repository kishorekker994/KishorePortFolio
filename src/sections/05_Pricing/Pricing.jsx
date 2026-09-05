import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Pricing.css';

gsap.registerPlugin(ScrollTrigger);

const pricingLayers = [
  { label: 'FARE CALCULATION', desc: 'Base fare + taxes computation', depth: 0 },
  { label: 'RULE ENGINE', desc: 'Fare rules and restrictions', depth: 1 },
  { label: 'SURCHARGE LAYER', desc: 'Fuel, carrier, airport fees', depth: 2 },
  { label: 'COMMISSION ENGINE', desc: 'Agency and markup logic', depth: 3 },
  { label: 'AVAILABILITY CHECK', desc: 'Seat class and inventory', depth: 4 },
  { label: 'FINAL PRICE', desc: 'Total fare response', depth: 5 },
];

export default function Pricing() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo('.pricing__headline', { y: 35, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
    });

    gsap.fromTo('.pricing__layer', {
      x: (i) => i % 2 === 0 ? -40 : 40,
      opacity: 0,
    }, {
      x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
    });
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="pricing section">
      <div className="container">
        <div className="section-number">PRICING</div>

        <h2 className="pricing__headline display-lg">
          PRICING<br />PLATFORM<br />SERVICES
        </h2>

        <div className="pricing__sub body-text">
          Enterprise airline ticket pricing engine powering real-time fare calculations across the Travelport global distribution network.
        </div>

        <div className="pricing__layers">
          {pricingLayers.map((l, i) => (
            <div
              key={i}
              className="pricing__layer"
              style={{ '--depth': l.depth, '--idx': i }}
            >
              <div className="pricing__layer-num label">{String(i + 1).padStart(2, '0')}</div>
              <div className="pricing__layer-content">
                <div className="pricing__layer-label display-sm">{l.label}</div>
                <div className="label" style={{ opacity: 0.5 }}>{l.desc}</div>
              </div>
              <div className="pricing__layer-bar" />
            </div>
          ))}
        </div>

        <div className="pricing__stats">
          <div className="pricing__stat">
            <div className="pricing__stat-num display-md">3</div>
            <div className="label">YEARS ON PRICING PLATFORM</div>
          </div>
          <div className="pricing__stat">
            <div className="pricing__stat-num display-md">SOAP</div>
            <div className="label">SERVICE INTEGRATION</div>
          </div>
          <div className="pricing__stat">
            <div className="pricing__stat-num display-md">SQL</div>
            <div className="label">DATA LAYER OPTIMIZATION</div>
          </div>
        </div>
      </div>
    </section>
  );
}
