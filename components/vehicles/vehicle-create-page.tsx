"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { InfoIcon } from "lucide-react"
import { toast } from "@/components/ui/sileo"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { SubmitButton } from "@/components/operations/submit-button"
import { resolveApiAssetUrl } from "@/constants/api-config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useConvertSellerLeadMutation } from "@/hooks/mutations/seller-leads/use-convert-seller-lead-mutation"
import { useCreateVehicleMutation } from "@/hooks/mutations/vehicles/use-create-vehicle-mutation"
import { getApiErrorMessage } from "@/types/api"
import type { VehicleStatus } from "@/types/vehicles"
import {
  buildCreateVehiclePayload,
  getEmptyVehicleFormValues,
  previewQualityFromFormValues,
  type VehicleFormValues,
} from "./vehicles.helpers"
import { VehicleForm } from "./vehicle-form"
import { VehicleQualityPanel } from "./vehicle-quality-panel"

type VehicleCreatePageSearchParams = Record<string, string | string[] | undefined>

export function VehicleCreatePage({
  searchParams,
}: {
  searchParams?: VehicleCreatePageSearchParams
}) {
  return <VehicleCreatePageContent searchParams={searchParams ?? {}} />
}

function getSingleSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function getConversionDefaults(searchParams: VehicleCreatePageSearchParams): {
  sellerLeadId: string | null
  sellerName: string
  values: VehicleFormValues
} {
  const sellerLeadId = getSingleSearchParamValue(searchParams.sellerLeadId)
  const sellerName = getSingleSearchParamValue(searchParams.sellerName) ?? ""

  return {
    sellerLeadId,
    sellerName,
    values: {
      ...getEmptyVehicleFormValues(),
      brand: getSingleSearchParamValue(searchParams.vehicleBrand) ?? "",
      model: getSingleSearchParamValue(searchParams.vehicleModel) ?? "",
      year: getSingleSearchParamValue(searchParams.vehicleYear) ?? "",
      variant: getSingleSearchParamValue(searchParams.vehicleVariant) ?? "",
      purchasePrice: getSingleSearchParamValue(searchParams.askingPrice) ?? "",
      remarks: getSingleSearchParamValue(searchParams.notes) ?? "",
      status: "Incoming",
    },
  }
}

function buildConvertPayload(values: VehicleFormValues) {
  return {
    year: values.year ? Number(values.year) : undefined,
    variant: values.variant || null,
    mileage: values.mileage ? Number(values.mileage) : null,
    transmission: values.transmission || null,
    fuelType: values.fuelType || null,
    color: values.color || null,
    remarks: values.remarks || null,
    purchasePrice: values.purchasePrice || null,
    status: values.status as VehicleStatus,
    photos: values.photos.map((photo, index) => ({
      fileUrl: photo.fileUrl,
      sortOrder: index,
    })),
  }
}

