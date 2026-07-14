"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormCardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormCard({ title, icon, children, className }: FormCardProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

