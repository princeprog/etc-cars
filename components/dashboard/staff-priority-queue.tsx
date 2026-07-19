"use client";

import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  ArrowRightIcon,
  CalendarClockIcon,
  CircleAlertIcon,
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { DashboardPriorityItem } from "@/types/dashboard";

export function StaffPriorityQueue({
  items,
}: {
  items: DashboardPriorityItem[];
}) {
  return (
    <Card className="min-w-0 gap-2 py-0 shadow-none">
      <CardHeader className="p-4 pb-1">
        <CardTitle>My Priority Queue</CardTitle>
        <CardDescription>
          Assigned follow-ups ordered by urgency and due time.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {items.length === 0 ? (
          <Empty className="border-0 px-6 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClockIcon />
              </EmptyMedia>
              <EmptyTitle>No urgent work assigned</EmptyTitle>
              <EmptyDescription>
                Your overdue, due-today, and upcoming follow-ups will appear
                here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="gap-1">
            {items.map((item) => (
              <PriorityRow key={item.id} item={item} />
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}

function PriorityRow({ item }: { item: DashboardPriorityItem }) {
  const dueAt = new Date(item.dueAt);
  const href =
    item.leadType === "seller" && item.leadId
      ? `/seller-leads/${item.leadId}`
      : `/${item.leadType}-leads`;
  const presentation = {
    overdue: {
      label: "Overdue",
      variant: "destructive" as const,
      iconClassName: "text-destructive",
    },
    today: {
      label: "Due today",
      variant: "secondary" as const,
      iconClassName: "text-amber-600",
    },
    upcoming: {
      label: "Upcoming",
      variant: "outline" as const,
      iconClassName: "text-muted-foreground",
    },
  }[item.urgency];

  return (
    <Item variant="muted" size="sm">
      <ItemMedia
        variant="icon"
        className={`size-9 rounded-md bg-background ${presentation.iconClassName}`}
      >
        <CircleAlertIcon aria-hidden="true" />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle>{item.leadName}</ItemTitle>
        <ItemDescription>
          {item.note} · {format(dueAt, "MMM d, h:mm a")}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="ml-auto shrink-0">
        <div className="hidden text-right sm:block">
          <Badge variant={presentation.variant}>{presentation.label}</Badge>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNowStrict(dueAt, { addSuffix: true })}
          </p>
        </div>
        <Button asChild variant="ghost" size="icon-sm">
          <Link href={href} aria-label={`Open ${item.leadName}`}>
            <ArrowRightIcon />
          </Link>
        </Button>
      </ItemActions>
    </Item>
  );
}
