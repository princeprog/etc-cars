"use client"

import { RotateCcwIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ReportGroupBy } from "@/types/reports"

export type ReportFilterState = {
  dateRange: DateRange | undefined
  groupBy: ReportGroupBy
  agentName: string
}

export const DEFAULT_REPORT_FILTERS: ReportFilterState = {
  dateRange: undefined,
  groupBy: "month",
  agentName: "",
}

export function ReportFilterBar({
  value,
  onChange,
  onReset,
  showGrouping = true,
  showAgent = true,
}: {
  value: ReportFilterState
  onChange: (next: ReportFilterState) => void
  onReset: () => void
  showGrouping?: boolean
  showAgent?: boolean
}) {
  function update<K extends keyof ReportFilterState>(
    key: K,
    fieldValue: ReportFilterState[K],
  ) {
    onChange({ ...value, [key]: fieldValue })
  }

  return (
    <Card className="border-border/70 py-0 shadow-xs">
      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Date range</Label>
          <DateRangePicker
            value={value.dateRange}
            onChange={(range) => update("dateRange", range)}
            placeholder="All time"
            className="w-full lg:w-72"
          />
        </div>

        {showGrouping ? (
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Group trends by</Label>
            <Select
              value={value.groupBy}
              onValueChange={(next) => update("groupBy", next as ReportGroupBy)}
            >
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {showAgent ? (
          <div className="grid gap-1.5">
            <Label htmlFor="reportAgent" className="text-xs text-muted-foreground">
              Agent
            </Label>
            <Input
              id="reportAgent"
              className="w-full lg:w-48"
              placeholder="All agents"
              value={value.agentName}
              onChange={(event) => update("agentName", event.target.value)}
            />
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="lg:ml-auto"
          onClick={onReset}
        >
          <RotateCcwIcon />
          Reset filters
        </Button>
      </CardContent>
    </Card>
  )
}
