"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { formatCompactMoney } from "@/components/reports/report-format";
import type { DashboardInventory } from "@/types/dashboard";
import type { VehicleStatus } from "@/types/vehicles";

const chartConfig = {
  count: { label: "Vehicles" },
  available: { label: "Available", color: "var(--chart-1)" },
  reserved: { label: "Reserved", color: "var(--chart-2)" },
  reconditioning: { label: "Reconditioning", color: "var(--chart-3)" },
  incoming: { label: "Incoming", color: "var(--chart-4)" },
} satisfies ChartConfig;

type InventoryChartItem = {
  status: VehicleStatus;
  count: number;
  fill: string;
};

export function InventoryPositionPanel({
  inventory,
  totalInventoryValue,
}: {
  inventory: DashboardInventory;
  totalInventoryValue?: string;
}) {
  const router = useRouter();
  const chartData: InventoryChartItem[] = [
    {
      status: "Available",
      count: inventory.statuses.Available,
      fill: "var(--color-available)",
    },
    {
      status: "Reserved",
      count: inventory.statuses.Reserved,
      fill: "var(--color-reserved)",
    },
    {
      status: "Reconditioning",
      count: inventory.statuses.Reconditioning,
      fill: "var(--color-reconditioning)",
    },
    {
      status: "Incoming",
      count: inventory.statuses.Incoming,
      fill: "var(--color-incoming)",
    },
  ];

  function openVehiclesByStatus(status: VehicleStatus) {
    router.push(`/vehicles?status=${encodeURIComponent(status)}`);
  }

  function handleBarKeyDown(
    event: React.KeyboardEvent<SVGElement>,
    status: VehicleStatus,
    count: number,
  ) {
    if (count <= 0) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openVehiclesByStatus(status);
    }
  }

  return (
    <Card className="min-w-0 gap-2 py-0 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-0">
        <div>
          <CardTitle>Inventory Position</CardTitle>
          <CardDescription>
            Current vehicle status, with quality tracked separately.
          </CardDescription>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold tabular-nums">
            {inventory.active.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Active units</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4 pt-1">
        <ChartContainer
          config={chartConfig}
          className="h-36 w-full"
          initialDimension={{ width: 520, height: 144 }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ top: 6, right: 32, bottom: 0, left: 4 }}
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
              dataKey="status"
              width={108}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.45 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={3} barSize={16}>
              {chartData.map((item) => (
                <Cell
                  key={item.status}
                  fill={item.fill}
                  className={
                    item.count > 0
                      ? "cursor-pointer outline-none transition-opacity hover:opacity-80 focus:opacity-80"
                      : undefined
                  }
                  role={item.count > 0 ? "link" : undefined}
                  tabIndex={item.count > 0 ? 0 : undefined}
                  aria-label={
                    item.count > 0
                      ? `View ${item.count.toLocaleString()} ${item.status.toLowerCase()} vehicles`
                      : undefined
                  }
                  onClick={
                    item.count > 0
                      ? () => openVehiclesByStatus(item.status)
                      : undefined
                  }
                  onKeyDown={(event) =>
                    handleBarKeyDown(event, item.status, item.count)
                  }
                />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                className="fill-foreground text-xs"
              />
            </Bar>
          </BarChart>
        </ChartContainer>

        <Separator />

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {totalInventoryValue ? (
            <Badge variant="outline">
              {formatCompactMoney(totalInventoryValue)} invested
            </Badge>
          ) : null}
          <Badge variant="secondary">
            {inventory.quality.gradeCounts.needs_attention} need attention
          </Badge>
          <Badge variant="outline">
            {inventory.quality.gradeCounts.incomplete} incomplete
          </Badge>
          <span className="text-muted-foreground">
            Quality score {inventory.quality.averageScore}/100
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
