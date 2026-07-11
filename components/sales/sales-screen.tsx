"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  BadgeDollarSignIcon,
  BarChart3Icon,
  CarFrontIcon,
  CheckIcon,
  CircleUserRoundIcon,
  ClipboardCheckIcon,
  DollarSignIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  PercentIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  SearchIcon,
  TagsIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import { useLinkBuyerLeadVehicleMutation } from "@/hooks/mutations/buyer-leads/use-link-buyer-lead-vehicle-mutation";
import { useCreateSaleMutation } from "@/hooks/mutations/sales/use-create-sale-mutation";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { useBuyerLeadQuery } from "@/hooks/queries/buyer-leads/use-buyer-lead-query";
import { useSalesQuery } from "@/hooks/queries/sales/use-sales-query";
import { useSalesBuyerLeadSearchQuery } from "@/hooks/queries/sales/use-sales-buyer-lead-search-query";
import { useSalesSummaryQuery } from "@/hooks/queries/sales/use-sales-summary-query";
import { useVehiclesQuery } from "@/hooks/queries/vehicles/use-vehicles-query";
import { getApiErrorMessage } from "@/types/api";
import type { BuyerLead } from "@/types/buyer-leads";
import type { SaleWithDetails, SalesListFilters } from "@/types/sales";
import type { Vehicle } from "@/types/vehicles";

type SalesFilterStatus =
  "all" | "finalized" | "commission_locked" | "needs_review";
type SalesFilterAgent = "all" | "mine";
type SalesFilterRange = "all" | "this_month" | "last_30_days";

type SaleFormValues = {
  buyerLeadId: string;
  vehicleId: string;
  saleDate: string;
  finalSaleAmount: string;
  agentName: string;
  commissionOverrideAmount: string;
  commissionOverrideReason: string;
  buyerClosingNote: string;
};

type BuyerLeadOption = {
  value: string;
  label: string;
};

