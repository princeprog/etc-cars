// Shared display formatters for the reporting module. Backend values arrive as
// fixed-precision strings; these helpers only format for display and never
// recompute totals, so visible numbers always match the source of truth.

export function formatMoney(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "₱0.00"
  }

  const numeric = typeof value === "number" ? value : Number(value)

  if (Number.isNaN(numeric)) {
    return `₱${value}`
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)
}

export function formatCompactMoney(value?: string | number | null) {
  const numeric = typeof value === "number" ? value : Number(value ?? 0)

  if (Number.isNaN(numeric)) {
    return formatMoney(value)
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numeric)
}

export function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("en-PH").format(value ?? 0)
}

export function formatPercent(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "0.0%"
  }

  const numeric = typeof value === "number" ? value : Number(value)

  if (Number.isNaN(numeric)) {
    return `${value}%`
  }

  return `${numeric.toFixed(1)}%`
}
