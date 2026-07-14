"use client";

import { ReactNode, useEffect, useRef, useState, CSSProperties } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "slideUp" | "scale";
  hover?: boolean;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  variant = "slideUp",
  hover = true,
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  const getVariantStyle = (): CSSProperties => {
    const baseTransition = `opacity ${variant === "slideUp" ? "0.5s" : "0.4s"} ease-out ${delay}s, transform ${variant === "slideUp" ? "0.5s" : "0.4s"} ease-out ${delay}s`;
    
    switch (variant) {
      case "fade":
        return {
          opacity: isVisible ? 1 : 0,
          transition: `opacity 0.4s ease-out ${delay}s`,
        };
      case "slideUp":
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: baseTransition,
        };
      case "scale":
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.95)",
          transition: baseTransition,
        };
      default:
        return {
          opacity: isVisible ? 1 : 0,
          transition: baseTransition,
        };
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        hover && "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
      style={getVariantStyle()}
    >
      {children}
    </div>
  );
}

