"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2Icon, CircleIcon, InfoIcon, TagsIcon } from "lucide-react";
import { toast } from "sonner";

import { resolveApiAssetUrl } from "@/constants/api-config";
import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { SubmitButton } from "@/components/operations/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUpdateVehicleMutation } from "@/hooks/mutations/vehicles/use-update-vehicle-mutation";
import { useVehicleQuery } from "@/hooks/queries/vehicles/use-vehicle-query";
import { getApiErrorMessage } from "@/types/api";
import type { Vehicle } from "@/types/vehicles";
import {
  buildUpdateVehiclePayload,
  getVehicleFormValues,
  type VehicleFormValues,
} from "./vehicles.helpers";
import { VehicleForm } from "./vehicle-form";
import { VehicleQualityPanel } from "./vehicle-quality-panel";

function ReadinessItem({
  complete,
  title,
  description,
}: {
  complete: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-muted-foreground">
        {complete ? (
          <CheckCircle2Icon className="size-4 text-emerald-600" />
        ) : (
          <CircleIcon className="size-4" />
        )}
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function VehicleEditPage({ vehicleId }: { vehicleId: string }) {
  const vehicleQuery = useVehicleQuery(vehicleId);
  const vehicle = vehicleQuery.data?.vehicle;

  return (
    <AuthenticatedAppShell
      title="Edit Vehicle"
      breadcrumbs={[
        { label: "Vehicles", href: "/vehicles" },
        { label: "Edit Vehicle" },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="space-y-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Edit Vehicle
            </h2>
            <p className="text-sm text-muted-foreground">
              Update inventory details, photos, and commercial readiness from
              the full vehicle record.
            </p>
          </div>
        </section>

        {vehicleQuery.isPending ? (
          <ModuleLoadingState label="Loading vehicle" />
        ) : vehicleQuery.error ? (
          <ApiErrorAlert
            title="Unable to load vehicle"
            message={getApiErrorMessage(vehicleQuery.error, "")}
          />
        ) : !vehicle ? (
          <EmptyState
            title="Vehicle not found"
            description="The vehicle record could not be loaded for editing."
          />
        ) : (
          <VehicleEditPageContent key={vehicle.id} vehicle={vehicle} />
        )}
      </div>
    </AuthenticatedAppShell>
  );
}

function VehicleEditPageContent({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const updateMutation = useUpdateVehicleMutation();
  const [values, setValues] = React.useState<VehicleFormValues>(() =>
    getVehicleFormValues(vehicle),
  );

  const hasTargetPrice = Boolean(values.targetSellingPrice.trim());
  const hasMinimumPrice = Boolean(values.minimumAcceptablePrice.trim());
  const hasPhoto = Boolean(values.photos.length);
  const eligibleForAvailable = hasTargetPrice && hasMinimumPrice && hasPhoto;
  const previewPhoto = values.photos[0];
  const brandModelLabel = [
    values.brand || "Brand",
    values.model || "Model",
  ].join(" ");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateMutation.mutateAsync(
      {
        id: vehicle.id,
        payload: buildUpdateVehiclePayload(values),
      },
      {
        onSuccess: () => {
          toast.success("Vehicle updated");
          router.push("/vehicles");
        },
      },
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_360px]">
      <div className="space-y-6">
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Vehicle Entry Form</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="space-y-5 px-6 py-6">
                <ApiErrorAlert
                  title="Unable to update vehicle"
                  message={getApiErrorMessage(updateMutation.error, "")}
                />
                <VehicleForm
                  values={values}
                  onChange={setValues}
                  showStockNumberField={false}
                  showStatusField={false}
                />
              </div>
              <div className="flex flex-col gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  This record will remain in{" "}
                  <span className="font-medium text-foreground">
                    {values.status}
                  </span>
                  .
                </p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/vehicles">Cancel</Link>
                  </Button>
                  <SubmitButton
                    type="submit"
                    pending={updateMutation.isPending}
                    pendingLabel="Saving changes"
                  >
                    Save Changes
                  </SubmitButton>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <VehicleQualityPanel
          quality={vehicle.qualityScore}
          status={vehicle.status}
          className="border-border/70 shadow-xs"
        />

        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Available eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReadinessItem
              complete={hasTargetPrice}
              title="Target selling price added"
              description="Set this from the dedicated pricing workflow."
            />
            <Separator />
            <ReadinessItem
              complete={hasMinimumPrice}
              title="Minimum acceptable price added"
              description="Set this from the dedicated pricing workflow."
            />
            <Separator />
            <ReadinessItem
              complete={hasPhoto}
              title="At least one photo added"
              description="Include at least one exterior shot."
            />
            <Separator />
            <ReadinessItem
              complete={eligibleForAvailable}
              title="Eligible for Available status"
              description="Complete all requirements before marking the unit available."
            />
          </CardContent>
          <CardFooter className="border-t bg-muted/20">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/vehicles/${vehicle.id}/pricing`}>
                <TagsIcon data-icon="inline-start" />
                Set Pricing
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/70 px-4 py-3 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-100">
              <InfoIcon className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm">
                Vehicles can only move to{" "}
                <span className="font-semibold">Available</span> after pricing
                is set and photo requirements are complete.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <CardAction>
              <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                Preview
              </div>
            </CardAction>
            <CardTitle className="text-base">Vehicle Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/70 bg-muted/40">
                {previewPhoto ? (
                  <Image
                    src={resolveApiAssetUrl(previewPhoto.fileUrl)}
                    alt="Vehicle preview"
                    fill
                    unoptimized
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
                    Upload a photo to preview the unit here
                  </div>
                )}
              </div>

              <div className="grid min-w-0 grid-cols-[104px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                <span className="text-muted-foreground">Stock Number</span>
                <span className="truncate font-medium text-foreground">
                  {values.stockNumber || "Not set"}
                </span>
                <span className="text-muted-foreground">Brand / Model</span>
                <span className="truncate font-medium text-foreground">
                  {brandModelLabel}
                </span>
                <span className="text-muted-foreground">Year</span>
                <span className="font-medium text-foreground">
                  {values.year || "Not set"}
                </span>
                <span className="text-muted-foreground">Variant</span>
                <span className="truncate font-medium text-foreground">
                  {values.variant || "Not set"}
                </span>
                <span className="text-muted-foreground">Status</span>
                <span>
                  <Badge
                    variant="outline"
                    className="rounded-md border-border/70 bg-muted/30 text-xs font-medium"
                  >
                    {values.status}
                  </Badge>
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
              This is a preview of the information entered. Please review before
              saving the record.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
