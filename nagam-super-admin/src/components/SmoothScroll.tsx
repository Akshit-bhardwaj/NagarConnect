"use client";

import React, { useEffect } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenisInstance: any = null;
    let rafId: number | null = null;

    import("lenis").then(({ default: Lenis }) => {
      lenisInstance = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });

      function raf(time: number) {
        if (lenisInstance) {
          lenisInstance.raf(time);
          rafId = requestAnimationFrame(raf);
        }
      }

      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  return <>{children}</>;
}
