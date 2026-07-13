"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  AlertTriangleIcon,
  MessageSquareTextIcon,
  SparklesIcon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { SubmitButton } from "@/components/operations/submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUpdateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-update-seller-lead-mutation";
import { useSellerLeadQuery } from "@/hooks/queries/seller-leads/use-seller-lead-query";
import { getApiErrorMessage } from "@/types/api";
import {
  SELLER_LEAD_INSPECTION_RATINGS,
  type SellerLead,
  type SellerLeadDecision,
  type SellerLeadInspectionFindings,
  type SellerLeadInspectionRating,
  type SellerLeadStatus,
  type UpdateSellerLeadPayload,
} from "@/types/seller-leads";
import { formatVehicleMoney } from "../vehicles/vehicles.helpers";

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

type OverviewFormValues = {
  sellerName: string;
  contactNumber: string;
  email: string;
  facebookName: string;
  inquirySource: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleVariant: string;
  askingPrice: string;
  region: string;
  notes: string;
};

type InspectionFormValues = {
  inspectionCompletedAt: string;
  inspectionNotes: string;
  inspectionFindings: Record<
    InspectionKey,
    { rating: SellerLeadInspectionRating; notes: string }
  >;
};

type DecisionFormValues = {
  decision: SellerLeadDecision | "";
  decisionNote: string;
  status: SellerLeadStatus;
};

function getEmptyInspectionFindings(): InspectionFormValues["inspectionFindings"] {
  return {
    engine: { rating: "good", notes: "" },
    transmission: { rating: "good", notes: "" },
    suspension: { rating: "good", notes: "" },
    brakes: { rating: "good", notes: "" },
    tires: { rating: "good", notes: "" },
    exterior: { rating: "good", notes: "" },
    interior: { rating: "good", notes: "" },
    ac: { rating: "good", notes: "" },
    electrical: { rating: "good", notes: "" },
    papers: { rating: "good", notes: "" },
  };
}

function mapInspectionFindings(
  findings: SellerLeadInspectionFindings | null | undefined,
) {
  const next = getEmptyInspectionFindings();

  for (const key of INSPECTION_KEYS) {
    const current = findings?.[key];
    if (current) {
      next[key] = {
        rating: current.rating,
        notes: current.notes ?? "",
      };
    }
  }

  return next;
}

function getOverviewFormValues(lead: SellerLead): OverviewFormValues {
  return {
    sellerName: lead.sellerName,
    contactNumber: lead.contactNumber,
    email: lead.email ?? "",
    facebookName: lead.facebookName ?? "",
    inquirySource: lead.inquirySource ?? "",
    vehicleBrand: lead.vehicleBrand,
    vehicleModel: lead.vehicleModel,
    vehicleYear: lead.vehicleYear ? String(lead.vehicleYear) : "",
    vehicleVariant: lead.vehicleVariant ?? "",
    askingPrice: lead.askingPrice ?? "",
    region: lead.region ?? "",
    notes: lead.notes ?? "",
  };
}

function getInspectionFormValues(lead: SellerLead): InspectionFormValues {
  return {
    inspectionCompletedAt: lead.inspectionCompletedAt
      ? lead.inspectionCompletedAt.slice(0, 16)
      : "",
    inspectionNotes: lead.inspectionNotes ?? "",
    inspectionFindings: mapInspectionFindings(lead.inspectionFindings),
  };
}

function getDecisionFormValues(lead: SellerLead): DecisionFormValues {
  return {
    decision: lead.decision ?? "",
    decisionNote: lead.decisionNote ?? "",
    status: lead.status,
  };
}

function toInspectionFindingsPayload(
  values: InspectionFormValues["inspectionFindings"],
) {
  return Object.fromEntries(
    INSPECTION_KEYS.map((key) => [
      key,
      {
        rating: values[key].rating,
        notes: values[key].notes.trim() || null,
      },
    ]),
  );
}

function buildInspectionPayload(
  values: InspectionFormValues,
): UpdateSellerLeadPayload {
  return {
    inspectionCompletedAt: values.inspectionCompletedAt
      ? new Date(values.inspectionCompletedAt).toISOString()
      : null,
    inspectionNotes: values.inspectionNotes || null,
    inspectionFindings: toInspectionFindingsPayload(values.inspectionFindings),
  };
}

