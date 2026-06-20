import { Spinner } from "@/components/ui/spinner"

export function ModuleLoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-md border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        {label}
      </div>
    </div>
  )
}
