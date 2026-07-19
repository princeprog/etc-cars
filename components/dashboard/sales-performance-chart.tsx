"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { ChartNoAxesCombinedIcon } from "lucide-react";
import type { DashboardSalesTrendPoint } from "@/types/dashboard";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  grossProfit: {
    label: "Gross Profit",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function formatAxisMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function SalesPerformanceChart({
  trend,
  periodLabel,
  title = "Sales & Profitability",
  description = "Revenue and gross profit for the selected period.",
}: {
  trend: DashboardSalesTrendPoint[];
  periodLabel: string;
  title?: string;
  description?: string;
}) {
  const chartData = trend.map((point) => ({
    ...point,
    revenue: Number(point.revenue),
    grossProfit: Number(point.grossProfit),
  }));

  return (
    <Card className="min-w-0 gap-2 py-0 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-1">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge variant="outline" className="shrink-0">
          {periodLabel}
        </Badge>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="h-64 w-full"
            initialDimension={{ width: 720, height: 256 }}
          >
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 12, right: 8, left: 4, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="periodLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={formatAxisMoney}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={46}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value, name) => (
                      <div className="flex min-w-36 items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                            maximumFractionDigits: 0,
                          }).format(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                dataKey="grossProfit"
                type="monotone"
                stroke="var(--color-grossProfit)"
                fill="var(--color-grossProfit)"
                fillOpacity={0.08}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <Empty className="border-0 px-6 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ChartNoAxesCombinedIcon />
              </EmptyMedia>
              <EmptyTitle>No sales in this period</EmptyTitle>
              <EmptyDescription>
                Sales performance will appear after a deal is finalized.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
