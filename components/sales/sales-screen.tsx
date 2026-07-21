"use client";

import * as React from "react";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import {
  BadgeDollarSignIcon,
  BarChart3Icon,
  CalendarIcon,
  CarFrontIcon,
  CircleCheckIcon,
  CheckIcon,
  CircleUserRoundIcon,
  ClipboardCheckIcon,
  DollarSignIcon,
  FileTextIcon,
  Loader2Icon,
  LockIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  PercentIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  SaveIcon,
  SearchIcon,
  ScaleIcon,
  TagsIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { toast } from "@/components/ui/sileo";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ListPagination } from "@/components/operations/list-pagination";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { SubmitButton } from "@/components/operations/submit-button";
import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
import { resolveApiAssetUrl } from "@/constants/api-config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSaleMutation } from "@/hooks/mutations/sales/use-create-sale-mutation";
import {
  useDeleteSaleDraftMutation,
  useFinalizeSaleDraftMutation,
  useSaveSaleDraftMutation,
  useUpdateSaleDraftMutation,
} from "@/hooks/mutations/sales/use-sale-draft-mutations";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { useBuyerLeadQuery } from "@/hooks/queries/buyer-leads/use-buyer-lead-query";
import { useSalesQuery } from "@/hooks/queries/sales/use-sales-query";
import { useSalesBuyerLeadSearchQuery } from "@/hooks/queries/sales/use-sales-buyer-lead-search-query";
import { useSalesSummaryQuery } from "@/hooks/queries/sales/use-sales-summary-query";
import { useVehiclesQuery } from "@/hooks/queries/vehicles/use-vehicles-query";
import { getApiErrorMessage } from "@/types/api";
import { cn } from "@/lib/utils";
import type { BuyerLead } from "@/types/buyer-leads";
import type {
  SaleDraft,
  SalesListFilters,
  SalesListItem,
} from "@/types/sales";
import type { Vehicle } from "@/types/vehicles";

type SalesFilterStatus =
  "all" | "draft" | "finalized" | "commission_locked" | "needs_review";
type SalesFilterAgent = "all" | "mine";
type SalesFilterRange = "all" | "this_month" | "last_30_days";

type SaleFormValues = {
  buyerLeadId: string;
  vehicleId: string;
  saleDate: string;
  finalSaleAmount: string;
  agentName: string;
  buyerClosingNote: string;
};

const SALE_FORM_ERROR_FIELDS = [
  "buyerLeadId",
  "vehicleId",
  "saleDate",
  "finalSaleAmount",
] as const;

type SaleFormErrorField = (typeof SALE_FORM_ERROR_FIELDS)[number];
type SaleFormErrors = Partial<Record<SaleFormErrorField, string>>;

type BuyerLeadOption = {
  value: string;
  buyerName: string;
  contactNumber: string;
  email: string | null;
  status: string;
};

type SalesVehicleOption = {
  id: string;
  label: string;
  summary: string;
  details: string;
  stockNumber: string;
  statusLabel: string;
  relationship: "linked" | "available";
  vehicle?: Vehicle;
};

function getEmptySaleFormValues(defaultAgentName = ""): SaleFormValues {
  return {
    buyerLeadId: "",
    vehicleId: "",
    saleDate: "",
    finalSaleAmount: "",
    agentName: defaultAgentName,
    buyerClosingNote: "",
  };
}

function getSaleFormErrors(values: SaleFormValues): SaleFormErrors {
  const errors: SaleFormErrors = {};
  const finalSaleAmount = parseMoney(values.finalSaleAmount);

  if (!values.buyerLeadId) {
    errors.buyerLeadId = "Select a buyer lead before reviewing the sale.";
  }

  if (!values.vehicleId) {
    errors.vehicleId = "Select the vehicle being sold before reviewing the sale.";
  }

  if (!values.saleDate) {
    errors.saleDate = "Enter the sale date and time before reviewing the sale.";
  }

  if (!values.finalSaleAmount.trim()) {
    errors.finalSaleAmount =
      "Enter the final sale amount before reviewing the sale.";
  } else if (finalSaleAmount === null || finalSaleAmount <= 0) {
    errors.finalSaleAmount = "Enter a valid sale amount greater than zero.";
  }

  return errors;
}

function hasSaleFormErrors(errors: SaleFormErrors) {
  return Object.keys(errors).length > 0;
}

