import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function SubmitButton({
  pending,
  children,
  pendingLabel,
  ...props
}: React.ComponentProps<typeof Button> & {
  pending: boolean
  pendingLabel: string
  children: ReactNode
}) {
  return (
    <Button {...props} disabled={pending || props.disabled}>
      {pending ? (
        <>
          <Spinner className="size-4" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
