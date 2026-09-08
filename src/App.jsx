import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import './styles/index.css';
import './styles/portfolio.css';
import './styles/flight-story.css';
import usePortfolioMotion from './hooks/usePortfolioMotion';

// Components
import Preloader from './components/FlightIntro';

// 3D Scene
import AircraftScene from './scenes/FlightScene';

// Sections
import APIFlow from './sections/RequestFlow';
import FlightChapter from './sections/FlightChapter';
import { PortfolioNavigation, Intro, Experience, TravelTech, Pricing, RapidReprice, Impact, Technology, Architecture, HowIBuild, Leadership, InMotion, BeyondEnterprise, Projects, Contact } from './sections/PortfolioSections';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef(0);
  const mainRef = useRef(null);
  usePortfolioMotion(loaded, mainRef);

  // Lenis smooth scroll — integrate with GSAP ScrollTrigger
  useEffect(() => {
    if (!loaded) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
      });
      const tick = (time) => lenis.raf(time * 1000);

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      lenis.on('scroll', ScrollTrigger.update);

      return () => {
        gsap.ticker.remove(tick);
        lenis.off('scroll', ScrollTrigger.update);
        lenis.destroy();
      };
    });

    // Master scroll progress tracker — drives aircraft & 3D environment
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollRef.current = self.progress;
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      media.revert();
    };
  }, [loaded]);

  // Lock scroll during preloader
  useEffect(() => {
    if (!loaded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const refreshTimer = loaded ? setTimeout(() => ScrollTrigger.refresh(), 150) : null;
    return () => {
      clearTimeout(refreshTimer);
      document.body.style.overflow = '';
    };
  }, [loaded]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>

      {/* Preloader */}
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}

      {/* Fixed 3D Aircraft Canvas — always rendered for continuity */}
      <AircraftScene scrollRef={scrollRef} />

      {/* Fixed Navigation */}
      <PortfolioNavigation />

      {/* Page Content */}
      <main ref={mainRef} id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 20 }}>
        <Intro />
        <Experience />
        <FlightChapter id="runway" from={1} to={2} label="01 / CLEARED FOR DEPARTURE" title="Every journey starts with direction." destination="RUNWAY 07 / LINE UP" />
        <TravelTech />
        <FlightChapter id="takeoff" from={2} to={3} label="02 / TAKEOFF" title="From the ground up." destination="POSITIVE CLIMB" />
        <APIFlow />
        <Pricing />
        <RapidReprice />
        <FlightChapter id="climb" from={3} to={4} label="03 / ABOVE THE CLOUDS" title="A wider perspective." destination="CLIMB / CRUISE" />
        <Impact />
        <Technology />
        <Architecture />
        <HowIBuild />
        <Leadership />
        <InMotion />
        <BeyondEnterprise />
        <FlightChapter id="descent" from={5} to={6} label="05 / APPROACH" title="Bringing it all together." destination="DESTINATION IN SIGHT" />
        <Projects />
        <FlightChapter id="landing" from={6} to={7} label="06 / TOUCHDOWN" title="Ideas. Delivered." destination="LANDING / ROLLOUT" />
        <FlightChapter id="arrival" from={7} to={9} label="07 / ARRIVAL" title="The next journey starts here." destination="AT THE GATE / ARRIVAL COMPLETE" />
        <Contact />
      </main>
    </>
  );
}
