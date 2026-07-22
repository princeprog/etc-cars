"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArchiveIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { toast } from "@/components/ui/sileo";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useArchiveRoleMutation,
  useCreateRoleMutation,
  useRestoreRoleMutation,
} from "@/hooks/mutations/roles/use-save-role-mutations";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { useRolesQuery } from "@/hooks/queries/roles/use-roles-query";
import { getApiErrorMessage } from "@/types/api";
import type { RoleRecord } from "@/types/roles";

export function RolesAccessScreen({
  createRoleDialogOpen = false,
}: {
  createRoleDialogOpen?: boolean;
}) {
  return (
    <AuthenticatedAppShell
      title="Roles & Access"
      breadcrumbs={[
        { label: "Administration" },
        { label: "Settings", href: "/settings" },
        { label: "Roles & Access" },
      ]}
    >
      <RolesAccessContent createRoleDialogOpen={createRoleDialogOpen} />
    </AuthenticatedAppShell>
  );
}

function RolesAccessContent({
  createRoleDialogOpen,
}: {
  createRoleDialogOpen: boolean;
}) {
  const router = useRouter();
  const authQuery = useAuthenticatedUserQuery();
  const rolesQuery = useRolesQuery();
  const createMutation = useCreateRoleMutation();
  const archiveMutation = useArchiveRoleMutation();
  const restoreMutation = useRestoreRoleMutation();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "archived" | "all">(
    "active",
  );
  const [archiveTarget, setArchiveTarget] = React.useState<RoleRecord | null>(
    null,
  );
  const [replacementRoleId, setReplacementRoleId] = React.useState("");

  const roles = React.useMemo(
    () => rolesQuery.data?.roles ?? [],
    [rolesQuery.data?.roles],
  );
  const visibleRoles = React.useMemo(() => {
    const needle = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesStatus =
        status === "all" ||
        (status === "active" && !role.archivedAt) ||
        (status === "archived" && Boolean(role.archivedAt));
      const matchesSearch =
        !needle ||
        `${role.name} ${role.description ?? ""}`.toLowerCase().includes(needle);

      return matchesStatus && matchesSearch;
    });
  }, [roles, search, status]);

  if (authQuery.data?.user.isAdministrator !== true) {
    return (
      <div className="flex flex-1 items-start px-4 py-6 md:px-6">
        <Alert variant="destructive" className="max-w-xl">
          <ShieldCheckIcon />
          <AlertTitle>Administrator access required</AlertTitle>
          <AlertDescription>
            Role management is protected for Administrator users only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const errorMessage =
    getApiErrorMessage(rolesQuery.error, "") ||
    getApiErrorMessage(createMutation.error, "") ||
    getApiErrorMessage(archiveMutation.error, "") ||
    getApiErrorMessage(restoreMutation.error, "");

  async function createRole(payload: { name: string; description: string }) {
    const response = await createMutation.mutateAsync({
      name: payload.name,
      description: payload.description || null,
      permissions: [],
    });
    toast.success("Role created");
    router.replace(`/settings/roles/${response.role.id}`);
  }

  async function restoreRole(role: RoleRecord) {
    await restoreMutation.mutateAsync(role.id);
    toast.success("Role restored");
  }

  async function confirmArchive() {
    if (!archiveTarget || !replacementRoleId) {
      return;
    }

    await archiveMutation.mutateAsync({
      id: archiveTarget.id,
      payload: { replacementRoleId },
    });
    setArchiveTarget(null);
    setReplacementRoleId("");
    toast.success("Role archived");
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Roles & Access
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Review every role in the workspace, then open a role to configure
            its access levels.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/roles/new">
            <PlusIcon data-icon="inline-start" />
            New Role
          </Link>
        </Button>
      </header>

      <ApiErrorAlert
        title="Unable to load role settings"
        message={errorMessage}
      />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Roles</CardTitle>
            <CardDescription>
              Active and archived access profiles for your team.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-sm flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search roles"
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as "active" | "archived" | "all")
              }
            >
              <SelectTrigger className="w-full md:w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="active">Active roles</SelectItem>
                  <SelectItem value="archived">Archived roles</SelectItem>
                  <SelectItem value="all">All roles</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rolesQuery.isPending ? (
            <RolesTableSkeleton />
          ) : visibleRoles.length === 0 ? (
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldCheckIcon />
                </EmptyMedia>
                <EmptyTitle>No roles found</EmptyTitle>
                <EmptyDescription>
                  Adjust the filters or create a new role for this workspace.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild variant="outline">
                  <Link href="/settings/roles/new">
                    <PlusIcon data-icon="inline-start" />
                    New Role
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <RolesTable
              roles={visibleRoles}
              allRoles={roles}
              onArchive={(role) => {
                setArchiveTarget(role);
                setReplacementRoleId(
                  roles.find(
                    (candidate) =>
                      candidate.id !== role.id && !candidate.archivedAt,
                  )?.id ?? "",
                );
              }}
              onRestore={restoreRole}
              pendingRestoreId={
                restoreMutation.isPending ? restoreMutation.variables : null
              }
            />
          )}
        </CardContent>
      </Card>

      <ArchiveRoleDialog
        role={archiveTarget}
        roles={roles}
        replacementRoleId={replacementRoleId}
        onReplacementRoleChange={setReplacementRoleId}
        onOpenChange={(open) => {
          if (!open) {
            setArchiveTarget(null);
          }
        }}
        onConfirm={confirmArchive}
        pending={archiveMutation.isPending}
      />
      <CreateRoleDialog
        open={createRoleDialogOpen}
        pending={createMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            router.replace("/settings/roles");
          }
        }}
        onSubmit={createRole}
      />
    </main>
  );
}

