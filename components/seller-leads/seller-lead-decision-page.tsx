"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CarFrontIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  InfoIcon,
  LockKeyholeIcon,
  MessageCircleIcon,
  SearchIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { SubmitButton } from "@/components/operations/submit-button";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-update-seller-lead-mutation";
import { useSellerLeadQuery } from "@/hooks/queries/seller-leads/use-seller-lead-query";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api";
import type {
  SellerLead,
  SellerLeadDecision,
  SellerLeadInspectionFindings,
  SellerLeadInspectionRating,
  SellerLeadStatus,
  UpdateSellerLeadPayload,
} from "@/types/seller-leads";

const INSPECTION_KEYS = [
  "engine",
  "transmission",
  "suspension",
  "brakes",
  "tires",
  "exterior",
  "interior",
  "ac",
  "electrical",
  "papers",
] as const;

type InspectionKey = (typeof INSPECTION_KEYS)[number];

type DecisionAction = {
  title: string;
  description: string;
  decision: SellerLeadDecision | null;
  status: SellerLeadStatus;
  successMessage: string;
  icon: LucideIcon;
  tone: "neutral" | "warning" | "success" | "danger";
  pendingLabel: string;
};

const DECISION_ACTIONS: DecisionAction[] = [
  {
    title: "Need More Review",
    description:
      "Inspection is complete, but the team is not ready to choose buy or reject.",
    decision: null,
    status: "Evaluated",
    successMessage: "Lead kept under review",
    icon: SearchIcon,
    tone: "neutral",
    pendingLabel: "Saving review",
  },
  {
    title: "Negotiate",
    description: "Vehicle is viable, but price or terms need more discussion.",
    decision: "Negotiate",
    status: "Negotiating",
    successMessage: "Lead moved to negotiation",
    icon: MessageCircleIcon,
    tone: "warning",
    pendingLabel: "Saving negotiation",
  },
  {
    title: "Approve to Buy",
    description:
      "Inspection supports acquisition and the unit can move toward inventory.",
    decision: "Buy",
    status: "Approved to Buy",
    successMessage: "Lead approved to buy",
    icon: CheckCircle2Icon,
    tone: "success",
    pendingLabel: "Approving",
  },
  {
    title: "Walk Away",
    description:
      "Condition, price, or seller context makes this acquisition not worth continuing.",
    decision: "Walk Away",
    status: "Rejected",
    successMessage: "Lead rejected",
    icon: XCircleIcon,
    tone: "danger",
    pendingLabel: "Rejecting",
  },
];

const ACTION_TONE_CLASSES = {
  neutral: "bg-muted text-muted-foreground",
  warning:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  success:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  danger: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300",
} satisfies Record<DecisionAction["tone"], string>;

function formatInspectionLabel(key: InspectionKey) {
  if (key === "ac") return "A/C";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function getRecordedFindings(findings: SellerLeadInspectionFindings | null) {
  return INSPECTION_KEYS.flatMap((key) => {
    const finding = findings?.[key];
    return finding ? [{ key, ...finding }] : [];
  });
}

function getInspectionMetrics(lead: SellerLead) {
  const findings = getRecordedFindings(lead.inspectionFindings);

  if (!lead.inspectionCompletedAt || findings.length === 0) {
    return { score: null, readiness: null, poor: [], fair: [] };
  }

  const weights: Record<SellerLeadInspectionRating, number> = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1,
  };
  const score = Math.round(
    (findings.reduce((sum, finding) => sum + weights[finding.rating], 0) /
      (findings.length * 4)) *
      100,
  );
  const poor = findings.filter((finding) => finding.rating === "poor");
  const fair = findings.filter((finding) => finding.rating === "fair");
  const readiness =
    poor.length > 0
      ? "Needs attention"
      : fair.length >= 3
        ? "Proceed with caution"
        : "Ready for review";

  return { score, readiness, poor, fair };
}