function formatMoney(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return `PHP ${value}`;
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatDistanceLabel(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

function parseMoney(value?: string | null) {
  if (!value) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatAmountInputValue(value: number) {
  return value.toFixed(2);
}

function getVehiclePricingRange(vehicle?: Vehicle) {
  const minimum = parseMoney(vehicle?.minimumAcceptablePrice);
  const target = parseMoney(vehicle?.targetSellingPrice);

  if (minimum === null || target === null || minimum <= 0 || target <= 0) {
    return null;
  }

  return {
    minimum: Math.min(minimum, target),
    target: Math.max(minimum, target),
  };
}

function getSliderSaleAmountValue(
  amount: string,
  minimum: number,
  target: number,
) {
  const numericAmount = parseMoney(amount);

  if (numericAmount === null || numericAmount < minimum) {
    return minimum;
  }

  if (numericAmount > target) {
    return target;
  }

  return numericAmount;
}

function getSaleStatus(sale: SalesListItem): Exclude<SalesFilterStatus, "all"> {
  if (sale.recordType === "draft") {
    return "draft";
  }

  if (!sale.commissionLocked) {
    return "needs_review";
  }

  if (sale.commission.overrideAmount) {
    return "commission_locked";
  }

  return "finalized";
}

function getSaleStatusLabel(status: Exclude<SalesFilterStatus, "all">) {
  switch (status) {
    case "draft":
      return "Draft";
    case "finalized":
      return "Finalized";
    case "commission_locked":
      return "Commission Locked";
    case "needs_review":
      return "Needs Review";
    default:
      return status;
  }
}

function getSaleStatusClassName(status: Exclude<SalesFilterStatus, "all">) {
  switch (status) {
    case "draft":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300";
    case "finalized":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "commission_locked":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";
    case "needs_review":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    default:
      return "";
  }
}

const FIXED_COMMISSION_AMOUNT = "10000.00";

function getCommissionPreview(values: SaleFormValues, currentUserName?: string) {
  const effectiveAgentName =
    values.agentName.trim() || currentUserName?.trim() || "";
  const defaultAmount = effectiveAgentName ? FIXED_COMMISSION_AMOUNT : null;
  const finalAmount = effectiveAgentName ? FIXED_COMMISSION_AMOUNT : "0.00";

  return {
    defaultAmount,
    finalAmount,
  };
}

function FinalSaleAmountInput({
  value,
  selectedVehicle,
  onChange,
  error,
}: {
  value: string;
  selectedVehicle?: Vehicle;
  onChange: (value: string) => void;
  error?: string;
}) {
  const pricingRange = getVehiclePricingRange(selectedVehicle);
  const numericAmount = parseMoney(value);
  const isBelowMinimum =
    Boolean(pricingRange) &&
    numericAmount !== null &&
    numericAmount < pricingRange!.minimum;

  return (
    <Field data-invalid={error || isBelowMinimum ? true : undefined}>
      <FieldLabel htmlFor="finalSaleAmount">Final sale amount</FieldLabel>
      <Input
        id="finalSaleAmount"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="1250000"
        inputMode="decimal"
        aria-invalid={error || isBelowMinimum ? true : undefined}
        aria-describedby={error ? "finalSaleAmountError" : undefined}
        required
      />
      <FieldError id="finalSaleAmountError">{error}</FieldError>
    </Field>
  );
}

function FinalSalePricingHelper({
  value,
  selectedVehicle,
  onChange,
}: {
  value: string;
  selectedVehicle?: Vehicle;
  onChange: (value: string) => void;
}) {
  const pricingRange = getVehiclePricingRange(selectedVehicle);
  const numericAmount = parseMoney(value);
  const isBelowMinimum =
    Boolean(pricingRange) &&
    numericAmount !== null &&
    numericAmount < pricingRange!.minimum;
  const midpoint = pricingRange
    ? (pricingRange.minimum + pricingRange.target) / 2
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-muted/15 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            Vehicle pricing guide
          </p>
          {pricingRange ? (
            <Badge variant="outline" className="rounded-full">
              Slider range
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Use these saved pricing values as a guide, then enter the exact
          negotiated sale amount above.
        </p>
      </div>

      {pricingRange ? (
        <>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="flex flex-col gap-2">
              <Slider
                min={pricingRange.minimum}
                max={pricingRange.target}
                step={1000}
                value={[
                  getSliderSaleAmountValue(
                    value,
                    pricingRange.minimum,
                    pricingRange.target,
                  ),
                ]}
                onValueChange={([nextValue]) => {
                  if (typeof nextValue === "number") {
                    onChange(formatAmountInputValue(nextValue));
                  }
                }}
                aria-label="Final sale amount pricing range"
              />
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  {formatMoney(formatAmountInputValue(pricingRange.minimum))}
                </span>
                <span>
                  {formatMoney(formatAmountInputValue(pricingRange.target))}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:w-[320px]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onChange(formatAmountInputValue(pricingRange.minimum))
                }
              >
                Minimum
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (midpoint !== null) {
                    onChange(formatAmountInputValue(midpoint));
                  }
                }}
              >
                Midpoint
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onChange(formatAmountInputValue(pricingRange.target))
                }
              >
                Target
              </Button>
            </div>
          </div>

          {isBelowMinimum ? (
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <TriangleAlertIcon />
              <AlertTitle>Below minimum acceptable price</AlertTitle>
              <AlertDescription className="text-amber-700">
                This sale amount is below the vehicle minimum. You can still
                finalize it after confirming the exception.
              </AlertDescription>
            </Alert>
          ) : null}
        </>
      ) : (
        <Alert>
          <TagsIcon />
          <AlertTitle>Pricing range unavailable</AlertTitle>
          <AlertDescription>
            Pricing range is unavailable for this vehicle. Enter the final
            amount manually.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function SalesForm({
  values,
  onChange,
  buyerLeadSearch,
  onBuyerLeadSearchChange,
  buyerLeadOptions,
  buyerLeadSearchPending,
  buyerLeadSearchError,
  vehicleOptions,
  selectedBuyerLead,
  selectedVehicle,
  selectedVehicleOption,
  currentUserName,
  errors,
}: {
  values: SaleFormValues;
  onChange: (values: SaleFormValues) => void;
  buyerLeadSearch: string;
  onBuyerLeadSearchChange: (value: string) => void;
  buyerLeadOptions: BuyerLeadOption[];
  buyerLeadSearchPending: boolean;
  buyerLeadSearchError?: unknown;
  vehicleOptions: SalesVehicleOption[];
  selectedBuyerLead?: BuyerLead;
  selectedVehicle?: Vehicle;
  selectedVehicleOption?: SalesVehicleOption;
  currentUserName?: string;
  errors?: SaleFormErrors;
}) {
  const buyerLeadInputRef = React.useRef<HTMLInputElement | null>(null);
  const vehicleInputRef = React.useRef<HTMLInputElement | null>(null);
  const [buyerLeadPickerOpen, setBuyerLeadPickerOpen] = React.useState(false);
  const [buyerLeadSearchVisible, setBuyerLeadSearchVisible] =
    React.useState(false);
  const [vehiclePickerVisible, setVehiclePickerVisible] =
    React.useState(false);
  const [vehiclePickerOpen, setVehiclePickerOpen] = React.useState(false);
  const [vehicleSearch, setVehicleSearch] = React.useState("");

  function updateField<K extends keyof SaleFormValues>(
    key: K,
    value: SaleFormValues[K],
  ) {
    if (key === "buyerLeadId") {
      setVehiclePickerVisible(false);
      setVehiclePickerOpen(false);
      setVehicleSearch("");
      onChange({
        ...values,
        buyerLeadId: value as string,
        vehicleId: "",
        finalSaleAmount: "",
      });
      return;
    }

    if (key === "vehicleId") {
      setVehiclePickerVisible(false);
      setVehiclePickerOpen(false);
      setVehicleSearch("");
      onChange({
        ...values,
        vehicleId: value as string,
        finalSaleAmount:
          value === values.vehicleId ? values.finalSaleAmount : "",
      });
      return;
    }

    onChange({ ...values, [key]: value });
  }

  const hasSelectedBuyerLead = Boolean(values.buyerLeadId);
  const hasVehicleOptions = vehicleOptions.length > 0;
  const linkedVehicleOptions = vehicleOptions.filter(
    (vehicle) => vehicle.relationship === "linked",
  );
  const availableVehicleOptions = vehicleOptions.filter(
    (vehicle) => vehicle.relationship === "available",
  );
  const normalizedVehicleSearch = vehicleSearch.trim().toLowerCase();
  const filterVehicleOptions = React.useCallback(
    (options: SalesVehicleOption[]) => {
      if (!normalizedVehicleSearch) {
        return options;
      }

      return options.filter((vehicle) =>
        [
          vehicle.summary,
          vehicle.details,
          vehicle.statusLabel,
          vehicle.relationship,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedVehicleSearch),
      );
    },
    [normalizedVehicleSearch],
  );
  const filteredLinkedVehicleOptions =
    filterVehicleOptions(linkedVehicleOptions);
  const filteredAvailableVehicleOptions =
    filterVehicleOptions(availableVehicleOptions);
  const hasFilteredVehicleOptions =
    filteredLinkedVehicleOptions.length > 0 ||
    filteredAvailableVehicleOptions.length > 0;

  function renderVehicleOption(vehicle: SalesVehicleOption) {
    return (
      <button
        key={vehicle.id}
        type="button"
        className="flex w-full items-start justify-between gap-3 rounded-sm px-2 py-2 text-left hover:bg-accent hover:text-accent-foreground"
        onMouseDown={(event) => {
          event.preventDefault();
          updateField("vehicleId", vehicle.id);
          vehicleInputRef.current?.blur();
        }}
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">
            {vehicle.summary}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {vehicle.details}
          </span>
        </span>
        <Badge
          variant={vehicle.relationship === "linked" ? "secondary" : "outline"}
          className="shrink-0"
        >
          {vehicle.relationship === "linked" ? "Linked" : "Will link"}
        </Badge>
      </button>
    );
  }

  return (
    <FieldGroup className="gap-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Deal Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a buyer and vehicle; the system will link them when the sale
            is saved.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={errors?.buyerLeadId ? true : undefined}>
            <FieldLabel htmlFor="saleBuyerLeadId">Buyer lead</FieldLabel>
            <div className="space-y-2">
              {selectedBuyerLead ? (
                <div className="rounded-md border border-border/70 bg-background px-3 py-2 shadow-xs">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {selectedBuyerLead.buyerName}
                        </p>
                        <Badge variant="secondary" className="shrink-0">
                          {selectedBuyerLead.status}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedBuyerLead.contactNumber}
                        {selectedBuyerLead.email
                          ? ` • ${selectedBuyerLead.email}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Clear selected buyer"
                        onClick={() => {
                          updateField("buyerLeadId", "");
                          onBuyerLeadSearchChange("");
                          setBuyerLeadSearchVisible(true);
                          setBuyerLeadPickerOpen(false);
                          window.setTimeout(() => {
                            buyerLeadInputRef.current?.focus();
                          }, 0);
                        }}
                      >
                        <XIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="hidden shrink-0 sm:inline-flex"
                        onClick={() => {
                          setBuyerLeadSearchVisible(true);
                          window.setTimeout(() => {
                            buyerLeadInputRef.current?.focus();
                          }, 0);
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
              {!selectedBuyerLead || buyerLeadSearchVisible ? (
                <div className="relative">
                  <Input
                    id="saleBuyerLeadId"
                    ref={buyerLeadInputRef}
                    value={buyerLeadSearch}
                    aria-invalid={errors?.buyerLeadId ? true : undefined}
                    aria-describedby={
                      errors?.buyerLeadId ? "saleBuyerLeadIdError" : undefined
                    }
                    placeholder={
                      selectedBuyerLead
                        ? "Search to replace buyer lead"
                        : "Search buyer lead"
                    }
                    onFocus={() => setBuyerLeadPickerOpen(true)}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setBuyerLeadPickerOpen(false);

                        if (selectedBuyerLead) {
                          setBuyerLeadSearchVisible(false);
                          onBuyerLeadSearchChange("");
                        }
                      }, 120);
                    }}
                    onChange={(event) => {
                      onBuyerLeadSearchChange(event.target.value);
                      setBuyerLeadPickerOpen(true);
                    }}
                  />
                  {buyerLeadPickerOpen ? (
                    <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                      <div className="border-b px-3 py-2 text-xs text-muted-foreground">
                        {buyerLeadSearchPending
                          ? "Searching buyer leads..."
                          : buyerLeadSearchError
                            ? "Unable to load buyer leads"
                            : selectedBuyerLead
                              ? "Search by buyer name or contact number to replace the selected buyer"
                              : "Search by buyer name or contact number"}
                      </div>
                      {buyerLeadSearch.trim() &&
                      !buyerLeadSearchPending &&
                      buyerLeadOptions.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No buyer leads found.
                        </div>
                      ) : null}
                      {!buyerLeadSearch.trim() && !buyerLeadSearchPending ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {selectedBuyerLead
                            ? "Start typing to replace the selected buyer lead."
                            : "Start typing to search buyer leads."}
                        </div>
                      ) : null}
                      <div className="p-1">
                        {buyerLeadOptions.map((lead) => (
                          <button
                            key={lead.value}
                            type="button"
                            className="flex w-full items-start justify-between gap-3 rounded-sm px-2 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              updateField("buyerLeadId", lead.value);
                              onBuyerLeadSearchChange("");
                              setBuyerLeadSearchVisible(false);
                              setBuyerLeadPickerOpen(false);
                              buyerLeadInputRef.current?.blur();
                            }}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {lead.buyerName}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {lead.contactNumber}
                                {lead.email ? ` • ${lead.email}` : ""}
                              </span>
                            </span>
                            <Badge variant="secondary" className="shrink-0">
                              {lead.status}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <FieldError id="saleBuyerLeadIdError">
              {errors?.buyerLeadId}
            </FieldError>
            <ApiErrorAlert
              title="Unable to search buyer leads"
              message={getApiErrorMessage(
                buyerLeadSearchError ?? undefined,
                "",
              )}
            />
          </Field>
          <Field data-invalid={errors?.vehicleId ? true : undefined}>
            <FieldLabel htmlFor="saleVehicleId">Vehicle</FieldLabel>
            <div className="space-y-2">
              {selectedVehicleOption && !vehiclePickerVisible ? (
                <div className="rounded-md border border-border/70 bg-background px-3 py-2 shadow-xs">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {selectedVehicleOption.summary}
                        </p>
                        <Badge
                          variant={
                            selectedVehicleOption.relationship === "linked"
                              ? "secondary"
                              : "outline"
                          }
                          className="shrink-0"
                        >
                          {selectedVehicleOption.relationship === "linked"
                            ? "Linked"
                            : "Will link"}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedVehicleOption.details}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Clear selected vehicle"
                        onClick={() => {
                          updateField("vehicleId", "");
                          setVehiclePickerVisible(true);
                          window.setTimeout(() => {
                            vehicleInputRef.current?.focus();
                          }, 0);
                        }}
                      >
                        <XIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => {
                          setVehiclePickerVisible(true);
                          window.setTimeout(() => {
                            vehicleInputRef.current?.focus();
                          }, 0);
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
              {!selectedVehicleOption || vehiclePickerVisible ? (
                <div className="relative">
                  <div className="flex items-start gap-2">
                    <Input
                      id="saleVehicleId"
                      ref={vehicleInputRef}
                      value={vehicleSearch}
                      disabled={!hasSelectedBuyerLead || !hasVehicleOptions}
                      aria-invalid={errors?.vehicleId ? true : undefined}
                      aria-describedby={
                        errors?.vehicleId ? "saleVehicleIdError" : undefined
                      }
                      placeholder={
                        !hasSelectedBuyerLead
                          ? "Select buyer lead first"
                          : hasVehicleOptions
                            ? selectedVehicleOption
                              ? "Search to replace vehicle"
                              : "Search vehicle"
                            : "No available vehicles"
                      }
                      onFocus={() => setVehiclePickerOpen(true)}
                      onBlur={() => {
                        window.setTimeout(() => setVehiclePickerOpen(false), 120);
                      }}
                      onChange={(event) => {
                        setVehicleSearch(event.target.value);
                        setVehiclePickerOpen(true);
                      }}
                    />
                    {selectedVehicleOption && vehiclePickerVisible ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 shrink-0"
                        onClick={() => {
                          setVehiclePickerVisible(false);
                          setVehiclePickerOpen(false);
                          setVehicleSearch("");
                        }}
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                  {vehiclePickerOpen ? (
                    <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                      <div className="border-b px-3 py-2 text-xs text-muted-foreground">
                        {selectedVehicleOption
                          ? "Search or select another available vehicle"
                          : "Search or select an available vehicle"}
                      </div>
                      {!hasFilteredVehicleOptions ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No available vehicles found.
                        </div>
                      ) : null}
                      <div className="p-1">
                        {filteredLinkedVehicleOptions.length ? (
                          <div className="space-y-1">
                            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                              Linked to buyer
                            </p>
                            {filteredLinkedVehicleOptions.map(renderVehicleOption)}
                          </div>
                        ) : null}
                        {filteredLinkedVehicleOptions.length &&
                        filteredAvailableVehicleOptions.length ? (
                          <Separator className="my-1" />
                        ) : null}
                        {filteredAvailableVehicleOptions.length ? (
                          <div className="space-y-1">
                            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                              Available vehicles
                            </p>
                            {filteredAvailableVehicleOptions.map(
                              renderVehicleOption,
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {hasSelectedBuyerLead && !hasVehicleOptions ? (
                <p className="text-xs text-muted-foreground">
                  No available vehicles can be selected for this sale.
                </p>
              ) : null}
            </div>
            <FieldError id="saleVehicleIdError">
              {errors?.vehicleId}
            </FieldError>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={errors?.saleDate ? true : undefined}>
            <FieldLabel htmlFor="saleDate">Sale date</FieldLabel>
            <Input
              id="saleDate"
              type="datetime-local"
              value={values.saleDate}
              onChange={(e) => updateField("saleDate", e.target.value)}
              aria-invalid={errors?.saleDate ? true : undefined}
              aria-describedby={errors?.saleDate ? "saleDateError" : undefined}
              required
            />
            <FieldError id="saleDateError">{errors?.saleDate}</FieldError>
          </Field>
          <FinalSaleAmountInput
            value={values.finalSaleAmount}
            selectedVehicle={selectedVehicle}
            onChange={(nextValue) => updateField("finalSaleAmount", nextValue)}
            error={errors?.finalSaleAmount}
          />
        </div>
        <FinalSalePricingHelper
          value={values.finalSaleAmount}
          selectedVehicle={selectedVehicle}
          onChange={(nextValue) => updateField("finalSaleAmount", nextValue)}
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Commission & Closing
          </h3>
          <p className="text-sm text-muted-foreground">
            Record the sales agent, fixed commission, and closing details.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="agentName">Agent name</FieldLabel>
            <Input
              id="agentName"
              value={values.agentName}
              placeholder={currentUserName ?? "Assigned agent"}
              onChange={(e) => updateField("agentName", e.target.value)}
            />
          </Field>
          <div className="rounded-lg border bg-muted/20 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              Sales commission
            </p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {formatMoney(FIXED_COMMISSION_AMOUNT)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fixed sales commission applied when an agent is assigned.
            </p>
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor="buyerClosingNote">
            Buyer closing note{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </FieldLabel>
          <Textarea
            id="buyerClosingNote"
            rows={5}
            value={values.buyerClosingNote}
            onChange={(e) => updateField("buyerClosingNote", e.target.value)}
            placeholder="Add handoff notes, release schedule, or payment context if needed."
          />
        </Field>
      </section>
    </FieldGroup>
  );
}

function ReviewPanelTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-normal">
      <Icon className="size-4 text-primary" />
      {children}
    </CardTitle>
  );
}

function ReviewInfoItem({
  label,
  children,
  valueClassName,
}: {
  label: string;
  children: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div
        className={cn(
          "min-h-5 text-sm font-semibold text-foreground [overflow-wrap:anywhere]",
          valueClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SaleReviewDialog({
  open,
  onOpenChange,
  form,
  buyerLead,
  vehicle,
  vehicleRequiresAutoLink,
  currentUserName,
  belowMinimum,
  minimumAmount,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: SaleFormValues;
  buyerLead?: BuyerLead;
  vehicle?: Vehicle;
  vehicleRequiresAutoLink: boolean;
  currentUserName: string;
  belowMinimum: boolean;
  minimumAmount: number | null;
  pending: boolean;
  onConfirm: () => void;
}) {
  const commissionPreview = getCommissionPreview(form, currentUserName);
  const effectiveAgentName =
    form.agentName.trim() || currentUserName || "Not set";
  const saleDateLabel = form.saleDate
    ? format(new Date(form.saleDate), "MMM d, yyyy h:mm a")
    : "Not set";
  const finalSaleAmountNumber = parseMoney(form.finalSaleAmount);
  const belowMinimumDifference =
    belowMinimum && minimumAmount !== null && finalSaleAmountNumber !== null
      ? minimumAmount - finalSaleAmountNumber
      : null;
  const targetPriceLabel = vehicle?.targetSellingPrice
    ? formatMoney(vehicle.targetSellingPrice)
    : "N/A";
  const minimumPriceLabel = vehicle?.minimumAcceptablePrice
    ? formatMoney(vehicle.minimumAcceptablePrice)
    : "N/A";
  const targetPriceAmount = parseMoney(vehicle?.targetSellingPrice);
  const priceDifference =
    targetPriceAmount !== null && finalSaleAmountNumber !== null
      ? finalSaleAmountNumber - targetPriceAmount
      : null;
  const priceDifferenceLabel =
    priceDifference !== null
      ? formatMoney(formatAmountInputValue(priceDifference))
      : "N/A";
  const saleMeetsTarget =
    targetPriceAmount !== null &&
    finalSaleAmountNumber !== null &&
    finalSaleAmountNumber >= targetPriceAmount;
  const priceValidationLabel = belowMinimum
    ? "Sale amount is below minimum."
    : saleMeetsTarget
      ? "Sale amount meets the target price."
      : "Sale amount is within acceptable range.";
  const closingNote =
    form.buyerClosingNote.trim() || "No closing note entered.";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="grid max-h-[calc(100vh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 data-[size=default]:sm:max-w-5xl sm:max-w-5xl">
        <AlertDialogCancel
          aria-label="Close review"
          className="absolute right-5 top-5"
          disabled={pending}
          size="icon"
          variant="ghost"
        >
          <XIcon />
        </AlertDialogCancel>

        <AlertDialogHeader className="grid-cols-[auto_1fr] grid-rows-none items-start gap-x-6 border-b px-6 py-6 pr-14 text-left sm:place-items-start">
          <AlertDialogMedia className="mb-0 rounded-full bg-primary text-primary-foreground shadow-xs">
            <ClipboardCheckIcon />
          </AlertDialogMedia>
          <div className="flex min-w-0 flex-col gap-2">
            <AlertDialogTitle className="text-2xl font-semibold leading-tight">
              Review Sale Before Finalizing
            </AlertDialogTitle>
            <AlertDialogDescription className="max-w-xl text-sm leading-6">
              Verify the buyer, vehicle, sale amount, commission, and closing
              details before recording this sale.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <Card
            className="min-h-30 rounded-lg border-primary/20 bg-primary/5 shadow-none"
            size="sm"
          >
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-normal">
                Sale Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.05fr_1.15fr]">
                <ReviewInfoItem
                  label="Final Sale Amount"
                  valueClassName="text-3xl font-semibold leading-none text-primary"
                >
                  {formatMoney(form.finalSaleAmount)}
                </ReviewInfoItem>
                <ReviewInfoItem label="Sale Date">
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="size-4 text-primary" />
                    {saleDateLabel}
                  </span>
                </ReviewInfoItem>
                <ReviewInfoItem label="Agent">
                  <span className="flex items-center gap-2">
                    <CircleUserRoundIcon className="size-4 text-primary" />
                    {effectiveAgentName}
                  </span>
                </ReviewInfoItem>
                <ReviewInfoItem label="Commission">
                  <span className="flex items-center gap-2">
                    <PercentIcon className="size-4 text-primary" />
                    {formatMoney(commissionPreview.finalAmount)} fixed
                  </span>
                </ReviewInfoItem>
                <ReviewInfoItem label="Sale Status">
                  <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                    <span className="size-2 rounded-full bg-emerald-600" />
                    Ready to finalize
                  </Badge>
                </ReviewInfoItem>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="min-h-40 rounded-lg shadow-none" size="sm">
              <CardHeader>
                <ReviewPanelTitle icon={CircleUserRoundIcon}>
                  Buyer
                </ReviewPanelTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
                <ReviewInfoItem label="Buyer Name">
                  {buyerLead?.buyerName ?? "Not selected"}
                </ReviewInfoItem>
                <ReviewInfoItem label="Contact Number">
                  {buyerLead?.contactNumber ?? "N/A"}
                </ReviewInfoItem>
                <ReviewInfoItem label="Lead Status">
                  <Badge className="border-sky-200 bg-sky-100 text-sky-700">
                    {buyerLead?.status ?? "N/A"}
                  </Badge>
                </ReviewInfoItem>
              </CardContent>
            </Card>

            <Card className="min-h-40 rounded-lg shadow-none" size="sm">
              <CardHeader>
                <ReviewPanelTitle icon={CarFrontIcon}>
                  Vehicle
                </ReviewPanelTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
                <ReviewInfoItem label="Stock Number">
                  {vehicle?.stockNumber ?? "Not selected"}
                </ReviewInfoItem>
                <ReviewInfoItem label="Brand / Model">
                  {vehicle
                    ? `${vehicle.brand} ${vehicle.model}`
                    : "Not selected"}
                </ReviewInfoItem>
                <ReviewInfoItem label="Year / Variant">
                  {vehicle
                    ? [vehicle.year, vehicle.variant].filter(Boolean).join(" • ")
                    : "N/A"}
                </ReviewInfoItem>
                <ReviewInfoItem label="Inventory Status">
                  {vehicle?.status ? (
                    <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                      {vehicle.status}
                    </Badge>
                  ) : (
                    "N/A"
                  )}
                </ReviewInfoItem>
              </CardContent>
            </Card>
          </div>

          <Card className="min-h-36 rounded-lg shadow-none" size="sm">
            <CardHeader>
              <ReviewPanelTitle icon={ScaleIcon}>
                Price Validation
              </ReviewPanelTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_1fr_1.25fr]">
                <ReviewInfoItem label="Final Sale Amount">
                  {formatMoney(form.finalSaleAmount)}
                </ReviewInfoItem>
                <ReviewInfoItem label="Target Price">
                  {targetPriceLabel}
                </ReviewInfoItem>
                <ReviewInfoItem label="Minimum Acceptable Price">
                  {minimumPriceLabel}
                </ReviewInfoItem>
                <ReviewInfoItem label="Price Difference">
                  {priceDifferenceLabel}
                </ReviewInfoItem>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold",
                    belowMinimum
                      ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2",
                      belowMinimum ? "border-amber-500" : "border-emerald-600",
                    )}
                  >
                    {belowMinimum ? (
                      <TriangleAlertIcon className="size-5" />
                    ) : (
                      <CircleCheckIcon className="size-5" />
                    )}
                  </span>
                  {priceValidationLabel}
                </div>
              </div>

              {vehicleRequiresAutoLink ? (
                <Alert className="mt-4">
                  <CarFrontIcon />
                  <AlertTitle>Vehicle will be linked automatically</AlertTitle>
                  <AlertDescription>
                    This vehicle is not currently linked to the buyer. The link
                    will be created when you finalize the sale.
                  </AlertDescription>
                </Alert>
              ) : null}

              {belowMinimum ? (
                <Alert className="mt-4 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <TriangleAlertIcon />
                  <AlertTitle>
                    This sale amount is below the minimum acceptable price
                    {belowMinimumDifference !== null
                      ? ` by ${formatMoney(formatAmountInputValue(belowMinimumDifference))}`
                      : ""}
                    .
                  </AlertTitle>
                  <AlertDescription className="text-amber-800 dark:text-amber-300">
                    Please confirm only if this exception has approval.
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="min-h-44 rounded-lg shadow-none" size="sm">
              <CardHeader>
                <ReviewPanelTitle icon={PercentIcon}>
                  Commission
                </ReviewPanelTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_1.1fr]">
                  <ReviewInfoItem label="Fixed Sales Commission">
                    {formatMoney(commissionPreview.defaultAmount)}
                  </ReviewInfoItem>
                  <ReviewInfoItem label="Commission Rule">
                    Standard vehicle sale
                  </ReviewInfoItem>
                  <ReviewInfoItem label="Agent">
                    {effectiveAgentName}
                  </ReviewInfoItem>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Final Payout
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    {formatMoney(commissionPreview.finalAmount)}
                  </span>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LockIcon className="size-4" />
                  Commission is fixed by the dealership policy.
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-44 rounded-lg shadow-none" size="sm">
              <CardHeader>
                <ReviewPanelTitle icon={FileTextIcon}>
                  Closing Details
                </ReviewPanelTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Buyer Closing Note
                </span>
                <Textarea
                  className="min-h-24 resize-none bg-muted/20"
                  readOnly
                  value={closingNote}
                />
                <p className="text-xs text-muted-foreground">
                  Optional notes are saved with the sale record and visible in
                  the activity history.
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <TriangleAlertIcon />
            <AlertTitle>
              Finalizing will record the sale, mark the vehicle as sold, and
              create the {formatMoney(FIXED_COMMISSION_AMOUNT)} agent
              commission.
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              This action cannot be undone from this screen.
            </AlertDescription>
          </Alert>
        </div>

        <AlertDialogFooter className="items-center border-t bg-background px-6 py-4 sm:justify-between">
          <p className="text-sm text-muted-foreground">
            All required sale details have been verified.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel disabled={pending}>
              <PencilIcon data-icon="inline-start" />
              Back to Edit
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                onConfirm();
              }}
            >
              <CheckIcon data-icon="inline-start" />
              {belowMinimum ? "Finalize Below Minimum" : "Finalize Sale"}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function DeleteSaleDraftDialog({
  draft,
  open,
  onOpenChange,
  pending,
  onConfirm,
}: {
  draft: SaleDraft | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete sales draft?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            {draft ? draft.draftNumber : "this sales draft"}. You cannot undo
            this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {draft ? (
          <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              {draft.buyerLead.buyerName}
            </p>
            <p className="text-muted-foreground">
              {draft.vehicle.stockNumber} • {draft.vehicle.brand}{" "}
              {draft.vehicle.model}
            </p>
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete Draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SalesScreen() {
  const authQuery = useAuthenticatedUserQuery();
  const availableVehiclesQuery = useVehiclesQuery({ status: "Available" });
  const createMutation = useCreateSaleMutation();
  const saveDraftMutation = useSaveSaleDraftMutation();
  const updateDraftMutation = useUpdateSaleDraftMutation();
  const deleteDraftMutation = useDeleteSaleDraftMutation();
  const finalizeDraftMutation = useFinalizeSaleDraftMutation();
  const autoSelectedBuyerIdRef = React.useRef<string | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] =
    React.useState<SalesFilterStatus>("all");
  const [agentFilter, setAgentFilter] = React.useState<SalesFilterAgent>("all");
  const [rangeFilter, setRangeFilter] = React.useState<SalesFilterRange>("all");
  const [page, setPage] = React.useState(1);
  const [form, setForm] = React.useState<SaleFormValues>(() =>
    getEmptySaleFormValues(),
  );
  const [showFormErrors, setShowFormErrors] = React.useState(false);
  const [buyerLeadSearch, setBuyerLeadSearch] = React.useState("");
  const [debouncedBuyerLeadSearch, setDebouncedBuyerLeadSearch] =
    React.useState("");
  const [viewSaleId, setViewSaleId] = React.useState<string | null>(null);
  const [reviewSaleOpen, setReviewSaleOpen] = React.useState(false);
  const [activeDraftId, setActiveDraftId] = React.useState<string | null>(null);
  const [draftPendingDelete, setDraftPendingDelete] =
    React.useState<SaleDraft | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedBuyerLeadSearch(buyerLeadSearch);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [buyerLeadSearch]);

  const currentUserName = authQuery.data?.user.fullName ?? "";
  const immediateSalesFilterValues = React.useMemo<
    Omit<SalesListFilters, "page" | "pageSize">
  >(
    () => ({
      search: searchTerm.trim() || undefined,
      status: statusFilter,
      agentName: agentFilter === "mine" ? currentUserName : undefined,
      dateRange: rangeFilter,
    }),
    [agentFilter, currentUserName, rangeFilter, searchTerm, statusFilter],
  );
  const [debouncedSalesFilterValues, setDebouncedSalesFilterValues] =
    React.useState<Omit<SalesListFilters, "page" | "pageSize">>(
      immediateSalesFilterValues,
    );
  const isDebouncingSalesFilters =
    immediateSalesFilterValues !== debouncedSalesFilterValues;

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSalesFilterValues(immediateSalesFilterValues);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [immediateSalesFilterValues]);

  const salesFilters = React.useMemo<SalesListFilters>(
    () => ({
      page,
      pageSize: 10,
      ...debouncedSalesFilterValues,
    }),
    [debouncedSalesFilterValues, page],
  );
  const salesSummaryFilters = React.useMemo<
    Omit<SalesListFilters, "page" | "pageSize">
  >(() => debouncedSalesFilterValues, [debouncedSalesFilterValues]);
  const salesQuery = useSalesQuery(salesFilters);
  const salesSummaryQuery = useSalesSummaryQuery(salesSummaryFilters);
  const isUpdatingSalesTable =
    isDebouncingSalesFilters || (salesQuery.isFetching && !salesQuery.isPending);
  const buyerLeadSearchQuery = useSalesBuyerLeadSearchQuery(
    debouncedBuyerLeadSearch,
    createOpen,
  );
  const selectedBuyerLeadQuery = useBuyerLeadQuery(form.buyerLeadId);
  const selectedBuyerLead = selectedBuyerLeadQuery.data?.buyerLead;
  const buyerLeadSearchResults = React.useMemo(
    () => buyerLeadSearchQuery.data?.buyerLeads ?? [],
    [buyerLeadSearchQuery.data?.buyerLeads],
  );
  const sales = salesQuery.data?.sales ?? [];
  const total = salesQuery.data?.total ?? 0;
  const totalPages = salesQuery.data?.totalPages ?? 1;

  const totalSales = salesSummaryQuery.data?.totalSales ?? 0;
  const revenueTotal = salesSummaryQuery.data?.totalRevenue ?? "0.00";
  const grossProfitTotal = salesSummaryQuery.data?.totalGrossProfit ?? "0.00";
  const commissionTotal =
    salesSummaryQuery.data?.totalCommissionPayouts ?? "0.00";
  const totalDrafts = salesSummaryQuery.data?.totalDrafts ?? 0;

  const buyerLeadOptions = React.useMemo(() => {
    const options = buyerLeadSearchResults.map((lead) => ({
      value: lead.id,
      buyerName: lead.buyerName,
      contactNumber: lead.contactNumber,
      email: lead.email,
      status: lead.status,
    }));

    if (
      selectedBuyerLead &&
      !options.some((option) => option.value === selectedBuyerLead.id)
    ) {
      options.unshift({
        value: selectedBuyerLead.id,
        buyerName: selectedBuyerLead.buyerName,
        contactNumber: selectedBuyerLead.contactNumber,
        email: selectedBuyerLead.email,
        status: selectedBuyerLead.status,
      });
    }

    return options;
  }, [buyerLeadSearchResults, selectedBuyerLead]);

  const vehicleOptions =
    React.useMemo<SalesVehicleOption[]>(() => {
      const linkedVehicles = selectedBuyerLead?.vehicles ?? [];
      const availableVehicles = availableVehiclesQuery.data?.vehicles ?? [];
      const availableVehicleById = new Map(
        availableVehicles.map((vehicle) => [vehicle.id, vehicle]),
      );
      const linkedVehicleIds = new Set(
        linkedVehicles.map((vehicle) => vehicle.id),
      );
      const linkedOptions = linkedVehicles.flatMap((linkedVehicle) => {
        const vehicle = availableVehicleById.get(linkedVehicle.id);

        if (!vehicle) {
          return [];
        }

        return [
          {
            id: vehicle.id,
            label: `${vehicle.brand} ${vehicle.model}`,
            summary: `${vehicle.brand} ${vehicle.model}`,
            details: `${vehicle.year}${
              vehicle.variant ? ` • ${vehicle.variant}` : ""
            }`,
            stockNumber: vehicle.stockNumber,
            statusLabel: vehicle.status,
            relationship: "linked" as const,
            vehicle,
          },
        ];
      });
      const availableOptions =
        availableVehicles
          .filter((vehicle) => !linkedVehicleIds.has(vehicle.id))
          .map((vehicle) => ({
            id: vehicle.id,
            label: `${vehicle.brand} ${vehicle.model}`,
            summary: `${vehicle.brand} ${vehicle.model}`,
            details: `${vehicle.year}${
              vehicle.variant ? ` • ${vehicle.variant}` : ""
            }`,
            stockNumber: vehicle.stockNumber,
            statusLabel: vehicle.status,
            relationship: "available" as const,
            vehicle,
          }));

      return [...linkedOptions, ...availableOptions];
    }, [availableVehiclesQuery.data?.vehicles, selectedBuyerLead?.vehicles]);

  React.useEffect(() => {
    if (!form.buyerLeadId) {
      autoSelectedBuyerIdRef.current = null;
      return;
    }

    if (!selectedBuyerLead || selectedBuyerLead.id !== form.buyerLeadId) {
      return;
    }

    if (
      form.vehicleId ||
      autoSelectedBuyerIdRef.current === selectedBuyerLead.id
    ) {
      return;
    }

    const linkedAvailableOptions = vehicleOptions.filter(
      (vehicle) => vehicle.relationship === "linked",
    );

    if (linkedAvailableOptions.length !== 1) {
      return;
    }

    const [linkedVehicle] = linkedAvailableOptions;
    const timer = window.setTimeout(() => {
      autoSelectedBuyerIdRef.current = selectedBuyerLead.id;
      setForm((currentForm) => {
        if (
          currentForm.buyerLeadId !== selectedBuyerLead.id ||
          currentForm.vehicleId
        ) {
          return currentForm;
        }

        return {
          ...currentForm,
          vehicleId: linkedVehicle.id,
          finalSaleAmount: "",
        };
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [form.buyerLeadId, form.vehicleId, selectedBuyerLead, vehicleOptions]);

  const selectedVehicleOption = vehicleOptions.find(
    (vehicle) => vehicle.id === form.vehicleId,
  );
  const selectedPricingVehicle = selectedVehicleOption?.vehicle;
  const selectedPricingRange = getVehiclePricingRange(selectedPricingVehicle);
  const finalSaleAmountNumber = parseMoney(form.finalSaleAmount);
  const isFinalSaleBelowMinimum =
    Boolean(selectedPricingRange) &&
    finalSaleAmountNumber !== null &&
    finalSaleAmountNumber < selectedPricingRange!.minimum;
  const draftSavePending =
    saveDraftMutation.isPending || updateDraftMutation.isPending;
  const finalizationPending =
    createMutation.isPending ||
    updateDraftMutation.isPending ||
    finalizeDraftMutation.isPending;
  const formErrors = React.useMemo(
    () => (showFormErrors ? getSaleFormErrors(form) : {}),
    [form, showFormErrors],
  );
  const formErrorMessages = SALE_FORM_ERROR_FIELDS.flatMap((field) => {
    const message = formErrors[field];

    return message ? [message] : [];
  });

  const resetCreateSaleState = React.useCallback(() => {
    setForm(getEmptySaleFormValues(currentUserName));
    setShowFormErrors(false);
    setBuyerLeadSearch("");
    setDebouncedBuyerLeadSearch("");
    setReviewSaleOpen(false);
    setActiveDraftId(null);
    setDraftPendingDelete(null);
  }, [currentUserName]);

  function handleCreateOpenChange(nextOpen: boolean) {
    setCreateOpen(nextOpen);

    if (!nextOpen) {
      resetCreateSaleState();
    }
  }

  function getDraftPayload() {
    return {
      buyerLeadId: form.buyerLeadId,
      vehicleId: form.vehicleId,
      saleDate: form.saleDate
        ? new Date(form.saleDate).toISOString()
        : null,
      finalSaleAmount: form.finalSaleAmount || null,
      agentName: form.agentName || currentUserName || null,
      buyerClosingNote: form.buyerClosingNote || null,
    };
  }

  function handleContinueDraft(draft: SaleDraft) {
    setActiveDraftId(draft.id);
    setForm({
      buyerLeadId: draft.buyerLeadId,
      vehicleId: draft.vehicleId,
      saleDate: draft.saleDate
        ? format(new Date(draft.saleDate), "yyyy-MM-dd'T'HH:mm")
        : "",
      finalSaleAmount: draft.finalSaleAmount ?? "",
      agentName: draft.agentName ?? currentUserName,
      buyerClosingNote:
        draft.buyerClosingNote ?? draft.buyerLead.closingNote ?? "",
    });
    setBuyerLeadSearch("");
    setDebouncedBuyerLeadSearch("");
    setShowFormErrors(false);
    setReviewSaleOpen(false);
    setCreateOpen(true);
  }

  async function handleSaveDraft() {
    if (!form.buyerLeadId || !form.vehicleId) {
      toast.error("Select a buyer lead and vehicle before saving a draft", {
        details:
          "A sales draft must link one buyer lead to one inventory vehicle before it can be saved.",
      });
      return;
    }

    const payload = getDraftPayload();

    if (activeDraftId) {
      await updateDraftMutation.mutateAsync(
        { id: activeDraftId, payload },
        {
          onSuccess: () => {
            toast.success("Sales draft updated", {
              details:
                "The current draft now has the latest buyer, vehicle, pricing, and closing details.",
            });
            resetCreateSaleState();
            setCreateOpen(false);
          },
        },
      );
      return;
    }

    await saveDraftMutation.mutateAsync(payload, {
      onSuccess: () => {
        toast.success("Sales draft saved", {
          details:
            "The draft sale is saved and can be resumed from the sales workspace.",
        });
        resetCreateSaleState();
        setCreateOpen(false);
      },
    });
  }

  async function confirmDeleteDraft() {
    if (!draftPendingDelete) {
      return;
    }

    await deleteDraftMutation.mutateAsync(draftPendingDelete.id, {
      onSuccess: () => {
        toast.success("Sales draft deleted", {
          details:
            "The selected draft was removed from the active sales workflow.",
        });
        setDraftPendingDelete(null);
      },
    });
  }

  async function submitSale() {
    if (activeDraftId) {
      await updateDraftMutation.mutateAsync({
        id: activeDraftId,
        payload: getDraftPayload(),
      });
      await finalizeDraftMutation.mutateAsync(activeDraftId, {
        onSuccess: () => {
          toast.success("Sale finalized", {
            details:
              "The draft was finalized as a sale and the linked vehicle is no longer available.",
          });
          resetCreateSaleState();
          setCreateOpen(false);
        },
      });
      return;
    }

    await createMutation.mutateAsync(
      {
        buyerLeadId: form.buyerLeadId,
        vehicleId: form.vehicleId,
        saleDate: new Date(form.saleDate).toISOString(),
        finalSaleAmount: form.finalSaleAmount,
        agentName: form.agentName || currentUserName || null,
        buyerClosingNote: form.buyerClosingNote || null,
      },
      {
        onSuccess: () => {
          toast.success("Sale finalized", {
            details:
              "The sale record was completed and the linked vehicle inventory status was updated.",
          });
          resetCreateSaleState();
          setCreateOpen(false);
        },
      },
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = getSaleFormErrors(form);
    setShowFormErrors(hasSaleFormErrors(nextErrors));

    if (hasSaleFormErrors(nextErrors)) {
      setReviewSaleOpen(false);
      toast.error("Please complete the required sale details first.", {
        details:
          "Fill in the highlighted buyer, vehicle, sale date, price, and closing fields before finalizing.",
      });
      return;
    }

    setShowFormErrors(false);
    setReviewSaleOpen(true);
  }

  const summaryCards = [
    {
      title: "Total Sales",
      value: totalSales.toString(),
      caption: "Closed deals",
      icon: ReceiptTextIcon,
      iconWrapClassName: "bg-blue-50 text-blue-600 dark:bg-blue-950/40",
    },
    {
      title: "Drafts",
      value: totalDrafts.toString(),
      caption: "Saved in progress",
      icon: FileTextIcon,
      iconWrapClassName: "bg-slate-50 text-slate-600 dark:bg-slate-950/40",
    },
    {
      title: "Revenue",
      value: formatMoney(revenueTotal),
      caption: "Booked revenue",
      icon: DollarSignIcon,
      iconWrapClassName:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
    },
    {
      title: "Gross Profit",
      value: formatMoney(grossProfitTotal),
      caption: "Closed deals",
      icon: BarChart3Icon,
      iconWrapClassName:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
    },
    {
      title: "Commission Payouts",
      value: formatMoney(commissionTotal),
      caption: "Locked commissions",
      icon: BadgeDollarSignIcon,
      iconWrapClassName: "bg-orange-50 text-orange-600 dark:bg-orange-950/40",
    },
  ];

  return (
    <AuthenticatedAppShell title="Sales">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Sales</h2>
              <p className="text-sm text-muted-foreground">
                Track finalized deals, review deal value, and monitor commission
                outcomes across the sales pipeline.
              </p>
            </div>
            <Button
              onClick={() => {
                resetCreateSaleState();
                setCreateOpen(true);
              }}
            >
              <PlusIcon />
              Finalize Sale
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(320px,1fr)_repeat(4,160px)]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                placeholder="Search sales, buyer, vehicle, or ID..."
                className="h-10 pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as SalesFilterStatus);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="finalized">Finalized</SelectItem>
                <SelectItem value="commission_locked">
                  Commission Locked
                </SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={agentFilter}
              onValueChange={(value) => {
                setAgentFilter(value as SalesFilterAgent);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="mine">My Sales</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={rangeFilter}
              onValueChange={(value) => {
                setRangeFilter(value as SalesFilterRange);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="h-10 w-full justify-center"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setAgentFilter("all");
                setRangeFilter("all");
                setPage(1);
              }}
            >
              <RotateCcwIcon />
              Reset
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <Card
                  key={card.title}
                  className="border-border/70 py-0 shadow-xs"
                >
                  <CardContent className="flex items-center gap-4 p-5">
                    <div
                      className={`flex size-11 items-center justify-center rounded-full ${card.iconWrapClassName}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {card.title}
                      </p>
                      <p className="text-2xl font-semibold tracking-tight text-foreground">
                        {card.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {card.caption}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
          <CardContent className="relative p-0">
            {isUpdatingSalesTable ? (
              <div
                className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/95 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                  <Loader2Icon
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Updating results</span>
                </div>
              </div>
            ) : null}
            {salesQuery.isPending ? (
              <div className="p-6">
                <ModuleLoadingState label="Loading sales" />
              </div>
            ) : salesQuery.error ? (
              <div className="p-6">
                <ApiErrorAlert
                  title="Unable to load sales"
                  message={getApiErrorMessage(salesQuery.error, "")}
                />
              </div>
            ) : sales.length ? (
              <Table className="w-full border-collapse">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Sale
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Vehicle
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Buyer
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Sale Date
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Final Amount
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Gross Profit
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Status
                    </TableHead>
                    <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => {
                    const status = getSaleStatus(sale);
                    const previewPhoto = sale.vehicle.photos[0];
                    const recordNumber =
                      sale.recordType === "draft"
                        ? sale.draftNumber
                        : sale.saleNumber;
                    const saleDate =
                      sale.recordType === "draft" ? sale.saleDate : sale.saleDate;
                    const updatedAt =
                      sale.recordType === "draft" ? sale.updatedAt : sale.updatedAt;

                    return (
                      <TableRow key={sale.id} className="hover:bg-muted/15">
                        <TableCell className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {recordNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sale.recordType === "draft"
                                ? `Saved ${formatDistanceLabel(updatedAt)}`
                                : (sale.agentName ?? "Unassigned agent")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <div className="flex items-start gap-3">
                            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                              {previewPhoto ? (
                                <Image
                                  src={resolveApiAssetUrl(previewPhoto.fileUrl)}
                                  alt={`${sale.vehicle.stockNumber} preview`}
                                  fill
                                  unoptimized
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                  N/A
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">
                                {sale.vehicle.stockNumber}
                              </p>
                              <p className="text-sm text-foreground">
                                {sale.vehicle.brand} {sale.vehicle.model}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {sale.vehicle.year}
                                {sale.vehicle.variant
                                  ? ` • ${sale.vehicle.variant}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {sale.buyerLead.buyerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sale.buyerLead.contactNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {saleDate
                                ? format(new Date(saleDate), "MMM d, yyyy")
                                : "Not set"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {saleDate
                                ? format(new Date(saleDate), "h:mm a")
                                : sale.recordType === "draft"
                                  ? "Draft"
                                  : "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top text-sm font-semibold text-foreground">
                          {formatMoney(sale.finalSaleAmount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                          {sale.recordType === "draft"
                            ? "N/A"
                            : formatMoney(sale.grossProfitAmount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <Badge
                            variant="outline"
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getSaleStatusClassName(status)}`}
                          >
                            {getSaleStatusLabel(status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for sale ${sale.id}`}
                              >
                                <MoreHorizontalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>
                                Sale actions
                              </DropdownMenuLabel>
                              {sale.recordType === "draft" ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleContinueDraft(sale)}
                                  >
                                    <PencilIcon data-icon="inline-start" />
                                    Continue Draft
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={deleteDraftMutation.isPending}
                                    onClick={() => setDraftPendingDelete(sale)}
                                  >
                                    <Trash2Icon data-icon="inline-start" />
                                    Delete Draft
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => setViewSaleId(sale.id)}
                                >
                                  View Details
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    recordNumber,
                                  );
                                  toast.success(
                                    sale.recordType === "draft"
                                      ? "Draft number copied"
                                      : "Sale number copied",
                                    {
                                      details: `${recordNumber} is ready to paste into messages, forms, or records.`,
                                    },
                                  );
                                }}
                              >
                                {sale.recordType === "draft"
                                  ? "Copy Draft Number"
                                  : "Copy Sale Number"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    sale.vehicle.stockNumber,
                                  );
                                  toast.success("Vehicle stock number copied", {
                                    details: `${sale.vehicle.stockNumber} is ready to paste into messages, forms, or records.`,
                                  });
                                }}
                              >
                                Copy Vehicle Stock
                              </DropdownMenuItem>
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
                  title="No sales or drafts yet"
                  description="Finalize a sale or save an in-progress draft to start tracking the sales workflow."
                />
              </div>
            )}
          </CardContent>
          {!salesQuery.isPending && !salesQuery.error && total > 0 ? (
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="sales"
              onPageChange={setPage}
            />
          ) : null}
        </Card>

        <Sheet open={createOpen} onOpenChange={handleCreateOpenChange}>
          <SheetContent
            side="right"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
            }}
            className="overflow-hidden w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[50vw] md:data-[side=right]:max-w-none"
          >
            <SheetHeader className="border-b px-6 py-5 pr-14">
              <SheetTitle className="text-lg">
                {activeDraftId ? "Continue Sales Draft" : "Finalize Sale"}
              </SheetTitle>
              <SheetDescription>
                {activeDraftId
                  ? "Review the saved details, update the draft, or finalize it when ready."
                  : "Close a deal, save a draft, or move the selected vehicle into sold inventory."}
              </SheetDescription>
            </SheetHeader>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="min-h-full px-6 py-6">
                  <div className="space-y-5">
                    <ApiErrorAlert
                      title="Unable to finalize sale"
                      message={getApiErrorMessage(
                        createMutation.error ?? finalizeDraftMutation.error,
                        "",
                      )}
                    />
                    <ApiErrorAlert
                      title="Unable to save draft"
                      message={getApiErrorMessage(
                        saveDraftMutation.error ?? updateDraftMutation.error,
                        "",
                      )}
                    />
                    <ApiErrorAlert
                      title="Unable to delete draft"
                      message={getApiErrorMessage(
                        deleteDraftMutation.error,
                        "",
                      )}
                    />
                    {formErrorMessages.length ? (
                      <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
                        <TriangleAlertIcon />
                        <AlertTitle>
                          Complete the required sale details
                        </AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc space-y-1 pl-4">
                            {formErrorMessages.map((message) => (
                              <li key={message}>{message}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    ) : null}
                    <SalesForm
                      values={form}
                      onChange={(nextValues) => {
                        if (nextValues.buyerLeadId !== form.buyerLeadId) {
                          const nextBuyerLead = buyerLeadSearchResults.find(
                            (lead) => lead.id === nextValues.buyerLeadId,
                          );
                          if (
                            nextBuyerLead?.closingNote &&
                            !nextValues.buyerClosingNote.trim()
                          ) {
                            nextValues = {
                              ...nextValues,
                              buyerClosingNote: nextBuyerLead.closingNote,
                            };
                          }

                          setBuyerLeadSearch("");
                        }

                        setForm(nextValues);
                      }}
                      buyerLeadSearch={buyerLeadSearch}
                      onBuyerLeadSearchChange={setBuyerLeadSearch}
                      buyerLeadOptions={buyerLeadOptions}
                      buyerLeadSearchPending={buyerLeadSearchQuery.isPending}
                      buyerLeadSearchError={buyerLeadSearchQuery.error}
                      vehicleOptions={vehicleOptions}
                      selectedBuyerLead={selectedBuyerLead}
                      selectedVehicle={selectedPricingVehicle}
                      selectedVehicleOption={selectedVehicleOption}
                      currentUserName={currentUserName}
                      errors={formErrors}
                    />
                  </div>
                </div>
              </div>
              <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Drafts do not update dashboard metrics or inventory status
                  until finalization.
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
                    type="button"
                    variant="outline"
                    pending={draftSavePending}
                    pendingLabel={
                      activeDraftId ? "Updating draft" : "Saving draft"
                    }
                    onClick={handleSaveDraft}
                  >
                    <SaveIcon data-icon="inline-start" />
                    {activeDraftId ? "Update Draft" : "Save as Draft"}
                  </SubmitButton>
                  <SubmitButton
                    type="submit"
                    pending={finalizationPending}
                    pendingLabel="Finalizing sale"
                  >
                    Finalize Sale
                  </SubmitButton>
                </div>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <SaleReviewDialog
          open={reviewSaleOpen}
          onOpenChange={setReviewSaleOpen}
          form={form}
          buyerLead={selectedBuyerLead}
          vehicle={selectedPricingVehicle}
          vehicleRequiresAutoLink={
            selectedVehicleOption?.relationship === "available"
          }
          currentUserName={currentUserName}
          belowMinimum={isFinalSaleBelowMinimum}
          minimumAmount={selectedPricingRange?.minimum ?? null}
          pending={finalizationPending}
          onConfirm={() => {
            void (async () => {
              try {
                await submitSale();
                setReviewSaleOpen(false);
              } catch {
                // The sheet-level API error alert renders the mutation error.
                setReviewSaleOpen(false);
              }
            })();
          }}
        />

        <DeleteSaleDraftDialog
          draft={draftPendingDelete}
          open={Boolean(draftPendingDelete)}
          onOpenChange={(open) => {
            if (!open) {
              setDraftPendingDelete(null);
            }
          }}
          pending={deleteDraftMutation.isPending}
          onConfirm={() => {
            void confirmDeleteDraft();
          }}
        />

        <SaleDetailDialog
          open={Boolean(viewSaleId)}
          onOpenChange={(open) => !open && setViewSaleId(null)}
          saleId={viewSaleId}
        />
      </div>
    </AuthenticatedAppShell>
  );
}
