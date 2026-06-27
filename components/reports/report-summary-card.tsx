import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export type ReportSummaryCardProps = {
  title: string
  value: string
  caption?: string
  icon: LucideIcon
  iconWrapClassName?: string
}

export function ReportSummaryCard({
  title,
  value,
  caption,
  icon: Icon,
  iconWrapClassName = "bg-foreground/10 text-foreground",
}: ReportSummaryCardProps) {
  return (
    <Card className="border-border/70 py-0 shadow-xs">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-full ${iconWrapClassName}`}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {caption ? (
            <p className="text-xs text-muted-foreground">{caption}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportSummaryCardGrid({
  cards,
}: {
  cards: ReportSummaryCardProps[]
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <ReportSummaryCard key={card.title} {...card} />
      ))}
    </div>
  )
}
