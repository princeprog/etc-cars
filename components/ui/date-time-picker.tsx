"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  minDate?: Date
  className?: string
  id?: string
}

function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  minDate,
  className,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const hours = value ? value.getHours() % 12 || 12 : 12
  const minutes = value ? value.getMinutes() : 0
  const period = value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM"

  function updateTime(h: number, m: number, p: string) {
    const base = value ?? new Date()
    const newDate = new Date(base)
    let hours24 = h % 12
    if (p === "PM") hours24 += 12
    newDate.setHours(hours24, m, 0, 0)
    onChange?.(newDate)
  }

  function handleDateSelect(date: Date | undefined) {
    if (!date) {
      onChange?.(undefined)
      return
    }
    const newDate = new Date(date)
    if (value) {
      newDate.setHours(value.getHours(), value.getMinutes(), 0, 0)
    } else {
      newDate.setHours(9, 0, 0, 0)
    }
    onChange?.(newDate)
  }

  function handleHourChange(h: string) {
    updateTime(Number(h), minutes, period)
  }

  function handleMinuteChange(m: string) {
    updateTime(hours, Number(m), period)
  }

  function handlePeriodChange(p: string) {
    updateTime(hours, minutes, p)
  }

  const disabledDays = minDate ? { before: minDate } : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-medium tracking-tight",
            !value && "text-muted-foreground font-normal",
            className,
          )}
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          {value ? format(value, "MMM d, yyyy  ·  h:mm a") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          disabled={disabledDays}
          initialFocus
        />
        <div className="border-t px-3 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Time</p>
          <div className="flex items-center gap-1.5">
            <Select value={String(hours)} onValueChange={handleHourChange}>
              <SelectTrigger className="h-8 w-[62px] text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <SelectItem key={h} value={String(h)} className="text-xs">
                    {String(h).padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm font-medium text-muted-foreground">:</span>
            <Select value={String(minutes)} onValueChange={handleMinuteChange}>
              <SelectTrigger className="h-8 w-[62px] text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                  <SelectItem key={m} value={String(m)} className="text-xs">
                    {String(m).padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="h-8 w-[62px] text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM" className="text-xs">AM</SelectItem>
                <SelectItem value="PM" className="text-xs">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
export type { DateTimePickerProps }
