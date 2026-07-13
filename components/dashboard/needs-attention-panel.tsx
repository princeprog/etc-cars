"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRightIcon,
  CircleCheckBigIcon,
  CircleIcon,
  ClipboardCheckIcon,
  ClockAlertIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const ATTENTION_TONES = {
  high: {
    icon: "bg-red-50 text-red-700",
    badge: "border-red-100 bg-red-50 text-red-700",
    dot: "fill-red-600 text-red-600",
  },
  medium: {
    icon: "bg-amber-50 text-amber-700",
    badge: "border-amber-100 bg-amber-50 text-amber-700",
    dot: "fill-amber-500 text-amber-500",
  },
  normal: {
    icon: "bg-emerald-50 text-emerald-700",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    dot: "fill-emerald-600 text-emerald-600",
  },
} as const

type AttentionTone = keyof typeof ATTENTION_TONES

export function NeedsAttentionPanel({
  overdueFollowUps,
  inspectionsPending,
  incompleteListings,
  approvedLeads,
}: {
  overdueFollowUps: number
  inspectionsPending: number
  incompleteListings: number
  approvedLeads: number
}) {
  const items: Array<{
    label: string
    count: number
    priority: string
    href: string
    icon: LucideIcon
    tone: AttentionTone
  }> = [
    {
      label: "Overdue follow-ups",
      count: overdueFollowUps,
      priority: "High",
      href: "/follow-ups",
      icon: ClockAlertIcon,
      tone: "high",
    },
    {
      label: "Inspections pending",
      count: inspectionsPending,
      priority: "Medium",
      href: "/seller-leads",
      icon: ClipboardCheckIcon,
      tone: "medium",
    },
    {
      label: "Vehicle listings incomplete",
      count: incompleteListings,
      priority: "Medium",
      href: "/vehicles",
      icon: TriangleAlertIcon,
      tone: "medium",
    },
    {
      label: "Approved leads awaiting conversion",
      count: approvedLeads,
      priority: "Normal",
      href: "/seller-leads",
      icon: CircleCheckBigIcon,
      tone: "normal",
    },
  ]

  return (
    <Card className="min-w-0 gap-0 py-0 shadow-none">
      <CardHeader className="px-4 pt-3 pb-1">
        <CardTitle className="text-base">Needs Attention</CardTitle>
        <CardDescription>Operational items requiring action.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-2 pt-0">
        {items.map((item) => (
          <AttentionRow key={item.label} {...item} />
        ))}
      </CardContent>
    </Card>
  )
}

function AttentionRow({
  label,
  count,
  priority,
  href,
  icon: Icon,
  tone,
}: {
  label: string
  count: number
  priority: string
  href: string
  icon: LucideIcon
  tone: AttentionTone
}) {
  const toneClasses = ATTENTION_TONES[tone]

  return (
    <div className="grid min-h-8 grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto] items-center gap-2 rounded-md border px-2 py-0.5 text-xs">
      <div
        className={cn(
          "flex size-7 items-center justify-center rounded-md",
          toneClasses.icon,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <span className="truncate text-muted-foreground">{label}</span>
      <Badge
        variant="outline"
        className={cn("min-w-8 justify-center", toneClasses.badge)}
      >
        {count}
      </Badge>
      <Badge
        variant="outline"
        className={cn("hidden sm:inline-flex", toneClasses.badge)}
      >
        {priority}
      </Badge>
      <CircleIcon
        className={cn("hidden size-2.5 lg:block", toneClasses.dot)}
        aria-hidden="true"
      />
      <Button asChild variant="outline" size="icon-sm">
        <Link href={href} aria-label={`View ${label}`}>
          <ArrowRightIcon />
        </Link>
      </Button>
    </div>
  )
}
