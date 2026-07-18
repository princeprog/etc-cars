import {
  getInspectionDraft,
  getInspectionMetrics,
  INSPECTION_SECTIONS,
  type InspectionRating,
} from "./seller-lead-inspection-model";
import type {
  SellerLead,
  SellerLeadDecision,
  SellerLeadStatus,
} from "@/types/seller-leads";

export type DecisionChoiceId = "review" | "negotiate" | "approve" | "walk-away";

export type DecisionTone = "neutral" | "warning" | "success" | "danger";

export type DecisionChoice = {
  id: DecisionChoiceId;
  title: string;
  description: string;
  statusLabel: string;
  status: SellerLeadStatus;
  decision: SellerLeadDecision | null;
  successMessage: string;
  tone: DecisionTone;
  nextSteps: string[];
};

export const DECISION_CHOICES: DecisionChoice[] = [
  {
    id: "review",
    title: "Need More Review",
    description:
      "Keep the lead evaluated while the team gathers more information.",
    statusLabel: "Evaluated",
    status: "Evaluated",
    decision: null,
    successMessage: "Lead kept under review",
    tone: "neutral",
    nextSteps: [
      "Lead status stays Evaluated",
      "Seller lead returns to the overview page",
      "Team can schedule a follow-up for more information",
      "Conversion remains unavailable until approved",
    ],
  },
  {
    id: "negotiate",
    title: "Negotiate",
    description:
      "Continue with the seller to discuss price, terms, or repair allowance.",
    statusLabel: "Negotiating",
    status: "Negotiating",
    decision: "Negotiate",
    successMessage: "Lead moved to negotiation",
    tone: "warning",
    nextSteps: [
      "Lead status changes to Negotiating",
      "Seller lead returns to the overview page",
      "Team can schedule a follow-up with the seller",
      "Conversion remains unavailable until approved",
    ],
  },
  {
    id: "approve",
    title: "Approve to Buy",
    description:
      "Approve the vehicle for acquisition and prepare it for conversion.",
    statusLabel: "Approved to Buy",
    status: "Approved to Buy",
    decision: "Buy",
    successMessage: "Lead approved to buy",
    tone: "success",
    nextSteps: [
      "Lead status changes to Approved to Buy",
      "Seller lead returns to the overview page",
      "The acquisition decision is recorded",
      "Convert to Vehicle becomes available",
    ],
  },
  {
    id: "walk-away",
    title: "Walk Away",
    description:
      "Reject the acquisition because the condition, price, or seller context is unsuitable.",
    statusLabel: "Rejected",
    status: "Rejected",
    decision: "Walk Away",
    successMessage: "Lead rejected",
    tone: "danger",
    nextSteps: [
      "Lead status changes to Rejected",
      "Seller lead returns to the overview page",
      "The decision note is retained for reference",
      "No inventory conversion will be created",
    ],
  },
];

export function getInitialDecisionChoice(
  lead: SellerLead,
): DecisionChoiceId | null {
  if (lead.decision === "Negotiate") return "negotiate";
  if (lead.decision === "Buy") return "approve";
  if (lead.decision === "Walk Away") return "walk-away";
  if (lead.status === "Evaluated" && lead.inspectionCompletedAt)
    return "review";
  return null;
}

export function getDecisionChoice(id: DecisionChoiceId | null) {
  return DECISION_CHOICES.find((choice) => choice.id === id) ?? null;
}

const RATING_PRIORITY: Record<Exclude<InspectionRating, null>, number> = {
  good: 1,
  fair: 2,
  poor: 3,
};

export type ConditionBreakdownRow = {
  id: string;
  label: string;
  rating: Exclude<InspectionRating, null> | "not-checked";
  checked: number;
  total: number;
  notes: string;
};

export function getDecisionInspectionData(lead: SellerLead) {
  const draft = getInspectionDraft(lead);
  const metrics = getInspectionMetrics(draft);
  const conditionRows: ConditionBreakdownRow[] = INSPECTION_SECTIONS.map(
    (section) => {
      const values = section.items.map((item) => draft.items[item.id]);
      const checkedValues = values.filter(
        (
          value,
        ): value is typeof value & {
          rating: Exclude<InspectionRating, null>;
        } => value.rating !== null,
      );
      const rating = checkedValues.length
        ? checkedValues.reduce<Exclude<InspectionRating, null>>(
            (worst, value) =>
              RATING_PRIORITY[value.rating] > RATING_PRIORITY[worst]
                ? value.rating
                : worst,
            "good",
          )
        : "not-checked";
      const notes = Array.from(
        new Set(values.map((value) => value.notes.trim()).filter(Boolean)),
      ).join("; ");

      return {
        id: section.id,
        label: section.label,
        rating,
        checked: checkedValues.length,
        total: section.items.length,
        notes: notes || "No item notes recorded.",
      };
    },
  );

  return { draft, metrics, conditionRows };
}

export function getVehicleSubtitle(lead: SellerLead) {
  return lead.vehicleVariant || "Variant not recorded";
}

export function buildConvertVehicleHref(lead: SellerLead) {
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

export function getStatusBadgeClassName(status: SellerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Contacted":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "Inspection Scheduled":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "Evaluated":
      return "border-blue-200 bg-blue-50 text-blue-700";
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
