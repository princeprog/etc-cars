"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  CalendarPlusIcon,
  ClipboardCheckIcon,
  EyeIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ShuffleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ListPagination } from "@/components/operations/list-pagination";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { SubmitButton } from "@/components/operations/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useCreateFollowUpMutation } from "@/hooks/mutations/follow-ups/use-create-follow-up-mutation";
import { useCreateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-create-seller-lead-mutation";
import { useUpdateSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-update-seller-lead-mutation";
import {
  useCreateVehicleCatalogBrandMutation,
  useCreateVehicleCatalogModelMutation,
  useCreateVehicleCatalogVariantMutation,
} from "@/hooks/mutations/vehicle-catalog/use-vehicle-catalog-mutations";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { useSellerLeadsQuery } from "@/hooks/queries/seller-leads/use-seller-leads-query";
import {
  useVehicleCatalogBrandsQuery,
  useVehicleCatalogModelsQuery,
  useVehicleCatalogVariantsQuery,
} from "@/hooks/queries/vehicle-catalog/use-vehicle-catalog-queries";
import { getApiErrorMessage } from "@/types/api";
import {
  SELLER_LEAD_DECISIONS,
  SELLER_LEAD_INSPECTION_RATINGS,
  SELLER_LEAD_STATUSES,
  type CreateSellerLeadPayload,
  type SellerLead,
  type SellerLeadDecision,
  type SellerLeadInspectionFindings,
  type SellerLeadInspectionRating,
  type SellerLeadListFilters,
  type SellerLeadStatus,
  type UpdateSellerLeadPayload,
} from "@/types/seller-leads";
import {
  findCatalogItemByName,
  normalizeCatalogName,
  VehicleCatalogCombobox,
} from "../vehicles/vehicle-catalog-combobox";
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

const SELLER_LEAD_INQUIRY_SOURCES = [
  "Facebook Marketplace",
  "Facebook Page",
  "Website",
  "Walk-in",
  "Referral",
  "Phone Call",
  "SMS / Viber",
  "WhatsApp",
  "Car Listing Platform",
  "Existing Customer",
  "Other",
] as const;

type InspectionKey = (typeof INSPECTION_KEYS)[number];

type SellerLeadFormValues = {
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
  status: SellerLeadStatus;
  inspectionCompletedAt: string;
  inspectionNotes: string;
  decision: SellerLeadDecision | "";
  decisionNote: string;
  inspectionFindings: Record<
    InspectionKey,
    { rating: SellerLeadInspectionRating; notes: string }
  >;
};

type SellerLeadNextActionCta = {
  label: string;
  helper: string;
  action: "convert" | "inspection" | "decision" | "view" | "follow-up";
};

function getEmptyInspectionFindings(): SellerLeadFormValues["inspectionFindings"] {
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

function getEmptySellerLeadFormValues(): SellerLeadFormValues {
  return {
    sellerName: "",
    contactNumber: "",
    email: "",
    facebookName: "",
    inquirySource: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleVariant: "",
    askingPrice: "",
    region: "",
    notes: "",
    status: "New Inquiry",
    inspectionCompletedAt: "",
    inspectionNotes: "",
    decision: "",
    decisionNote: "",
    inspectionFindings: getEmptyInspectionFindings(),
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

export function getSellerLeadFormValues(
  lead: SellerLead,
): SellerLeadFormValues {
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
    status: lead.status,
    inspectionCompletedAt: lead.inspectionCompletedAt
      ? lead.inspectionCompletedAt.slice(0, 16)
      : "",
    inspectionNotes: lead.inspectionNotes ?? "",
    decision: lead.decision ?? "",
    decisionNote: lead.decisionNote ?? "",
    inspectionFindings: mapInspectionFindings(lead.inspectionFindings),
  };
}

function toInspectionFindingsPayload(
  values: SellerLeadFormValues["inspectionFindings"],
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

function parseSellerLeadPayload(
  values: SellerLeadFormValues,
  assigneeUserId: string | null,
): CreateSellerLeadPayload {
  return {
    sellerName: values.sellerName,
    contactNumber: values.contactNumber,
    email: values.email || null,
    facebookName: values.facebookName || null,
    inquirySource: values.inquirySource || null,
    vehicleBrand: values.vehicleBrand,
    vehicleModel: values.vehicleModel,
    vehicleYear: values.vehicleYear ? Number(values.vehicleYear) : null,
    vehicleVariant: values.vehicleVariant || null,
    askingPrice: values.askingPrice || null,
    region: values.region || null,
    notes: values.notes || null,
    status: values.status,
    assigneeUserId,
  };
}

export function parseUpdateSellerLeadPayload(
  values: SellerLeadFormValues,
): UpdateSellerLeadPayload {
  return {
    sellerName: values.sellerName,
    contactNumber: values.contactNumber,
    email: values.email || null,
    facebookName: values.facebookName || null,
    inquirySource: values.inquirySource || null,
    vehicleBrand: values.vehicleBrand,
    vehicleModel: values.vehicleModel,
    vehicleYear: values.vehicleYear ? Number(values.vehicleYear) : null,
    vehicleVariant: values.vehicleVariant || null,
    askingPrice: values.askingPrice || null,
    region: values.region || null,
    notes: values.notes || null,
    status: values.status,
    inspectionCompletedAt: values.inspectionCompletedAt
      ? new Date(values.inspectionCompletedAt).toISOString()
      : null,
    inspectionNotes: values.inspectionNotes || null,
    inspectionFindings: toInspectionFindingsPayload(values.inspectionFindings),
    decision: values.decision || null,
    decisionNote: values.decisionNote || null,
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

function getInquirySourceOptions(currentValue: string) {
  if (
    !currentValue ||
    SELLER_LEAD_INQUIRY_SOURCES.some((source) => source === currentValue)
  ) {
    return SELLER_LEAD_INQUIRY_SOURCES;
  }

  return [currentValue, ...SELLER_LEAD_INQUIRY_SOURCES];
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

function getSellerLeadNextActionCta(lead: SellerLead): SellerLeadNextActionCta {
  if (lead.status === "Approved to Buy") {
    return {
      label: "Convert to Vehicle",
      helper: "Move this approved deal into inventory.",
      action: "convert" as const,
    };
  }

  if (lead.status === "Purchased" || lead.status === "Rejected") {
    return {
      label: "View Record",
      helper: "Review the completed acquisition record.",
      action: "view" as const,
    };
  }

  if (lead.status === "Evaluated" || lead.status === "Negotiating") {
    return {
      label: "Review Decision",
      helper: "Use inspection results to decide the acquisition path.",
      action: "decision" as const,
    };
  }

  return {
    label: "Start Inspection",
    helper: "Inspect the vehicle before acquisition review.",
    action: "inspection" as const,
  };
}

function SellerLeadNextActionIcon({
  action,
}: {
  action: SellerLeadNextActionCta["action"];
}) {
  if (action === "follow-up") return <CalendarPlusIcon />;
  if (action === "convert") return <ShuffleIcon />;
  if (action === "inspection") return <ClipboardCheckIcon />;
  if (action === "decision") return <PencilIcon />;
  return <FileTextIcon />;
}

function getDefaultSellerFollowUpDueAt() {
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 1);
  dueAt.setHours(9, 0, 0, 0);
  return dueAt;
}

function getDefaultSellerFollowUpNote(lead: SellerLead) {
  return `Follow up with ${lead.sellerName} about their seller lead.`;
}

function isSellerLeadStale(lead: SellerLead) {
  if (typeof lead.pipeline?.isStale === "boolean") {
    return lead.pipeline.isStale;
  }

  const activityAt = lead.latestActivityAt ?? lead.updatedAt;
  const ageMs = Date.now() - new Date(activityAt).getTime();
  const staleDays = lead.status === "New Inquiry" ? 2 : 5;
  return (
    ageMs > staleDays * 24 * 60 * 60 * 1000 &&
    lead.status !== "Purchased" &&
    lead.status !== "Rejected"
  );
}

function getSellerLeadStatusBadgeVariant(
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

function getSellerLeadStatusClassName(status: SellerLeadStatus) {
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
    default:
      return "";
  }
}

function getSellerLeadStatusTextClassName(status: SellerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "text-sky-700 dark:text-sky-300";
    case "Contacted":
      return "text-slate-700 dark:text-slate-300";
    case "Inspection Scheduled":
      return "text-violet-700 dark:text-violet-300";
    case "Evaluated":
      return "text-indigo-700 dark:text-indigo-300";
    case "Negotiating":
      return "text-amber-700 dark:text-amber-300";
    case "Approved to Buy":
      return "text-emerald-700 dark:text-emerald-300";
    case "Purchased":
      return "text-teal-700 dark:text-teal-300";
    case "Rejected":
      return "text-rose-700 dark:text-rose-300";
    default:
      return "";
  }
}

function formatInspectionLabel(key: InspectionKey) {
  if (key === "ac") return "A/C";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function SellerLeadForm({
  values,
  onChange,
}: {
  values: SellerLeadFormValues;
  onChange: (values: SellerLeadFormValues) => void;
}) {
  const [catalogPortalContainer, setCatalogPortalContainer] =
    React.useState<HTMLDivElement | null>(null);
  const brandsQuery = useVehicleCatalogBrandsQuery();
  const selectedBrand = findCatalogItemByName(
    brandsQuery.data?.items ?? [],
    values.vehicleBrand,
  );
  const modelsQuery = useVehicleCatalogModelsQuery(selectedBrand?.id);
  const selectedModel = findCatalogItemByName(
    modelsQuery.data?.items ?? [],
    values.vehicleModel,
  );
  const variantsQuery = useVehicleCatalogVariantsQuery(selectedModel?.id);
  const createBrandMutation = useCreateVehicleCatalogBrandMutation();
  const createModelMutation = useCreateVehicleCatalogModelMutation();
  const createVariantMutation = useCreateVehicleCatalogVariantMutation();

  function updateField<K extends keyof SellerLeadFormValues>(
    key: K,
    value: SellerLeadFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  function updateBrand(value: string) {
    onChange({
      ...values,
      vehicleBrand: value,
      vehicleModel: "",
      vehicleVariant: "",
    });
  }

  function updateModel(value: string) {
    onChange({
      ...values,
      vehicleModel: value,
      vehicleVariant: "",
    });
  }

  async function addBrand() {
    const name = normalizeCatalogName(values.vehicleBrand);

    if (!name) {
      return;
    }

    try {
      const response = await createBrandMutation.mutateAsync({ name });
      onChange({
        ...values,
        vehicleBrand: response.item.name,
        vehicleModel: "",
        vehicleVariant: "",
      });
      toast.success("Vehicle brand added");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add vehicle brand"));
    }
  }

  async function addModel() {
    const name = normalizeCatalogName(values.vehicleModel);

    if (!name || !selectedBrand) {
      return;
    }

    try {
      const response = await createModelMutation.mutateAsync({
        brandId: selectedBrand.id,
        name,
      });
      onChange({
        ...values,
        vehicleModel: response.item.name,
        vehicleVariant: "",
      });
      toast.success("Vehicle model added");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add vehicle model"));
    }
  }

  async function addVariant() {
    const name = normalizeCatalogName(values.vehicleVariant);

    if (!name || !selectedModel) {
      return;
    }

    try {
      const response = await createVariantMutation.mutateAsync({
        modelId: selectedModel.id,
        name,
      });
      updateField("vehicleVariant", response.item.name);
      toast.success("Vehicle variant added");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add vehicle variant"));
    }
  }

  return (
    <FieldGroup ref={setCatalogPortalContainer} className="gap-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Seller Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Capture the core contact information for the acquisition inquiry.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="sellerName">Seller name</FieldLabel>
            <Input
              id="sellerName"
              value={values.sellerName}
              onChange={(e) => updateField("sellerName", e.target.value)}
              placeholder="Juan Dela Cruz"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="contactNumber">Contact number</FieldLabel>
            <Input
              id="contactNumber"
              value={values.contactNumber}
              onChange={(e) => updateField("contactNumber", e.target.value)}
              placeholder="0917 123 4567"
              required
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="seller@example.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="facebookName">Facebook name</FieldLabel>
            <Input
              id="facebookName"
              value={values.facebookName}
              onChange={(e) => updateField("facebookName", e.target.value)}
              placeholder="Juan Dela Cruz"
            />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Vehicle Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Record the unit being offered so the team can move it cleanly into
            evaluation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="vehicleBrand">Vehicle brand</FieldLabel>
            <VehicleCatalogCombobox
              id="vehicleBrand"
              value={values.vehicleBrand}
              items={brandsQuery.data?.items ?? []}
              placeholder="Search or add brand"
              emptyLabel="No brands found."
              addLabel={`Add "${normalizeCatalogName(values.vehicleBrand)}" as a brand`}
              isLoading={brandsQuery.isLoading}
              isAdding={createBrandMutation.isPending}
              portalContainer={catalogPortalContainer}
              onValueChange={updateBrand}
              onAdd={addBrand}
              required
              canAdd={Boolean(
                normalizeCatalogName(values.vehicleBrand) &&
                !findCatalogItemByName(
                  brandsQuery.data?.items ?? [],
                  values.vehicleBrand,
                ),
              )}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="vehicleModel">Vehicle model</FieldLabel>
            <VehicleCatalogCombobox
              id="vehicleModel"
              value={values.vehicleModel}
              items={modelsQuery.data?.items ?? []}
              placeholder={
                selectedBrand ? "Search or add model" : "Select brand first"
              }
              emptyLabel="No models found."
              addLabel={`Add "${normalizeCatalogName(values.vehicleModel)}" as a model`}
              disabled={!selectedBrand}
              isLoading={modelsQuery.isLoading}
              isAdding={createModelMutation.isPending}
              portalContainer={catalogPortalContainer}
              onValueChange={updateModel}
              onAdd={addModel}
              required
              canAdd={Boolean(
                selectedBrand &&
                normalizeCatalogName(values.vehicleModel) &&
                !findCatalogItemByName(
                  modelsQuery.data?.items ?? [],
                  values.vehicleModel,
                ),
              )}
            />
            {!selectedBrand ? (
              <FieldDescription>
                Select or add a brand before choosing a model.
              </FieldDescription>
            ) : null}
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="vehicleYear">Year</FieldLabel>
            <Input
              id="vehicleYear"
              type="number"
              value={values.vehicleYear}
              onChange={(e) => updateField("vehicleYear", e.target.value)}
              placeholder="2020"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="vehicleVariant">Variant</FieldLabel>
            <VehicleCatalogCombobox
              id="vehicleVariant"
              value={values.vehicleVariant}
              items={variantsQuery.data?.items ?? []}
              placeholder={
                selectedModel ? "Search or add variant" : "Select model first"
              }
              emptyLabel="No variants found."
              addLabel={`Add "${normalizeCatalogName(values.vehicleVariant)}" as a variant`}
              disabled={!selectedModel}
              isLoading={variantsQuery.isLoading}
              isAdding={createVariantMutation.isPending}
              portalContainer={catalogPortalContainer}
              onValueChange={(value) => updateField("vehicleVariant", value)}
              onAdd={addVariant}
              canAdd={Boolean(
                selectedModel &&
                normalizeCatalogName(values.vehicleVariant) &&
                !findCatalogItemByName(
                  variantsQuery.data?.items ?? [],
                  values.vehicleVariant,
                ),
              )}
            />
            {!selectedModel ? (
              <FieldDescription>
                Select or add a model before choosing a variant.
              </FieldDescription>
            ) : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="askingPrice">Seller asking price</FieldLabel>
            <Input
              id="askingPrice"
              value={values.askingPrice}
              onChange={(e) => updateField("askingPrice", e.target.value)}
              placeholder="850000"
            />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Lead Context
          </h3>
          <p className="text-sm text-muted-foreground">
            Capture source, region, current workflow status, and intake notes.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldTitle id="inquirySourceLabel">Inquiry source</FieldTitle>
            <Select
              value={values.inquirySource}
              onValueChange={(value) => updateField("inquirySource", value)}
            >
              <SelectTrigger
                id="inquirySource"
                aria-labelledby="inquirySourceLabel inquirySource"
              >
                <SelectValue placeholder="Select inquiry source" />
              </SelectTrigger>
              <SelectContent portalContainer={catalogPortalContainer}>
                {getInquirySourceOptions(values.inquirySource).map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="region">Region</FieldLabel>
            <Input
              id="region"
              value={values.region}
              onChange={(e) => updateField("region", e.target.value)}
              placeholder="Metro Manila"
            />
          </Field>
        </div>
        <Field>
          <FieldTitle id="sellerStatusLabel">Status</FieldTitle>
          <Select
            value={values.status}
            onValueChange={(value) =>
              updateField("status", value as SellerLeadStatus)
            }
          >
            <SelectTrigger
              id="sellerStatus"
              aria-labelledby="sellerStatusLabel sellerStatus"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent portalContainer={catalogPortalContainer}>
              {SELLER_LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="sellerNotes">Notes</FieldLabel>
          <Textarea
            id="sellerNotes"
            rows={5}
            value={values.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Seller mentioned the unit is casa maintained, complete papers, and available for inspection this week."
          />
        </Field>
      </section>
    </FieldGroup>
  );
}

export function AcquisitionEvaluationForm({
  values,
  onChange,
}: {
  values: SellerLeadFormValues;
  onChange: (values: SellerLeadFormValues) => void;
}) {
  function updateField<K extends keyof SellerLeadFormValues>(
    key: K,
    value: SellerLeadFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

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

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Decision</h3>
          <p className="text-sm text-muted-foreground">
            Record the current acquisition direction after inspection.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="decision">Decision</FieldLabel>
            <Select
              value={values.decision || "none"}
              onValueChange={(value) =>
                updateField(
                  "decision",
                  value === "none" ? "" : (value as SellerLeadDecision),
                )
              }
            >
              <SelectTrigger id="decision">
                <SelectValue placeholder="Select decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No decision yet</SelectItem>
                {SELLER_LEAD_DECISIONS.map((decision) => (
                  <SelectItem key={decision} value={decision}>
                    {decision}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="inspectionCompletedAt">
              Inspection completed at
            </FieldLabel>
            <Input
              id="inspectionCompletedAt"
              type="datetime-local"
              value={values.inspectionCompletedAt}
              onChange={(e) =>
                updateField("inspectionCompletedAt", e.target.value)
              }
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="decisionNote">Decision note</FieldLabel>
          <Textarea
            id="decisionNote"
            rows={3}
            value={values.decisionNote}
            onChange={(e) => updateField("decisionNote", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="inspectionNotes">Inspection notes</FieldLabel>
          <Textarea
            id="inspectionNotes"
            rows={4}
            value={values.inspectionNotes}
            onChange={(e) => updateField("inspectionNotes", e.target.value)}
          />
        </Field>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Inspection Checklist
          </h3>
          <p className="text-sm text-muted-foreground">
            Give each system a condition rating and short note so the review
            discussion has real inspection context.
          </p>
        </div>
        <div className="space-y-4">
          {INSPECTION_KEYS.map((key) => (
            <div
              key={key}
              className="grid gap-3 rounded-xl border border-border/70 p-4 md:grid-cols-[180px_180px_minmax(0,1fr)]"
            >
              <div className="text-sm font-medium text-foreground">
                {formatInspectionLabel(key)}
              </div>
              <NativeSelect
                value={values.inspectionFindings[key].rating}
                onChange={(event) =>
                  updateInspectionField(key, "rating", event.target.value)
                }
              >
                {SELLER_LEAD_INSPECTION_RATINGS.map((rating) => (
                  <NativeSelectOption key={rating} value={rating}>
                    {rating.charAt(0).toUpperCase() + rating.slice(1)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Input
                value={values.inspectionFindings[key].notes}
                onChange={(event) =>
                  updateInspectionField(key, "notes", event.target.value)
                }
                placeholder="Inspection note"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SellerLeadsScreen() {
  const router = useRouter();
  const authQuery = useAuthenticatedUserQuery();
  const createMutation = useCreateSellerLeadMutation();
  const updateMutation = useUpdateSellerLeadMutation();
  const createFollowUpMutation = useCreateFollowUpMutation();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<
    SellerLeadStatus | "all"
  >("all");
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [followUpLead, setFollowUpLead] = React.useState<SellerLead | null>(
    null,
  );
  const [createForm, setCreateForm] = React.useState<SellerLeadFormValues>(
    getEmptySellerLeadFormValues,
  );

  const filters = React.useMemo<SellerLeadListFilters>(
    () => ({
      page,
      pageSize: 10,
      search: searchTerm.trim() || undefined,
      status: activeFilter,
    }),
    [activeFilter, page, searchTerm],
  );
  const sellerLeadsQuery = useSellerLeadsQuery(filters);

  const currentUserId = authQuery.data?.user.id;
  const leads = sellerLeadsQuery.data?.sellerLeads ?? [];
  const total = sellerLeadsQuery.data?.total ?? 0;
  const totalPages = sellerLeadsQuery.data?.totalPages ?? 1;

  function handleNextActionClick(lead: SellerLead) {
    const cta = getSellerLeadNextActionCta(lead);

    if (cta.action === "convert") {
      router.push(buildConvertVehicleHref(lead));
      return;
    }

    if (cta.action === "follow-up") {
      setFollowUpLead(lead);
      return;
    }

    if (cta.action === "inspection") {
      router.push(`/seller-leads/${lead.id}/inspection`);
      return;
    }

    if (cta.action === "decision") {
      router.push(`/seller-leads/${lead.id}/decision`);
      return;
    }

    router.push(`/seller-leads/${lead.id}`);
  }

  async function handleStatusChange(
    lead: SellerLead,
    nextStatus: SellerLeadStatus,
  ) {
    if (lead.status === nextStatus) return;

    try {
      await updateMutation.mutateAsync({
        id: lead.id,
        payload: {
          status: nextStatus,
        },
      });

      toast.success(`Seller lead moved to ${nextStatus}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update seller lead status"),
      );
    }
  }

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await createMutation.mutateAsync(
      parseSellerLeadPayload(createForm, currentUserId ?? null),
      {
        onSuccess: () => {
          toast.success("Seller lead created");
          setCreateOpen(false);
          setCreateForm(getEmptySellerLeadFormValues());
        },
      },
    );
  }

  return (
    <AuthenticatedAppShell title="Seller Leads">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Seller Leads
              </h2>
              <p className="text-sm text-muted-foreground">
                Track acquisition opportunities, see the next required step, and
                open the right task page from one place.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Add Seller Lead
            </Button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search seller, contact, or vehicle"
                  className="pl-9"
                />
              </div>
              <Select
                value={activeFilter}
                onValueChange={(value) => {
                  setActiveFilter(value as SellerLeadStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[240px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seller Leads</SelectItem>
                  {SELLER_LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {leads.length} of {total} seller leads
            </p>
          </div>
        </section>

        <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
          <CardContent className="p-0">
            {sellerLeadsQuery.isPending ? (
              <div className="p-6">
                <ModuleLoadingState label="Loading seller leads" />
              </div>
            ) : sellerLeadsQuery.error ? (
              <div className="p-6">
                <ApiErrorAlert
                  title="Unable to load seller leads"
                  message={getApiErrorMessage(sellerLeadsQuery.error, "")}
                />
              </div>
            ) : leads.length ? (
              <Table className="min-w-[820px] border-collapse">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Seller
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Vehicle
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Asking
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Next Action
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Status
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Updated
                    </TableHead>
                    <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const cta = getSellerLeadNextActionCta(lead);

                    return (
                      <TableRow
                        key={lead.id}
                        className={
                          isSellerLeadStale(lead)
                            ? "bg-amber-50/60 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
                            : "hover:bg-muted/15"
                        }
                      >
                        <TableCell className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {lead.sellerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {lead.contactNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {lead.vehicleBrand} {lead.vehicleModel}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {lead.vehicleYear
                                ? `${lead.vehicleYear}${lead.vehicleVariant ? ` • ${lead.vehicleVariant}` : ""}`
                                : lead.vehicleVariant || "No variant"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium tabular-nums">
                          {formatVehicleMoney(lead.askingPrice)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Button
                            type="button"
                            variant={
                              cta.action === "follow-up" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleNextActionClick(lead)}
                          >
                            <SellerLeadNextActionIcon action={cta.action} />
                            {cta.label}
                          </Button>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant={getSellerLeadStatusBadgeVariant(
                              lead.status,
                            )}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getSellerLeadStatusClassName(lead.status)}`}
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {formatDistanceToNow(new Date(lead.updatedAt), {
                                addSuffix: true,
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(lead.updatedAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${lead.sellerName}`}
                              >
                                <MoreHorizontalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel>
                                Lead actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/seller-leads/${lead.id}`)
                                }
                              >
                                <EyeIcon />
                                View Record
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/seller-leads/${lead.id}/inspection`,
                                  )
                                }
                              >
                                <ClipboardCheckIcon />
                                Inspect Vehicle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/seller-leads/${lead.id}/decision`,
                                  )
                                }
                              >
                                <PencilIcon />
                                Review Decision
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setFollowUpLead(lead)}
                              >
                                <CalendarPlusIcon />
                                Schedule Follow-Up
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={lead.status !== "Approved to Buy"}
                                onClick={() =>
                                  router.push(buildConvertVehicleHref(lead))
                                }
                              >
                                <ShuffleIcon />
                                Convert to Vehicle
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>
                                Quick status
                              </DropdownMenuLabel>
                              <DropdownMenuRadioGroup value={lead.status}>
                                {SELLER_LEAD_STATUSES.map((status) => (
                                  <DropdownMenuRadioItem
                                    key={status}
                                    value={status}
                                    className={`font-medium ${getSellerLeadStatusTextClassName(status)}`}
                                    disabled={updateMutation.isPending}
                                    onSelect={(event) => {
                                      event.preventDefault();
                                      void handleStatusChange(lead, status);
                                    }}
                                  >
                                    {status}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No seller leads yet"
                  description="Add the first seller lead to start the acquisition workflow."
                />
              </div>
            )}
          </CardContent>
          {!sellerLeadsQuery.isPending &&
          !sellerLeadsQuery.error &&
          total > 0 ? (
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="seller leads"
              onPageChange={setPage}
            />
          ) : null}
        </Card>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent
            side="right"
            onPointerDownOutside={(event) => event.preventDefault()}
            onFocusOutside={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
            className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[50vw] md:data-[side=right]:max-w-none"
          >
            <SheetHeader className="border-b px-6 py-5 pr-14">
              <SheetTitle className="text-lg">Add Seller Lead</SheetTitle>
              <SheetDescription>
                Capture a new acquisition inquiry and assign it to yourself by
                default.
              </SheetDescription>
            </SheetHeader>
            <form
              onSubmit={handleCreateSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-5">
                  <ApiErrorAlert
                    title="Unable to create seller lead"
                    message={getApiErrorMessage(createMutation.error, "")}
                  />
                  <SellerLeadForm
                    values={createForm}
                    onChange={setCreateForm}
                  />
                </div>
              </div>
              <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  This lead will be assigned to{" "}
                  <span className="font-medium text-foreground">
                    {currentUserId ? "you" : "the active user"}
                  </span>
                  .
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <SubmitButton
                    type="submit"
                    pending={createMutation.isPending}
                    pendingLabel="Creating lead"
                  >
                    Create Seller Lead
                  </SubmitButton>
                </div>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <Dialog
          open={Boolean(followUpLead)}
          onOpenChange={(open) => !open && setFollowUpLead(null)}
        >
          <DialogContent className="max-w-xl">
            {followUpLead ? (
              <ScheduleSellerFollowUpDialogForm
                key={followUpLead.id}
                lead={followUpLead}
                currentUserId={currentUserId}
                mutation={createFollowUpMutation}
                onClose={() => setFollowUpLead(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedAppShell>
  );
}

function ScheduleSellerFollowUpDialogForm({
  lead,
  currentUserId,
  mutation,
  onClose,
}: {
  lead: SellerLead;
  currentUserId?: string;
  mutation: ReturnType<typeof useCreateFollowUpMutation>;
  onClose: () => void;
}) {
  const assigneeUserId = currentUserId ?? lead.assigneeUserId ?? "";
  const [dueAt, setDueAt] = React.useState<Date | undefined>(() =>
    getDefaultSellerFollowUpDueAt(),
  );
  const [note, setNote] = React.useState(() =>
    getDefaultSellerFollowUpNote(lead),
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assigneeUserId || !dueAt || !note.trim()) {
      return;
    }

    await mutation.mutateAsync(
      {
        leadType: "seller",
        sellerLeadId: lead.id,
        assigneeUserId,
        dueAt: dueAt.toISOString(),
        note: note.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Follow-up scheduled");
          onClose();
        },
      },
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Schedule Follow-Up</DialogTitle>
        <DialogDescription>
          Create the next contact task for {lead.sellerName}.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5">
        <ApiErrorAlert
          title="Unable to schedule follow-up"
          message={getApiErrorMessage(mutation.error, "")}
        />
        <div className="rounded-md border bg-muted/20 px-3 py-3 text-sm">
          <p className="font-medium text-foreground">{lead.sellerName}</p>
          <p className="text-muted-foreground">
            {lead.contactNumber} - {lead.vehicleBrand} {lead.vehicleModel}
          </p>
        </div>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="sellerFollowUpDueAt">Due at</FieldLabel>
            <DateTimePicker
              id="sellerFollowUpDueAt"
              value={dueAt}
              onChange={setDueAt}
              minDate={new Date()}
              placeholder="Select due date and time"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sellerFollowUpNote">Follow-up note</FieldLabel>
            <Textarea
              id="sellerFollowUpNote"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              required
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            type="submit"
            pending={mutation.isPending}
            pendingLabel="Scheduling follow-up"
            disabled={!assigneeUserId || !dueAt || !note.trim()}
          >
            <CalendarPlusIcon />
            Schedule Follow-Up
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  );
}
