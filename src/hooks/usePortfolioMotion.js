import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function usePortfolioMotion(ready, rootRef) {
  useEffect(() => {
    if (!ready || !rootRef.current) return;
    const root = rootRef.current;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
    }, { rootMargin: '100px' });
    root.querySelectorAll('section').forEach(section => observer.observe(section));
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('[data-reveal]').forEach(element => {
          gsap.from(element, { y: 32, opacity: 0.15, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 94%', toggleActions: 'play reverse play reverse' } });
        });
        gsap.utils.toArray('[data-depth]').forEach(element => {
          if (element.closest('[data-flight-from]')) return;
          const distance = Number(element.dataset.depth);
          gsap.fromTo(element, { y: distance * 0.35 }, { y: -distance, ease: 'none', scrollTrigger: { trigger: element.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        });
        gsap.utils.toArray('[data-count]').forEach(element => {
          const counter = { value: 0 };
          gsap.to(counter, { value: Number(element.dataset.count), duration: 1.7, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true }, onUpdate: () => { element.textContent = Math.round(counter.value); }, onComplete: () => { element.textContent = element.dataset.count; } });
        });
        gsap.from('.impact-bar > div', { scaleY: 0, stagger: 0.15, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.impact-chart', start: 'top 85%', once: true } });
      }, root);
      return () => {
        context.revert();
        root.querySelectorAll('[data-count]').forEach(element => {
          element.textContent = element.dataset.count;
        });
      };
    });
    let refreshFrame;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    resizeObserver.observe(root);
    return () => { observer.disconnect(); resizeObserver.disconnect(); cancelAnimationFrame(refreshFrame); media.revert(); };
  }, [ready, rootRef]);
}