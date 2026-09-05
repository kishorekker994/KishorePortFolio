import { useRef, useState, useEffect, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './styles/index.css';

// Components
import Preloader from './components/Preloader/Preloader';
import Navigation from './components/Navigation/Navigation';
import Cursor from './components/Cursor/Cursor';
import ScrollProgress from './components/ScrollProgress/ScrollProgress';

// 3D Scene
import AircraftScene from './scenes/AircraftScene';

// Sections
import Intro from './sections/01_Intro/Intro';
import Experience from './sections/02_Experience/Experience';
import TravelTech from './sections/03_TravelTech/TravelTech';
import APIFlow from './sections/04_APIFlow/APIFlow';
import Pricing from './sections/05_Pricing/Pricing';
import RapidReprice from './sections/06_RapidReprice/RapidReprice';
import Impact from './sections/07_Impact/Impact';
import Technology from './sections/08_Technology/Technology';
import Architecture from './sections/09_Architecture/Architecture';
import HowIBuild from './sections/10_HowIBuild/HowIBuild';
import Leadership from './sections/11_Leadership/Leadership';
import InMotion from './sections/12_InMotion/InMotion';
import BeyondEnterprise from './sections/14_BeyondEnterprise/BeyondEnterprise';
import Projects from './sections/15_Projects/Projects';
import Contact from './sections/18_Contact/Contact';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef(0);

  // Update scroll progress ref smoothly via ScrollTrigger (no layout thrashing)
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollRef.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, [loaded]);

  // Lock scroll during preloader
  useEffect(() => {
    if (!loaded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Refresh ScrollTrigger after load
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [loaded]);

  return (
    <>
      {/* Custom Cursor */}
      <Cursor />

      {/* Preloader */}
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}

      {/* Fixed 3D Aircraft Canvas */}
      <AircraftScene scrollRef={scrollRef} />

      {/* Fixed Navigation */}
      <Navigation />

      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Page Content */}
      <main id="main-content" style={{ position: 'relative', zIndex: 20 }}>
        <Intro />
        <Experience />
        <TravelTech />
        <APIFlow />
        <Pricing />
        <RapidReprice />
        <Impact />
        <Technology />
        <Architecture />
        <HowIBuild />
        <Leadership />
        <InMotion />
        <BeyondEnterprise />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
