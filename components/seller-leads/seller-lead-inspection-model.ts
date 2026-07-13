import type {
  SellerLead,
  SellerLeadInspectionFindings,
  SellerLeadInspectionRating,
  SellerLeadStatus,
  UpdateSellerLeadPayload,
} from "@/types/seller-leads";

export const INSPECTION_STORAGE_MARKER = "[[seller-lead-inspection:v1]]";

export const INSPECTION_KEYS = [
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

export type InspectionKey = (typeof INSPECTION_KEYS)[number];
export type InspectionRating = "good" | "fair" | "poor" | null;
export type OverallCondition = "good" | "fair" | "poor";

export type DetailedInspectionItem = {
  id: string;
  label: string;
  key: InspectionKey;
};

export type InspectionSection = {
  id: string;
  label: string;
  items: DetailedInspectionItem[];
};

export type InspectionItemValue = {
  rating: InspectionRating;
  notes: string;
};

export type InspectionDraft = {
  items: Record<string, InspectionItemValue>;
  majorIssues: string;
  recommendedRepairs: string;
  inspectorNotes: string;
  estimatedRepairCost: string;
  overallCondition: OverallCondition;
};

export const INSPECTION_SECTIONS: InspectionSection[] = [
  {
    id: "exterior",
    label: "Exterior",
    items: [
      { id: "body-paint", label: "Body panels and paint", key: "exterior" },
      { id: "glass", label: "Windshield and windows", key: "exterior" },
      {
        id: "exterior-lights",
        label: "Headlights and signal lights",
        key: "electrical",
      },
      { id: "mirrors", label: "Mirrors", key: "exterior" },
      { id: "doors", label: "Doors, hood, and tailgate", key: "exterior" },
    ],
  },
  {
    id: "interior",
    label: "Interior",
    items: [
      { id: "seats", label: "Seats and upholstery", key: "interior" },
      { id: "dashboard", label: "Dashboard and trim", key: "interior" },
      { id: "controls", label: "Interior controls", key: "interior" },
      {
        id: "seatbelts",
        label: "Seatbelts and safety equipment",
        key: "interior",
      },
      { id: "odor", label: "Cabin odor and water damage", key: "interior" },
      { id: "storage", label: "Storage and cargo area", key: "interior" },
      {
        id: "headliner",
        label: "Headliner and floor covering",
        key: "interior",
      },
    ],
  },
  {
    id: "mechanical",
    label: "Engine and Mechanical",
    items: [
      { id: "engine-start", label: "Engine start and idle", key: "engine" },
      { id: "fluids", label: "Fluid levels and condition", key: "engine" },
      { id: "leaks", label: "Visible leaks", key: "engine" },
      { id: "cooling", label: "Cooling system", key: "engine" },
      {
        id: "transmission",
        label: "Transmission operation",
        key: "transmission",
      },
      { id: "clutch", label: "Clutch and driveline", key: "transmission" },
      { id: "suspension", label: "Suspension components", key: "suspension" },
      { id: "steering", label: "Steering system", key: "suspension" },
      { id: "brakes", label: "Brakes and brake fluid", key: "brakes" },
      { id: "exhaust", label: "Exhaust and emissions", key: "engine" },
    ],
  },
  {
    id: "tires",
    label: "Tires and Wheels",
    items: [
      { id: "front-tires", label: "Front tire condition", key: "tires" },
      { id: "rear-tires", label: "Rear tire condition", key: "tires" },
      { id: "wheels", label: "Wheels and alignment", key: "tires" },
      { id: "spare", label: "Spare tire and tools", key: "tires" },
    ],
  },
  {
    id: "electrical",
    label: "Electrical System",
    items: [
      { id: "battery", label: "Battery and charging", key: "electrical" },
      {
        id: "warning-lights",
        label: "Dashboard warning lights",
        key: "electrical",
      },
      {
        id: "power-features",
        label: "Power windows, locks, and mirrors",
        key: "electrical",
      },
      { id: "air-conditioning", label: "Air conditioning", key: "ac" },
      { id: "audio", label: "Audio and infotainment", key: "electrical" },
    ],
  },
  {
    id: "documents",
    label: "Documents and Identification",
    items: [
      { id: "registration", label: "Registration documents", key: "papers" },
      { id: "vin", label: "Chassis and VIN verification", key: "papers" },
      {
        id: "engine-number",
        label: "Engine number verification",
        key: "papers",
      },
      {
        id: "service-records",
        label: "Service and ownership records",
        key: "papers",
      },
    ],
  },
  {
    id: "road-test",
    label: "Road Test",
    items: [
      {
        id: "acceleration",
        label: "Acceleration and engine response",
        key: "engine",
      },
      {
        id: "road-shifting",
        label: "Gear shifting and drivability",
        key: "transmission",
      },
      {
        id: "road-handling",
        label: "Braking, steering, and handling",
        key: "brakes",
      },
    ],
  },
];

export const ALL_INSPECTION_ITEMS = INSPECTION_SECTIONS.flatMap(
  (section) => section.items,
);

type StoredInspectionDraft = Omit<InspectionDraft, "items"> & {
  items: Record<string, InspectionItemValue>;
};

function normalizeRating(
  rating: SellerLeadInspectionRating | undefined,
): InspectionRating {
  if (!rating) return null;
  return rating === "excellent" ? "good" : rating;
}

function getSeedItems(
  findings: SellerLeadInspectionFindings | null,
): InspectionDraft["items"] {
  return Object.fromEntries(
    ALL_INSPECTION_ITEMS.map((item) => [
      item.id,
      {
        rating: normalizeRating(findings?.[item.key]?.rating),
        notes: "",
      },
    ]),
  );
}

function getStoredDraft(notes: string | null): StoredInspectionDraft | null {
  if (!notes?.startsWith(INSPECTION_STORAGE_MARKER)) return null;

  try {
    const parsed: unknown = JSON.parse(
      notes.slice(INSPECTION_STORAGE_MARKER.length),
    );

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("items" in parsed) ||
      !parsed.items ||
      typeof parsed.items !== "object"
    ) {
      return null;
    }

    return parsed as StoredInspectionDraft;
  } catch {
    return null;
  }
}