function buildDecisionPayload(
  values: DecisionFormValues,
): UpdateSellerLeadPayload {
  return {
    decision: values.decision || null,
    decisionNote: values.decisionNote || null,
    status: values.status,
  };
}

function getStatusAfterInspection(status: SellerLeadStatus): SellerLeadStatus {
  if (["Approved to Buy", "Purchased", "Rejected"].includes(status)) {
    return status;
  }

  return "Evaluated";
}

function formatInspectionLabel(key: InspectionKey) {
  if (key === "ac") return "A/C";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function getInspectionRatingColor(rating: SellerLeadInspectionRating) {
  switch (rating) {
    case "excellent":
      return "bg-emerald-500";
    case "good":
      return "bg-blue-500";
    case "fair":
      return "bg-amber-500";
    case "poor":
      return "bg-rose-500";
    default:
      return "bg-muted";
  }
}

function getInspectionScore(
  findings: InspectionFormValues["inspectionFindings"],
) {
  const weights: Record<SellerLeadInspectionRating, number> = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1,
  };

  const total = INSPECTION_KEYS.reduce(
    (sum, key) => sum + weights[findings[key].rating],
    0,
  );

  return Math.round((total / (INSPECTION_KEYS.length * 4)) * 100);
}

function getInspectionBreakdown(
  findings: InspectionFormValues["inspectionFindings"],
) {
  const poor = INSPECTION_KEYS.filter((key) => findings[key].rating === "poor");
  const fair = INSPECTION_KEYS.filter((key) => findings[key].rating === "fair");
  const strong = INSPECTION_KEYS.filter((key) =>
    ["excellent", "good"].includes(findings[key].rating),
  );

  return { poor, fair, strong };
}

function getInspectionReadiness(
  findings: InspectionFormValues["inspectionFindings"],
) {
  const { poor, fair } = getInspectionBreakdown(findings);

  if (poor.length > 0) {
    return {
      label: "Needs attention",
      description: "Critical issues found. Review before deciding.",
      progress: 38,
    };
  }

  if (fair.length >= 3) {
    return {
      label: "Proceed with caution",
      description:
        "Vehicle can move forward, but condition issues need review.",
      progress: 68,
    };
  }

  return {
    label: "Ready for review",
    description:
      "Condition profile is stable enough to review the acquisition path.",
    progress: 84,
  };
}

function getSellerLeadVehicleLabel(lead: SellerLead) {
  return [
    lead.vehicleBrand,
    lead.vehicleModel,
    lead.vehicleYear ? String(lead.vehicleYear) : "",
    lead.vehicleVariant ?? "",
  ]
    .filter(Boolean)
    .join(" • ");
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

function getStatusBadgeVariant(
  status: SellerLeadStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Approved to Buy":
    case "Purchased":
      return "secondary";
    case "Rejected":
      return "destructive";
    default:
      return "outline";
  }
}

function getDecisionBadgeVariant(
  decision: SellerLeadDecision | null,
): "default" | "secondary" | "outline" | "destructive" {
  switch (decision) {
    case "Buy":
      return "secondary";
    case "Walk Away":
      return "destructive";
    default:
      return "outline";
  }
}

function serialize(value: unknown) {
  return JSON.stringify(value);
}

function getNextTaskLabel(lead: SellerLead) {
  if (lead.status === "Approved to Buy") return "Convert to Vehicle";
  if (lead.status === "Purchased" || lead.status === "Rejected")
    return "View Record";
  if (lead.status === "Evaluated" || lead.status === "Negotiating")
    return "Review Decision";
  return "Start Inspection";
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/15 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-foreground">
        {value || "—"}
      </p>
    </div>
  );
}

