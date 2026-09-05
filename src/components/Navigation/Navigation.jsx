import { useEffect, useRef, useState, useCallback } from 'react';
import './Navigation.css';

const sections = [
  { id: 'intro', label: 'INTRO' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'traveltech', label: 'WORK' },
  { id: 'technology', label: 'TECH' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'contact', label: 'CONTACT' },
];

export default function Navigation() {
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

  // Active section detection via IntersectionObserver
  useEffect(() => {
    const sectionEls = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMenuOpen(false);
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
          {sections.map((s) => (
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
        {sections.map((s) => (
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
