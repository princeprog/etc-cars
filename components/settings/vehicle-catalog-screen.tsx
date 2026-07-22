"use client";

import * as React from "react";
import {
  ArchiveIcon,
  CarFrontIcon,
  EditIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { toast } from "@/components/ui/sileo";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateVehicleCatalogBrandMutation,
  useCreateVehicleCatalogModelMutation,
  useCreateVehicleCatalogVariantMutation,
  useUpdateVehicleCatalogBrandMutation,
  useUpdateVehicleCatalogModelMutation,
  useUpdateVehicleCatalogVariantMutation,
} from "@/hooks/mutations/vehicle-catalog/use-vehicle-catalog-mutations";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { can } from "@/lib/permissions";
import {
  useVehicleCatalogBrandsQuery,
  useVehicleCatalogModelsQuery,
  useVehicleCatalogVariantsQuery,
} from "@/hooks/queries/vehicle-catalog/use-vehicle-catalog-queries";
import { getApiErrorMessage } from "@/types/api";
import type { VehicleCatalogItem } from "@/types/vehicle-catalog";

type CatalogTab = "brands" | "models" | "variants";
type VisibilityFilter = "active" | "archived" | "all";

type PendingArchive = {
  tab: CatalogTab;
  item: VehicleCatalogItem;
  archived: boolean;
} | null;

const VISIBILITY_OPTIONS: Array<{
  label: string;
  value: VisibilityFilter;
}> = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
  { label: "All", value: "all" },
];

export function VehicleCatalogScreen() {
  return (
    <AuthenticatedAppShell
      title="Vehicle Catalog"
      breadcrumbs={[{ label: "Settings" }, { label: "Vehicle Catalog" }]}
    >
      <VehicleCatalogContent />
    </AuthenticatedAppShell>
  );
}

