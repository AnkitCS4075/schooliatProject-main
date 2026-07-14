import { Link } from "lucide-react"; // This was a mistake in my thought process, I should use next/link
import NextLink from "next/link";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient?: string;
  textColor?: string;
  delay?: number;
  animateCount?: boolean;
  className?: string;
  href?: string;
  change?: string | number;
  showTrend?: boolean;
}

export function PremiumStatCard({
  title,
  value,
  icon: Icon,
  gradient = "from-primary to-chart-2",
  textColor = "text-white",
  delay = 0,
  animateCount = true,
  className,
  href,
  change,
  showTrend = false,
}: PremiumStatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
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

  useEffect(() => {
    if (!isVisible || !animateCount || typeof value !== "number") {
      setDisplayValue(typeof value === "number" ? value : 0);
      return;
    }

    const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, "")) || 0;
    const duration = 1500;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value, animateCount]);

  const formattedValue = typeof value === "number"
    ? displayValue.toLocaleString()
    : value;

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href) {
      return (
        <NextLink href={href} className="block no-underline h-full">
          {children}
        </NextLink>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card
        ref={cardRef}
        className={cn(
          "border-0 overflow-hidden transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-1",
          "relative isolate h-full",
          className
        )}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: `all 0.5s ease-out ${delay}s`,
        }}
      >
        <CardContent
          className={cn(
            "p-4 bg-gradient-to-br",
            gradient,
            textColor
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                "bg-white/25 backdrop-blur-sm transition-transform duration-300",
                "hover:scale-110 hover:bg-white/35"
              )}
              style={{
                animation: isVisible ? "pulse-glow 2s infinite" : "none",
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>
          <div className="ml-2.5">
            <p
              className={cn(
                "text-2xl font-extrabold mb-0.5 transition-all duration-300",
                "animate-count-up"
              )}
              style={{
                animation: isVisible ? "countUp 0.6s ease-out" : "none",
              }}
            >
              {formattedValue}
            </p>
            <p className={cn("text-xs font-semibold opacity-90 mb-1")}>
              {title}
            </p>
            {change && (
              <div className="flex items-center gap-1 mt-1">
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  "bg-white/20 backdrop-blur-sm"
                )}>
                  {change}% {showTrend ? (Number(change) >= 0 ? "↑" : "↓") : ""}
                </span>
                <span className="text-[10px] opacity-70">vs last year</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

