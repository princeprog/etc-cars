"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldTitle,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApiErrorMessage } from "@/types/api"
import type { AuthenticatedUser } from "@/types/auth"

export function LeadAssigneeSelect({
  users,
  value,
  onValueChange,
  isLoading,
  error,
  fieldError,
}: {
  users: AuthenticatedUser[]
  value: string
  onValueChange: (value: string) => void
  isLoading: boolean
  error: unknown
  fieldError?: string
}) {
  const hasUsers = users.length > 0

  return (
    <Field data-invalid={Boolean(fieldError)}>
      <FieldTitle id="leadAssigneeLabel">Assigned staff</FieldTitle>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={isLoading || Boolean(error) || !hasUsers}
      >
        <SelectTrigger
          id="leadAssignee"
          aria-labelledby="leadAssigneeLabel leadAssignee"
        >
          <SelectValue placeholder="Select staff member" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{user.fullName}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {user.roleName}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription>
        {isLoading
          ? "Loading active staff."
          : error
            ? getApiErrorMessage(error, "Unable to load staff.")
            : hasUsers
              ? "This lead will be assigned to the selected staff member."
              : "No active staff are ready for assignment."}
      </FieldDescription>
      <FieldError>{fieldError}</FieldError>
    </Field>
  )
}
