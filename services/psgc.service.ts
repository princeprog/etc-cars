import type { PsgcRegion } from "@/types/psgc"

const PSGC_REGIONS_URL = "https://psgc.gitlab.io/api/regions/"

export async function getPsgcRegions() {
  const response = await fetch(PSGC_REGIONS_URL)

  if (!response.ok) {
    throw new Error("Unable to load PSGC regions")
  }

  return response.json() as Promise<PsgcRegion[]>
}
