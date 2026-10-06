"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function FormulaScroll({ children, className, fadeClassName }: { children: ReactNode; className: string; fadeClassName: string }) {
  const element = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const update = () => setOverflowing(node.scrollWidth > node.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => observer.disconnect();
  }, []);

  return <div ref={element} dir="ltr" className={`${className} ${overflowing ? fadeClassName : ""}`}>{children}</div>;
}
