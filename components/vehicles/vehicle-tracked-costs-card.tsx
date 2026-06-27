"use client";

import * as React from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { SubmitButton } from "@/components/operations/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateVehicleTrackedCostMutation,
  useDeleteVehicleTrackedCostMutation,
} from "@/hooks/mutations/vehicles/use-vehicle-tracked-cost-mutations";
import { getApiErrorMessage } from "@/types/api";
import {
  VEHICLE_TRACKED_COST_CATEGORIES,
  type Vehicle,
  type VehicleTrackedCostCategory,
} from "@/types/vehicles";

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value));
}

function formatCategory(category: VehicleTrackedCostCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function VehicleTrackedCostsCard({ vehicle }: { vehicle: Vehicle }) {
  const createMutation = useCreateVehicleTrackedCostMutation();
  const deleteMutation = useDeleteVehicleTrackedCostMutation();
  const [category, setCategory] =
    React.useState<VehicleTrackedCostCategory>("reconditioning");
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await createMutation.mutateAsync(
      { id: vehicle.id, payload: { category, amount, note } },
      {
        onSuccess: () => {
          setAmount("");
          setNote("");
          toast.success("Tracked cost added");
        },
      },
    );
  }

  async function handleDelete(costId: string) {
    await deleteMutation.mutateAsync(
      { id: vehicle.id, costId },
      { onSuccess: () => toast.success("Tracked cost removed") },
    );
  }

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Tracked Costs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Record vehicle-specific expenses separately from purchase price
              and commission.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="text-lg font-semibold tabular-nums">
              {formatMoney(vehicle.trackedCostsTotal)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <ApiErrorAlert
          title="Unable to update tracked costs"
          message={getApiErrorMessage(
            createMutation.error ?? deleteMutation.error,
            "",
          )}
        />

        {vehicle.trackedCosts.length > 0 ? (
          <div
            className="space-y-3"
            role="list"
            aria-label="Tracked vehicle costs"
          >
            {vehicle.trackedCosts.map((cost) => (
              <div
                key={cost.id}
                role="listitem"
                className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 px-4 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatCategory(cost.category)}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatMoney(cost.amount)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{cost.note}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${formatCategory(cost.category)} cost`}
                  disabled={deleteMutation.isPending}
                  onClick={() => void handleDelete(cost.id)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No tracked costs recorded. Profit after tracked costs currently
            equals gross profit.
          </div>
        )}

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tracked-cost-category">Category</Label>
              <NativeSelect
                id="tracked-cost-category"
                className="w-full"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as VehicleTrackedCostCategory)
                }
              >
                {VEHICLE_TRACKED_COST_CATEGORIES.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {formatCategory(option)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracked-cost-amount">Amount</Label>
              <Input
                id="tracked-cost-amount"
                inputMode="decimal"
                placeholder="0.00"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracked-cost-note">Note</Label>
            <Textarea
              id="tracked-cost-note"
              placeholder="Describe the work, supplier, or reason for this cost."
              required
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <SubmitButton
            pending={createMutation.isPending}
            pendingLabel="Adding cost"
          >
            <PlusIcon />
            Add Tracked Cost
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
