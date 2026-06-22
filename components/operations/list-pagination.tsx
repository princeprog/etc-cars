"use client"

import { Button } from "@/components/ui/button"

type ListPaginationProps = {
  page: number
  totalPages: number
  total: number
  itemLabel: string
  onPageChange: (page: number) => void
}

export function ListPagination({
  page,
  totalPages,
  total,
  itemLabel,
  onPageChange,
}: ListPaginationProps) {
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing page {page} of {totalPages} for {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
