"use client";

import { useEffect, useRef } from "react";

export function FeatureCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      title: "Decentralized Funding",
      description: "Direct peer-to-peer funding with no intermediaries",
      icon: "💸",
    },
    {
      title: "Smart Contract Security",
      description: "Campaigns powered by secure, auditable smart contracts",
      icon: "🔒",
    },
    {
      title: "Transparent Process",
      description: "All transactions recorded on-chain for full transparency",
      icon: "🔍",
    },
    {
      title: "Deadline Management",
      description: "Time-bound campaigns with automatic state management",
      icon: "⏱️",
    },
    // Duplicate items to create a seamless infinite scroll effect
    {
      title: "Decentralized Funding",
      description: "Direct peer-to-peer funding with no intermediaries",
      icon: "💸",
    },
    {
      title: "Smart Contract Security",
      description: "Campaigns powered by secure, auditable smart contracts",
      icon: "🔒",
    },
    {
      title: "Transparent Process",
      description: "All transactions recorded on-chain for full transparency",
      icon: "🔍",
    },
    {
      title: "Deadline Management",
      description: "Time-bound campaigns with automatic state management",
      icon: "⏱️",
    },
  ];

  // Set up the auto-scrolling effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Pixels per frame - adjust for faster/slower scrolling

    const scroll = () => {
      if (!scrollContainer) return;

      scrollPosition += scrollSpeed;

      // Reset position when we've scrolled the width of the first 4 items
      const itemWidth = scrollContainer.scrollWidth / features.length;
      if (scrollPosition >= itemWidth * 4) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
      animationFrameId = requestAnimationFrame(scroll);
    };

    // Start the animation
    animationFrameId = requestAnimationFrame(scroll);

    // Pause scrolling when hovering
    const handleMouseEnter = () => cancelAnimationFrame(animationFrameId);
    const handleMouseLeave = () => {
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    // Also pause on touch for mobile devices
    const handleTouchStart = () => cancelAnimationFrame(animationFrameId);
    const handleTouchEnd = () => {
      animationFrameId = requestAnimationFrame(scroll);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);
    scrollContainer.addEventListener("touchstart", handleTouchStart);
    scrollContainer.addEventListener("touchend", handleTouchEnd);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (scrollContainer) {
        scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
        scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
        scrollContainer.removeEventListener("touchstart", handleTouchStart);
        scrollContainer.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [features.length]);

  return (
    <div className="relative overflow-hidden">
      {/* Gradient fade effect on the edges */}
      <div className="absolute left-0 top-0 h-full w-16 md:w-24 z-10 bg-gradient-to-r from-background to-transparent"></div>
      <div className="absolute right-0 top-0 h-full w-16 md:w-24 z-10 bg-gradient-to-l from-background to-transparent"></div>

      {/* Scrolling container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-none py-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex gap-6 flex-nowrap px-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-primary/20 min-w-[280px] md:min-w-[320px] flex-shrink-0"
            >
              <div className="text-4xl mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-lg">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
