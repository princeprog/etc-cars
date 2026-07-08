"use client"

import * as React from "react"

export function AnimatedQualityProgress({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, score))
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplayValue(clamped))
    return () => cancelAnimationFrame(frame)
  }, [clamped])

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className ?? ""}`}
    >
      <div
        className="h-full rounded-full bg-emerald-700 shadow-[0_0_0_1px_rgba(4,120,87,0.25)] dark:bg-emerald-500"
        style={{
          width: `${displayValue}%`,
          transition:
            "width 1400ms cubic-bezier(0.16, 1, 0.3, 1), background-color 300ms ease",
        }}
      />
    </div>
  )
}
