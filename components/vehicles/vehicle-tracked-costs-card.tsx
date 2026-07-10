"use client";

import * as React from "react";
import {
  ClipboardListIcon,
  FileTextIcon,
  PlusIcon,
  ReceiptTextIcon,
  SparklesIcon,
  Trash2Icon,
  TruckIcon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { SubmitButton } from "@/components/operations/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  useCreateVehicleTrackedCostMutation,
  useDeleteVehicleTrackedCostMutation,
} from "@/hooks/mutations/vehicles/use-vehicle-tracked-cost-mutations";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api";
import {
  VEHICLE_TRACKED_COST_CATEGORIES,
  type Vehicle,
  type VehicleTrackedCost,
  type VehicleTrackedCostCategory,
} from "@/types/vehicles";

const CATEGORY_META: Record<
  VehicleTrackedCostCategory,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    className: string;
  }
> = {
  reconditioning: {
    icon: WrenchIcon,
    className: "bg-primary/10 text-primary",
  },
  repair: {
    icon: WrenchIcon,
    className: "bg-destructive/10 text-destructive",
  },
  detailing: {
    icon: SparklesIcon,
    className: "bg-secondary text-secondary-foreground",
  },
  transport: {
    icon: TruckIcon,
    className: "bg-muted text-muted-foreground",
  },
  documentation: {
    icon: ClipboardListIcon,
    className: "bg-accent text-accent-foreground",
  },
  miscellaneous: {
    icon: ReceiptTextIcon,
    className: "bg-muted text-muted-foreground",
  },
};

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value));
}

function formatCategory(category: VehicleTrackedCostCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatCostDate(cost: VehicleTrackedCost) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(cost.createdAt));
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
        <CardTitle className="flex items-center gap-3 text-base">
          <span className="flex size-9 items-center justify-center rounded-md border border-border/70 bg-muted text-muted-foreground [&_svg]:size-4">
            <ReceiptTextIcon />
          </span>
          Tracked Costs
        </CardTitle>
        <CardDescription>
          Record vehicle-specific expenses separately from purchase price and
          commission.
        </CardDescription>
        <CardAction className="text-right">
          <p className="text-xs font-medium text-muted-foreground">
            Total Tracked Cost
          </p>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {formatMoney(vehicle.trackedCostsTotal)}
          </p>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-0">
        <ApiErrorAlert
          title="Unable to update tracked costs"
          message={getApiErrorMessage(
            createMutation.error ?? deleteMutation.error,
            "",
          )}
        />

        {vehicle.trackedCosts.length > 0 ? (
          <div className="-mx-(--card-spacing) border-b">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="min-w-[260px]">Note</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="px-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicle.trackedCosts.map((cost) => {
                  const meta = CATEGORY_META[cost.category];
                  const Icon = meta.icon;

                  return (
                    <TableRow key={cost.id}>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
                              meta.className,
                            )}
                          >
                            <Icon />
                          </span>
                          <span className="font-medium text-foreground">
                            {formatCategory(cost.category)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium tabular-nums text-foreground">
                        {formatMoney(cost.amount)}
                      </TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">
                        {cost.note}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCostDate(cost)}
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          aria-label={`Remove ${formatCategory(cost.category)} cost`}
                          disabled={deleteMutation.isPending}
                          onClick={() => void handleDelete(cost.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Empty className="border border-dashed py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileTextIcon />
              </EmptyMedia>
              <EmptyTitle>No tracked costs recorded</EmptyTitle>
              <EmptyDescription>
                Profit after tracked costs currently equals gross profit.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <Separator />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary [&_svg]:size-4">
              <PlusIcon />
            </span>
            <h3 className="text-base font-semibold text-foreground">
              Add Tracked Cost
            </h3>
          </div>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(180px,0.8fr)_minmax(160px,0.6fr)_minmax(260px,1.2fr)]">
              <Field>
                <FieldLabel htmlFor="tracked-cost-category">
                  Category
                </FieldLabel>
                <Select
                  value={category}
                  onValueChange={(value) =>
                    setCategory(value as VehicleTrackedCostCategory)
                  }
                >
                  <SelectTrigger id="tracked-cost-category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {VEHICLE_TRACKED_COST_CATEGORIES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {formatCategory(option)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="tracked-cost-amount">Amount</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>₱</InputGroupAddon>
                  <InputGroupInput
                    id="tracked-cost-amount"
                    inputMode="decimal"
                    placeholder="0.00"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="tracked-cost-note">Note</FieldLabel>
                <Textarea
                  id="tracked-cost-note"
                  placeholder="Describe the work, supplier, or reason for this cost."
                  required
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
          <SubmitButton
            className="self-end"
            pending={createMutation.isPending}
            pendingLabel="Adding cost"
          >
            <PlusIcon data-icon="inline-start" />
            Add Tracked Cost
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
