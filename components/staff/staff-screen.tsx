"use client"

import * as React from "react"
import {
  BanIcon,
  GripVerticalIcon,
  MailIcon,
  MoreHorizontalIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserCogIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { SubmitButton } from "@/components/operations/submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCreateStaffMutation } from "@/hooks/mutations/auth/use-create-staff-mutation"
import { useUpdateUserStatusMutation } from "@/hooks/mutations/auth/use-update-user-status-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useUsersQuery } from "@/hooks/queries/auth/use-users-query"
import { getApiErrorMessage } from "@/types/api"
import type { AuthenticatedUser, ListUsersParams } from "@/types/auth"

const DEFAULT_STAFF_PASSWORD = "123456"
const STATUS_FILTER_OPTIONS: Array<{
  label: string
  value: NonNullable<ListUsersParams["status"]>
}> = [
  { label: "all", value: "all" },
  { label: "active", value: "active" },
  { label: "disabled", value: "disabled" },
  { label: "change password required", value: "change_password_required" },
]

const SUMMARY_CARD_STYLES = {
  admins:
    "border-sky-200/70 bg-linear-to-br from-sky-50 via-white to-sky-100/70",
  active:
    "border-emerald-200/70 bg-linear-to-br from-emerald-50 via-white to-emerald-100/70",
  total:
    "border-violet-200/70 bg-linear-to-br from-violet-50 via-white to-violet-100/70",
} as const

export function StaffScreen() {
  return (
    <AuthenticatedAppShell
      title="Staff"
      breadcrumbs={[{ label: "Administration" }, { label: "Staff" }]}
    >
      <StaffScreenContent />
    </AuthenticatedAppShell>
  )
}

function StaffScreenContent() {
  const authQuery = useAuthenticatedUserQuery()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<NonNullable<ListUsersParams["status"]>>("all")
  const usersQuery = useUsersQuery({
    search,
    status: statusFilter,
  })
  const createStaffMutation = useCreateStaffMutation()
  const updateUserStatusMutation = useUpdateUserStatusMutation()
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [createConfirmOpen, setCreateConfirmOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [pendingStatusUser, setPendingStatusUser] =
    React.useState<AuthenticatedUser | null>(null)
  const [createdUser, setCreatedUser] =
    React.useState<AuthenticatedUser | null>(null)

  if (authQuery.data?.user.role !== "admin") {
    return (
      <div className="flex flex-1 items-start px-4 py-6 md:px-6">
        <Alert variant="destructive" className="max-w-xl">
          <ShieldCheckIcon />
          <AlertTitle>Admin access required</AlertTitle>
          <AlertDescription>
            Staff management is available only to admin users.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreatedUser(null)
    setCreateConfirmOpen(true)
  }

  async function confirmCreateStaff() {
    await createStaffMutation.mutateAsync(
      {
        email,
        fullName: fullName.trim() || undefined,
        role: "staff",
      },
      {
        onSuccess: (response) => {
          setCreatedUser(response.user)
          setEmail("")
          setFullName("")
          setCreateConfirmOpen(false)
          setCreateDialogOpen(false)
          toast.success("Staff account created")
        },
      },
    )
  }

  async function confirmStatusToggle() {
    if (!pendingStatusUser) {
      return
    }

    if (pendingStatusUser.active && pendingStatusUser.mustChangePassword) {
      toast.error("This account must complete its first password change before it can be disabled.")
      setPendingStatusUser(null)
      return
    }

    await updateUserStatusMutation.mutateAsync(
      {
        id: pendingStatusUser.id,
        payload: { active: !pendingStatusUser.active },
      },
      {
        onSuccess: () => {
          toast.success(
            pendingStatusUser.active
              ? "Staff account disabled"
              : "Staff account enabled",
          )
          setPendingStatusUser(null)
        },
      },
    )
  }

  const users = usersQuery.data?.users ?? []
  const staffUsers = users.filter((user) => user.role === "staff")
  const totalStaffCount = staffUsers.length
  const activeStaffCount = staffUsers.filter((user) => user.active).length
  const listedAdminCount = users.filter((user) => user.role === "admin").length
  const currentUser = authQuery.data?.user
  const adminCount =
    currentUser?.role === "admin" && !users.some((user) => user.id === currentUser.id)
      ? listedAdminCount + 1
      : listedAdminCount
  const disabledStaffCount = staffUsers.filter((user) => !user.active).length

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight">Staff</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Manage staff access, review account readiness, and update account
              status from one table-first workspace.
            </p>
          </div>

          <Button
            onClick={() => setCreateDialogOpen(true)}
          >
            <UserPlusIcon />
            New Staff
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Admin"
            value={adminCount}
            className={SUMMARY_CARD_STYLES.admins}
          />
          <SummaryCard
            label="All Staff"
            value={totalStaffCount}
            className={SUMMARY_CARD_STYLES.total}
          />
          <SummaryCard
            label="Active"
            value={activeStaffCount}
            className={SUMMARY_CARD_STYLES.active}
          />
          <SummaryCard
            label="Disabled"
            value={disabledStaffCount}
            className="border-amber-200/70 bg-linear-to-br from-amber-50 via-white to-amber-100/70"
          />
        </div>
      </section>

      <AlertDialog
        open={createConfirmOpen}
        onOpenChange={setCreateConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm staff creation</AlertDialogTitle>
            <AlertDialogDescription>
              Create a staff account for {email || "this user"} with the
              default password {DEFAULT_STAFF_PASSWORD}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createStaffMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCreateStaff}
              disabled={createStaffMutation.isPending}
            >
              {createStaffMutation.isPending ? "Creating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {createdUser ? (
        <Alert className="border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-100">
          <UserPlusIcon />
          <AlertTitle>Staff account created</AlertTitle>
          <AlertDescription>
            {createdUser.email} can sign in with {DEFAULT_STAFF_PASSWORD} and
            will be asked to choose a new password.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <div className="relative max-w-sm flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search staff"
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as NonNullable<ListUsersParams["status"]>)
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
              }}
            >
              Reset
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {staffUsers.length} filtered staff accounts
          </p>
        </div>

        <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
          <CardContent className="p-0">
            <ApiErrorAlert
              title="Unable to load staff data"
              message={
                getApiErrorMessage(usersQuery.error, "") ||
                getApiErrorMessage(updateUserStatusMutation.error, "")
              }
            />

            {usersQuery.isPending ? (
              <div className="flex items-center justify-center p-6">
                <Spinner className="size-5" />
              </div>
            ) : staffUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No staff accounts yet.
              </div>
            ) : (
              <Table className="min-w-[980px] border-collapse">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-10 w-8 px-3" />
                    <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">
                      ID
                    </TableHead>
                    <TableHead className="h-10 min-w-[240px] px-4 text-xs font-semibold text-foreground/80">
                      Staff Member
                    </TableHead>
                    <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">
                      Email
                    </TableHead>
                    <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">
                      Status
                    </TableHead>
                    <TableHead className="h-10 px-4 text-xs font-semibold text-foreground/80">
                      Access
                    </TableHead>
                    <TableHead className="h-10 w-12 px-4 text-right text-xs font-semibold text-foreground/80">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffUsers.map((user) => {
                    const isUpdating =
                      updateUserStatusMutation.isPending &&
                      updateUserStatusMutation.variables?.id === user.id
                    const status = getStaffStatus(user)
                    const disableBlockedByPasswordReset = user.active && user.mustChangePassword

                    return (
                      <TableRow key={user.id} className="hover:bg-muted/15">
                        <TableCell className="px-3 py-3 text-muted-foreground">
                          <GripVerticalIcon className="size-4 opacity-55" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="rounded-md border-border/70 bg-background px-1.5 py-0 font-mono text-[10px] tracking-wide text-muted-foreground"
                          >
                            {getStaffCode(user)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-11 border border-border/60 bg-muted">
                              <AvatarFallback className="bg-transparent text-sm font-semibold text-foreground">
                                {getInitials(user.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">
                                {user.fullName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.active ? "Can access workspace" : "Access currently blocked"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground">
                          <div className="inline-flex items-center gap-2">
                            <MailIcon className="size-4 text-muted-foreground/80" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status.variant}
                            className="rounded-full border px-3 py-1 font-medium"
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {user.mustChangePassword ? "Password reset needed" : "Ready to sign in"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${user.fullName}`}
                                className="text-muted-foreground hover:bg-muted hover:text-foreground"
                              >
                                <MoreHorizontalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel>Staff actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => setPendingStatusUser(user)}
                                disabled={isUpdating || disableBlockedByPasswordReset}
                              >
                                {user.active ? (
                                  <>
                                    <BanIcon />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <UserCheckIcon />
                                    Enable
                                  </>
                                )}
                              </DropdownMenuItem>
                              {disableBlockedByPasswordReset ? (
                                <DropdownMenuItem disabled className="text-xs text-muted-foreground opacity-100">
                                  Password change required before disabling
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <CreateStaffDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        email={email}
        fullName={fullName}
        onEmailChange={setEmail}
        onFullNameChange={setFullName}
        onSubmit={handleSubmit}
        pending={createStaffMutation.isPending}
        errorMessage={getApiErrorMessage(createStaffMutation.error, "")}
      />

      <AlertDialog
        open={Boolean(pendingStatusUser)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingStatusUser(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatusUser?.active
                ? "Disable staff account?"
                : "Enable staff account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusUser
                ? pendingStatusUser.active
                  ? `This will block ${pendingStatusUser.fullName} from signing in until the account is enabled again.`
                  : `This will allow ${pendingStatusUser.fullName} to sign in again.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateUserStatusMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusToggle}
              disabled={updateUserStatusMutation.isPending}
            >
              {updateUserStatusMutation.isPending ? "Saving..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CreateStaffDialog({
  open,
  onOpenChange,
  email,
  fullName,
  onEmailChange,
  onFullNameChange,
  onSubmit,
  pending,
  errorMessage,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  fullName: string
  onEmailChange: (value: string) => void
  onFullNameChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  pending: boolean
  errorMessage: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create staff account</DialogTitle>
          <DialogDescription>
            Staff accounts start with the default password and are required to
            change it on first sign-in.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={onSubmit}>
          <ApiErrorAlert
            title="Unable to create staff"
            message={errorMessage}
          />

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="staff-email">Email</FieldLabel>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
                autoComplete="email"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="staff-full-name">Full name</FieldLabel>
              <Input
                id="staff-full-name"
                value={fullName}
                onChange={(event) => onFullNameChange(event.target.value)}
                autoComplete="name"
              />
              <FieldDescription>
                Optional. If left blank, the name is derived from the email
                address.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Role</p>
                <p className="text-xs text-muted-foreground">
                  Staff can use the operational workspace.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-md">
                Staff
              </Badge>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-medium">Default Password</p>
              <p className="font-mono text-sm">{DEFAULT_STAFF_PASSWORD}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <SubmitButton
              type="submit"
              pending={pending}
              pendingLabel="Creating staff"
            >
              <UserPlusIcon />
              Create Staff
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-normal text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-semibold leading-none text-foreground">
              {value}
            </p>
          </div>
          <span className="mt-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-border" />
        </div>
      </CardContent>
    </Card>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "ST"
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getStaffStatus(user: AuthenticatedUser): {
  label: string
  variant: "outline" | "secondary" | "destructive"
} {
  if (user.mustChangePassword) {
    return { label: "change password required", variant: "outline" }
  }

  if (user.active) {
    return { label: "active", variant: "secondary" }
  }

  return { label: "disabled", variant: "destructive" }
}

function getStaffCode(user: AuthenticatedUser) {
  return `STF-${user.id.slice(0, 8).toUpperCase()}`
}
