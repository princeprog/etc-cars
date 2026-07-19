"use client";

import { ShoppingBagIcon, UsersRoundIcon, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import type {
  DashboardPipelineItem,
  StaffDashboardResponse,
} from "@/types/dashboard";

export function StaffLeadPipeline({
  pipelines,
}: {
  pipelines: StaffDashboardResponse["pipelines"];
}) {
  return (
    <Card className="min-w-0 gap-2 py-0 shadow-none">
      <CardHeader className="p-4 pb-1">
        <CardTitle>My Lead Pipeline</CardTitle>
        <CardDescription>
          Active buyer and seller leads currently assigned to you.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-3 pt-1">
        <PipelineGroup
          label="Seller Leads"
          icon={UsersRoundIcon}
          items={pipelines.seller}
        />
        <Separator />
        <PipelineGroup
          label="Buyer Leads"
          icon={ShoppingBagIcon}
          items={pipelines.buyer}
        />
      </CardContent>
    </Card>
  );
}

function PipelineGroup({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon: LucideIcon;
  items: DashboardPipelineItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <ItemGroup className="gap-1">
      <Item size="xs">
        <ItemMedia variant="icon">
          <Icon className="text-muted-foreground" aria-hidden="true" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{label}</ItemTitle>
          <ItemDescription>{total} active assignments</ItemDescription>
        </ItemContent>
        <Badge variant="outline">{total}</Badge>
      </Item>
      {items.map((item) => (
        <div key={item.status} className="px-2.5 py-1">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-muted-foreground">
              {item.status}
            </span>
            <span className="font-medium tabular-nums">{item.count}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-muted">
            <div
              className="h-full rounded-sm bg-primary"
              style={{
                width: `${total > 0 ? (item.count / total) * 100 : 0}%`,
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      ))}
    </ItemGroup>
  );
}
