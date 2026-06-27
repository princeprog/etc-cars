export const VEHICLE_STATUSES = [
  "Incoming",
  "Reconditioning",
  "Available",
  "Reserved",
  "Sold",
] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const VEHICLE_TRACKED_COST_CATEGORIES = [
  "reconditioning",
  "repair",
  "detailing",
  "transport",
  "documentation",
  "miscellaneous",
] as const;

export type VehicleTrackedCostCategory =
  (typeof VEHICLE_TRACKED_COST_CATEGORIES)[number];

export interface VehicleTrackedCost {
  id: string;
  category: VehicleTrackedCostCategory;
  amount: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehiclePhoto {
  fileUrl: string;
  sortOrder?: number;
}

export interface Vehicle {
  id: string;
  stockNumber: string;
  brand: string;
  model: string;
  year: number;
  variant: string | null;
  mileage: number | null;
  transmission: string | null;
  fuelType: string | null;
  color: string | null;
  region: string | null;
  features: string | null;
  remarks: string | null;
  purchasePrice: string | null;
  targetSellingPrice: string | null;
  minimumAcceptablePrice: string | null;
  acquisitionSource: string | null;
  sellerLeadId: string | null;
  status: VehicleStatus;
  photos: VehiclePhoto[];
  trackedCosts: VehicleTrackedCost[];
  trackedCostsTotal: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehiclePayload {
  brand: string;
  model: string;
  year: number;
  variant?: string | null;
  mileage?: number | null;
  transmission?: string | null;
  fuelType?: string | null;
  color?: string | null;
  region?: string | null;
  features?: string | null;
  remarks?: string | null;
  purchasePrice?: string | null;
  targetSellingPrice?: string | null;
  minimumAcceptablePrice?: string | null;
  acquisitionSource?: string | null;
  sellerLeadId?: string | null;
  status?: VehicleStatus;
  photos?: VehiclePhoto[];
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export interface VehicleTrackedCostPayload {
  category: VehicleTrackedCostCategory;
  amount: string;
  note: string;
}

export interface VehicleResponse {
  vehicle: Vehicle;
}

export interface VehiclesResponse {
  vehicles: Vehicle[];
}
