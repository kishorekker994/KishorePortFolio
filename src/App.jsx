import { useRef, useState, useEffect, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

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

  // Lenis smooth scroll — integrate with GSAP ScrollTrigger
  useEffect(() => {
    if (!loaded) return;

    const lenis = new Lenis({
      lerp: 0.08,           // Smoother momentum
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.60, // Reduces scroll speed by 40% globally, requiring more physical scrolling
      touchMultiplier: 0.60,
    });

    // Tick Lenis inside GSAP's RAF
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0); // Prevent frame lag spikes

    // Connect Lenis scroll to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) lenis.scrollTo(value, { immediate: true });
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: 'transform',
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
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, [loaded]);

  // Lock scroll during preloader
  useEffect(() => {
    if (!loaded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTimeout(() => ScrollTrigger.refresh(), 150);
    }
  }, [loaded]);

  return (
    <>
      {/* Custom Cursor */}
      <Cursor />

      {/* Preloader */}
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}

      {/* Fixed 3D Aircraft Canvas — always rendered for continuity */}
      <AircraftScene scrollRef={scrollRef} />

      {/* Fixed Navigation */}
      <Navigation scrollRef={scrollRef} />

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
