"use client"

import type { LucideIcon } from "lucide-react"
import {
  CarFrontIcon,
  ClockAlertIcon,
  PhilippinePesoIcon,
  UsersRoundIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { DashboardMetrics } from "@/types/dashboard"

function formatCompactCurrency(value: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value))
}

const METRIC_TONES = {
  blue: {
    icon: "bg-blue-50 text-blue-700",
    supporting: "text-blue-700",
  },
  amber: {
    icon: "bg-amber-50 text-amber-700",
    supporting: "text-amber-700",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-700",
    supporting: "text-emerald-700",
  },
  red: {
    icon: "bg-red-50 text-red-700",
    supporting: "text-red-700",
  },
} as const

type MetricTone = keyof typeof METRIC_TONES

export function SectionCards({
  metrics,
  overdueFollowUps,
}: {
  metrics: DashboardMetrics
  overdueFollowUps: number
}) {
  const cards: Array<{
    label: string
    value: string
    supporting: string
    icon: LucideIcon
    tone: MetricTone
  }> = [
    {
      label: "Active Inventory",
      value: metrics.activeInventory.toLocaleString(),
      supporting: `${metrics.availableVehicles.toLocaleString()} ready for sale`,
      icon: CarFrontIcon,
      tone: "blue",
    },
    {
      label: "Seller Leads",
      value: metrics.activeSellerLeads.toLocaleString(),
      supporting: `${metrics.sellerLeadsRequiringAction.toLocaleString()} require action`,
      icon: UsersRoundIcon,
      tone: "amber",
    },
    {
      label: "Monthly Revenue",
      value: formatCompactCurrency(metrics.monthlyRevenue),
      supporting: `${metrics.monthlySales.toLocaleString()} sales this month`,
      icon: PhilippinePesoIcon,
      tone: "emerald",
    },
    {
      label: "Overdue Follow-Ups",
      value: overdueFollowUps.toLocaleString(),
      supporting:
        overdueFollowUps === 0
          ? "No overdue follow-ups"
          : "Needs immediate attention",
      icon: ClockAlertIcon,
      tone: "red",
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  )
}

function MetricCard({
  label,
  value,
  supporting,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  supporting: string
  icon: LucideIcon
  tone: MetricTone
}) {
  const toneClasses = METRIC_TONES[tone]

  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex min-h-28 items-center gap-4 p-4">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-full ${toneClasses.icon}`}
        >
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-3xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
          <p className={`mt-0.5 text-xs font-medium ${toneClasses.supporting}`}>
            {supporting}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
