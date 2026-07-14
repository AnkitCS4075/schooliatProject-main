"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PremiumLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner Skeleton */}
      <Card className="bg-gradient-to-r from-primary to-chart-2">
        <CardContent className="p-6 lg:p-8">
          <Skeleton className="h-8 w-64 mb-4 bg-white/20" />
          <Skeleton className="h-4 w-full max-w-2xl bg-white/20" />
        </CardContent>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="overflow-hidden"
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <CardContent className="p-5 lg:p-6">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-14 w-14 rounded-full" />
              </div>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widgets Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