export function getInspectionDraft(lead: SellerLead): InspectionDraft {
  const stored = getStoredDraft(lead.inspectionNotes);
  const items = getSeedItems(lead.inspectionFindings);

  if (stored) {
    for (const item of ALL_INSPECTION_ITEMS) {
      const storedItem = stored.items[item.id];
      if (storedItem) items[item.id] = storedItem;
    }
  } else {
    for (const key of INSPECTION_KEYS) {
      const note = lead.inspectionFindings?.[key]?.notes;
      const firstItem = ALL_INSPECTION_ITEMS.find((item) => item.key === key);
      if (note && firstItem) items[firstItem.id].notes = note;
    }
  }

  return {
    items,
    majorIssues: stored?.majorIssues ?? "",
    recommendedRepairs: stored?.recommendedRepairs ?? "",
    inspectorNotes:
      stored?.inspectorNotes ??
      (lead.inspectionNotes?.startsWith(INSPECTION_STORAGE_MARKER)
        ? ""
        : (lead.inspectionNotes ?? "")),
    estimatedRepairCost: stored?.estimatedRepairCost ?? "",
    overallCondition: stored?.overallCondition ?? "fair",
  };
}

const RATING_WEIGHT: Record<Exclude<InspectionRating, null>, number> = {
  good: 100,
  fair: 60,
  poor: 20,
};

const RATING_PRIORITY: Record<Exclude<InspectionRating, null>, number> = {
  good: 1,
  fair: 2,
  poor: 3,
};

export function getInspectionMetrics(draft: InspectionDraft) {
  const values = ALL_INSPECTION_ITEMS.map((item) => draft.items[item.id]);
  const checked = values.filter((value) => value.rating !== null);
  const counts = {
    good: checked.filter((value) => value.rating === "good").length,
    fair: checked.filter((value) => value.rating === "fair").length,
    poor: checked.filter((value) => value.rating === "poor").length,
    unchecked: values.length - checked.length,
  };
  const score = checked.length
    ? Math.round(
        checked.reduce(
          (total, value) => total + RATING_WEIGHT[value.rating!],
          0,
        ) / checked.length,
      )
    : 0;
  const completion = Math.round((checked.length / values.length) * 100);

  return {
    checked: checked.length,
    total: values.length,
    completion,
    score,
    counts,
    requiredRemaining: values.length - checked.length,
    readiness:
      counts.poor > 0 || checked.length < values.length
        ? "Needs Review"
        : counts.fair > 0
          ? "Proceed with Caution"
          : "Ready for Decision",
  };
}

function aggregateFindings(
  draft: InspectionDraft,
): SellerLeadInspectionFindings {
  const findings: SellerLeadInspectionFindings = {};

  for (const key of INSPECTION_KEYS) {
    const items = ALL_INSPECTION_ITEMS.filter((item) => item.key === key)
      .map((item) => ({ ...draft.items[item.id], label: item.label }))
      .filter((item) => item.rating !== null);

    if (items.length === 0) continue;

    const rating = items.reduce<Exclude<InspectionRating, null>>(
      (worst, item) =>
        RATING_PRIORITY[item.rating!] > RATING_PRIORITY[worst]
          ? item.rating!
          : worst,
      "good",
    );
    const notes = items
      .filter((item) => item.notes.trim())
      .map((item) => `${item.label}: ${item.notes.trim()}`)
      .join("\n");

    findings[key] = { rating, notes: notes || null };
  }

  return findings;
}

export function buildInspectionPayload(
  draft: InspectionDraft,
): UpdateSellerLeadPayload {
  return {
    inspectionFindings: aggregateFindings(draft),
    inspectionNotes: `${INSPECTION_STORAGE_MARKER}${JSON.stringify(draft)}`,
  };
}

export function getStatusAfterInspection(
  status: SellerLeadStatus,
): SellerLeadStatus {
  return ["Approved to Buy", "Purchased", "Rejected"].includes(status)
    ? status
    : "Evaluated";
}

export function formatSellerLeadMoney(value: string | null) {
  if (!value) return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getVehicleTitle(lead: SellerLead) {
  return [lead.vehicleBrand, lead.vehicleModel, lead.vehicleYear]
    .filter(Boolean)
    .join(" ");
}