function VehicleCreatePageContent({ searchParams }: { searchParams: VehicleCreatePageSearchParams }) {
  const router = useRouter()
  const createMutation = useCreateVehicleMutation()
  const convertMutation = useConvertSellerLeadMutation()
  const conversionDefaults = React.useMemo(() => getConversionDefaults(searchParams), [searchParams])
  const isSellerLeadConversion = Boolean(conversionDefaults.sellerLeadId)
  const [values, setValues] = React.useState<VehicleFormValues>(conversionDefaults.values)

  const previewPhoto = values.photos[0]
  const livePreviewQuality = React.useMemo(
    () =>
      previewQualityFromFormValues(values, {
        stockNumberPlaceholder: true,
        sellerLeadId: conversionDefaults.sellerLeadId,
      }),
    [values, conversionDefaults.sellerLeadId],
  )
  const brandModelLabel = [values.brand || "Brand", values.model || "Model"].join(" ")
  const stockNumberPreview = "Generated automatically"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (conversionDefaults.sellerLeadId) {
      await convertMutation.mutateAsync(
        {
          id: conversionDefaults.sellerLeadId,
          payload: buildConvertPayload(values),
        },
        {
          onSuccess: () => {
            toast.success("Seller lead converted to inventory")
            router.push("/vehicles")
          },
        },
      )

      return
    }

    await createMutation.mutateAsync(buildCreateVehiclePayload(values), {
      onSuccess: () => {
        toast.success("Vehicle created")
        router.push("/vehicles")
      },
    })
  }

  return (
    <AuthenticatedAppShell
      title={isSellerLeadConversion ? "Convert Seller Lead" : "Add New Vehicle"}
      breadcrumbs={[
        { label: "Vehicles", href: "/vehicles" },
        { label: isSellerLeadConversion ? "Convert Seller Lead" : "Add New Vehicle" },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="space-y-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {isSellerLeadConversion ? "Convert Seller Lead" : "Add New Vehicle"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSellerLeadConversion
                ? `Continue the acquisition workflow by creating inventory from ${conversionDefaults.sellerName || "this seller lead"}.`
                : "Create a new inventory record for a vehicle entering stock."}
            </p>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_360px]">
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Vehicle Entry Form</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="space-y-5 px-6 py-6">
                  <ApiErrorAlert
                    title={isSellerLeadConversion ? "Unable to convert seller lead" : "Unable to create vehicle"}
                    message={getApiErrorMessage(
                      isSellerLeadConversion ? convertMutation.error : createMutation.error,
                      "",
                    )}
                  />
                  <VehicleForm values={values} onChange={setValues} showStockNumberField={false} />
                </div>
                <div className="flex flex-col gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    This record will be created as{" "}
                    <span className="font-medium text-foreground">{values.status}</span>.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" asChild>
                      <Link href={isSellerLeadConversion ? "/seller-leads" : "/vehicles"}>Cancel</Link>
                    </Button>
                    <SubmitButton
                      type="submit"
                      pending={isSellerLeadConversion ? convertMutation.isPending : createMutation.isPending}
                      pendingLabel={isSellerLeadConversion ? "Converting lead" : "Creating vehicle"}
                    >
                      {isSellerLeadConversion ? "Convert to Vehicle" : "Create Vehicle"}
                    </SubmitButton>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <VehicleQualityPanel
              quality={livePreviewQuality}
              status={values.status}
              className="border-border/70 shadow-xs"
            />

            <Card className="border-border/70 shadow-xs">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/70 px-4 py-3 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-100">
                  <InfoIcon className="mt-0.5 size-4 shrink-0" />
                  <p className="text-sm">
                    Vehicles can only move to <span className="font-semibold">Available</span> after pricing and photo requirements are complete.
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
                <div className={`grid gap-4 ${previewPhoto ? "grid-cols-[92px_minmax(0,1fr)]" : "grid-cols-1"}`}>
                  {previewPhoto ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/70 bg-muted/40">
                      <Image
                        src={resolveApiAssetUrl(previewPhoto.fileUrl)}
                        alt="Vehicle preview"
                        fill
                        unoptimized
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="grid min-w-0 grid-cols-[104px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Stock Number</span>
                    <span className="truncate font-medium text-foreground">{stockNumberPreview}</span>
                    <span className="text-muted-foreground">Brand / Model</span>
                    <span className="truncate font-medium text-foreground">{brandModelLabel}</span>
                    <span className="text-muted-foreground">Year</span>
                    <span className="font-medium text-foreground">{values.year || "Not set"}</span>
                    <span className="text-muted-foreground">Variant</span>
                    <span className="truncate font-medium text-foreground">{values.variant || "Not set"}</span>
                    <span className="text-muted-foreground">Status</span>
                    <span>
                      <Badge variant="outline" className="rounded-md border-border/70 bg-muted/30 text-xs font-medium">
                        {values.status}
                      </Badge>
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                  This is a preview of the information entered. Please review before creating the record.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedAppShell>
  )
}
