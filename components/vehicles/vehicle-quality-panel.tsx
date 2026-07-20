"use client";

import * as React from "react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  VehicleQualityIssue,
  VehicleQualityIssueSeverity,
  VehicleQualityScore,
  VehicleStatus,
} from "@/types/vehicles";

import { GRADE_BADGE_CLASSES, GRADE_LABELS } from "./vehicle-quality.helpers";

const SEVERITY_META: Record<
  VehicleQualityIssueSeverity,
  {
    title: string;
    icon: typeof AlertCircleIcon;
    dotClassName: string;
    iconWrapClassName: string;
    badgeClassName: string;
    emptyHint: string;
  }
> = {
  critical: {
    title: "Critical issues",
    icon: AlertCircleIcon,
    dotClassName: "bg-destructive",
    iconWrapClassName: "bg-destructive/10 text-destructive",
    badgeClassName: "border-destructive/20 bg-destructive/10 text-destructive",
    emptyHint: "No critical issues.",
  },
  warning: {
    title: "Warnings",
    icon: AlertTriangleIcon,
    dotClassName: "bg-amber-500",
    iconWrapClassName:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    emptyHint: "No warnings.",
  },
  info: {
    title: "Suggestions",
    icon: InfoIcon,
    dotClassName: "bg-primary",
    iconWrapClassName: "bg-primary/10 text-primary",
    badgeClassName: "border-primary/20 bg-primary/10 text-primary",
    emptyHint: "No suggestions.",
  },
};

const ISSUE_FIELD_TARGETS: Record<string, string> = {
  acquisitionSource: "purchasePrice",
  brand: "brand",
  color: "color",
  features: "remarks",
  fuelType: "fuelType",
  mileage: "mileage",
  minimumAcceptablePrice: "purchasePrice",
  model: "model",
  photos: "vehicle-photos",
  purchasePrice: "purchasePrice",
  region: "remarks",
  remarks: "remarks",
  status: "status",
  targetSellingPrice: "purchasePrice",
  transmission: "transmission",
  variant: "variant",
  year: "year",
};

