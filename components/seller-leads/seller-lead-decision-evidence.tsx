"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  AlertTriangleIcon,
  CalendarCheckIcon,
  ChartNoAxesCombinedIcon,
  ClipboardPenLineIcon,
  FlagIcon,
  StarIcon,
  UserRoundIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SellerLead } from "@/types/seller-leads";
import {
  formatSellerLeadMoney,
  getVehicleTitle,
  type CalculatedOverallCondition,
} from "./seller-lead-inspection-model";
import {
  getDecisionInspectionData,
  getStatusBadgeClassName,
  getVehicleSubtitle,
  type ConditionBreakdownRow,
} from "./seller-lead-decision-model";

function EvidenceCard({
  title,
  children,
  className,
  contentClassName,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card size="sm" className={cn("gap-0 rounded-lg py-0", className)}>
      <CardHeader className="border-b px-4 py-2 pb-2!">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn("px-4 py-2", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

function SummaryCell({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-start gap-1 border-t px-4 py-3 first:border-t-0 sm:border-l sm:first:border-l-0 xl:border-t-0",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function DecisionLeadSummary({ lead }: { lead: SellerLead }) {
  const decisionLabel =
    lead.decision === "Buy" ? "Approve to Buy" : (lead.decision ?? "Pending");

  return (
    <Card size="sm" className="gap-0 rounded-lg py-0">
      <CardContent className="grid p-0 sm:grid-cols-2 xl:grid-cols-[1fr_1.25fr_0.9fr_0.9fr_1fr_1fr_1fr]">
        <SummaryCell label="Seller">
          <p className="truncate font-semibold" title={lead.sellerName}>
            {lead.sellerName}
          </p>
        </SummaryCell>
        <SummaryCell label="Vehicle">
          <p className="truncate font-semibold" title={getVehicleTitle(lead)}>
            {getVehicleTitle(lead)}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {getVehicleSubtitle(lead)}
          </p>
        </SummaryCell>
        <SummaryCell label="Asking Price">
          <p className="font-semibold">
            {formatSellerLeadMoney(lead.askingPrice)}
          </p>
        </SummaryCell>
        <SummaryCell label="Lead Status">
          <Badge
            variant="outline"
            className={getStatusBadgeClassName(lead.status)}
          >
            {lead.status}
          </Badge>
        </SummaryCell>
        <SummaryCell label="Inspection Status">
          <Badge
            variant="outline"
            className={cn(
              lead.inspectionCompletedAt
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-700",
            )}
          >
            {lead.inspectionCompletedAt ? "Recorded" : "Pending"}
          </Badge>
        </SummaryCell>
        <SummaryCell label="Current Decision">
          <Badge
            variant="outline"
            className={cn(
              lead.decision === "Walk Away"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : lead.decision === "Buy"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700",
            )}
          >
            {decisionLabel}
          </Badge>
        </SummaryCell>
        <SummaryCell label="Approval State">
          <Badge
            variant="outline"
            className={cn(
              lead.status === "Approved to Buy"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-100 text-slate-700",
            )}
          >
            {lead.status === "Approved to Buy" ? "Approved" : "Not approved"}
          </Badge>
        </SummaryCell>
      </CardContent>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 gap-1.5 border-l px-2.5 first:border-l-0",
        className,
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 space-y-0.5">
        <p className="text-[10px] leading-3.5 text-muted-foreground">{label}</p>
        <div className="text-xs font-semibold">{children}</div>
      </div>
    </div>
  );
}

function conditionLabel(rating: ConditionBreakdownRow["rating"]) {
  if (rating === "not-checked") return "Not Checked";
  return rating.charAt(0).toUpperCase() + rating.slice(1);
}

function conditionBadgeClassName(rating: ConditionBreakdownRow["rating"]) {
  if (rating === "good")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (rating === "fair") return "border-amber-200 bg-amber-50 text-amber-700";
  if (rating === "poor") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function overallConditionLabel(condition: CalculatedOverallCondition) {
  if (condition === "pending") return "Pending";
  return condition.charAt(0).toUpperCase() + condition.slice(1);
}

function overallConditionClassName(condition: CalculatedOverallCondition) {
  if (condition === "good") return "text-emerald-700";
  if (condition === "fair") return "text-amber-700";
  if (condition === "poor") return "text-rose-700";
  return "text-slate-600";
}

function InspectionSummary({ lead }: { lead: SellerLead }) {
  const { draft, metrics } = getDecisionInspectionData(lead);
  const recordedAt = lead.inspectionCompletedAt
    ? new Date(lead.inspectionCompletedAt)
    : null;
  const readiness = !lead.inspectionCompletedAt
    ? "Pending"
    : metrics.counts.poor > 0
      ? "Needs review"
      : metrics.counts.fair > 0
        ? "Proceed with caution"
        : "Ready for review";

  return (
    <EvidenceCard title="1. Inspection Summary">
      <div className="grid gap-y-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[1.15fr_0.85fr_0.9fr_0.85fr_0.95fr_1.1fr]">
        <Metric icon={CalendarCheckIcon} label="Inspection recorded">
          {recordedAt ? (
            <span className="block text-[11px] leading-4">
              <span className="block whitespace-nowrap">
                {format(recordedAt, "MMM d, yyyy")}
              </span>
              <span className="block">{format(recordedAt, "h:mm a")}</span>
            </span>
          ) : (
            "Not recorded"
          )}
        </Metric>
        <Metric icon={UserRoundIcon} label="Inspector">
          {lead.assigneeUserId ? "Assigned" : "Not assigned"}
        </Metric>
        <Metric icon={ChartNoAxesCombinedIcon} label="Overall score">
          <span className="text-primary">{metrics.score}</span>
          <span className="font-normal text-muted-foreground"> / 100</span>
        </Metric>
        <Metric icon={StarIcon} label="Overall condition">
          <span className={overallConditionClassName(metrics.overallCondition)}>
            {overallConditionLabel(metrics.overallCondition)}
          </span>
        </Metric>
        <Metric icon={WrenchIcon} label="Estimated repair cost">
          {formatSellerLeadMoney(draft.estimatedRepairCost || null)}
        </Metric>
        <Metric icon={FlagIcon} label="Acquisition readiness">
          <Badge
            variant="outline"
            className={cn(
              "max-w-full text-[10px]",
              readiness === "Ready for review"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700",
            )}
          >
            {readiness}
          </Badge>
        </Metric>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Progress
          value={metrics.score}
          aria-label="Inspection score"
          className="h-2 bg-muted [&_[data-slot=progress-indicator]]:bg-primary"
        />
        <span className="w-9 text-right text-xs font-semibold">
          {metrics.score}%
        </span>
      </div>
    </EvidenceCard>
  );
}

function ConditionBreakdown({ lead }: { lead: SellerLead }) {
  const { conditionRows } = getDecisionInspectionData(lead);

  return (
    <EvidenceCard title="2. Condition Breakdown" contentClassName="p-0">
      <Table className="text-xs">
        <TableHeader className="bg-muted/35">
          <TableRow className="hover:bg-muted/35">
            <TableHead className="h-7 px-3">Inspection Area</TableHead>
            <TableHead className="h-7 px-3">Condition</TableHead>
            <TableHead className="h-7 px-3">Checked Items</TableHead>
            <TableHead className="h-7 min-w-52 px-3">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conditionRows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/20">
              <TableCell className="px-3 py-0.5 font-medium">
                {row.label}
              </TableCell>
              <TableCell className="px-3 py-0.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 text-[11px]",
                    conditionBadgeClassName(row.rating),
                  )}
                >
                  {conditionLabel(row.rating)}
                </Badge>
              </TableCell>
              <TableCell className="px-3 py-0.5">
                {row.checked} of {row.total}
              </TableCell>
              <TableCell className="max-w-80 whitespace-normal px-3 py-0.5 text-muted-foreground">
                {row.notes}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </EvidenceCard>
  );
}

function KeyFindings({ lead }: { lead: SellerLead }) {
  const { draft } = getDecisionInspectionData(lead);
  const rows = [
    {
      label: "Major Issues",
      value: draft.majorIssues || "No major issues recorded.",
      icon: AlertTriangleIcon,
    },
    {
      label: "Recommended Repairs",
      value: draft.recommendedRepairs || "No recommended repairs recorded.",
      icon: WrenchIcon,
    },
    {
      label: "Inspector Notes",
      value: draft.inspectorNotes || "No inspector notes recorded.",
      icon: ClipboardPenLineIcon,
    },
  ];

  return (
    <EvidenceCard title="3. Key Findings" contentClassName="py-1.5">
      <dl>
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className={cn(
                "grid gap-2 py-2 text-xs sm:grid-cols-[1.6fr_4fr]",
                index > 0 && "border-t",
              )}
            >
              <dt className="flex items-start gap-2 font-semibold">
                <Icon className="mt-0.5 size-4 shrink-0" />
                {row.label}:
              </dt>
              <dd className="leading-5 text-muted-foreground">{row.value}</dd>
            </div>
          );
        })}
      </dl>
    </EvidenceCard>
  );
}