function VehicleCatalogContent() {
  const authQuery = useAuthenticatedUserQuery();
  const [activeTab, setActiveTab] = React.useState<CatalogTab>("brands");
  const [visibility, setVisibility] =
    React.useState<VisibilityFilter>("active");
  const [search, setSearch] = React.useState("");
  const [selectedBrandId, setSelectedBrandId] = React.useState("");
  const [selectedVariantBrandId, setSelectedVariantBrandId] =
    React.useState("");
  const [selectedVariantModelId, setSelectedVariantModelId] =
    React.useState("");
  const [dialogMode, setDialogMode] = React.useState<"add" | "rename" | null>(
    null,
  );
  const [dialogItem, setDialogItem] = React.useState<VehicleCatalogItem | null>(
    null,
  );
  const [itemName, setItemName] = React.useState("");
  const [pendingArchive, setPendingArchive] =
    React.useState<PendingArchive>(null);

  const listFilters = React.useMemo(
    () => ({
      includeArchived: visibility !== "active",
      search: search.trim() || undefined,
    }),
    [search, visibility],
  );

  const allBrandsQuery = useVehicleCatalogBrandsQuery({
    includeArchived: true,
  });
  const brandOptions = allBrandsQuery.data?.items ?? [];
  const effectiveSelectedBrandId = getEffectiveSelectedId(
    selectedBrandId,
    brandOptions,
  );
  const effectiveSelectedVariantBrandId = getEffectiveSelectedId(
    selectedVariantBrandId,
    brandOptions,
  );
  const brandsQuery = useVehicleCatalogBrandsQuery(
    activeTab === "brands" ? listFilters : { includeArchived: true },
  );
  const modelsQuery = useVehicleCatalogModelsQuery(
    effectiveSelectedBrandId,
    activeTab === "models" ? listFilters : { includeArchived: true },
  );
  const variantModelsQuery = useVehicleCatalogModelsQuery(
    effectiveSelectedVariantBrandId,
    { includeArchived: true },
  );
  const modelOptions = variantModelsQuery.data?.items ?? [];
  const effectiveSelectedVariantModelId = getEffectiveSelectedId(
    selectedVariantModelId,
    modelOptions,
  );
  const variantsQuery = useVehicleCatalogVariantsQuery(
    effectiveSelectedVariantModelId,
    activeTab === "variants" ? listFilters : { includeArchived: true },
  );

  const createBrandMutation = useCreateVehicleCatalogBrandMutation();
  const createModelMutation = useCreateVehicleCatalogModelMutation();
  const createVariantMutation = useCreateVehicleCatalogVariantMutation();
  const updateBrandMutation = useUpdateVehicleCatalogBrandMutation();
  const updateModelMutation = useUpdateVehicleCatalogModelMutation();
  const updateVariantMutation = useUpdateVehicleCatalogVariantMutation();

  if (!can(authQuery.data?.user, "vehicle_catalog.manage")) {
    return (
      <div className="flex flex-1 items-start px-4 py-6 md:px-6">
        <Alert variant="destructive" className="max-w-xl">
          <ShieldCheckIcon />
          <AlertTitle>Admin access required</AlertTitle>
          <AlertDescription>
            Vehicle Catalog management is available only to admin users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentQuery =
    activeTab === "brands"
      ? brandsQuery
      : activeTab === "models"
        ? modelsQuery
        : variantsQuery;
  const currentItems = filterItemsByVisibility(
    currentQuery.data?.items ?? [],
    visibility,
  );
  const isMutating =
    createBrandMutation.isPending ||
    createModelMutation.isPending ||
    createVariantMutation.isPending ||
    updateBrandMutation.isPending ||
    updateModelMutation.isPending ||
    updateVariantMutation.isPending;

  function openAddDialog() {
    setDialogItem(null);
    setItemName("");
    setDialogMode("add");
  }

  function openRenameDialog(item: VehicleCatalogItem) {
    setDialogItem(item);
    setItemName(item.name);
    setDialogMode("rename");
  }

  async function submitDialog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = itemName.trim();

    if (!name) {
      return;
    }

    try {
      if (dialogMode === "add") {
        await createCatalogItem(activeTab, name);
        toast.success("Catalog item added", {
          details: `${name} is now available in the ${getTabPluralLabel(activeTab)} catalog.`,
        });
      } else if (dialogMode === "rename" && dialogItem) {
        await updateCatalogItem(activeTab, dialogItem.id, { name });
        toast.success("Catalog item renamed", {
          details: `${dialogItem.name} was renamed to ${name} in the ${getTabPluralLabel(activeTab)} catalog.`,
        });
      }

      setDialogMode(null);
      setDialogItem(null);
      setItemName("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save catalog item"), {
        details: `${name} could not be saved in the ${getTabPluralLabel(activeTab)} catalog.`,
      });
    }
  }

  async function confirmArchiveChange() {
    if (!pendingArchive) {
      return;
    }

    try {
      await updateCatalogItem(pendingArchive.tab, pendingArchive.item.id, {
        archived: pendingArchive.archived,
      });
      toast.success(
        pendingArchive.archived
          ? "Catalog item archived"
          : "Catalog item restored",
        {
          details: `${pendingArchive.item.name} is now ${pendingArchive.archived ? "hidden from" : "available in"} ${getTabPluralLabel(pendingArchive.tab)} selections.`,
        },
      );
      setPendingArchive(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update catalog item"), {
        details: `${pendingArchive.item.name} could not be updated in the ${getTabPluralLabel(pendingArchive.tab)} catalog.`,
      });
    }
  }

  function createCatalogItem(tab: CatalogTab, name: string) {
    if (tab === "brands") {
      return createBrandMutation.mutateAsync({ name });
    }

    if (tab === "models") {
      return createModelMutation.mutateAsync({
        brandId: effectiveSelectedBrandId,
        name,
      });
    }

    return createVariantMutation.mutateAsync({
      modelId: effectiveSelectedVariantModelId,
      name,
    });
  }

  function updateCatalogItem(
    tab: CatalogTab,
    id: string,
    payload: { name?: string; archived?: boolean },
  ) {
    if (tab === "brands") {
      return updateBrandMutation.mutateAsync({ id, payload });
    }

    if (tab === "models") {
      return updateModelMutation.mutateAsync({ id, payload });
    }

    return updateVariantMutation.mutateAsync({ id, payload });
  }

  const canAdd =
    activeTab === "brands" ||
    (activeTab === "models" && Boolean(effectiveSelectedBrandId)) ||
    (activeTab === "variants" && Boolean(effectiveSelectedVariantModelId));

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-3xl flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Vehicle Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            Curate the brands, models, and variants used as suggestions during
            vehicle intake.
          </p>
        </div>
        <Button onClick={openAddDialog} disabled={!canAdd}>
          <PlusIcon data-icon="inline-start" />
          Add {getTabSingularLabel(activeTab)}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog Controls</CardTitle>
          <CardDescription>
            Archived entries are hidden from Add/Edit Vehicle suggestions, but
            existing vehicle records remain unchanged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as CatalogTab)}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabsList>
                <TabsTrigger value="brands">Brands</TabsTrigger>
                <TabsTrigger value="models">Models</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
              </TabsList>
              <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px]">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={`Search ${getTabPluralLabel(activeTab).toLowerCase()}`}
                  />
                </div>
                <Select
                  value={visibility}
                  onValueChange={(value) =>
                    setVisibility(value as VisibilityFilter)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="brands" className="mt-6">
              <CatalogTableSection
                title="Brands"
                description="Brand names available in vehicle intake."
                items={currentItems}
                isLoading={brandsQuery.isLoading}
                error={brandsQuery.error}
                onRename={openRenameDialog}
                onArchiveChange={(item, archived) =>
                  setPendingArchive({ tab: "brands", item, archived })
                }
              />
            </TabsContent>

            <TabsContent value="models" className="mt-6">
              <div className="flex flex-col gap-4">
                <ParentSelector
                  label="Brand"
                  value={effectiveSelectedBrandId}
                  placeholder="Select brand"
                  items={brandOptions}
                  onValueChange={setSelectedBrandId}
                />
                <CatalogTableSection
                  title="Models"
                  description="Models managed under the selected brand."
                  items={currentItems}
                  isLoading={modelsQuery.isLoading}
                  error={modelsQuery.error}
                  parentMissing={!effectiveSelectedBrandId}
                  parentMissingLabel="Select a brand to manage models."
                  onRename={openRenameDialog}
                  onArchiveChange={(item, archived) =>
                    setPendingArchive({ tab: "models", item, archived })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="variants" className="mt-6">
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <ParentSelector
                    label="Brand"
                    value={effectiveSelectedVariantBrandId}
                    placeholder="Select brand"
                    items={brandOptions}
                    onValueChange={(value) => {
                      setSelectedVariantBrandId(value);
                      setSelectedVariantModelId("");
                    }}
                  />
                  <ParentSelector
                    label="Model"
                    value={effectiveSelectedVariantModelId}
                    placeholder="Select model"
                    items={modelOptions}
                    onValueChange={setSelectedVariantModelId}
                  />
                </div>
                <CatalogTableSection
                  title="Variants"
                  description="Variants managed under the selected model."
                  items={currentItems}
                  isLoading={variantsQuery.isLoading}
                  error={variantsQuery.error}
                  parentMissing={!effectiveSelectedVariantModelId}
                  parentMissingLabel="Select a brand and model to manage variants."
                  onRename={openRenameDialog}
                  onArchiveChange={(item, archived) =>
                    setPendingArchive({ tab: "variants", item, archived })
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CatalogItemDialog
        open={Boolean(dialogMode)}
        title={
          dialogMode === "rename"
            ? `Rename ${getTabSingularLabel(activeTab)}`
            : `Add ${getTabSingularLabel(activeTab)}`
        }
        description={
          dialogMode === "rename"
            ? "Update this catalog label for future suggestions."
            : "Add a new catalog value for future vehicle intake."
        }
        value={itemName}
        pending={isMutating}
        onValueChange={setItemName}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode(null);
            setDialogItem(null);
          }
        }}
        onSubmit={submitDialog}
      />

      <AlertDialog
        open={Boolean(pendingArchive)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingArchive(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingArchive?.archived ? "Archive" : "Restore"} catalog item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingArchive?.archived
                ? "This item will be hidden from future Add/Edit Vehicle suggestions. Existing vehicle records will not change."
                : "This item will become available again in Add/Edit Vehicle suggestions."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchiveChange}
              disabled={isMutating}
            >
              {isMutating ? (
                <Spinner data-icon="inline-start" />
              ) : pendingArchive?.archived ? (
                <ArchiveIcon data-icon="inline-start" />
              ) : (
                <RotateCcwIcon data-icon="inline-start" />
              )}
              {pendingArchive?.archived ? "Archive" : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CatalogTableSection({
  title,
  description,
  items,
  isLoading,
  error,
  parentMissing = false,
  parentMissingLabel,
  onRename,
  onArchiveChange,
}: {
  title: string;
  description: string;
  items: VehicleCatalogItem[];
  isLoading: boolean;
  error: unknown;
  parentMissing?: boolean;
  parentMissingLabel?: string;
  onRename: (item: VehicleCatalogItem) => void;
  onArchiveChange: (item: VehicleCatalogItem, archived: boolean) => void;
}) {
  if (parentMissing) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CarFrontIcon />
          </EmptyMedia>
          <EmptyTitle>Choose a parent first</EmptyTitle>
          <EmptyDescription>{parentMissingLabel}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Badge variant="secondary">{items.length} shown</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        {error ? (
          <ApiErrorAlert
            message={getApiErrorMessage(error, "Unable to load catalog")}
          />
        ) : isLoading ? (
          <CatalogTableSkeleton />
        ) : items.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CarFrontIcon />
              </EmptyMedia>
              <EmptyTitle>No catalog items found</EmptyTitle>
              <EmptyDescription>
                Adjust the filters or add a new item.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.archivedAt ? "outline" : "secondary"}
                      >
                        {item.archivedAt ? "Archived" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.usageCount} vehicles</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onRename(item)}
                        >
                          <EditIcon data-icon="inline-start" />
                          Rename
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onArchiveChange(item, !item.archivedAt)
                          }
                        >
                          {item.archivedAt ? (
                            <RotateCcwIcon data-icon="inline-start" />
                          ) : (
                            <ArchiveIcon data-icon="inline-start" />
                          )}
                          {item.archivedAt ? "Restore" : "Archive"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ParentSelector({
  label,
  value,
  placeholder,
  items,
  onValueChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  items: VehicleCatalogItem[];
  onValueChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
              {item.archivedAt ? " (archived)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function CatalogItemDialog({
  open,
  title,
  description,
  value,
  pending,
  onValueChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  value: string;
  pending: boolean;
  onValueChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="catalogItemName">Name</FieldLabel>
              <Input
                id="catalogItemName"
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                placeholder="Enter catalog name"
                required
              />
              <FieldDescription>
                Names are trimmed and compared case-insensitively.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !value.trim()}>
              {pending ? <Spinner data-icon="inline-start" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CatalogTableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}

function filterItemsByVisibility(
  items: VehicleCatalogItem[],
  visibility: VisibilityFilter,
) {
  if (visibility === "archived") {
    return items.filter((item) => item.archivedAt);
  }

  if (visibility === "active") {
    return items.filter((item) => !item.archivedAt);
  }

  return items;
}

function getEffectiveSelectedId(
  selectedId: string,
  items: VehicleCatalogItem[],
) {
  if (items.some((item) => item.id === selectedId)) {
    return selectedId;
  }

  return items[0]?.id ?? "";
}

function getTabSingularLabel(tab: CatalogTab) {
  if (tab === "brands") {
    return "Brand";
  }

  if (tab === "models") {
    return "Model";
  }

  return "Variant";
}

function getTabPluralLabel(tab: CatalogTab) {
  if (tab === "brands") {
    return "Brands";
  }

  if (tab === "models") {
    return "Models";
  }

  return "Variants";
}
