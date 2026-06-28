"use client"

import * as React from "react"
import { BanIcon, ShieldCheckIcon, UserCheckIcon, UserPlusIcon } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
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

  const staffUsers = usersQuery.data?.users ?? []

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Administration</p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Staff accounts
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create staff access, monitor account status, and disable sign-in when needed.
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlusIcon />
              Create Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create staff account</DialogTitle>
              <DialogDescription>
                Staff accounts start with the default password and are required to change it on first sign-in.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <ApiErrorAlert
                title="Unable to create staff"
                message={getApiErrorMessage(createStaffMutation.error, "")}
              />

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="staff-email">Email</FieldLabel>
                  <Input
                    id="staff-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="staff-full-name">Full name</FieldLabel>
                  <Input
                    id="staff-full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                  />
                  <FieldDescription>
                    Optional. If left blank, the name is derived from the email address.
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
                  pending={createStaffMutation.isPending}
                  pendingLabel="Creating staff"
                >
                  <UserPlusIcon />
                  Create Staff
                </SubmitButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={createConfirmOpen}
          onOpenChange={setCreateConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm staff creation</AlertDialogTitle>
              <AlertDialogDescription>
                Create a staff account for {email || "this user"} with the default
                password {DEFAULT_STAFF_PASSWORD}?
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
      </section>

      {createdUser ? (
        <Alert className="border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-100">
          <UserPlusIcon />
          <AlertTitle>Staff account created</AlertTitle>
          <AlertDescription>
            {createdUser.email} can sign in with {DEFAULT_STAFF_PASSWORD} and will be asked to choose a new password.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">Staff Directory</CardTitle>
          <CardDescription>
            Disable an account to block sign-in. Disabled staff will see that their account has been disabled by an admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="sm:max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as NonNullable<ListUsersParams["status"]>)
              }
            >
              <SelectTrigger className="w-full sm:w-64">
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
          </div>

          <ApiErrorAlert
            title="Unable to load staff data"
            message={
              getApiErrorMessage(usersQuery.error, "") ||
              getApiErrorMessage(updateUserStatusMutation.error, "")
            }
          />

          {usersQuery.isPending ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="size-5" />
            </div>
          ) : staffUsers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
              No staff accounts yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/70">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-4">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="px-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffUsers.map((user) => {
                    const isUpdating =
                      updateUserStatusMutation.isPending &&
                      updateUserStatusMutation.variables?.id === user.id

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="px-4 font-medium">
                          {user.fullName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.mustChangePassword
                                ? "outline"
                                : user.active
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="rounded-md"
                          >
                            {user.mustChangePassword
                              ? "change password required"
                              : user.active
                                ? "active"
                                : "disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <SubmitButton
                            type="button"
                            variant={user.active ? "destructive" : "outline"}
                            pending={isUpdating}
                            pendingLabel={user.active ? "Disabling" : "Enabling"}
                            onClick={() => setPendingStatusUser(user)}
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
                          </SubmitButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
              {pendingStatusUser?.active ? "Disable staff account?" : "Enable staff account?"}
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
