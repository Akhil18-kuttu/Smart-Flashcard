"use client";
import { useEffect, useRef, useState } from "react";

export default function AnimatedCard({ children, index = 0, className = "", style = {} }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        if (ref.current) observer.unobserve(ref.current);
      }
    };
  }, []);

  const delay = `${index * 60}ms`;

  return (
    <div
      ref={ref}
      className={`card animate-fade-in ${isVisible ? "visible" : ""} ${className}`}
      style={{
        "--stagger-delay": delay,
        ...style
      }}
    >
      {children}
    </div>
  );
}
