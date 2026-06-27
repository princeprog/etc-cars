import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"

/**
 * Consistent chrome for a report table/detail block: a titled header with an
 * optional description and an export (or other) action aligned to the right.
 */
export function ReportSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}
