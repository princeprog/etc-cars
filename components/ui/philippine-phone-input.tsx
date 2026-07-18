import * as React from "react"

import {
  formatPhilippineMobileLocalInput,
  formatPhilippineMobileNumberInput,
  PHILIPPINE_MOBILE_NUMBER_PREFIX,
} from "@/lib/philippine-phone"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type PhilippinePhoneInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "autoComplete" | "inputMode" | "onChange" | "type" | "value"
> & {
  value: string
  onChange: (value: string) => void
}

function PhilippinePhoneInput({
  className,
  value,
  onChange,
  ...props
}: PhilippinePhoneInputProps) {
  const invalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true"

  return (
    <div
      className={cn(
        "flex h-9 w-full overflow-hidden rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        invalid &&
          "border-destructive ring-3 ring-destructive/20 focus-within:border-destructive focus-within:ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40 dark:focus-within:border-destructive/50 dark:focus-within:ring-destructive/40",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="flex h-full shrink-0 items-center gap-2 border-r bg-muted/30 px-3 text-sm font-medium text-foreground"
      >
        <span className="text-base leading-none">🇵🇭</span>
        <span>{PHILIPPINE_MOBILE_NUMBER_PREFIX}</span>
      </div>
      <Input
        {...props}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={formatPhilippineMobileLocalInput(value)}
        onChange={(event) =>
          onChange(formatPhilippineMobileNumberInput(event.target.value))
        }
        placeholder="9XX XXX XXXX"
        className="h-full flex-1 rounded-none border-0 px-3 shadow-none focus-visible:ring-0 aria-invalid:ring-0"
      />
    </div>
  )
}

export { PhilippinePhoneInput }
