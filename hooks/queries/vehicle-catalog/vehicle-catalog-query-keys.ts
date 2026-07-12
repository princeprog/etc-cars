export const vehicleCatalogQueryKeys = {
  all: ["vehicle-catalog"] as const,
  brands: () => [...vehicleCatalogQueryKeys.all, "brands"] as const,
  models: (brandId?: string) =>
    [...vehicleCatalogQueryKeys.all, "models", brandId ?? ""] as const,
  variants: (modelId?: string) =>
    [...vehicleCatalogQueryKeys.all, "variants", modelId ?? ""] as const,
};
