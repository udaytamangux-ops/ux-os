"use client";

import { useEffect } from "react";

const shards = Array.from({ length: 8 }, (_, index) => index + 1);

export function AnimeAtmosphere() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
        root.dataset.pointer = "active";
      });
    }

    function onPointerLeave() {
      delete root.dataset.pointer;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      delete root.dataset.pointer;
    };
  }, []);

  return (
    <div className="anime-atmosphere" aria-hidden="true">
      <div className="anime-rain anime-rain-a" />
      <div className="anime-rain anime-rain-b" />
      <div className="anime-slice" />
      <div className="anime-ribbon anime-ribbon-a" />
      <div className="anime-ribbon anime-ribbon-b" />
      {shards.map((shard) => (
        <span key={shard} className={`paper-shard paper-shard-${shard}`} />
      ))}
    </div>
  );
}
