"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  LockIcon,
  RotateCcwIcon,
  SaveIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { toast } from "@/components/ui/sileo";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { RolePermissionMatrix } from "@/components/settings/role-permission-matrix";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateRoleMutation,
  useRestoreRoleMutation,
  useUpdateRoleMutation,
} from "@/hooks/mutations/roles/use-save-role-mutations";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { useRolePermissionsQuery } from "@/hooks/queries/roles/use-role-permissions-query";
import { useRoleQuery } from "@/hooks/queries/roles/use-role-query";
import { getApiErrorMessage } from "@/types/api";
import type { PermissionScope, RoleRecord } from "@/types/roles";

type DraftRole = {
  name: string;
  description: string;
  permissions: Record<string, PermissionScope | "none">;
};

export function RoleAccessDetailScreen({ roleId }: { roleId: string }) {
  const isNewRole = roleId === "new";

  return (
    <AuthenticatedAppShell
      title={isNewRole ? "New Role" : "Role Access"}
      breadcrumbs={[
        { label: "Administration" },
        { label: "Settings", href: "/settings" },
        { label: "Roles & Access", href: "/settings/roles" },
        { label: isNewRole ? "New Role" : "Access" },
      ]}
    >
      <RoleAccessDetailContent roleId={roleId} />
    </AuthenticatedAppShell>
  );
}

function RoleAccessDetailContent({ roleId }: { roleId: string }) {
  const router = useRouter();
  const isNewRole = roleId === "new";
  const authQuery = useAuthenticatedUserQuery();
  const roleQuery = useRoleQuery(roleId);
  const permissionsQuery = useRolePermissionsQuery();
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const restoreMutation = useRestoreRoleMutation();
  const [draft, setDraft] = React.useState<DraftRole>(() => createEmptyDraft());
  const role = isNewRole ? null : roleQuery.data?.role;
  const permissions = React.useMemo(
    () => permissionsQuery.data?.permissions ?? [],
    [permissionsQuery.data?.permissions],
  );
  const canEdit = isNewRole || Boolean(role?.isMutable);
  const loading =
    permissionsQuery.isPending || (!isNewRole && roleQuery.isPending);

  React.useEffect(() => {
    if (isNewRole) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(createEmptyDraft());
      return;
    }

    if (role) {
      setDraft(createDraftFromRole(role));
    }
  }, [isNewRole, role]);

  if (authQuery.data?.user.isAdministrator !== true) {
    return (
      <div className="flex flex-1 items-start px-4 py-6 md:px-6">
        <Alert variant="destructive" className="max-w-xl">
          <ShieldCheckIcon />
          <AlertTitle>Administrator access required</AlertTitle>
          <AlertDescription>
            Role access settings are protected for Administrator users only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const errorMessage =
    getApiErrorMessage(roleQuery.error, "") ||
    getApiErrorMessage(permissionsQuery.error, "") ||
    getApiErrorMessage(createMutation.error, "") ||
    getApiErrorMessage(updateMutation.error, "") ||
    getApiErrorMessage(restoreMutation.error, "");
  const grantedCount = Object.values(draft.permissions).filter(
    (scope) => scope !== "none",
  ).length;

  async function saveRole() {
    const payload = {
      name: draft.name,
      description: draft.description || null,
      permissions: Object.entries(draft.permissions)
        .filter(([, scope]) => scope !== "none")
        .map(([key, scope]) => ({ key, scope: scope as PermissionScope })),
      expectedRevision: role?.revision,
    };

    if (isNewRole) {
      const response = await createMutation.mutateAsync(payload);
      toast.success("Role created");
      router.replace(`/settings/roles/${response.role.id}`);
      return;
    }

    if (!role) {
      return;
    }

    await updateMutation.mutateAsync({ id: role.id, payload });
    toast.success("Role access updated");
  }

  async function restoreRole() {
    if (!role) {
      return;
    }

    await restoreMutation.mutateAsync(role.id);
    toast.success("Role restored");
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href="/settings/roles">
            <ArrowLeftIcon data-icon="inline-start" />
            Back to roles
          </Link>
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {isNewRole ? "Create role" : (role?.name ?? "Role access")}
              </h1>
              {role?.isAdministrator ? (
                <Badge variant="secondary">
                  <LockIcon />
                  Protected
                </Badge>
              ) : null}
              {role?.archivedAt ? (
                <Badge variant="outline">Archived</Badge>
              ) : null}
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {isNewRole
                ? "Name the role and configure the access granted to assigned team members."
                : "Configure the access available to team members assigned to this role."}
            </p>
            {!isNewRole && role ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="outline">
                  {grantedCount} of {permissions.length} granted
                </Badge>
                <Badge variant="outline">
                  {role.userCount} {role.userCount === 1 ? "user" : "users"}
                </Badge>
                <Badge variant="outline">Revision {role.revision}</Badge>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {role?.archivedAt ? (
              <Button variant="outline" onClick={restoreRole}>
                <RotateCcwIcon data-icon="inline-start" />
                Restore role
              </Button>
            ) : null}
            <Button
              onClick={saveRole}
              disabled={
                loading ||
                !canEdit ||
                Boolean(role?.archivedAt) ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              <SaveIcon data-icon="inline-start" />
              {isNewRole ? "Create role" : "Save changes"}
            </Button>
          </div>
        </div>
      </header>

      <ApiErrorAlert
        title="Unable to save role access"
        message={errorMessage}
      />

      {loading ? (
        <RoleDetailSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          {isNewRole ? (
            <Card size="sm">
              <CardHeader className="border-b">
                <CardTitle>Role information</CardTitle>
                <CardDescription>
                  Use a clear name that matches the team member&apos;s
                  responsibility.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="max-w-lg">
                  <Field>
                    <FieldLabel htmlFor="role-name">Role name</FieldLabel>
                    <Input
                      id="role-name"
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="e.g. Sales supervisor"
                    />
                    <FieldDescription>
                      This name appears when assigning roles to team members.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          ) : null}

          <RolePermissionMatrix
            permissions={permissions}
            scopes={draft.permissions}
            disabled={!canEdit || Boolean(role?.archivedAt)}
            onScopeChange={(key, scope) =>
              setDraft((current) => ({
                ...current,
                permissions: {
                  ...current.permissions,
                  [key]: scope,
                },
              }))
            }
          />
        </div>
      )}
    </main>
  );
}

function RoleDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function createDraftFromRole(role: RoleRecord): DraftRole {
  return {
    name: role.name,
    description: role.description ?? "",
    permissions: Object.fromEntries(
      role.permissions.map((permission) => [permission.key, permission.scope]),
    ),
  };
}

function createEmptyDraft(): DraftRole {
  return {
    name: "",
    description: "",
    permissions: {},
  };
}
