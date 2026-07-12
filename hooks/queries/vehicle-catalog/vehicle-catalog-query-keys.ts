export const vehicleCatalogQueryKeys = {
  all: ["vehicle-catalog"] as const,
  brands: (filters?: unknown) =>
    [...vehicleCatalogQueryKeys.all, "brands", filters ?? {}] as const,
  models: (brandId?: string, filters?: unknown) =>
    [
      ...vehicleCatalogQueryKeys.all,
      "models",
      brandId ?? "",
      filters ?? {},
    ] as const,
  variants: (modelId?: string, filters?: unknown) =>
    [
      ...vehicleCatalogQueryKeys.all,
      "variants",
      modelId ?? "",
      filters ?? {},
    ] as const,
};
