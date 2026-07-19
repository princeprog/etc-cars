"use client";

import { ShoppingBagIcon, UsersRoundIcon } from "lucide-react";

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
import { formatPercent } from "@/components/reports/report-format";
import type { AdminDashboardResponse } from "@/types/dashboard";

export function LeadHealthPanel({
  health,
}: {
  health: AdminDashboardResponse["leads"]["health"];
}) {
  const items = [
    {
      label: "Buyer Leads",
      icon: ShoppingBagIcon,
      total: health.totalBuyerLeads,
      active: health.buyerActive,
      won: health.buyerWon,
      lost: health.buyerLost,
      conversion: health.buyerConversionRate,
    },
    {
      label: "Seller Leads",
      icon: UsersRoundIcon,
      total: health.totalSellerLeads,
      active: health.sellerActive,
      won: health.sellerPurchased,
      lost: health.sellerRejected,
      conversion: health.sellerConversionRate,
    },
  ];

  return (
    <Card className="min-w-0 gap-2 py-0 shadow-none">
      <CardHeader className="p-4 pb-1">
        <CardTitle>Lead Health</CardTitle>
        <CardDescription>
          Conversion and active demand created during the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ItemGroup className="gap-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Item key={item.label} variant="muted" size="sm">
                <ItemMedia
                  variant="icon"
                  className="size-9 rounded-md bg-background"
                >
                  <Icon aria-hidden="true" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.label}</ItemTitle>
                  <ItemDescription>
                    {item.active} active · {item.won} converted · {item.lost}{" "}
                    lost
                  </ItemDescription>
                </ItemContent>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-lg font-semibold tabular-nums">
                    {item.total}
                  </span>
                  <Badge variant="outline">
                    {formatPercent(item.conversion)} conversion
                  </Badge>
                </div>
              </Item>
            );
          })}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