function RolesTable({
  roles,
  onArchive,
  onRestore,
  pendingRestoreId,
}: {
  roles: RoleRecord[];
  allRoles: RoleRecord[];
  onArchive: (role: RoleRecord) => void;
  onRestore: (role: RoleRecord) => void;
  pendingRestoreId: string | null;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-5">Role</TableHead>
          <TableHead>Access</TableHead>
          <TableHead>Users</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12 px-5 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="max-w-[360px] px-5">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{role.name}</span>
                  {role.isAdministrator ? (
                    <Badge variant="secondary" className="rounded-md">
                      Protected
                    </Badge>
                  ) : null}
                </div>
                <span className="truncate text-sm text-muted-foreground">
                  {role.description || "No description"}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {role.permissions.length} permission
              {role.permissions.length === 1 ? "" : "s"}
            </TableCell>
            <TableCell>
              {role.userCount} user{role.userCount === 1 ? "" : "s"}
            </TableCell>
            <TableCell>
              <Badge
                variant={role.archivedAt ? "outline" : "secondary"}
                className="rounded-md"
              >
                {role.archivedAt ? "Archived" : "Active"}
              </Badge>
            </TableCell>
            <TableCell className="px-5 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${role.name}`}
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Role actions</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={`/settings/roles/${role.id}`}>
                        <EyeIcon />
                        Manage access
                      </Link>
                    </DropdownMenuItem>
                    {role.archivedAt ? (
                      <DropdownMenuItem
                        disabled={pendingRestoreId === role.id}
                        onClick={() => onRestore(role)}
                      >
                        <RotateCcwIcon />
                        Restore
                      </DropdownMenuItem>
                    ) : role.isMutable ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onArchive(role)}>
                          <ArchiveIcon />
                          Archive
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RolesTableSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[minmax(240px,1fr)_140px_100px_120px_64px] gap-4 border-b px-5 py-4"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}

function CreateRoleDialog({
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { name: string; description: string }) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const trimmedName = name.trim();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedName) {
      return;
    }

    await onSubmit({
      name: trimmedName,
      description: description.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Create new role</DialogTitle>
            <DialogDescription>
              Add the role first, then configure its access levels on the role
              access page.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-role-name">Role name</FieldLabel>
              <Input
                id="new-role-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Sales supervisor"
                autoFocus
              />
              <FieldDescription>
                Use a clear name that matches the team member&apos;s
                responsibility.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="new-role-description">
                Description
              </FieldLabel>
              <Input
                id="new-role-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional short description"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending || !trimmedName}>
              {pending ? "Creating..." : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ArchiveRoleDialog({
  role,
  roles,
  replacementRoleId,
  onReplacementRoleChange,
  onOpenChange,
  onConfirm,
  pending,
}: {
  role: RoleRecord | null;
  roles: RoleRecord[];
  replacementRoleId: string;
  onReplacementRoleChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  const replacements = roles.filter(
    (candidate) => candidate.id !== role?.id && !candidate.archivedAt,
  );

  return (
    <AlertDialog open={Boolean(role)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive role?</AlertDialogTitle>
          <AlertDialogDescription>
            Users assigned to {role?.name ?? "this role"} must move to another
            active role before it is archived.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel>Replacement role</FieldLabel>
          <Select
            value={replacementRoleId}
            onValueChange={onReplacementRoleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose replacement role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {replacements.map((replacement) => (
                  <SelectItem key={replacement.id} value={replacement.id}>
                    {replacement.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending || !replacementRoleId}
          >
            {pending ? "Archiving..." : "Archive Role"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
