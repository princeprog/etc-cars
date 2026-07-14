"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  FileTextIcon,
  GavelIcon,
  PencilIcon,
  UserIcon,
} from "lucide-react";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSellerLeadQuery } from "@/hooks/queries/seller-leads/use-seller-lead-query";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api";
import type { SellerLead, SellerLeadStatus } from "@/types/seller-leads";
import {
  getInspectionDraft,
  getInspectionMetrics,
  formatSellerLeadMoney,
  getVehicleTitle,
} from "./seller-lead-inspection-model";

type OverviewTask = {
  label: string;
  description: string;
  href: string;
  icon: typeof FileTextIcon;
  secondaryLabel?: string;
  secondaryHref?: string;
};

type DetailRow = {
  label: string;
  value: string;
  href?: string;
};

const INSPECTION_LABELS: Record<string, string> = {
  engine: "Engine",
  transmission: "Transmission",
  suspension: "Suspension",
  brakes: "Brakes",
  tires: "Tires",
  exterior: "Exterior",
  interior: "Interior",
  ac: "A/C",
  electrical: "Electrical",
  papers: "Documents",
};

function buildConvertVehicleHref(lead: SellerLead) {
  const params = new URLSearchParams({
    sellerLeadId: lead.id,
    sellerName: lead.sellerName,
    vehicleBrand: lead.vehicleBrand,
    vehicleModel: lead.vehicleModel,
  });

  if (lead.vehicleYear) params.set("vehicleYear", String(lead.vehicleYear));
  if (lead.vehicleVariant) params.set("vehicleVariant", lead.vehicleVariant);
  if (lead.askingPrice) params.set("askingPrice", lead.askingPrice);
  if (lead.region) params.set("region", lead.region);
  if (lead.notes) params.set("notes", lead.notes);

  return `/vehicles/new?${params.toString()}`;
}

function getPrimaryTask(lead: SellerLead): OverviewTask {
  if (lead.status === "Approved to Buy") {
    return {
      label: "Convert to Vehicle",
      description:
        "This lead is approved. Convert it into inventory and continue the acquisition record.",
      href: buildConvertVehicleHref(lead),
      icon: ClipboardListIcon,
      secondaryLabel: "Review Decision",
      secondaryHref: `/seller-leads/${lead.id}/decision`,
    };
  }

  if (lead.status === "Purchased" || lead.status === "Rejected") {
    return {
      label: "View Record",
      description:
        "This acquisition path is closed. Review the completed seller lead record.",
      href: `/seller-leads/${lead.id}`,
      icon: FileTextIcon,
    };
  }

  if (lead.status === "Evaluated" || lead.status === "Negotiating") {
    return {
      label: "Review Decision",
      description:
        "Inspection is complete. Review the findings and choose whether to negotiate, approve, or walk away.",
      href: `/seller-leads/${lead.id}/decision`,
      icon: FileTextIcon,
      secondaryLabel: "Schedule Follow-Up",
      secondaryHref: "/follow-ups",
    };
  }

  return {
    label: "Start Inspection",
    description:
      "Record the vehicle condition before choosing the next acquisition step.",
    href: `/seller-leads/${lead.id}/inspection`,
    icon: ClipboardCheckIcon,
    secondaryLabel: "Schedule Follow-Up",
    secondaryHref: "/follow-ups",
  };
}

function getStatusBadgeClassName(status: SellerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Contacted":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "Inspection Scheduled":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "Evaluated":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "Negotiating":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Approved to Buy":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Purchased":
      return "border-teal-200 bg-teal-50 text-teal-700";
    case "Rejected":
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}

