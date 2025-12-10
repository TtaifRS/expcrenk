'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from '@/components/marquee/Marquee.module.css';

export const useMarqueeAnimation = (marqueeRef: React.RefObject<HTMLElement | null>) => {
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  const horizontalLoop = (
    items: HTMLElement[],
    config: {
      repeat?: number;
      paused?: boolean;
      speed?: number;
      paddingRight?: number;
      snap?: number | false;
      reversed?: boolean;
    }
  ) => {
    items = gsap.utils.toArray(items) as HTMLElement[];
    config = config || {};
    let tl = gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: 'none' },
      onReverseComplete: () => {
        tl.totalTime(tl.rawTime() + tl.duration() * 100);
      },
    });
    const length: number = items.length;
    const startX = items[0]?.offsetLeft ?? 0;
    const times: number[] = [];
    const widths: number[] = [];
    const xPercents: number[] = [];
    let curIndex = 0;
    const pixelsPerSecond = (config.speed || 1) * 100;
    const snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1);

    const populateWidths = () => {
      items.forEach((el, i) => {
        widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px') as string);
        xPercents[i] = snap(
          (parseFloat(gsap.getProperty(el, 'x', 'px') as string) / widths[i]) * 100 +
            (gsap.getProperty(el, 'xPercent') as number)
        );
      });
    };

    const getTotalWidth = () => {
      if (length === 0) return 0;
      const lastItem = items[length - 1];
      return (
        lastItem.offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        (lastItem.offsetWidth ?? 0) * (gsap.getProperty(lastItem, 'scaleX') as number) +
        (parseFloat(config.paddingRight as any) || 0)
      );
    };

    populateWidths();
    gsap.set(items, { xPercent: (i) => xPercents[i] });
    gsap.set(items, { x: 0 });
    const totalWidth = getTotalWidth();

    for (let i = 0; i < length; i++) {
      const item = items[i];
      const curX = (xPercents[i] / 100) * widths[i];
      const distanceToStart = item.offsetLeft + curX - startX;
      const distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, 'scaleX') as number);
      tl.to(
        item,
        { xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond },
        0
      )
        .fromTo(
          item,
          { xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100) },
          {
            xPercent: xPercents[i],
            duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
            immediateRender: false,
          },
          distanceToLoop / pixelsPerSecond
        )
        .add('label' + i, distanceToStart / pixelsPerSecond);
      times[i] = distanceToStart / pixelsPerSecond;
    }

    function toIndex(itemIndex: number, vars: any = {}) {
      (Math.abs(itemIndex - curIndex) > length / 2) && (itemIndex += itemIndex > curIndex ? -length : length);
      const newIndex = gsap.utils.wrap(0, length, itemIndex);
      let time = times[newIndex];
      if (time > tl.time() !== itemIndex > curIndex) {
        vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
        time += tl.duration() * (itemIndex > curIndex ? 1 : -1);
      }
      curIndex = newIndex;
      vars.overwrite = true;
      return tl.tweenTo(time, vars);
    }

    tl.next = (vars: any) => toIndex(curIndex + 1, vars);
    tl.previous = (vars: any) => toIndex(curIndex - 1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (itemIndex: number, vars: any) => toIndex(itemIndex, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true);
    if (config.reversed) {
      tl.reverse();
    }
    return tl;
  };

  useEffect(() => {
    if (!marqueeRef.current) {
      console.log('useMarqueeAnimation: marqueeRef.current is null');
      return;
    }

    const marqueeContainer = marqueeRef.current.querySelector(`.${styles.marquee}`);
    if (!marqueeContainer) {
      console.log('useMarqueeAnimation: marqueeContainer not found');
      return;
    }

    const items = gsap.utils.toArray(`.${styles.marquee} p`, marqueeContainer) as HTMLElement[];
    if (items.length === 0) {
      console.log('useMarqueeAnimation: no p items found in marqueeContainer');
      return;
    }

    console.log('useMarqueeAnimation: initializing horizontalLoop with', items.length, 'items');
    animationRef.current = horizontalLoop(items, {
      repeat: -1,
      paddingRight: 30,
      speed: 1,
    });

    return () => {
      console.log('useMarqueeAnimation: cleaning up');
      animationRef.current?.kill();
    };
  }, [marqueeRef]);

  return animationRef;
};