function OverviewTab({ values }: { values: OverviewFormValues }) {
  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Intake Snapshot</CardTitle>
        <CardDescription>
          Reference the seller profile and original vehicle intake while moving
          through inspection and review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Seller Details
            </h3>
            <p className="text-sm text-muted-foreground">
              Contact details captured during lead creation.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SnapshotItem label="Seller name" value={values.sellerName} />
            <SnapshotItem label="Contact number" value={values.contactNumber} />
            <SnapshotItem label="Email" value={values.email} />
            <SnapshotItem label="Facebook name" value={values.facebookName} />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Vehicle Intake
            </h3>
            <p className="text-sm text-muted-foreground">
              Original vehicle details and asking price for review context.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SnapshotItem label="Vehicle brand" value={values.vehicleBrand} />
            <SnapshotItem label="Vehicle model" value={values.vehicleModel} />
            <SnapshotItem label="Year" value={values.vehicleYear} />
            <SnapshotItem label="Variant" value={values.vehicleVariant} />
            <SnapshotItem
              label="Seller asking price"
              value={formatVehicleMoney(values.askingPrice)}
            />
            <SnapshotItem label="Inquiry source" value={values.inquirySource} />
            <SnapshotItem label="Region" value={values.region} />
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Seller notes
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
              {values.notes || "No seller notes recorded."}
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function InspectionTab({
  values,
  onChange,
  onSave,
  pending,
  dirty,
}: {
  values: InspectionFormValues;
  onChange: (values: InspectionFormValues) => void;
  onSave: () => Promise<void>;
  pending: boolean;
  dirty: boolean;
}) {
  function updateInspectionField(
    key: InspectionKey,
    field: "rating" | "notes",
    value: string,
  ) {
    onChange({
      ...values,
      inspectionFindings: {
        ...values.inspectionFindings,
        [key]: {
          ...values.inspectionFindings[key],
          [field]: value,
        },
      },
    });
  }

  const score = getInspectionScore(values.inspectionFindings);
  const breakdown = getInspectionBreakdown(values.inspectionFindings);
  const readiness = getInspectionReadiness(values.inspectionFindings);
  const fairCount = breakdown.fair.length;
  const poorCount = breakdown.poor.length;
  const strongCount = breakdown.strong.length;

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">
                Vehicle Condition Checklist
              </CardTitle>
              <CardDescription>
                Rate each component and leave short professional notes for
                review and negotiation.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {SELLER_LEAD_INSPECTION_RATINGS.map((rating) => (
                <div
                  key={rating}
                  className="flex items-center gap-2 rounded-full border px-3 py-1"
                >
                  <span
                    className={`size-2 rounded-full ${getInspectionRatingColor(rating)}`}
                  />
                  <span className="capitalize">{rating}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {INSPECTION_KEYS.map((key) => (
              <Card key={key} className="border-border/70 shadow-none">
                <CardContent className="flex flex-col gap-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {formatInspectionLabel(key)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Condition rating and inspection remark
                      </p>
                    </div>
                    <span
                      className={`mt-1 size-2.5 rounded-full ${getInspectionRatingColor(values.inspectionFindings[key].rating)}`}
                    />
                  </div>

                  <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    spacing={0}
                    value={values.inspectionFindings[key].rating}
                    onValueChange={(value) => {
                      if (value) {
                        updateInspectionField(key, "rating", value);
                      }
                    }}
                    className="w-full"
                  >
                    {SELLER_LEAD_INSPECTION_RATINGS.map((rating) => (
                      <ToggleGroupItem
                        key={rating}
                        value={rating}
                        className="flex-1 capitalize"
                        aria-label={`${formatInspectionLabel(key)} ${rating}`}
                      >
                        {rating.charAt(0).toUpperCase()}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>

                  <Input
                    value={values.inspectionFindings[key].notes}
                    onChange={(event) =>
                      updateInspectionField(key, "notes", event.target.value)
                    }
                    placeholder="Add inspection note"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Detailed Findings</CardTitle>
          <CardDescription>
            Summarized insights based on the condition checklist recorded above.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          <div className="rounded-xl border bg-muted/15 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="mt-0.5 size-4 text-rose-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Major Defects Found
                </p>
                {poorCount > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {breakdown.poor.map((key) => (
                      <li key={key}>
                        <span className="font-medium text-foreground">
                          {formatInspectionLabel(key)}:
                        </span>{" "}
                        {values.inspectionFindings[key].notes ||
                          "Requires immediate review."}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No major defects recorded during inspection.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <div className="flex items-start gap-3">
              <WrenchIcon className="mt-0.5 size-4 text-amber-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Immediate Repair Needs
                </p>
                {fairCount > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {breakdown.fair.map((key) => (
                      <li key={key}>
                        <span className="font-medium text-foreground">
                          {formatInspectionLabel(key)}:
                        </span>{" "}
                        {values.inspectionFindings[key].notes ||
                          "Review this condition item before deciding."}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No moderate issues flagged for immediate review attention.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <div className="flex items-start gap-3">
              <SparklesIcon className="mt-0.5 size-4 text-emerald-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Strong Condition Areas
                </p>
                {strongCount > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {breakdown.strong.slice(0, 5).map((key) => (
                      <li key={key}>
                        <span className="font-medium text-foreground">
                          {formatInspectionLabel(key)}:
                        </span>{" "}
                        {values.inspectionFindings[key].notes ||
                          "Condition supports a positive buy case."}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No strong-condition highlights recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <div className="flex items-start gap-3">
              <MessageSquareTextIcon className="mt-0.5 size-4 text-blue-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Recommended Next Steps
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>
                    Review the seller asking price against the recorded
                    condition.
                  </li>
                  <li>
                    Use fair and poor components as negotiation or review
                    points.
                  </li>
                  <li>
                    Choose whether to buy now, negotiate, keep reviewing, or
                    walk away.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Visual Inspection Summary</CardTitle>
          <CardDescription>
            A quick operational view of condition quality and readiness for
            review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Overall Inspection Score
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold text-foreground">
                  {score}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">/100</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {score >= 75
                  ? "Good condition"
                  : score >= 55
                    ? "Mixed condition"
                    : "High review required"}
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Poor Components
              </p>
              <p className="mt-3 text-4xl font-semibold text-rose-500">
                {poorCount}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Out of {INSPECTION_KEYS.length} inspected areas
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Fair Components
              </p>
              <p className="mt-3 text-4xl font-semibold text-amber-500">
                {fairCount}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Items likely to affect reconditioning budget
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Readiness
              </p>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {readiness.label}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {readiness.description}
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  Inspection Readiness
                </p>
                <span className="text-sm font-medium text-muted-foreground">
                  {readiness.progress}%
                </span>
              </div>
              <Progress value={readiness.progress} />
            </div>
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangleIcon className="text-amber-500" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                {poorCount > 0
                  ? "Critical issues were recorded. Review the inspection before moving to decision."
                  : fairCount > 0
                    ? "No critical issues detected, but moderate condition items should shape the decision."
                    : "No material condition blockers detected. This unit appears clean enough to review."}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {dirty
            ? "You have unsaved changes in Inspection."
            : "Inspection is up to date."}
        </p>
        <SubmitButton
          type="button"
          onClick={() => void onSave()}
          pending={pending}
          pendingLabel="Saving inspection"
        >
          Save Inspection & Review Decision
        </SubmitButton>
      </div>
    </div>
  );
}

function DecisionTab({
  lead,
  values,
  onChange,
  onReviewAction,
  pending,
  dirty,
  actionsDisabled = false,
}: {
  lead: SellerLead;
  values: DecisionFormValues;
  onChange: (values: DecisionFormValues) => void;
  onReviewAction: (
    payload: UpdateSellerLeadPayload,
    successMessage: string,
  ) => Promise<void>;
  pending: boolean;
  dirty: boolean;
  actionsDisabled?: boolean;
}) {
  function updateDecisionNote(value: string) {
    onChange({ ...values, decisionNote: value });
  }

  function saveReview(
    decision: SellerLeadDecision | null,
    status: SellerLeadStatus,
    successMessage: string,
  ) {
    return onReviewAction(
      {
        decision,
        decisionNote: values.decisionNote || null,
        status,
      },
      successMessage,
    );
  }

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Review & Decision</CardTitle>
        <CardDescription>
          Use the inspection result to decide whether to review more, negotiate,
          approve, or walk away.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <p className="text-muted-foreground">Inspection state</p>
            <p className="mt-1 font-medium text-foreground">
              {lead.inspectionCompletedAt
                ? "Inspection recorded"
                : "Inspection not completed"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {lead.inspectionCompletedAt
                ? format(
                    new Date(lead.inspectionCompletedAt),
                    "MMM d, yyyy h:mm a",
                  )
                : "Save the inspection before making a final acquisition call."}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <p className="text-muted-foreground">Current direction</p>
            <p className="mt-1 font-medium text-foreground">
              {lead.decision ?? "Need more review"}
            </p>
            <p className="mt-1 text-muted-foreground">{lead.status}</p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <p className="text-muted-foreground">Approval state</p>
            <p className="mt-1 font-medium text-foreground">
              {lead.approvedToBuyAt ? "Approved to Buy" : "Not approved"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {lead.approvedToBuyAt
                ? format(new Date(lead.approvedToBuyAt), "MMM d, yyyy h:mm a")
                : "Approval unlocks vehicle conversion."}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="decisionNote"
            className="text-sm font-medium text-foreground"
          >
            Review note
          </label>
          <Textarea
            id="decisionNote"
            rows={4}
            value={values.decisionNote}
            onChange={(event) => updateDecisionNote(event.target.value)}
            placeholder="Why this vehicle needs review, negotiation, approval, or rejection."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <p className="font-medium text-foreground">Need more review</p>
            <p className="mt-1 min-h-10 text-muted-foreground">
              Inspection is done, but the team is not ready to choose buy or
              reject.
            </p>
            <SubmitButton
              type="button"
              variant="outline"
              className="mt-4 w-full"
              pending={pending}
              pendingLabel="Saving review"
              disabled={actionsDisabled}
              onClick={() =>
                void saveReview(null, "Evaluated", "Lead kept under review")
              }
            >
              Need More Review
            </SubmitButton>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <p className="font-medium text-foreground">Negotiate</p>
            <p className="mt-1 min-h-10 text-muted-foreground">
              Vehicle is still viable, but the seller conversation needs to
              continue.
            </p>
            <SubmitButton
              type="button"
              variant="outline"
              className="mt-4 w-full"
              pending={pending}
              pendingLabel="Saving negotiation"
              disabled={actionsDisabled}
              onClick={() =>
                void saveReview(
                  "Negotiate",
                  "Negotiating",
                  "Lead moved to negotiation",
                )
              }
            >
              Negotiate
            </SubmitButton>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <p className="font-medium text-foreground">Approve to buy</p>
            <p className="mt-1 min-h-10 text-muted-foreground">
              The inspection supports acquisition and the unit can move toward
              inventory.
            </p>
            <SubmitButton
              type="button"
              className="mt-4 w-full"
              pending={pending}
              pendingLabel="Approving"
              disabled={actionsDisabled}
              onClick={() =>
                void saveReview(
                  "Buy",
                  "Approved to Buy",
                  "Lead approved to buy",
                )
              }
            >
              Approve to Buy
            </SubmitButton>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <p className="font-medium text-foreground">Walk away</p>
            <p className="mt-1 min-h-10 text-muted-foreground">
              Condition or seller context makes this acquisition not worth
              continuing.
            </p>
            <SubmitButton
              type="button"
              variant="destructive"
              className="mt-4 w-full"
              pending={pending}
              pendingLabel="Rejecting"
              disabled={actionsDisabled}
              onClick={() =>
                void saveReview("Walk Away", "Rejected", "Lead rejected")
              }
            >
              Walk Away
            </SubmitButton>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {dirty
              ? "You have unsaved changes in Review & Decision."
              : "Review & Decision is up to date."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SubmitButton
              type="button"
              variant="outline"
              onClick={() =>
                void onReviewAction(
                  buildDecisionPayload(values),
                  "Review note updated",
                )
              }
              pending={pending}
              pendingLabel="Saving note"
              disabled={actionsDisabled}
            >
              Save Review Note
            </SubmitButton>
            {lead.status === "Approved to Buy" ? (
              <Button type="button" asChild>
                <Link href={buildConvertVehicleHref(lead)}>
                  Convert to Vehicle
                </Link>
              </Button>
            ) : (
              <Button type="button" disabled>
                Convert to Vehicle
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SellerLeadTaskHeader({
  lead,
  eyebrow,
}: {
  lead: SellerLead;
  eyebrow: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Seller Lead
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              {lead.sellerName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {getSellerLeadVehicleLabel(lead)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusBadgeVariant(lead.status)}>
              {lead.status}
            </Badge>
            <Badge variant={getDecisionBadgeVariant(lead.decision)}>
              {lead.decision ?? "Pending"}
            </Badge>
            <Badge variant={lead.approvedToBuyAt ? "secondary" : "outline"}>
              {lead.approvedToBuyAt ? "Approved" : "Not approved"}
            </Badge>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border bg-background/80 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Seller Asking
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatVehicleMoney(lead.askingPrice)}
            </p>
          </div>
          <div className="rounded-xl border bg-background/80 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Inspection
            </p>
            <p className="mt-1 text-lg font-semibold">
              {lead.inspectionCompletedAt ? "Recorded" : "Pending"}
            </p>
          </div>
          <div className="rounded-xl border bg-background/80 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Review
            </p>
            <p className="mt-1 text-lg font-semibold">
              {lead.decision ??
                (lead.status === "Evaluated" ? "Need review" : "Pending")}
            </p>
          </div>
          <div className="rounded-xl border bg-background/80 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Next Task
            </p>
            <p className="mt-1 text-lg font-semibold">
              {lead.pipeline?.nextAction?.label ?? getNextTaskLabel(lead)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SellerLeadTaskPageState({
  title,
  breadcrumb,
  leadId,
  children,
}: {
  title: string;
  breadcrumb: string;
  leadId: string;
  children: (lead: SellerLead) => React.ReactNode;
}) {
  const leadQuery = useSellerLeadQuery(leadId);
  const lead = leadQuery.data?.sellerLead;

  if (leadQuery.isPending) {
    return (
      <AuthenticatedAppShell
        title={title}
        breadcrumbs={[
          { label: "Seller Leads", href: "/seller-leads" },
          { label: breadcrumb },
        ]}
      >
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <ModuleLoadingState label={`Loading ${breadcrumb.toLowerCase()}`} />
        </div>
      </AuthenticatedAppShell>
    );
  }

  if (leadQuery.error) {
    return (
      <AuthenticatedAppShell
        title={title}
        breadcrumbs={[
          { label: "Seller Leads", href: "/seller-leads" },
          { label: breadcrumb },
        ]}
      >
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
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
      <AuthenticatedAppShell
        title={title}
        breadcrumbs={[
          { label: "Seller Leads", href: "/seller-leads" },
          { label: breadcrumb },
        ]}
      >
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <EmptyState
            title="Seller lead not found"
            description="The requested seller lead could not be loaded."
          />
        </div>
      </AuthenticatedAppShell>
    );
  }

  return (
    <AuthenticatedAppShell
      title={title}
      breadcrumbs={[
        { label: "Seller Leads", href: "/seller-leads" },
        { label: breadcrumb },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {children(lead)}
      </div>
    </AuthenticatedAppShell>
  );
}

export function SellerLeadEvaluationPage({ leadId }: { leadId: string }) {
  return (
    <SellerLeadTaskPageState
      title="Seller Lead Record"
      breadcrumb="Record"
      leadId={leadId}
    >
      {(lead) => (
        <>
          <SellerLeadTaskHeader lead={lead} eyebrow="Read-only intake record" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" asChild>
              <Link href={`/seller-leads/${lead.id}/inspection`}>
                Start Inspection
              </Link>
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/seller-leads/${lead.id}/decision`}>
                Review Decision
              </Link>
            </Button>
            {lead.status === "Approved to Buy" ? (
              <Button type="button" asChild>
                <Link href={buildConvertVehicleHref(lead)}>
                  Convert to Vehicle
                </Link>
              </Button>
            ) : null}
          </div>
          <OverviewTab values={getOverviewFormValues(lead)} />
        </>
      )}
    </SellerLeadTaskPageState>
  );
}

export function SellerLeadInspectionPage({ leadId }: { leadId: string }) {
  return (
    <SellerLeadTaskPageState
      title="Seller Lead Inspection"
      breadcrumb="Inspection"
      leadId={leadId}
    >
      {(lead) => <SellerLeadInspectionTask lead={lead} leadId={leadId} />}
    </SellerLeadTaskPageState>
  );
}

function SellerLeadInspectionTask({
  lead,
  leadId,
}: {
  lead: SellerLead;
  leadId: string;
}) {
  const router = useRouter();
  const updateMutation = useUpdateSellerLeadMutation();
  const [inspectionValues, setInspectionValues] =
    React.useState<InspectionFormValues | null>(null);

  React.useEffect(() => {
    setInspectionValues(getInspectionFormValues(lead));
  }, [lead]);

  async function saveSection(
    payload: UpdateSellerLeadPayload,
    successMessage: string,
  ) {
    await updateMutation.mutateAsync(
      { id: leadId, payload },
      {
        onSuccess: () => {
          toast.success(successMessage);
        },
      },
    );
  }

  if (!inspectionValues) {
    return <ModuleLoadingState label="Preparing inspection" />;
  }

  const currentInspectionValues = inspectionValues;
  const inspectionDirty =
    serialize(buildInspectionPayload(currentInspectionValues)) !==
    serialize(buildInspectionPayload(getInspectionFormValues(lead)));

  async function saveInspectionAndReview() {
    await saveSection(
      {
        ...buildInspectionPayload(currentInspectionValues),
        inspectionCompletedAt: currentInspectionValues.inspectionCompletedAt
          ? new Date(
              currentInspectionValues.inspectionCompletedAt,
            ).toISOString()
          : new Date().toISOString(),
        status: getStatusAfterInspection(lead.status),
      },
      "Inspection saved for review",
    );
    router.push(`/seller-leads/${lead.id}/decision`);
  }

  return (
    <>
      <SellerLeadTaskHeader lead={lead} eyebrow="Vehicle inspection" />
      <InspectionTab
        values={currentInspectionValues}
        onChange={setInspectionValues}
        onSave={saveInspectionAndReview}
        pending={updateMutation.isPending}
        dirty={inspectionDirty}
      />
    </>
  );
}

export function SellerLeadDecisionPage({ leadId }: { leadId: string }) {
  return (
    <SellerLeadTaskPageState
      title="Seller Lead Decision"
      breadcrumb="Decision"
      leadId={leadId}
    >
      {(lead) => <SellerLeadDecisionTask lead={lead} leadId={leadId} />}
    </SellerLeadTaskPageState>
  );
}

function SellerLeadDecisionTask({
  lead,
  leadId,
}: {
  lead: SellerLead;
  leadId: string;
}) {
  const updateMutation = useUpdateSellerLeadMutation();
  const [decisionValues, setDecisionValues] =
    React.useState<DecisionFormValues | null>(null);

  React.useEffect(() => {
    setDecisionValues(getDecisionFormValues(lead));
  }, [lead]);

  async function saveSection(
    payload: UpdateSellerLeadPayload,
    successMessage: string,
  ) {
    await updateMutation.mutateAsync(
      { id: leadId, payload },
      {
        onSuccess: () => {
          toast.success(successMessage);
        },
      },
    );
  }

  if (!decisionValues) {
    return <ModuleLoadingState label="Preparing decision review" />;
  }

  const decisionDirty =
    serialize(buildDecisionPayload(decisionValues)) !==
    serialize(buildDecisionPayload(getDecisionFormValues(lead)));
  const inspectionMissing = !lead.inspectionCompletedAt;

  return (
    <>
      <SellerLeadTaskHeader lead={lead} eyebrow="Review and decision" />
      {inspectionMissing ? (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangleIcon className="text-amber-500" />
          <AlertTitle>Inspection required</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Save the vehicle inspection before making an acquisition decision.
            </span>
            <Button type="button" variant="outline" asChild>
              <Link href={`/seller-leads/${lead.id}/inspection`}>
                Start Inspection
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <DecisionTab
        lead={lead}
        values={decisionValues}
        onChange={setDecisionValues}
        onReviewAction={saveSection}
        pending={updateMutation.isPending}
        dirty={decisionDirty}
        actionsDisabled={inspectionMissing}
      />
    </>
  );
}
