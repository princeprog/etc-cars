"use client";

import * as React from "react";
import { KeyRoundIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { PermissionScope, RolePermissionCatalogItem } from "@/types/roles";

type RolePermissionMatrixProps = {
  permissions: RolePermissionCatalogItem[];
  scopes: Record<string, PermissionScope | "none">;
  disabled: boolean;
  onScopeChange: (key: string, scope: PermissionScope | "none") => void;
};

export function RolePermissionMatrix({
  permissions,
  scopes,
  disabled,
  onScopeChange,
}: RolePermissionMatrixProps) {
  const groupedPermissions = React.useMemo(
    () => groupPermissions(permissions),
    [permissions],
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Access matrix</CardTitle>
        <CardDescription>
          Choose how much access this role has for every capability.
        </CardDescription>
        <CardAction>
          <Badge variant="outline">
            {permissions.length}{" "}
            {permissions.length === 1 ? "permission" : "permissions"}
          </Badge>
        </CardAction>
      </CardHeader>

      {groupedPermissions.length === 0 ? (
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <KeyRoundIcon />
              </EmptyMedia>
              <EmptyTitle>No permissions available</EmptyTitle>
              <EmptyDescription>
                The permission catalog is empty. Add permissions before
                configuring this role.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-0 px-0">
          <div className="hidden grid-cols-[minmax(0,1fr)_14rem] items-center border-b bg-muted/30 px-6 py-2.5 text-xs font-medium text-muted-foreground md:grid">
            <span>Permission</span>
            <span>Access level</span>
          </div>

          {groupedPermissions.map(([moduleName, modulePermissions], index) => (
            <React.Fragment key={moduleName}>
              {index > 0 ? <Separator /> : null}
              <PermissionModule
                moduleName={moduleName}
                permissions={modulePermissions}
                scopes={scopes}
                disabled={disabled}
                onScopeChange={onScopeChange}
              />
            </React.Fragment>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

function PermissionModule({
  moduleName,
  permissions,
  scopes,
  disabled,
  onScopeChange,
}: {
  moduleName: string;
  permissions: RolePermissionCatalogItem[];
  scopes: Record<string, PermissionScope | "none">;
  disabled: boolean;
  onScopeChange: (key: string, scope: PermissionScope | "none") => void;
}) {
  const headingId = `permission-module-${moduleName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section aria-labelledby={headingId}>
      <div className="flex min-h-11 items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5 md:px-6">
        <h2 id={headingId} className="text-sm font-semibold">
          {moduleName}
        </h2>
        <Badge variant="secondary">
          {permissions.length} {permissions.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      <div className="flex flex-col">
        {permissions.map((permission, index) => (
          <React.Fragment key={permission.key}>
            {index > 0 ? <Separator /> : null}
            <div className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_14rem] md:items-center md:gap-8 md:px-6">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-sm font-medium leading-5">
                  {permission.label}
                </p>
                <p className="max-w-3xl text-sm leading-5 text-muted-foreground">
                  {permission.description}
                </p>
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground md:sr-only">
                  Access level
                </span>
                <Select
                  value={scopes[permission.key] ?? "none"}
                  disabled={disabled}
                  onValueChange={(value) =>
                    onScopeChange(
                      permission.key,
                      value as PermissionScope | "none",
                    )
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label={`Access level for ${permission.label}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    <SelectGroup>
                      <SelectItem value="none">No access</SelectItem>
                      {permission.supportsAssignedScope ? (
                        <SelectItem value="assigned">Assigned only</SelectItem>
                      ) : null}
                      <SelectItem value="all">All records</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function groupPermissions(permissions: RolePermissionCatalogItem[]) {
  const groups = new Map<string, RolePermissionCatalogItem[]>();

  for (const permission of permissions) {
    groups.set(permission.module, [
      ...(groups.get(permission.module) ?? []),
      permission,
    ]);
  }

  return [...groups.entries()];
}
