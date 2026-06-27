"use client";

import { format, formatDistanceToNow } from "date-fns";

import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useSaleQuery } from "@/hooks/queries/sales/use-sale-query";
import { getApiErrorMessage } from "@/types/api";
import type { SaleWithDetails } from "@/types/sales";

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

function getSaleStatus(sale: SaleWithDetails) {
  if (!sale.commissionLocked) {
    return "needs_review";
  }

  if (sale.commission.overrideAmount) {
    return "commission_locked";
  }

  return "finalized";
}

function getSaleStatusLabel(
  status: "finalized" | "commission_locked" | "needs_review",
) {
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

function getSaleStatusClassName(
  status: "finalized" | "commission_locked" | "needs_review",
) {
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

export function SaleDetailDialog({
  open,
  onOpenChange,
  saleId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleId: string | null;
}) {
  const saleQuery = useSaleQuery(saleId ?? "");
  const sale = saleQuery.data?.sale;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        {saleQuery.isPending ? (
          <div className="p-6">
            <ModuleLoadingState label="Loading sale details" />
          </div>
        ) : saleQuery.error ? (
          <div className="p-6">
            <ApiErrorAlert
              title="Unable to load sale details"
              message={getApiErrorMessage(saleQuery.error, "")}
            />
          </div>
        ) : sale ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-3">
                <DialogTitle>{sale.saleNumber}</DialogTitle>
                <Badge
                  variant="outline"
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getSaleStatusClassName(getSaleStatus(sale))}`}
                >
                  {getSaleStatusLabel(getSaleStatus(sale))}
                </Badge>
              </div>
              <DialogDescription>
                {sale.vehicle.stockNumber} • {sale.vehicle.brand}{" "}
                {sale.vehicle.model} • Updated{" "}
                {formatDistanceToNow(new Date(sale.updatedAt), {
                  addSuffix: true,
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow label="Buyer" value={sale.buyerLead.buyerName} />
                <DetailRow
                  label="Buyer contact"
                  value={sale.buyerLead.contactNumber}
                />
                <DetailRow label="Buyer status" value={sale.buyerLead.status} />
                <DetailRow
                  label="Vehicle"
                  value={`${sale.vehicle.stockNumber} • ${sale.vehicle.brand} ${sale.vehicle.model}`}
                />
                <DetailRow
                  label="Sale date"
                  value={format(new Date(sale.saleDate), "MMM d, yyyy h:mm a")}
                />
                <DetailRow
                  label="Agent"
                  value={sale.agentName ?? "Not assigned"}
                />
                <DetailRow
                  label="Final amount"
                  value={formatMoney(sale.finalSaleAmount)}
                />
                <DetailRow
                  label="Gross profit"
                  value={formatMoney(sale.grossProfitAmount)}
                />
                <DetailRow
                  label="Tracked vehicle costs"
                  value={formatMoney(sale.trackedCostsTotal)}
                />
                <DetailRow
                  label="Profit after tracked costs"
                  value={formatMoney(sale.profitAfterTrackedCosts)}
                />
                <DetailRow
                  label="Commission method"
                  value={sale.commissionMethod ?? "Not set"}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow
                  label="Default commission"
                  value={formatMoney(sale.commission.defaultAmount)}
                />
                <DetailRow
                  label="Override commission"
                  value={formatMoney(sale.commission.overrideAmount)}
                />
                <DetailRow
                  label="Final payout"
                  value={formatMoney(sale.commission.finalAmount)}
                />
                <DetailRow
                  label="Override reason"
                  value={sale.commission.overrideReason ?? "No override used"}
                />
                <DetailRow
                  label="Buyer email"
                  value={sale.buyerLead.email ?? "Not set"}
                />
                <DetailRow label="Vehicle status" value={sale.vehicle.status} />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Closing Note
                  </p>
                  <p className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-foreground">
                    {sale.buyerLead.closingNote ?? "No closing note recorded."}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Record Metadata
                  </p>
                  <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-foreground">
                    <p>
                      Created{" "}
                      {formatDistanceToNow(new Date(sale.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    <p>
                      Commission updated{" "}
                      {formatDistanceToNow(
                        new Date(sale.commission.updatedAt),
                        { addSuffix: true },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