function SellerContext({ lead }: { lead: SellerLead }) {
  const previousFollowUp = lead.pipeline?.context.latestFollowUpAt
    ? format(
        new Date(lead.pipeline.context.latestFollowUpAt),
        "MMM d, yyyy, h:mm a",
      )
    : "No follow-up recorded";
  const rows = [
    ["Seller asking price", formatSellerLeadMoney(lead.askingPrice)],
    ["Contact number", lead.contactNumber || "Not recorded"],
    ["Region", lead.region || "Not recorded"],
    ["Original seller notes", lead.notes || "No seller notes recorded."],
    ["Inquiry source", lead.inquirySource || "Not recorded"],
    ["Previous follow-up", previousFollowUp],
  ];

  return (
    <EvidenceCard title="4. Seller Context" contentClassName="py-2">
      <dl className="grid sm:grid-cols-2">
        {rows.map(([label, value], index) => (
          <div
            key={label}
            className={cn(
              "grid min-w-0 gap-2 py-2 text-xs sm:grid-cols-[0.95fr_1.3fr] sm:px-3",
              index % 2 === 1 && "sm:border-l",
            )}
          >
            <dt className="font-semibold">{label}:</dt>
            <dd className="min-w-0 whitespace-pre-wrap text-muted-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </EvidenceCard>
  );
}

export function DecisionEvidenceColumn({ lead }: { lead: SellerLead }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <InspectionSummary lead={lead} />
      <ConditionBreakdown lead={lead} />
      <KeyFindings lead={lead} />
      <SellerContext lead={lead} />
    </div>
  );
}
