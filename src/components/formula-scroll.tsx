"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function FormulaScroll({ children, className, fadeClassName, atEndClassName }: { children: ReactNode; className: string; fadeClassName: string; atEndClassName: string }) {
  const element = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const update = () => {
      const hasOverflow = node.scrollWidth > node.clientWidth + 1;
      setOverflowing(hasOverflow);
      if (!hasOverflow) {
        node.scrollLeft = 0;
        setAtEnd(false);
      } else {
        setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 1);
      }
    };
    node.scrollLeft = 0;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => observer.disconnect();
  }, []);

  return <div ref={element} dir="ltr" onScroll={(event) => setAtEnd(event.currentTarget.scrollLeft + event.currentTarget.clientWidth >= event.currentTarget.scrollWidth - 1)} className={`${className} ${overflowing ? fadeClassName : ""} ${atEnd ? atEndClassName : ""}`}>{children}</div>;
}