export function VehicleQualityPanel({
  quality,
  status,
  className,
}: {
  quality: VehicleQualityScore | null | undefined;
  status: VehicleStatus;
  className?: string;
}) {
  if (!quality) {
    return (
      <Card className={className}>
        <CardHeader className="border-b">
          <CardTitle>Inventory readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Quality score is unavailable for this vehicle right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isSold = status === "Sold";
  const sections = [
    {
      severity: "critical" as const,
      items: quality.blockingIssues,
    },
    {
      severity: "warning" as const,
      items: quality.warnings,
    },
    {
      severity: "info" as const,
      items: quality.suggestions,
    },
  ];

  const totalIssues = sections.reduce(
    (count, section) => count + section.items.length,
    0,
  );

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="border-b py-5">
        <CardTitle>Inventory readiness</CardTitle>
        <CardDescription className="max-w-sm text-xs leading-5">
          {isSold
            ? "Readiness checks are adjusted for sold vehicles while preserving the saved quality summary."
            : "Live preview of how complete and ready this vehicle is based on key data, pricing, media, and status checks."}
        </CardDescription>
        <CardAction>
          <Badge
            variant="outline"
            className={cn(
              "rounded-md px-2.5 py-1",
              GRADE_BADGE_CLASSES[quality.grade],
            )}
          >
            {GRADE_LABELS[quality.grade]}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4 px-5 py-5">
          <ReadinessScore score={quality.score} grade={quality.grade} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {totalIssues === 0
                ? "Ready for inventory"
                : `${totalIssues} item${totalIssues === 1 ? "" : "s"} to review`}
            </p>
            <Progress
              value={quality.score}
              aria-label="Inventory readiness score"
              className={cn(
                "mt-4 h-2",
                getScoreProgressClassName(quality.grade),
              )}
            />
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Your vehicle is {quality.score}% ready
            </p>
          </div>
        </div>

        <Separator />

        {totalIssues === 0 ? (
          <div className="px-5 py-4">
            <div className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-3">
              <CheckCircle2Icon className="mt-0.5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  All readiness checks passed
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  This vehicle meets the current completeness, pricing, media,
                  and status checks.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={sections.map((section) => section.severity)}
          >
            {sections.map((section) => (
              <IssueSection
                key={section.severity}
                severity={section.severity}
                items={section.items}
              />
            ))}
          </Accordion>
        )}
      </CardContent>

      {isSold ? (
        <CardFooter className="border-t bg-muted/20 px-5 py-4">
          <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <InfoIcon className="mt-0.5 shrink-0" />
            <span>Active-inventory checks are adjusted for sold vehicles.</span>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}

function ReadinessScore({
  score,
  grade,
}: {
  score: number;
  grade: VehicleQualityScore["grade"];
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const accent = getScoreAccent(grade);

  return (
    <div
      className="relative flex size-24 items-center justify-center rounded-full"
      aria-hidden="true"
      style={
        {
          "--readiness-accent": accent,
          background: `conic-gradient(var(--readiness-accent) ${clamped * 3.6}deg, var(--muted) 0deg)`,
        } as React.CSSProperties
      }
    >
      <div className="flex size-20 flex-col items-center justify-center rounded-full bg-card shadow-xs ring-1 ring-border">
        <span className="text-3xl font-semibold leading-none tabular-nums">
          {clamped}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function getScoreAccent(grade: VehicleQualityScore["grade"]) {
  switch (grade) {
    case "excellent":
      return "oklch(0.627 0.194 149.214)";
    case "good":
      return "var(--primary)";
    case "needs_attention":
      return "oklch(0.705 0.213 47.604)";
    case "incomplete":
      return "var(--destructive)";
  }
}

function getScoreProgressClassName(grade: VehicleQualityScore["grade"]) {
  switch (grade) {
    case "excellent":
      return "[&_[data-slot=progress-indicator]]:bg-emerald-600";
    case "good":
      return "[&_[data-slot=progress-indicator]]:bg-primary";
    case "needs_attention":
      return "[&_[data-slot=progress-indicator]]:bg-orange-600";
    case "incomplete":
      return "[&_[data-slot=progress-indicator]]:bg-destructive";
  }
}

function IssueSection({
  severity,
  items,
}: {
  severity: VehicleQualityIssueSeverity;
  items: VehicleQualityIssue[];
}) {
  const meta = SEVERITY_META[severity];
  const Icon = meta.icon;

  return (
    <AccordionItem value={severity} className="border-b last:border-b-0">
      <AccordionTrigger className="rounded-none px-5 py-4 hover:no-underline">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
              meta.iconWrapClassName,
            )}
          >
            <Icon />
          </span>
          <span className="min-w-0 text-sm font-semibold text-foreground">
            {meta.title}
          </span>
          <Badge
            variant="outline"
            className={cn("rounded-full px-2", meta.badgeClassName)}
          >
            {items.length}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-5">
        {items.length ? (
          <ul className="flex flex-col gap-4">
            {items.map((issue) => (
              <IssueRow key={issue.code} issue={issue} severity={severity} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{meta.emptyHint}</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function IssueRow({
  issue,
  severity,
}: {
  issue: VehicleQualityIssue;
  severity: VehicleQualityIssueSeverity;
}) {
  const meta = SEVERITY_META[severity];
  const targetId = issue.field ? ISSUE_FIELD_TARGETS[issue.field] : undefined;

  function handleReviewField() {
    if (!targetId) {
      return;
    }

    const target = document.getElementById(targetId);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLButtonElement
    ) {
      window.setTimeout(() => target.focus(), 350);
    }
  }

  return (
    <li className="grid grid-cols-[18px_minmax(0,1fr)_auto] gap-3">
      <span
        className={cn("mt-1.5 size-2 rounded-full", meta.dotClassName)}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="break-words text-sm font-medium leading-5 text-foreground">
          {issue.label}
        </p>
        <p className="mt-0.5 break-words text-xs leading-5 text-muted-foreground">
          {issue.description}
        </p>
      </div>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto px-0 py-0 text-xs"
        onClick={handleReviewField}
        disabled={!targetId}
      >
        Review field
      </Button>
    </li>
  );
}
