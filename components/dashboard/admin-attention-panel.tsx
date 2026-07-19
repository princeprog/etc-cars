"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CarFrontIcon,
  CircleCheckIcon,
  ClipboardCheckIcon,
  ClockAlertIcon,
  ReceiptTextIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { AdminDashboardResponse } from "@/types/dashboard";

type AttentionItem = {
  label: string;
  description: string;
  count: number;
  href: string;
  icon: LucideIcon;
  priority: "high" | "medium" | "normal";
};

export function AdminAttentionPanel({
  attention,
}: {
  attention: AdminDashboardResponse["attention"];
}) {
  const items: AttentionItem[] = [
    {
      label: "Overdue follow-ups",
      description: "Customer actions past their due time",
      count: attention.overdueFollowUps,
      href: "/follow-ups",
      icon: ClockAlertIcon,
      priority: "high",
    },
    {
      label: "Pending inspections",
      description: "Seller vehicles awaiting completion",
      count: attention.pendingInspections,
      href: "/seller-leads",
      icon: ClipboardCheckIcon,
      priority: "medium",
    },
    {
      label: "Overdue bills",
      description: "Operating expenses requiring settlement",
      count: attention.overdueExpenses,
      href: "/bills-expenses",
      icon: ReceiptTextIcon,
      priority: "high",
    },
    {
      label: "Incomplete listings",
      description: "Vehicle records missing sale-ready details",
      count: attention.incompleteListings,
      href: "/vehicles",
      icon: TriangleAlertIcon,
      priority: "medium",
    },
    {
      label: "Approved seller leads",
      description: "Approved acquisitions awaiting conversion",
      count: attention.approvedSellerLeads,
      href: "/seller-leads",
      icon: CarFrontIcon,
      priority: "normal",
    },
  ];

  return (
    <Card className="min-w-0 gap-2 py-0 shadow-none">
      <CardHeader className="p-4 pb-1">
        <CardTitle>Needs Attention</CardTitle>
        <CardDescription>
          Current operational exceptions to resolve.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ItemGroup className="gap-1">
          {items.map((item) => (
            <AttentionRow key={item.label} item={item} />
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

function AttentionRow({ item }: { item: AttentionItem }) {
  const Icon = item.count === 0 ? CircleCheckIcon : item.icon;
  const badgeVariant: ComponentProps<typeof Badge>["variant"] =
    item.count === 0
      ? "outline"
      : item.priority === "high"
        ? "destructive"
        : "secondary";

  return (
    <Item variant="muted" size="xs">
      <ItemMedia variant="icon" className="size-8 rounded-md bg-background">
        <Icon aria-hidden="true" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{item.label}</ItemTitle>
        <ItemDescription>{item.description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Badge variant={badgeVariant}>{item.count}</Badge>
        <Button asChild variant="ghost" size="icon-sm">
          <Link href={item.href} aria-label={`Open ${item.label}`}>
            <ArrowRightIcon />
          </Link>
        </Button>
      </ItemActions>
    </Item>
  );
}