function getDecisionBadgeClassName(lead: SellerLead) {
  if (lead.decision === "Buy") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (lead.decision === "Walk Away") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (lead.decision === "Negotiate") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getReadinessLabel(readiness: string) {
  if (readiness === "Ready for Decision") return "Ready for review";
  if (readiness === "Proceed with Caution") return "Proceed with caution";
  return "Needs review";
}

function getInspectionLabel(key: string) {
  return INSPECTION_LABELS[key] ?? key;
}

function getKeyFindings(lead: SellerLead) {
  return Object.entries(lead.inspectionFindings ?? {})
    .filter(([, finding]) => finding?.rating === "fair" || finding?.rating === "poor")
    .map(([key, finding]) => ({
      key,
      label: getInspectionLabel(key),
      rating: finding.rating,
      notes: finding.notes,
    }));
}

function formatDateTime(value: string | null) {
  if (!value) return "Not recorded";
  return format(new Date(value), "MMM d, yyyy h:mm a");
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  return format(new Date(value), "MMM d, yyyy");
}

function SummaryBadge({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 border-t px-5 py-4 md:border-l md:border-t-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function SummaryValue({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-t px-5 py-4 first:border-t-0 md:border-l md:border-t-0 md:first:border-l-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="truncate font-semibold" title={value}>
        {value}
      </p>
      {detail ? (
        <p className="truncate text-sm text-muted-foreground" title={detail}>
          {detail}
        </p>
      ) : null}
    </div>
  );
}

function LeadSummary({ lead }: { lead: SellerLead }) {
  return (
    <Card size="sm" className="rounded-lg py-0">
      <CardContent className="grid p-0 md:grid-cols-3 xl:grid-cols-[1fr_1.35fr_1fr_1fr_1fr_1fr_1fr]">
        <SummaryValue label="Seller" value={lead.sellerName} />
        <SummaryValue
          label="Vehicle"
          value={getVehicleTitle(lead)}
          detail={lead.vehicleVariant ?? "Variant not recorded"}
        />
        <SummaryValue
          label="Asking Price"
          value={formatSellerLeadMoney(lead.askingPrice)}
        />
        <SummaryBadge label="Current Status">
          <Badge variant="outline" className={getStatusBadgeClassName(lead.status)}>
            {lead.status}
          </Badge>
        </SummaryBadge>
        <SummaryBadge label="Inspection Status">
          <Badge
            variant="outline"
            className={
              lead.inspectionCompletedAt
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-muted bg-muted text-muted-foreground"
            }
          >
            {lead.inspectionCompletedAt ? "Recorded" : "Pending"}
          </Badge>
        </SummaryBadge>
        <SummaryBadge label="Current Decision">
          <Badge variant="outline" className={getDecisionBadgeClassName(lead)}>
            {lead.decision ?? "Pending"}
          </Badge>
        </SummaryBadge>
        <SummaryBadge label="Approval State">
          <Badge variant="secondary">
            {lead.status === "Approved to Buy" ? "Approved" : "Not approved"}
          </Badge>
        </SummaryBadge>
      </CardContent>
    </Card>
  );
}

function RecommendedTaskCard({ lead }: { lead: SellerLead }) {
  const task = getPrimaryTask(lead);
  const Icon = task.icon;

  return (
    <Card size="sm" className="rounded-lg">
      <CardContent className="grid gap-5 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-9" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Recommended Next Task</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            {task.label}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {task.description}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
          <Button className="min-w-56" asChild>
            <Link href={task.href}>
              <Icon data-icon="inline-start" />
              {task.label}
            </Link>
          </Button>
          {task.secondaryLabel && task.secondaryHref ? (
            <Button variant="outline" className="min-w-56" asChild>
              <Link href={task.secondaryHref}>
                <CalendarIcon data-icon="inline-start" />
                {task.secondaryLabel}
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: ReactNode;
  rows: DetailRow[];
}) {
  return (
    <Card size="sm" className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[9.5rem_1fr] items-start gap-3"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="min-w-0 font-medium">
                {row.href ? (
                  <Link className="truncate text-primary hover:underline" href={row.href}>
                    {row.value}
                  </Link>
                ) : (
                  <span className="whitespace-pre-wrap">{row.value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function SellerInformationCard({ lead }: { lead: SellerLead }) {
  return (
    <DetailCard
      title="Seller Information"
      icon={<UserIcon className="size-4" />}
      rows={[
        { label: "Seller Name", value: lead.sellerName },
        { label: "Facebook Name", value: lead.facebookName ?? "Not recorded" },
        { label: "Contact Number", value: lead.contactNumber },
        { label: "Region", value: lead.region ?? "Not recorded" },
        {
          label: "Email",
          value: lead.email ?? "Not recorded",
          href: lead.email ? `mailto:${lead.email}` : undefined,
        },
        {
          label: "Inquiry Source",
          value: lead.inquirySource ?? "Not recorded",
        },
      ]}
    />
  );
}

function VehicleInformationCard({ lead }: { lead: SellerLead }) {
  return (
    <DetailCard
      title="Vehicle Information"
      icon={<ClipboardCheckIcon className="size-4" />}
      rows={[
        { label: "Brand", value: lead.vehicleBrand },
        { label: "Variant", value: lead.vehicleVariant ?? "Not recorded" },
        { label: "Model", value: lead.vehicleModel },
        {
          label: "Asking Price",
          value: formatSellerLeadMoney(lead.askingPrice),
        },
        {
          label: "Year",
          value: lead.vehicleYear ? String(lead.vehicleYear) : "Not recorded",
        },
        { label: "Notes", value: lead.notes ?? "No seller notes recorded." },
      ]}
    />
  );
}

function InspectionSnapshot({ lead }: { lead: SellerLead }) {
  const draft = getInspectionDraft(lead);
  const metrics = getInspectionMetrics(draft);
  const findings = getKeyFindings(lead);

  return (
    <Card size="sm" className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardListIcon className="size-4" />
          Inspection Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 text-sm lg:grid-cols-[1fr_0.85fr]">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <SnapshotRow
            label="Inspection Recorded"
            value={formatDateTime(lead.inspectionCompletedAt)}
          />
          <SnapshotRow label="Fair Components" value={String(metrics.counts.fair)} />
          <SnapshotRow
            label="Overall Score"
            value={`${metrics.score} / 100`}
            valueClassName="text-amber-600"
          />
          <SnapshotRow label="Poor Components" value={String(metrics.counts.poor)} />
          <SnapshotRow
            label="Readiness"
            value={getReadinessLabel(metrics.readiness)}
            badgeClassName={
              metrics.readiness === "Needs Review"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }
          />
        </dl>
        <div className="grid grid-cols-[7rem_1fr] gap-3">
          <p className="text-muted-foreground">Key Findings</p>
          {findings.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {findings.slice(0, 4).map((finding) => (
                <li key={finding.key} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>
                    {finding.label}:{" "}
                    <span
                      className={cn(
                        "font-medium capitalize",
                        finding.rating === "poor"
                          ? "text-rose-600"
                          : "text-amber-600",
                      )}
                    >
                      {finding.rating}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-medium">No key findings recorded.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SnapshotRow({
  label,
  value,
  valueClassName,
  badgeClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  badgeClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[9.5rem_1fr] items-start gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-semibold", valueClassName)}>
        {badgeClassName ? (
          <Badge variant="outline" className={badgeClassName}>
            {value}
          </Badge>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function DecisionSnapshot({ lead }: { lead: SellerLead }) {
  return (
    <Card size="sm" className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <GavelIcon className="size-4" />
          Decision Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm md:grid-cols-[1fr_auto] md:items-center">
        <dl className="grid gap-y-3">
          <SnapshotRow
            label="Current Decision"
            value={lead.decision ?? "Pending"}
            badgeClassName={getDecisionBadgeClassName(lead)}
          />
          <SnapshotRow
            label="Decision Note"
            value={lead.decisionNote ?? "No review note recorded yet."}
          />
          <SnapshotRow label="Last Updated" value={formatDate(lead.updatedAt)} />
        </dl>
        <Button variant="outline" className="md:min-w-56" asChild>
          <Link href={`/seller-leads/${lead.id}/decision`}>
            <FileTextIcon data-icon="inline-start" />
            Open Decision Review
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PageHeader({ lead }: { lead: SellerLead }) {
  const task = getPrimaryTask(lead);
  const Icon = task.icon;

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link href="/seller-leads" className="text-primary hover:underline">
            Seller Leads
          </Link>
          <span className="text-muted-foreground">/</span>
          <span>Seller Lead Overview</span>
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-normal">
          Seller Lead Overview
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review seller intake, inspection outcome, decision status, and next task.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" asChild>
          <Link href="/seller-leads">
            <ArrowLeftIcon data-icon="inline-start" />
            Back to Seller Leads
          </Link>
        </Button>
        <Button variant="outline" disabled>
          <PencilIcon data-icon="inline-start" />
          Edit Lead
        </Button>
        <Button asChild>
          <Link href={task.href}>
            <Icon data-icon="inline-start" />
            {task.label}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SellerLeadOverview({ lead }: { lead: SellerLead }) {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <PageHeader lead={lead} />
      <LeadSummary lead={lead} />
      <RecommendedTaskCard lead={lead} />
      <div className="grid items-start gap-5 xl:grid-cols-[0.9fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <SellerInformationCard lead={lead} />
          <VehicleInformationCard lead={lead} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <InspectionSnapshot lead={lead} />
          <DecisionSnapshot lead={lead} />
        </div>
      </div>
    </div>
  );
}

export function SellerLeadEvaluationPage({ leadId }: { leadId: string }) {
  const leadQuery = useSellerLeadQuery(leadId);
  const lead = leadQuery.data?.sellerLead;
  const shellProps = {
    title: "Seller Lead Overview",
    breadcrumbs: [
      { label: "Seller Leads", href: "/seller-leads" },
      { label: "Seller Lead Overview" },
    ],
    hideHeader: true,
  };

  if (leadQuery.isPending) {
    return (
      <AuthenticatedAppShell {...shellProps}>
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <ModuleLoadingState label="Loading seller lead overview" />
        </div>
      </AuthenticatedAppShell>
    );
  }

  if (leadQuery.error) {
    return (
      <AuthenticatedAppShell {...shellProps}>
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <ApiErrorAlert
            title="Unable to load seller lead"
            message={getApiErrorMessage(leadQuery.error, "")}
          />
        </div>
      </AuthenticatedAppShell>
    );
  }

  if (!lead) {
    return (
      <AuthenticatedAppShell {...shellProps}>
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <EmptyState
            title="Seller lead not found"
            description="The requested seller lead could not be loaded."
          />
        </div>
      </AuthenticatedAppShell>
    );
  }

  return (
    <AuthenticatedAppShell {...shellProps}>
      <SellerLeadOverview lead={lead} />
    </AuthenticatedAppShell>
  );
}
