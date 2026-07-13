"use client"

import { Cell, Pie, PieChart } from "recharts"

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
import type {
  DashboardSellerLeadPipelineItem,
  DashboardSellerLeadPipelineStatus,
} from "@/types/dashboard"

const PIPELINE_STYLE: Record<
  DashboardSellerLeadPipelineStatus,
  { key: string; color: string }
> = {
  "New Inquiry": { key: "newInquiry", color: "#2f67c7" },
  Contacted: { key: "contacted", color: "#36a6c2" },
  "Inspection Scheduled": { key: "inspectionScheduled", color: "#f2b624" },
  Evaluated: { key: "evaluated", color: "#f47b20" },
  Negotiating: { key: "negotiating", color: "#36a96f" },
  "Approved to Buy": { key: "approvedToBuy", color: "#9aa4b2" },
}

const chartConfig = {
  count: { label: "Leads" },
  newInquiry: { label: "New Inquiry", color: "#2f67c7" },
  contacted: { label: "Contacted", color: "#36a6c2" },
  inspectionScheduled: { label: "Inspection Scheduled", color: "#f2b624" },
  evaluated: { label: "Evaluated", color: "#f47b20" },
  negotiating: { label: "Negotiating", color: "#36a96f" },
  approvedToBuy: { label: "Approved to Buy", color: "#9aa4b2" },
} satisfies ChartConfig

export function SellerLeadPipelineChart({
  pipeline,
}: {
  pipeline: DashboardSellerLeadPipelineItem[]
}) {
  const chartData = pipeline.map((item) => ({
    ...item,
    key: PIPELINE_STYLE[item.status].key,
    fill: PIPELINE_STYLE[item.status].color,
  }))
  const total = chartData.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="min-w-0 gap-2 py-0 shadow-none">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">Seller Lead Pipeline</CardTitle>
        <CardDescription>
          Current distribution of active seller leads.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid items-center gap-3 p-4 lg:grid-cols-[minmax(180px,0.9fr)_minmax(180px,1.1fr)]">
        {total > 0 ? (
          <div className="relative mx-auto size-52 max-w-full">
            <ChartContainer
              config={chartConfig}
              className="size-full"
              initialDimension={{ width: 208, height: 208 }}
            >
              <PieChart accessibilityLayer>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      nameKey="status"
                      indicator="dot"
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={57}
                  outerRadius={88}
                  stroke="var(--background)"
                  strokeWidth={3}
                >
                  {chartData.map((item) => (
                    <Cell key={item.status} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold tabular-nums">
                {total}
              </span>
              <span className="text-xs text-muted-foreground">
                Active leads
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
            No active seller leads.
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {chartData.map((item) => (
            <li key={item.status} className="flex items-center gap-2 text-xs">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.fill }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {item.status}
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
