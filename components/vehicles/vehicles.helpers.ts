import type { CreateVehiclePayload, UpdateVehiclePayload, Vehicle, VehicleStatus } from "@/types/vehicles"

export const VEHICLE_FILTERS = [
  { label: "All Vehicles", value: "all" },
  { label: "Available", value: "Available" },
  { label: "Incoming", value: "Incoming" },
  { label: "Reserved", value: "Reserved" },
  { label: "Sold", value: "Sold" },
] as const

export type VehicleFilterValue = (typeof VEHICLE_FILTERS)[number]["value"]

export type VehicleFormValues = {
  stockNumber?: string
  brand: string
  model: string
  year: string
  variant: string
  color: string
  transmission: string
  fuelType: string
  mileage: string
  purchasePrice: string
  targetSellingPrice: string
  minimumAcceptablePrice: string
  status: VehicleStatus
  photos: { fileUrl: string; sortOrder?: number }[]
  remarks: string
}

export function getEmptyVehicleFormValues(): VehicleFormValues {
  return {
    brand: "",
    model: "",
    year: "",
    variant: "",
    color: "",
    transmission: "",
    fuelType: "",
    mileage: "",
    purchasePrice: "",
    targetSellingPrice: "",
    minimumAcceptablePrice: "",
    status: "Incoming",
    photos: [],
    remarks: "",
  }
}

export function getVehicleFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    brand: vehicle.brand,
    model: vehicle.model,
    year: String(vehicle.year),
    variant: vehicle.variant ?? "",
    color: vehicle.color ?? "",
    transmission: vehicle.transmission ?? "",
    fuelType: vehicle.fuelType ?? "",
    mileage: vehicle.mileage ? String(vehicle.mileage) : "",
    purchasePrice: vehicle.purchasePrice ?? "",
    targetSellingPrice: vehicle.targetSellingPrice ?? "",
    minimumAcceptablePrice: vehicle.minimumAcceptablePrice ?? "",
    status: vehicle.status,
    photos: vehicle.photos,
    remarks: vehicle.remarks ?? "",
  }
}

export function buildCreateVehiclePayload(values: VehicleFormValues): CreateVehiclePayload {
  return {
    brand: values.brand,
    model: values.model,
    year: Number(values.year),
    variant: values.variant || null,
    color: values.color || null,
    transmission: values.transmission || null,
    fuelType: values.fuelType || null,
    mileage: values.mileage ? Number(values.mileage) : null,
    purchasePrice: values.purchasePrice || null,
    targetSellingPrice: values.targetSellingPrice || null,
    minimumAcceptablePrice: values.minimumAcceptablePrice || null,
    status: values.status,
    photos: values.photos.map((photo, index) => ({
      fileUrl: photo.fileUrl,
      sortOrder: index,
    })),
    remarks: values.remarks || null,
  }
}

export function buildUpdateVehiclePayload(values: VehicleFormValues): UpdateVehiclePayload {
  return buildCreateVehiclePayload(values)
}

export function filterVehicles(
  vehicles: Vehicle[],
  searchTerm: string,
  filter: VehicleFilterValue,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  return vehicles.filter((vehicle) => {
    const matchesFilter = filter === "all" ? true : vehicle.status === filter

    const searchHaystack = [
      vehicle.stockNumber,
      vehicle.brand,
      vehicle.model,
      vehicle.variant ?? "",
    ]
      .join(" ")
      .toLowerCase()

    const matchesSearch = normalizedSearch ? searchHaystack.includes(normalizedSearch) : true

    return matchesFilter && matchesSearch
  })
}

export function getVehicleStatusCounts(vehicles: Vehicle[]) {
  return {
    all: vehicles.length,
    Available: vehicles.filter((vehicle) => vehicle.status === "Available").length,
    Incoming: vehicles.filter((vehicle) => vehicle.status === "Incoming").length,
    Reserved: vehicles.filter((vehicle) => vehicle.status === "Reserved").length,
    Sold: vehicles.filter((vehicle) => vehicle.status === "Sold").length,
  }
}

export function formatVehicleMoney(value?: string | null) {
  if (!value) {
    return "N/A"
  }

  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return `PHP ${value}`
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export function getVehicleStatusBadgeVariant(status: VehicleStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Available":
      return "secondary"
    case "Reserved":
      return "outline"
    case "Sold":
      return "default"
    case "Incoming":
      return "outline"
    case "Reconditioning":
      return "destructive"
    default:
      return "outline"
  }
}

export function getVehicleStatusClassName(status: VehicleStatus) {
  switch (status) {
    case "Available":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
    case "Incoming":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
    case "Reserved":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
    case "Sold":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
    case "Reconditioning":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
    default:
      return ""
  }
}
