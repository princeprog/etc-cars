"use client";

import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardKpiCard({
  label,
  value,
  description,
  icon: Icon,
  comparison,
}: {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  comparison?: string | null;
}) {
  return (
    <Card className="min-w-0 gap-3 py-4 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-0">
        <div className="min-w-0">
          <CardDescription className="truncate">{label}</CardDescription>
          <CardTitle className="mt-1 truncate text-2xl tabular-nums">
            {value}
          </CardTitle>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="flex min-w-0 items-center gap-2 px-4">
        {comparison ? (
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {comparison}
          </Badge>
        ) : null}
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
