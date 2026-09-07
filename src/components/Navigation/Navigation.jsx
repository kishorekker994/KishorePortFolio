import { useEffect, useRef, useState, useCallback } from 'react';
import './Navigation.css';

// All sections ordered for indicator (01/15)
const ALL_SECTIONS = [
  { id: 'intro',        label: 'INTRO',      num: '01' },
  { id: 'experience',   label: 'EXPERIENCE', num: '02' },
  { id: 'traveltech',   label: 'TRAVEL',     num: '03' },
  { id: 'apiflow',      label: 'API',        num: '04' },
  { id: 'pricing',      label: 'PRICING',    num: '05' },
  { id: 'rapidreprice', label: 'REPRICE',    num: '06' },
  { id: 'impact',       label: 'IMPACT',     num: '07' },
  { id: 'technology',   label: 'TECH',       num: '08' },
  { id: 'architecture', label: 'ARCH',       num: '09' },
  { id: 'howibuild',    label: 'BUILD',      num: '10' },
  { id: 'leadership',   label: 'LEAD',       num: '11' },
  { id: 'inmotion',     label: 'MOTION',     num: '12' },
  { id: 'beyond',       label: 'BEYOND',     num: '13' },
  { id: 'projects',     label: 'PROJECTS',   num: '14' },
  { id: 'contact',      label: 'CONTACT',    num: '15' },
];

// Nav links (abbreviated set for top nav)
const NAV_LINKS = [
  { id: 'intro',      label: 'INTRO' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'traveltech', label: 'WORK' },
  { id: 'technology', label: 'TECH' },
  { id: 'projects',   label: 'PROJECTS' },
  { id: 'contact',    label: 'CONTACT' },
];

export default function Navigation({ scrollRef }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');
  const navRef = useRef(null);

  // Scroll detection for nav background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section detection via IntersectionObserver — all 15 sections
  useEffect(() => {
    const sectionEls = ALL_SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5] }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Section indicator data
  const activeSectionData = ALL_SECTIONS.find((s) => s.id === activeSection) || ALL_SECTIONS[0];

  return (
    <nav
      ref={navRef}
      className={`nav ${scrolled ? 'nav--scrolled' : ''} ${menuOpen ? 'nav--open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="nav__inner">
        <button className="nav__brand" onClick={scrollToTop} aria-label="Scroll to top">
          KISHORE<span className="nav__dot">●</span>
        </button>



        <div className="nav__links">
          {NAV_LINKS.map((s) => (
            <button
              key={s.id}
              className={`nav__link ${activeSection === s.id ? 'nav__link--active' : ''}`}
              onClick={() => scrollToSection(s.id)}
              aria-current={activeSection === s.id ? 'true' : undefined}
            >
              {s.label}
            </button>
          ))}
        </div>

        <a href="mailto:kishorekumar.prakashbabu@gmail.com" className="nav__cta">
          CONTACT
        </a>

        <button
          className="nav__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span /><span /><span />
        </button>
      </div>

      <div
        className={`nav__mobile ${menuOpen ? 'nav__mobile--open' : ''}`}
        role="menu"
      >
        {NAV_LINKS.map((s) => (
          <button
            key={s.id}
            className={`nav__mobile-link ${activeSection === s.id ? 'nav__mobile-link--active' : ''}`}
            onClick={() => scrollToSection(s.id)}
            role="menuitem"
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
