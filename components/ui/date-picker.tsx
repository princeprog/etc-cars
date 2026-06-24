"use client"

import * as React from "react"
import { format, isAfter, isBefore, isSameDay } from "date-fns"
import { CalendarIcon, XIcon } from "lucide-react"
import type { DateRange, Matcher } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  className?: string
  id?: string
}

function DatePicker({ value, onChange, placeholder = "Pick a date", disabled, className, id }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

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
          {value ? format(value, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  id?: string
}

function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  className,
  id,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [pendingFrom, setPendingFrom] = React.useState<Date | undefined>(undefined)
  const [hoveredDay, setHoveredDay] = React.useState<Date | undefined>(undefined)

  const picking = pendingFrom !== undefined
  const displayFrom = picking ? pendingFrom : value?.from
  const displayTo = picking ? undefined : value?.to

  function handleDayClick(date: Date) {
    if (!picking) {
      setPendingFrom(date)
      return
    }

    const [from, to] = isBefore(date, pendingFrom!)
      ? [date, pendingFrom!]
      : [pendingFrom!, date]

    setPendingFrom(undefined)
    setHoveredDay(undefined)
    onChange?.({ from, to })
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange?.(undefined)
    setPendingFrom(undefined)
    setHoveredDay(undefined)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setPendingFrom(undefined)
      setHoveredDay(undefined)
    }
  }

  const rangeStartMatcher = React.useMemo<Matcher | undefined>(() => {
    if (!displayFrom) return undefined
    return (date: Date) => isSameDay(date, displayFrom)
  }, [displayFrom])

  const rangeEndMatcher = React.useMemo<Matcher | undefined>(() => {
    if (!displayTo) return undefined
    return (date: Date) => isSameDay(date, displayTo)
  }, [displayTo])

  const rangeMiddleMatcher = React.useMemo<Matcher | undefined>(() => {
    if (!displayFrom || !displayTo) return undefined
    return (date: Date) =>
      isAfter(date, displayFrom) && isBefore(date, displayTo)
  }, [displayFrom, displayTo])

  const hoverPreviewMatcher = React.useMemo<Matcher | undefined>(() => {
    if (!picking || !hoveredDay) return undefined
    if (isSameDay(pendingFrom!, hoveredDay)) return undefined

    const [start, end] = isBefore(hoveredDay, pendingFrom!)
      ? [hoveredDay, pendingFrom!]
      : [pendingFrom!, hoveredDay]

    return (date: Date) =>
      !isSameDay(date, start) &&
      !isSameDay(date, end) &&
      isAfter(date, start) &&
      isBefore(date, end)
  }, [picking, pendingFrom, hoveredDay])

  const hoverEndMatcher = React.useMemo<Matcher | undefined>(() => {
    if (!picking || !hoveredDay) return undefined
    if (isSameDay(pendingFrom!, hoveredDay)) return undefined
    return (date: Date) => isSameDay(date, hoveredDay)
  }, [picking, pendingFrom, hoveredDay])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-medium tracking-tight",
            !value?.from && !picking && "text-muted-foreground font-normal",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">
            {picking ? (
              <>
                {format(pendingFrom!, "MMM d, yyyy")}
                <span className="ml-1.5 text-muted-foreground">– select end</span>
              </>
            ) : value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "MMM d, yyyy")}
                  <span className="mx-1.5 text-muted-foreground">–</span>
                  {format(value.to, "MMM d, yyyy")}
                </>
              ) : (
                format(value.from, "MMM d, yyyy")
              )
            ) : (
              placeholder
            )}
          </span>
          {(value?.from || picking) ? (
            <XIcon
              className="size-3.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleClear}
            />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={undefined}
          onSelect={() => {}}
          onDayClick={handleDayClick}
          onDayMouseEnter={(date) => setHoveredDay(date)}
          onDayMouseLeave={() => setHoveredDay(undefined)}
          modifiers={{
            ...(rangeStartMatcher ? { rangeStart: rangeStartMatcher } : {}),
            ...(rangeEndMatcher ? { rangeEnd: rangeEndMatcher } : {}),
            ...(rangeMiddleMatcher ? { rangeMiddle: rangeMiddleMatcher } : {}),
            ...(hoverPreviewMatcher ? { hoverRange: hoverPreviewMatcher } : {}),
            ...(hoverEndMatcher ? { hoverEnd: hoverEndMatcher } : {}),
          }}
          modifiersClassNames={{
            rangeStart: "[&_button]:bg-foreground [&_button]:text-background rounded-l-md bg-muted",
            rangeEnd: "[&_button]:bg-foreground [&_button]:text-background rounded-r-md bg-muted",
            rangeMiddle: "bg-muted rounded-none",
            hoverRange: "bg-muted/60 rounded-none",
            hoverEnd: "bg-muted/80 rounded-none",
          }}
          numberOfMonths={1}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DateRangePicker }
export type { DatePickerProps, DateRangePickerProps }
