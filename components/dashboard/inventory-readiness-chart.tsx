"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DashboardMetrics } from "@/types/dashboard"

const chartConfig = {
  count: {
    label: "Vehicles",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function InventoryReadinessChart({
  metrics,
}: {
  metrics: DashboardMetrics
}) {
  const chartData = [
    {
      category: "Ready for Sale",
      count: metrics.availableVehicles,
      fill: "#2f67c7",
    },
    {
      category: "Reserved",
      count: metrics.reservedVehicles,
      fill: "#36a6c2",
    },
    {
      category: "In Preparation",
      count: Math.max(
        metrics.activeInventory -
          metrics.availableVehicles -
          metrics.reservedVehicles,
        0,
      ),
      fill: "#f2b624",
    },
    {
      category: "Needs Attention",
      count: metrics.inventoryQuality.gradeCounts.needs_attention,
      fill: "#f47b20",
    },
    {
      category: "Incomplete Listing",
      count: metrics.inventoryQuality.gradeCounts.incomplete,
      fill: "#9aa4b2",
    },
  ]

  return (
    <Card className="min-w-0 gap-0 py-0 shadow-none">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">Inventory Readiness</CardTitle>
        <CardDescription>
          Current condition of active vehicle records.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-1 sm:p-4 sm:pt-1">
        <ChartContainer
          config={chartConfig}
          className="h-32 w-full"
          initialDimension={{ width: 620, height: 128 }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ top: 6, right: 36, bottom: 0, left: 6 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={135}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.45 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={3} barSize={17}>
              {chartData.map((item) => (
                <Cell key={item.category} fill={item.fill} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                className="fill-foreground text-xs"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
