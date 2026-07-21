"use client";

import * as React from "react";
import {
  ClipboardListIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  ReceiptTextIcon,
  SparklesIcon,
  Trash2Icon,
  TruckIcon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "@/components/ui/sileo";

import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { SubmitButton } from "@/components/operations/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  useUpdateVehicleTrackedCostMutation,
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

const BASE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

function getPageSizeOptions(total: number, currentPageSize: number) {
  if (total <= 0) {
    return [currentPageSize];
  }

  const options = BASE_PAGE_SIZE_OPTIONS.filter((option, index) => {
    const previousOption = BASE_PAGE_SIZE_OPTIONS[index - 1] ?? 0;

    return option <= total || previousOption < total;
  });

  return Array.from(new Set([...options, currentPageSize])).sort(
    (a, b) => a - b,
  );
}

export function VehicleTrackedCostsCard({
  vehicle,
  trackedCosts,
  pagination,
  error,
}: {
  vehicle: Vehicle;
  trackedCosts: VehicleTrackedCost[];
  error?: unknown;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}) {
  const createMutation = useCreateVehicleTrackedCostMutation();
  const updateMutation = useUpdateVehicleTrackedCostMutation();
  const deleteMutation = useDeleteVehicleTrackedCostMutation();
  const [category, setCategory] =
    React.useState<VehicleTrackedCostCategory>("reconditioning");
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingCost, setEditingCost] =
    React.useState<VehicleTrackedCost | null>(null);
  const [editCategory, setEditCategory] =
    React.useState<VehicleTrackedCostCategory>("reconditioning");
  const [editAmount, setEditAmount] = React.useState("");
  const [editNote, setEditNote] = React.useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await createMutation.mutateAsync(
      { id: vehicle.id, payload: { category, amount, note } },
      {
        onSuccess: () => {
          setAmount("");
          setNote("");
          setIsAddDialogOpen(false);
          toast.success("Tracked cost added", {
            details: `${category} cost of ${amount} was added to ${vehicle.stockNumber}.`,
          });
        },
      },
    );
  }

  function handleStartEdit(cost: VehicleTrackedCost) {
    setEditingCost(cost);
    setEditCategory(cost.category);
    setEditAmount(cost.amount);
    setEditNote(cost.note);
  }

  function handleEditDialogChange(open: boolean) {
    if (!open) {
      setEditingCost(null);
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingCost) {
      return;
    }

    await updateMutation.mutateAsync(
      {
        id: vehicle.id,
        costId: editingCost.id,
        payload: {
          category: editCategory,
          amount: editAmount,
          note: editNote,
        },
      },
      {
        onSuccess: () => {
          setEditingCost(null);
          toast.success("Tracked cost updated", {
            details: `${editCategory} cost for ${vehicle.stockNumber} now uses the revised amount and note.`,
          });
        },
      },
    );
  }

  async function handleDelete(costId: string) {
    await deleteMutation.mutateAsync(
      { id: vehicle.id, costId },
      {
        onSuccess: () =>
          toast.success("Tracked cost removed", {
            details: `The selected cost was removed from ${vehicle.stockNumber}'s investment total.`,
          }),
      },
    );
  }

  const pageSizeOptions = getPageSizeOptions(
    pagination.total,
    pagination.pageSize,
  );
  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;
  const rangeStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const rangeEnd = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total,
  );

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
        <CardAction className="flex flex-col items-end gap-3 text-right max-sm:col-start-1 max-sm:row-start-3 max-sm:items-start max-sm:text-left">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Total Tracked Cost
            </p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {formatMoney(vehicle.trackedCostsTotal)}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" className="w-full sm:w-fit">
                <PlusIcon data-icon="inline-start" />
                Add Tracked Cost
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Tracked Cost</DialogTitle>
                <DialogDescription>
                  Record a vehicle-specific expense separate from purchase
                  price and commission.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <FieldGroup className="gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
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
                        <SelectTrigger
                          id="tracked-cost-category"
                          className="w-full"
                        >
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
                      <FieldLabel htmlFor="tracked-cost-amount">
                        Amount
                      </FieldLabel>
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
                  </div>
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
                </FieldGroup>
                <SubmitButton
                  className="w-full sm:w-fit sm:self-end"
                  pending={createMutation.isPending}
                  pendingLabel="Adding cost"
                >
                  <PlusIcon data-icon="inline-start" />
                  Add Tracked Cost
                </SubmitButton>
              </form>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-0">
        <ApiErrorAlert
          title="Unable to update tracked costs"
          message={getApiErrorMessage(
            createMutation.error ??
              updateMutation.error ??
              deleteMutation.error ??
              error,
            "",
          )}
        />

        {pagination.isLoading ? (
          <div className="flex flex-col gap-3 py-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : trackedCosts.length > 0 ? (
          <div className="-mx-(--card-spacing) border-b">
            <Table className="min-w-[820px]">
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
                {trackedCosts.map((cost) => {
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
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={`Edit ${formatCategory(cost.category)} cost`}
                            disabled={updateMutation.isPending}
                            onClick={() => handleStartEdit(cost)}
                          >
                            <PencilIcon />
                          </Button>
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
                        </div>
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

      </CardContent>
      <Dialog open={Boolean(editingCost)} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tracked Cost</DialogTitle>
            <DialogDescription>
              Correct the category, amount, or note for this vehicle-specific
              expense.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <FieldGroup className="gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="edit-tracked-cost-category">
                    Category
                  </FieldLabel>
                  <Select
                    value={editCategory}
                    onValueChange={(value) =>
                      setEditCategory(value as VehicleTrackedCostCategory)
                    }
                  >
                    <SelectTrigger
                      id="edit-tracked-cost-category"
                      className="w-full"
                    >
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
                  <FieldLabel htmlFor="edit-tracked-cost-amount">
                    Amount
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>₱</InputGroupAddon>
                    <InputGroupInput
                      id="edit-tracked-cost-amount"
                      inputMode="decimal"
                      placeholder="0.00"
                      required
                      value={editAmount}
                      onChange={(event) => setEditAmount(event.target.value)}
                    />
                  </InputGroup>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="edit-tracked-cost-note">Note</FieldLabel>
                <Textarea
                  id="edit-tracked-cost-note"
                  placeholder="Describe the work, supplier, or reason for this cost."
                  required
                  value={editNote}
                  onChange={(event) => setEditNote(event.target.value)}
                />
              </Field>
            </FieldGroup>
            <SubmitButton
              className="w-full sm:w-fit sm:self-end"
              pending={updateMutation.isPending}
              pendingLabel="Saving cost"
            >
              Save Tracked Cost
            </SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
      <CardFooter className="flex flex-col gap-3 border-t md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span>
            Showing {rangeStart}-{rangeEnd} of {pagination.total} tracked costs
          </span>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) =>
                pagination.onPageSizeChange(Number(value))
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoPrevious || pagination.isLoading}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoNext || pagination.isLoading}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