function getVehicleTitle(lead: SellerLead) {
  return [
    lead.vehicleBrand,
    lead.vehicleModel,
    lead.vehicleYear ? String(lead.vehicleYear) : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function getVehicleSubtitle(lead: SellerLead) {
  return lead.vehicleVariant || "Variant not recorded";
}

function formatSellerLeadMoney(value: string | null) {
  if (!value) return "—";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

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

function getStatusBadgeClassName(status: SellerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";
    case "Contacted":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300";
    case "Inspection Scheduled":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300";
    case "Evaluated":
      return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300";
    case "Negotiating":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    case "Approved to Buy":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "Purchased":
      return "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300";
    case "Rejected":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300";
  }
}

function SectionCard({
  title,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card size="sm" className={cn("gap-0 rounded-lg py-0", className)}>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn("py-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

function LeadSummary({ lead }: { lead: SellerLead }) {
  const items = [
    { label: "Seller", value: lead.sellerName },
    {
      label: "Vehicle",
      value: getVehicleTitle(lead),
      detail: getVehicleSubtitle(lead),
    },
    {
      label: "Seller Asking Price",
      value: formatSellerLeadMoney(lead.askingPrice),
      emphasized: true,
    },
  ];

  return (
    <Card size="sm" className="gap-0 rounded-lg py-0">
      <CardContent className="grid p-0 sm:grid-cols-2 xl:grid-cols-[1fr_1.3fr_1fr_1fr_1fr_1fr_1fr]">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "flex min-w-0 flex-col gap-1 px-5 py-4",
              index > 0 && "border-t sm:border-t-0 sm:border-l",
            )}
          >
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p
              className={cn(
                "truncate font-semibold",
                item.emphasized && "text-lg",
              )}
              title={item.value}
            >
              {item.value}
            </p>
            {item.detail ? (
              <p className="truncate text-sm text-muted-foreground">
                {item.detail}
              </p>
            ) : null}
          </div>
        ))}
        <SummaryBadgeItem label="Current Status">
          <Badge
            variant="outline"
            className={getStatusBadgeClassName(lead.status)}
          >
            {lead.status}
          </Badge>
        </SummaryBadgeItem>
        <SummaryBadgeItem label="Inspection Status">
          <Badge variant={lead.inspectionCompletedAt ? "secondary" : "outline"}>
            {lead.inspectionCompletedAt ? "Recorded" : "Pending"}
          </Badge>
        </SummaryBadgeItem>
        <SummaryBadgeItem label="Current Decision">
          <Badge
            variant={
              lead.decision === "Walk Away" ? "destructive" : "secondary"
            }
          >
            {lead.decision ?? "Pending"}
          </Badge>
        </SummaryBadgeItem>
        <SummaryBadgeItem label="Approval State">
          <Badge
            variant={
              lead.status === "Approved to Buy" ? "secondary" : "outline"
            }
          >
            {lead.status === "Approved to Buy" ? "Approved" : "Not approved"}
          </Badge>
        </SummaryBadgeItem>
      </CardContent>
    </Card>
  );
}

function SummaryBadgeItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2 border-t px-5 py-4 sm:border-l xl:border-t-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function InspectionSummary({ lead }: { lead: SellerLead }) {
  const metrics = getInspectionMetrics(lead);
  const recordedAt = lead.inspectionCompletedAt
    ? format(new Date(lead.inspectionCompletedAt), "MMM d, yyyy")
    : "—";

  const summaryItems = [
    { label: "Inspection Recorded", value: recordedAt },
    {
      label: "Overall Score",
      value: metrics.score === null ? "— / 100" : `${metrics.score} / 100`,
    },
    { label: "Readiness", value: metrics.readiness ?? "—" },
    { label: "Poor Components", value: String(metrics.poor.length || "—") },
    { label: "Fair Components", value: String(metrics.fair.length || "—") },
  ];

  return (
    <SectionCard title="1. Inspection Summary">
      <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-3 xl:grid-cols-5">
        {summaryItems.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "flex min-w-0 flex-col gap-2 px-3",
              index > 0 && "border-l",
            )}
          >
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="truncate font-semibold" title={item.value}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function KeyFindings({ lead }: { lead: SellerLead }) {
  const metrics = getInspectionMetrics(lead);
  const findings = [...metrics.poor, ...metrics.fair];

  return (
    <SectionCard title="2. Key Findings">
      {findings.length === 0 ? (
        <Empty className="min-h-36 border p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-12 rounded-full">
              <ClipboardCheckIcon />
            </EmptyMedia>
            <EmptyTitle className="text-sm">
              {lead.inspectionCompletedAt
                ? "No condition concerns recorded."
                : "No inspection recorded yet."}
            </EmptyTitle>
            <EmptyDescription>
              {lead.inspectionCompletedAt
                ? "The inspection did not identify poor or fair components."
                : "Complete the inspection to view key findings."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup className="gap-0 overflow-hidden rounded-md border">
          {findings.map((finding) => (
            <Item
              key={finding.key}
              className="rounded-none border-0 border-b last:border-b-0"
            >
              <ItemMedia
                variant="icon"
                className={cn(
                  "rounded-md p-2",
                  finding.rating === "poor"
                    ? ACTION_TONE_CLASSES.danger
                    : ACTION_TONE_CLASSES.warning,
                )}
              >
                <AlertTriangleIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{formatInspectionLabel(finding.key)}</ItemTitle>
                <ItemDescription>
                  {finding.notes || `${finding.rating} condition recorded.`}
                </ItemDescription>
              </ItemContent>
              <Badge
                variant={finding.rating === "poor" ? "destructive" : "outline"}
                className="capitalize"
              >
                {finding.rating}
              </Badge>
            </Item>
          ))}
        </ItemGroup>
      )}
    </SectionCard>
  );
}

function SellerContext({ lead }: { lead: SellerLead }) {
  const rows = [
    ["Seller Asking Price", formatSellerLeadMoney(lead.askingPrice)],
    ["Region", lead.region || "Not recorded"],
    ["Inquiry Source", lead.inquirySource || "Not recorded"],
    ["Original Seller Notes", lead.notes || "No seller notes recorded."],
  ];

  return (
    <SectionCard title="3. Seller Context">
      <dl className="-mx-4 -my-4">
        {rows.map(([label, value], index) => (
          <div
            key={label}
            className={cn(
              "grid gap-2 px-5 py-3 text-sm sm:grid-cols-[0.9fr_1.25fr]",
              index > 0 && "border-t",
            )}
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="whitespace-pre-wrap">{value}</dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}

function ReviewNote({
  value,
  onChange,
  onSave,
  pending,
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  pending: boolean;
}) {
  return (
    <SectionCard title="1. Review Note" contentClassName="pt-0 pb-3">
      <FieldGroup className="gap-3">
        <Field className="gap-1">
          <FieldLabel htmlFor="decision-note">Review note</FieldLabel>
          <Textarea
            id="decision-note"
            rows={4}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Summarize why this vehicle needs more review, negotiation, approval, or rejection."
            className="min-h-24 resize-y"
          />
        </Field>
        <SubmitButton
          type="button"
          variant="outline"
          className="w-fit"
          pending={pending}
          pendingLabel="Saving note"
          onClick={onSave}
        >
          Save Review Note
        </SubmitButton>
      </FieldGroup>
    </SectionCard>
  );
}

function DecisionActions({
  disabled,
  pending,
  onAction,
}: {
  disabled: boolean;
  pending: boolean;
  onAction: (action: DecisionAction) => void;
}) {
  return (
    <SectionCard
      title="2. Decision Actions"
      action={
        disabled ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <InfoIcon className="size-3.5" />
            Actions are disabled until inspection is recorded.
          </p>
        ) : null
      }
    >
      <ItemGroup className="gap-0 overflow-hidden rounded-md border">
        {DECISION_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Item
              key={action.title}
              className="flex-nowrap rounded-none border-0 border-b px-3 py-2.5 last:border-b-0"
              data-disabled={disabled || pending}
            >
              <ItemMedia
                variant="icon"
                className={cn(
                  "rounded-full p-2.5",
                  ACTION_TONE_CLASSES[action.tone],
                )}
              >
                <Icon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{action.title}</ItemTitle>
                <ItemDescription className="text-xs leading-snug">
                  {action.description}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <SubmitButton
                  type="button"
                  variant="outline"
                  className="w-32"
                  pending={pending}
                  pendingLabel="Saving"
                  disabled={disabled}
                  onClick={() => onAction(action)}
                >
                  {disabled ? (
                    <>
                      <LockKeyholeIcon data-icon="inline-start" />
                      Disabled
                    </>
                  ) : (
                    action.title
                  )}
                </SubmitButton>
              </ItemActions>
            </Item>
          );
        })}
      </ItemGroup>
    </SectionCard>
  );
}

function ConversionAction({ lead }: { lead: SellerLead }) {
  const enabled = lead.status === "Approved to Buy";

  return (
    <Card size="sm" className="gap-0 rounded-lg py-0">
      <CardContent className="p-0">
        <Item className="flex-nowrap border-0 px-4 py-3">
          <ItemMedia
            variant="icon"
            className="rounded-md bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <CarFrontIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Convert to Vehicle</ItemTitle>
            <ItemDescription>
              Convert this lead into a vehicle and move it to inventory.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            {enabled ? (
              <Button type="button" asChild>
                <Link href={buildConvertVehicleHref(lead)}>
                  Convert to Vehicle
                </Link>
              </Button>
            ) : (
              <Button type="button" className="w-32" disabled>
                <LockKeyholeIcon data-icon="inline-start" />
                Disabled
              </Button>
            )}
          </ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
}

function DecisionWorkspace({ lead }: { lead: SellerLead }) {
  const router = useRouter();
  const updateMutation = useUpdateSellerLeadMutation();
  const [decisionNote, setDecisionNote] = React.useState(
    lead.decisionNote ?? "",
  );
  const inspectionMissing = !lead.inspectionCompletedAt;

  async function save(
    payload: UpdateSellerLeadPayload,
    successMessage: string,
  ) {
    await updateMutation.mutateAsync(
      { id: lead.id, payload },
      { onSuccess: () => toast.success(successMessage) },
    );
  }

  function saveNote() {
    void save(
      { decisionNote: decisionNote.trim() || null },
      "Review note updated",
    );
  }

  function applyDecision(action: DecisionAction) {
    void (async () => {
      await save(
        {
          decision: action.decision,
          decisionNote: decisionNote.trim() || null,
          status: action.status,
        },
        `${action.successMessage}. Returning to seller lead overview.`,
      );
      router.push(`/seller-leads/${lead.id}`);
    })();
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-normal">
            Seller Lead Decision
          </h1>
          <p className="text-sm text-muted-foreground">
            Review the inspection result and choose the next acquisition step.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link href="/seller-leads">
            <ArrowLeftIcon data-icon="inline-start" />
            Back to Seller Leads
          </Link>
        </Button>
      </div>

      {inspectionMissing ? (
        <Alert className="border-amber-300 bg-amber-50/70 pr-4 text-amber-950 sm:pr-40 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <AlertTriangleIcon className="text-amber-500" />
          <AlertDescription className="text-amber-950/80 dark:text-amber-100/80">
            <span className="font-medium text-amber-950 dark:text-amber-100">
              Inspection required.
            </span>{" "}
            Save the vehicle inspection before making an acquisition decision.
          </AlertDescription>
          <AlertAction className="static col-span-full mt-3 sm:absolute sm:top-2.5 sm:mt-0">
            <Button
              type="button"
              size="sm"
              className="bg-amber-600 text-white hover:bg-amber-700"
              asChild
            >
              <Link href={`/seller-leads/${lead.id}/inspection`}>
                Start Inspection
              </Link>
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <LeadSummary lead={lead} />

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <InspectionSummary lead={lead} />
          <KeyFindings lead={lead} />
          <SellerContext lead={lead} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <ReviewNote
            value={decisionNote}
            onChange={setDecisionNote}
            onSave={saveNote}
            pending={updateMutation.isPending}
          />
          <DecisionActions
            disabled={inspectionMissing}
            pending={updateMutation.isPending}
            onAction={applyDecision}
          />
          <ConversionAction lead={lead} />
        </div>
      </div>
    </div>
  );
}

export function SellerLeadDecisionPage({ leadId }: { leadId: string }) {
  const leadQuery = useSellerLeadQuery(leadId);
  const lead = leadQuery.data?.sellerLead;
  const shellProps = {
    title: "Seller Lead Decision",
    breadcrumbs: [
      { label: "Seller Leads", href: "/seller-leads" },
      { label: "Decision" },
    ],
  };

  if (leadQuery.isPending) {
    return (
      <AuthenticatedAppShell {...shellProps}>
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <ModuleLoadingState label="Loading seller lead decision" />
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
      <DecisionWorkspace lead={lead} />
    </AuthenticatedAppShell>
  );
}
