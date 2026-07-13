"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { DashboardResponse } from "@/types/dashboard"

const chartConfig = {
  vehiclesAcquired: {
    label: "Vehicles Acquired",
    color: "#2563eb",
  },
  vehiclesSold: {
    label: "Vehicles Sold",
    color: "#22a66f",
  },
} satisfies ChartConfig

type TrendRange = keyof DashboardResponse["analytics"]["acquisitionSalesTrend"]

const RANGE_OPTIONS: Array<{ value: TrendRange; label: string }> = [
  { value: "twelveWeeks", label: "12 Weeks" },
  { value: "sixMonths", label: "6 Months" },
  { value: "oneYear", label: "1 Year" },
]

export function AcquisitionSalesChart({
  trend,
}: {
  trend: DashboardResponse["analytics"]["acquisitionSalesTrend"]
}) {
  const [range, setRange] = React.useState<TrendRange>("twelveWeeks")
  const chartData = trend[range]

  return (
    <Card className="min-w-0 gap-2 py-0 shadow-none">
      <CardHeader className="flex flex-col gap-3 p-4 pb-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">
            Acquisition and Sales Trend
          </CardTitle>
          <CardDescription>
            Vehicles acquired and sold during the selected period.
          </CardDescription>
        </div>
        <ToggleGroup
          type="single"
          value={range}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Chart period"
          onValueChange={(value) => {
            if (value) {
              setRange(value as TrendRange)
            }
          }}
        >
          {RANGE_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              aria-label={`Show ${option.label}`}
              className="px-3 text-xs"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
        <ChartContainer
          config={chartConfig}
          className="h-44 w-full"
          initialDimension={{ width: 720, height: 176 }}
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={32}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend
              verticalAlign="top"
              content={<ChartLegendContent verticalAlign="top" />}
            />
            <Area
              dataKey="vehiclesAcquired"
              type="monotone"
              stroke="var(--color-vehiclesAcquired)"
              fill="var(--color-vehiclesAcquired)"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ r: 2.5, fill: "var(--color-vehiclesAcquired)" }}
              activeDot={{ r: 5 }}
            />
            <Area
              dataKey="vehiclesSold"
              type="monotone"
              stroke="var(--color-vehiclesSold)"
              fill="var(--color-vehiclesSold)"
              fillOpacity={0.08}
              strokeWidth={2}
              dot={{ r: 2.5, fill: "var(--color-vehiclesSold)" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
