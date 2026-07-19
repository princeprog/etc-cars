"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClockIcon,
  CarFrontIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  HandCoinsIcon,
  RefreshCcwIcon,
  TagIcon,
  UserRoundIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ActivityEntityType,
  ActivityHistoryEvent,
} from "@/types/activity-history";

type ActivityPresentation = {
  label: string;
  icon: LucideIcon;
  badge: string;
  iconClassName: string;
};

const DEFAULT_ACTIVITY_PRESENTATION: ActivityPresentation = {
  label: "Activity",
  icon: ClipboardCheckIcon,
  badge: "border-border bg-muted text-muted-foreground",
  iconClassName: "text-muted-foreground",
};

const ACTIVITY_PRESENTATION: Partial<
  Record<ActivityEntityType | string, ActivityPresentation>
> = {
  seller_lead: {
    label: "Seller Lead",
    icon: UserRoundIcon,
    badge: "border-blue-100 bg-blue-50 text-blue-700",
    iconClassName: "text-blue-700",
  },
  buyer_lead: {
    label: "Buyer Lead",
    icon: UserRoundIcon,
    badge: "border-cyan-100 bg-cyan-50 text-cyan-700",
    iconClassName: "text-cyan-700",
  },
  vehicle: {
    label: "Vehicle",
    icon: CarFrontIcon,
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    iconClassName: "text-emerald-700",
  },
  sale: {
    label: "Sale",
    icon: HandCoinsIcon,
    badge: "border-amber-100 bg-amber-50 text-amber-700",
    iconClassName: "text-amber-700",
  },
  follow_up: {
    label: "Follow-Up",
    icon: CalendarClockIcon,
    badge: "border-violet-100 bg-violet-50 text-violet-700",
    iconClassName: "text-violet-700",
  },
  expense: {
    label: "Expense",
    icon: HandCoinsIcon,
    badge: "border-rose-100 bg-rose-50 text-rose-700",
    iconClassName: "text-rose-700",
  },
  expense_category: {
    label: "Expense Category",
    icon: TagIcon,
    badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
    iconClassName: "text-indigo-700",
  },
  expense_recurring_rule: {
    label: "Recurring Expense",
    icon: RefreshCcwIcon,
    badge: "border-teal-100 bg-teal-50 text-teal-700",
    iconClassName: "text-teal-700",
  },
  user: {
    label: "User",
    icon: ClipboardCheckIcon,
    badge: "border-border bg-muted text-muted-foreground",
    iconClassName: "text-muted-foreground",
  },
};

export function RecentActivityTable({
  events,
  isLoading,
  hasError,
  title = "Recent Activity",
}: {
  events: ActivityHistoryEvent[];
  isLoading: boolean;
  hasError: boolean;
  title?: string;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b px-4 pt-1.5 pb-1.5!">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button asChild variant="link" size="sm" className="px-0 text-xs">
          <Link href="/activity-history">
            View all activity
            <ChevronRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <ActivityRowsSkeleton />
        ) : hasError ? (
          <p className="p-4 text-sm text-muted-foreground">
            Recent activity is temporarily unavailable.
          </p>
        ) : events.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No recent activity has been recorded.
          </p>
        ) : (
          <>
            <MobileActivityList events={events} />
            <Table className="hidden lg:table">
              <TableHeader className="[&_th]:h-7">
                <TableRow className="bg-muted/25 hover:bg-muted/25">
                  <TableHead className="pl-4">Activity</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <ActivityRow key={event.id} event={event} />
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MobileActivityList({ events }: { events: ActivityHistoryEvent[] }) {
  return (
    <ItemGroup className="gap-0 lg:hidden">
      {events.map((event) => {
        const presentation =
          ACTIVITY_PRESENTATION[event.entityType] ??
          DEFAULT_ACTIVITY_PRESENTATION;
        const Icon = presentation.icon;

        return (
          <Item
            key={event.id}
            size="sm"
            className="rounded-none border-0 border-b last:border-b-0"
          >
            <ItemMedia
              variant="icon"
              className={`size-8 rounded-md bg-muted ${presentation.iconClassName}`}
            >
              <Icon aria-hidden="true" />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle>{formatActionLabel(event.actionType)}</ItemTitle>
              <ItemDescription>{event.summary}</ItemDescription>
              <p className="text-xs text-muted-foreground">
                {event.actorDisplayName ?? "System"} ·{" "}
                {formatDistanceToNowStrict(new Date(event.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </ItemContent>
            <Badge variant="outline" className={presentation.badge}>
              {presentation.label}
            </Badge>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

function ActivityRow({ event }: { event: ActivityHistoryEvent }) {
  const presentation =
    ACTIVITY_PRESENTATION[event.entityType] ?? DEFAULT_ACTIVITY_PRESENTATION;
  const Icon = presentation.icon;

  return (
    <TableRow>
      <TableCell className="min-w-48 py-1 pl-4">
        <div className="flex items-center gap-2">
          <Icon
            className={`size-4 shrink-0 ${presentation.iconClassName}`}
            aria-hidden="true"
          />
          <span className="font-medium">
            {formatActionLabel(event.actionType)}
          </span>
        </div>
      </TableCell>
      <TableCell className="min-w-64 max-w-md truncate py-1 text-muted-foreground">
        {event.summary}
      </TableCell>
      <TableCell className="min-w-36 py-1 text-muted-foreground">
        {event.actorDisplayName ?? "System"}
      </TableCell>
      <TableCell className="py-1">
        <Badge variant="outline" className={presentation.badge}>
          {presentation.label}
        </Badge>
      </TableCell>
      <TableCell className="min-w-32 py-1 pr-4 text-muted-foreground">
        {formatDistanceToNowStrict(new Date(event.timestamp), {
          addSuffix: true,
        })}
      </TableCell>
    </TableRow>
  );
}

function formatActionLabel(actionType: string) {
  return (
    actionType
      .split(".")
      .at(-1)
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? actionType
  );
}

function ActivityRowsSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 p-4"
      aria-label="Loading recent activity"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  );
}
