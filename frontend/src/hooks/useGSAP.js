import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP reveal animations for landing page sections.
 * Staggered fade-up, counter animations, and scroll-triggered reveals.
 */
export function useGSAPReveal(sectionRef, delay = 0) {
  useEffect(() => {
    if (!sectionRef.current) return;

    const el = sectionRef.current;
    const children = el.querySelectorAll('[data-reveal]');

    if (children.length === 0) return;

    gsap.fromTo(
      children,
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.12,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [sectionRef, delay]);
}

/**
 * Animated number counter using GSAP.
 * @param {number} target - final number to count to
 * @param {boolean} trigger - whether to start
 */
export function useCounterGSAP(elementRef, target, trigger = true, suffix = '') {
  useEffect(() => {
    if (!trigger || !elementRef.current) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2.2,
      delay: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        if (elementRef.current) {
          elementRef.current.textContent =
            Math.floor(obj.val).toLocaleString() + suffix;
        }
      },
    });
  }, [trigger, target, suffix]);
}

/**
 * Horizontal scroll / draggable marquee for the ticker.
 */
export function useMarqueeTicker(containerRef, speed = 40) {
  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const width = el.scrollWidth / 2;

    const tl = gsap.to(el, {
      x: `-${width}px`,
      duration: width / speed,
      ease: 'none',
      repeat: -1,
    });

    return () => tl.kill();
  }, []);
}