function getEmptySaleFormValues(defaultAgentName = ""): SaleFormValues {
  return {
    buyerLeadId: "",
    vehicleId: "",
    saleDate: "",
    finalSaleAmount: "",
    agentName: defaultAgentName,
    commissionOverrideAmount: "",
    commissionOverrideReason: "",
    buyerClosingNote: "",
  };
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

function getSaleStatus(
  sale: SaleWithDetails,
): Exclude<SalesFilterStatus, "all"> {
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

function getCommissionPreview(values: SaleFormValues, currentUserName?: string) {
  const effectiveAgentName =
    values.agentName.trim() || currentUserName?.trim() || "";
  const defaultAmount = effectiveAgentName ? "5000.00" : null;
  const overrideAmount = values.commissionOverrideAmount.trim() || null;
  const finalAmount = effectiveAgentName
    ? (overrideAmount ?? defaultAmount ?? "0.00")
    : "0.00";

  return {
    defaultAmount,
    overrideAmount,
    finalAmount,
  };
}

function FinalSaleAmountInput({
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

  return (
    <Field data-invalid={isBelowMinimum ? true : undefined}>
      <FieldLabel htmlFor="finalSaleAmount">Final sale amount</FieldLabel>
      <Input
        id="finalSaleAmount"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="1250000"
        inputMode="decimal"
        aria-invalid={isBelowMinimum ? true : undefined}
        required
      />
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
  availableVehicles,
  inlineLinkVehicleId,
  onInlineLinkVehicleIdChange,
  onLinkVehicle,
  linkVehiclePending,
  linkVehicleError,
  currentUserName,
}: {
  values: SaleFormValues;
  onChange: (values: SaleFormValues) => void;
  buyerLeadSearch: string;
  onBuyerLeadSearchChange: (value: string) => void;
  buyerLeadOptions: BuyerLeadOption[];
  buyerLeadSearchPending: boolean;
  buyerLeadSearchError?: unknown;
  vehicleOptions: { id: string; label: string }[];
  selectedBuyerLead?: BuyerLead;
  selectedVehicle?: Vehicle;
  availableVehicles: { id: string; label: string }[];
  inlineLinkVehicleId: string;
  onInlineLinkVehicleIdChange: (value: string) => void;
  onLinkVehicle: () => void;
  linkVehiclePending: boolean;
  linkVehicleError?: unknown;
  currentUserName?: string;
}) {
  const inlineVehicleSelectTriggerRef = React.useRef<HTMLButtonElement | null>(
    null,
  );
  const buyerLeadInputRef = React.useRef<HTMLInputElement | null>(null);
  const [buyerLeadPickerOpen, setBuyerLeadPickerOpen] = React.useState(false);

  function updateField<K extends keyof SaleFormValues>(
    key: K,
    value: SaleFormValues[K],
  ) {
    if (key === "buyerLeadId") {
      onChange({
        ...values,
        buyerLeadId: value as string,
        vehicleId: "",
        finalSaleAmount: "",
      });
      return;
    }

    if (key === "vehicleId") {
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
  const hasLinkedVehicles = Boolean(selectedBuyerLead?.vehicles.length);
  const selectedBuyerLeadLabel = selectedBuyerLead
    ? `${selectedBuyerLead.buyerName} • ${selectedBuyerLead.contactNumber} • ${selectedBuyerLead.status}`
    : "";

  React.useEffect(() => {
    if (!hasSelectedBuyerLead || hasLinkedVehicles) {
      return;
    }

    const timer = window.setTimeout(() => {
      inlineVehicleSelectTriggerRef.current?.focus();
    }, 120);

    return () => window.clearTimeout(timer);
  }, [hasLinkedVehicles, hasSelectedBuyerLead]);

  return (
    <FieldGroup className="gap-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Deal Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Finalize a sale using a buyer lead that is already linked to a
            vehicle.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="saleBuyerLeadId">Buyer lead</FieldLabel>
            <div className="space-y-2">
              {selectedBuyerLead ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                  <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Selected buyer
                    </p>
                    <Badge
                      variant="outline"
                      className="max-w-full truncate rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      {selectedBuyerLeadLabel}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    aria-label="Clear selected buyer"
                    onClick={() => {
                      updateField("buyerLeadId", "");
                      onBuyerLeadSearchChange("");
                      setBuyerLeadPickerOpen(false);
                      buyerLeadInputRef.current?.focus();
                    }}
                  >
                    <XIcon />
                  </Button>
                </div>
              ) : null}
              <div className="relative">
                <Input
                  id="saleBuyerLeadId"
                  ref={buyerLeadInputRef}
                  value={buyerLeadSearch}
                  placeholder={
                    selectedBuyerLead
                      ? "Search to replace buyer lead"
                      : "Search buyer lead"
                  }
                  onFocus={() => setBuyerLeadPickerOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setBuyerLeadPickerOpen(false), 120);
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
                          className="flex w-full items-center rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            updateField("buyerLeadId", lead.value);
                            onBuyerLeadSearchChange("");
                            setBuyerLeadPickerOpen(false);
                            buyerLeadInputRef.current?.blur();
                          }}
                        >
                          {lead.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <ApiErrorAlert
              title="Unable to search buyer leads"
              message={getApiErrorMessage(
                buyerLeadSearchError ?? undefined,
                "",
              )}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="saleVehicleId">Linked vehicle</FieldLabel>
            <Select
              value={values.vehicleId}
              onValueChange={(value) => updateField("vehicleId", value)}
            >
              <SelectTrigger
                id="saleVehicleId"
                disabled={!hasSelectedBuyerLead || !hasLinkedVehicles}
              >
                <SelectValue
                  placeholder={
                    !hasSelectedBuyerLead
                      ? "Select buyer lead first"
                      : hasLinkedVehicles
                        ? "Select linked vehicle"
                        : "Link a vehicle below first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {vehicleOptions.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {hasSelectedBuyerLead && !hasLinkedVehicles ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Link a vehicle to continue
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBuyerLead?.buyerName ?? "This buyer"} has no linked
                  vehicle yet. Link one available unit here and continue
                  finalizing the sale without leaving this screen.
                </p>
              </div>
              <ApiErrorAlert
                title="Unable to link vehicle"
                message={getApiErrorMessage(linkVehicleError, "")}
              />
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <Select
                  value={inlineLinkVehicleId}
                  onValueChange={onInlineLinkVehicleIdChange}
                >
                  <SelectTrigger ref={inlineVehicleSelectTriggerRef}>
                    <SelectValue placeholder="Select an available vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SubmitButton
                  type="button"
                  pending={linkVehiclePending}
                  pendingLabel="Linking vehicle"
                  disabled={
                    !inlineLinkVehicleId || availableVehicles.length === 0
                  }
                  onClick={onLinkVehicle}
                >
                  Link Vehicle
                </SubmitButton>
              </div>
              {!availableVehicles.length ? (
                <p className="text-sm text-muted-foreground">
                  No available vehicles can be linked right now.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="saleDate">Sale date</FieldLabel>
            <Input
              id="saleDate"
              type="datetime-local"
              value={values.saleDate}
              onChange={(e) => updateField("saleDate", e.target.value)}
              required
            />
          </Field>
          <FinalSaleAmountInput
            value={values.finalSaleAmount}
            selectedVehicle={selectedVehicle}
            onChange={(nextValue) => updateField("finalSaleAmount", nextValue)}
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
            Record the sales agent and any override details required for final
            commission locking.
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
          <Field>
            <FieldLabel htmlFor="commissionOverrideAmount">
              Commission override amount
            </FieldLabel>
            <Input
              id="commissionOverrideAmount"
              value={values.commissionOverrideAmount}
              onChange={(e) =>
                updateField("commissionOverrideAmount", e.target.value)
              }
              placeholder="1500"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="commissionOverrideReason">
            Commission override reason
          </FieldLabel>
          <Input
            id="commissionOverrideReason"
            value={values.commissionOverrideReason}
            onChange={(e) =>
              updateField("commissionOverrideReason", e.target.value)
            }
            placeholder="Used only when override amount is entered"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="buyerClosingNote">Buyer closing note</FieldLabel>
          <Textarea
            id="buyerClosingNote"
            rows={5}
            value={values.buyerClosingNote}
            onChange={(e) => updateField("buyerClosingNote", e.target.value)}
            placeholder="Buyer completed down payment and confirmed release schedule for unit pickup."
          />
        </Field>
      </section>
    </FieldGroup>
  );
}

function SaleReviewDialog({
  open,
  onOpenChange,
  form,
  buyerLead,
  vehicle,
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[calc(100vh-2rem)] gap-5 overflow-y-auto p-5 sm:max-w-4xl sm:p-6">
        <AlertDialogCancel
          aria-label="Close review"
          className="absolute right-4 top-4"
          disabled={pending}
          size="icon"
          variant="ghost"
        >
          <XIcon />
        </AlertDialogCancel>

        <AlertDialogHeader className="pr-10">
          <AlertDialogMedia className="rounded-full bg-primary/10 text-primary">
            <ClipboardCheckIcon />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-2xl">
            Review Sale Before Finalizing
          </AlertDialogTitle>
          <AlertDialogDescription className="max-w-md">
            Confirm the buyer, vehicle, final amount, commission, and closing
            details before creating this sale.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CircleUserRoundIcon className="size-4" />
                </span>
                1. Buyer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Buyer Name
                  </span>
                  <span className="truncate text-base font-medium">
                    {buyerLead?.buyerName ?? "Not selected"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Contact Number
                  </span>
                  <span className="truncate text-base font-medium">
                    {buyerLead?.contactNumber ?? "N/A"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Lead Status
                  </span>
                  <div>
                    <Badge variant="secondary">
                      {buyerLead?.status ?? "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CarFrontIcon className="size-4" />
                </span>
                2. Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-[1fr_1.5fr_1fr]">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Stock Number
                  </span>
                  <span className="truncate text-base font-medium">
                    {vehicle?.stockNumber ?? "Not selected"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Brand / Model
                  </span>
                  <span className="truncate text-base font-medium">
                    {vehicle
                      ? `${vehicle.brand} ${vehicle.model}`
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Year / Variant
                  </span>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-base font-medium">
                      {vehicle
                        ? [vehicle.year, vehicle.variant]
                            .filter(Boolean)
                            .join(" • ")
                        : "N/A"}
                    </span>
                    {vehicle?.status ? (
                      <Badge variant="secondary">{vehicle.status}</Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <TagsIcon className="size-4" />
                </span>
                3. Sale Details
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-[1.2fr_1.4fr_1fr]">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Sale Date
                  </span>
                  <span className="truncate text-base font-medium">
                    {saleDateLabel}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Final Sale Amount
                  </span>
                  <span className="truncate text-2xl font-semibold text-primary">
                    {formatMoney(form.finalSaleAmount)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-3 md:border-l md:pl-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Target Price
                    </span>
                    <span className="truncate text-sm font-medium">
                      {targetPriceLabel}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Minimum Acceptable Price
                    </span>
                    <span className="truncate text-sm font-medium">
                      {minimumPriceLabel}
                    </span>
                  </div>
                </div>
              </div>

              {belowMinimum ? (
                <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
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

          <div className="grid gap-3 md:grid-cols-2">
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <PercentIcon className="size-4" />
                  </span>
                  4. Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Default Commission
                    </span>
                    <span className="truncate text-base font-medium">
                      {formatMoney(commissionPreview.defaultAmount)}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Override Commission
                    </span>
                    <span className="truncate text-base font-medium">
                      {commissionPreview.overrideAmount
                        ? formatMoney(commissionPreview.overrideAmount)
                        : "-"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    Final Payout
                  </span>
                  <span className="truncate text-xl font-semibold text-primary">
                    {formatMoney(commissionPreview.finalAmount)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Agent</span>
                  <span className="truncate text-sm font-medium">
                    {effectiveAgentName}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileTextIcon className="size-4" />
                  </span>
                  5. Closing Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex min-h-28 flex-col gap-2">
                  <span className="text-xs text-muted-foreground">Note</span>
                  <p className="text-sm leading-relaxed">
                    {form.buyerClosingNote.trim() ||
                      "No closing note entered."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AlertDialogFooter className="pt-1">
          <AlertDialogCancel disabled={pending}>
            <PencilIcon data-icon="inline-start" />
            Edit Details
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SalesScreen() {
  const authQuery = useAuthenticatedUserQuery();
  const availableVehiclesQuery = useVehiclesQuery({ status: "Available" });
  const createMutation = useCreateSaleMutation();
  const linkVehicleMutation = useLinkBuyerLeadVehicleMutation();

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
  const [buyerLeadSearch, setBuyerLeadSearch] = React.useState("");
  const [debouncedBuyerLeadSearch, setDebouncedBuyerLeadSearch] =
    React.useState("");
  const [inlineLinkVehicleId, setInlineLinkVehicleId] = React.useState("");
  const [viewSaleId, setViewSaleId] = React.useState<string | null>(null);
  const [reviewSaleOpen, setReviewSaleOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedBuyerLeadSearch(buyerLeadSearch);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [buyerLeadSearch]);

  const currentUserName = authQuery.data?.user.fullName ?? "";
  const salesFilters = React.useMemo<SalesListFilters>(
    () => ({
      page,
      pageSize: 10,
      search: searchTerm.trim() || undefined,
      status: statusFilter,
      agentName: agentFilter === "mine" ? currentUserName : undefined,
      dateRange: rangeFilter,
    }),
    [agentFilter, currentUserName, page, rangeFilter, searchTerm, statusFilter],
  );
  const salesSummaryFilters = React.useMemo<
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
  const salesQuery = useSalesQuery(salesFilters);
  const salesSummaryQuery = useSalesSummaryQuery(salesSummaryFilters);
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

  const effectiveVehicleId = React.useMemo(() => {
    if (!selectedBuyerLead) {
      return form.vehicleId;
    }

    if (selectedBuyerLead.vehicles.length === 1) {
      return selectedBuyerLead.vehicles[0]?.id ?? "";
    }

    return selectedBuyerLead.vehicles.some(
      (vehicle) => vehicle.id === form.vehicleId,
    )
      ? form.vehicleId
      : "";
  }, [form.vehicleId, selectedBuyerLead]);

  const totalSales = salesSummaryQuery.data?.totalSales ?? 0;
  const revenueTotal = salesSummaryQuery.data?.totalRevenue ?? "0.00";
  const grossProfitTotal = salesSummaryQuery.data?.totalGrossProfit ?? "0.00";
  const commissionTotal =
    salesSummaryQuery.data?.totalCommissionPayouts ?? "0.00";

  const buyerLeadOptions = React.useMemo(() => {
    const options = buyerLeadSearchResults.map((lead) => ({
      value: lead.id,
      label: `${lead.buyerName} • ${lead.contactNumber} • ${lead.status}`,
    }));

    if (
      selectedBuyerLead &&
      !options.some((option) => option.value === selectedBuyerLead.id)
    ) {
      options.unshift({
        value: selectedBuyerLead.id,
        label: `${selectedBuyerLead.buyerName} • ${selectedBuyerLead.contactNumber} • ${selectedBuyerLead.status}`,
      });
    }

    return options;
  }, [buyerLeadSearchResults, selectedBuyerLead]);

  const vehicleOptions =
    selectedBuyerLead?.vehicles.map((vehicle) => ({
      id: vehicle.id,
      label: `${vehicle.stockNumber} • ${vehicle.brand} ${vehicle.model}`,
    })) ?? [];

  const inlineAvailableVehicleOptions =
    availableVehiclesQuery.data?.vehicles
      .filter(
        (vehicle) =>
          !selectedBuyerLead?.vehicles.some(
            (linkedVehicle) => linkedVehicle.id === vehicle.id,
          ),
      )
      .map((vehicle) => ({
        id: vehicle.id,
        label: `${vehicle.stockNumber} • ${vehicle.brand} ${vehicle.model}`,
      })) ?? [];
  const selectedPricingVehicle = availableVehiclesQuery.data?.vehicles.find(
    (vehicle) => vehicle.id === effectiveVehicleId,
  );
  const selectedPricingRange = getVehiclePricingRange(selectedPricingVehicle);
  const finalSaleAmountNumber = parseMoney(form.finalSaleAmount);
  const isFinalSaleBelowMinimum =
    Boolean(selectedPricingRange) &&
    finalSaleAmountNumber !== null &&
    finalSaleAmountNumber < selectedPricingRange!.minimum;

  const resetCreateSaleState = React.useCallback(() => {
    setForm(getEmptySaleFormValues(currentUserName));
    setBuyerLeadSearch("");
    setDebouncedBuyerLeadSearch("");
    setInlineLinkVehicleId("");
    setReviewSaleOpen(false);
  }, [currentUserName]);

  function handleCreateOpenChange(nextOpen: boolean) {
    setCreateOpen(nextOpen);

    if (!nextOpen) {
      resetCreateSaleState();
    }
  }

  async function handleInlineLinkVehicle() {
    if (!selectedBuyerLead || !inlineLinkVehicleId) {
      return;
    }

    await linkVehicleMutation.mutateAsync(
      { id: selectedBuyerLead.id, vehicleId: inlineLinkVehicleId },
      {
        onSuccess: () => {
          setForm((current) => ({
            ...current,
            vehicleId: inlineLinkVehicleId,
          }));
          setInlineLinkVehicleId("");
          toast.success("Vehicle linked to buyer lead");
        },
      },
    );
  }

  async function submitSale() {
    await createMutation.mutateAsync(
      {
        buyerLeadId: form.buyerLeadId,
        vehicleId: effectiveVehicleId,
        saleDate: new Date(form.saleDate).toISOString(),
        finalSaleAmount: form.finalSaleAmount,
        agentName: form.agentName || currentUserName || null,
        commissionOverrideAmount: form.commissionOverrideAmount || null,
        commissionOverrideReason: form.commissionOverrideReason || null,
        buyerClosingNote: form.buyerClosingNote || null,
      },
      {
        onSuccess: () => {
          toast.success("Sale finalized");
          resetCreateSaleState();
          setCreateOpen(false);
        },
      },
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_180px_180px_180px_auto]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                placeholder="Search sales, buyer, vehicle, or ID..."
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as SalesFilterStatus);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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
              <SelectTrigger>
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
              <SelectTrigger>
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

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
          <CardContent className="p-0">
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

                    return (
                      <TableRow key={sale.id} className="hover:bg-muted/15">
                        <TableCell className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {sale.saleNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sale.agentName ?? "Unassigned agent"}
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
                              {format(new Date(sale.saleDate), "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(sale.saleDate), "h:mm a")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top text-sm font-semibold text-foreground">
                          {formatMoney(sale.finalSaleAmount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                          {formatMoney(sale.grossProfitAmount)}
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
                              <DropdownMenuItem
                                onClick={() => setViewSaleId(sale.id)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    sale.saleNumber,
                                  );
                                  toast.success("Sale number copied");
                                }}
                              >
                                Copy Sale Number
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    sale.vehicle.stockNumber,
                                  );
                                  toast.success("Vehicle stock number copied");
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
                  title="No sales yet"
                  description="Finalize the first sale to validate the full inventory-to-dashboard workflow."
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
              <SheetTitle className="text-lg">Finalize Sale</SheetTitle>
              <SheetDescription>
                Close a deal, lock commission data, and move the linked vehicle
                into sold inventory.
              </SheetDescription>
            </SheetHeader>
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="min-h-full px-6 py-6">
                  <div className="space-y-5">
                    <ApiErrorAlert
                      title="Unable to finalize sale"
                      message={getApiErrorMessage(createMutation.error, "")}
                    />
                    <SalesForm
                      values={{ ...form, vehicleId: effectiveVehicleId }}
                      onChange={(nextValues) => {
                        if (nextValues.buyerLeadId !== form.buyerLeadId) {
                          setInlineLinkVehicleId("");

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
                      availableVehicles={inlineAvailableVehicleOptions}
                      inlineLinkVehicleId={inlineLinkVehicleId}
                      onInlineLinkVehicleIdChange={setInlineLinkVehicleId}
                      onLinkVehicle={handleInlineLinkVehicle}
                      linkVehiclePending={linkVehicleMutation.isPending}
                      linkVehicleError={linkVehicleMutation.error}
                      currentUserName={currentUserName}
                    />
                  </div>
                </div>
              </div>
              <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Dashboard metrics and inventory status update immediately
                  after finalization.
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
          currentUserName={currentUserName}
          belowMinimum={isFinalSaleBelowMinimum}
          minimumAmount={selectedPricingRange?.minimum ?? null}
          pending={createMutation.isPending}
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

        <SaleDetailDialog
          open={Boolean(viewSaleId)}
          onOpenChange={(open) => !open && setViewSaleId(null)}
          saleId={viewSaleId}
        />
      </div>
    </AuthenticatedAppShell>
  );
}
