"use client"

import * as React from "react"
import { EditIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "@/components/ui/sileo"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useFinancingMutations } from "@/hooks/mutations/financing/use-financing-mutations"
import { useFinancingRequirementsQuery } from "@/hooks/queries/financing/use-financing-queries"
import { getApiErrorMessage } from "@/types/api"
import type { FinancingRequirementSetting } from "@/types/financing"

export function FinancingSettingsScreen() {
  const requirementsQuery = useFinancingRequirementsQuery()
  const mutations = useFinancingMutations()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editingRequirement, setEditingRequirement] =
    React.useState<FinancingRequirementSetting | null>(null)

  const requirements = requirementsQuery.data?.requirements ?? []

  async function createRequirement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    await mutations.createRequirement.mutateAsync(
      {
        label: String(form.get("label") ?? ""),
        description: String(form.get("description") ?? "") || null,
      },
      {
        onSuccess: () => {
          toast.success("Financing requirement added")
          formElement.reset()
          setCreateOpen(false)
        },
      },
    )
  }

  async function updateRequirement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingRequirement) return

    const form = new FormData(event.currentTarget)
    await mutations.updateRequirementSetting.mutateAsync(
      {
        id: editingRequirement.id,
        payload: {
          label: String(form.get("label") ?? ""),
          description: String(form.get("description") ?? "") || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Financing requirement updated")
          setEditingRequirement(null)
        },
      },
    )
  }

  async function deleteRequirement(requirement: FinancingRequirementSetting) {
    const confirmed = window.confirm(
      `Delete "${requirement.label}" from buyer upload requirements?`,
    )

    if (!confirmed) return

    await mutations.deleteRequirementSetting.mutateAsync(requirement.id, {
      onSuccess: () => toast.success("Financing requirement deleted"),
    })
  }

  return (
    <AuthenticatedAppShell
      title="Financing Settings"
      breadcrumbs={[
        { label: "Financing", href: "/financing" },
        { label: "Settings" },
      ]}
    >
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle>Financing Requirements</CardTitle>
              <CardDescription>
                Manage the checklist buyers must upload for every financing
                application.
              </CardDescription>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon />
                  Add Requirement
                </Button>
              </DialogTrigger>
              <RequirementDialogContent
                title="Add financing requirement"
                description="Add one requirement name that buyers will see in the secure upload checklist."
                isSaving={mutations.createRequirement.isPending}
                errorMessage={getApiErrorMessage(
                  mutations.createRequirement.error,
                  "",
                )}
                onSubmit={createRequirement}
                onCancel={() => setCreateOpen(false)}
              />
            </Dialog>
          </CardHeader>
          <CardContent>
            <ApiErrorAlert
              title="Unable to load financing requirements"
              message={getApiErrorMessage(requirementsQuery.error, "")}
            />
            <ApiErrorAlert
              title="Unable to delete financing requirement"
              message={getApiErrorMessage(
                mutations.deleteRequirementSetting.error,
                "",
              )}
            />

            {requirementsQuery.isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : requirements.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No financing requirements yet</EmptyTitle>
                  <EmptyDescription>
                    Add at least one requirement before creating financing
                    applications.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setCreateOpen(true)}>
                    <PlusIcon />
                    Add Requirement
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requirements.map((requirement) => (
                      <TableRow key={requirement.id}>
                        <TableCell className="font-medium">
                          {requirement.label}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {requirement.description || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label={`Edit ${requirement.label}`}
                              onClick={() => setEditingRequirement(requirement)}
                            >
                              <EditIcon />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label={`Delete ${requirement.label}`}
                              disabled={
                                mutations.deleteRequirementSetting.isPending
                              }
                              onClick={() => void deleteRequirement(requirement)}
                            >
                              <Trash2Icon />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={Boolean(editingRequirement)}
          onOpenChange={(open) => {
            if (!open) setEditingRequirement(null)
          }}
        >
          <RequirementDialogContent
            key={editingRequirement?.id ?? "edit-requirement"}
            title="Edit financing requirement"
            description="Update the requirement name buyers will see in the upload checklist."
            requirement={editingRequirement}
            isSaving={mutations.updateRequirementSetting.isPending}
            errorMessage={getApiErrorMessage(
              mutations.updateRequirementSetting.error,
              "",
            )}
            onSubmit={updateRequirement}
            onCancel={() => setEditingRequirement(null)}
          />
        </Dialog>
      </div>
    </AuthenticatedAppShell>
  )
}

function RequirementDialogContent({
  title,
  description,
  requirement,
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
}: {
  title: string
  description: string
  requirement?: FinancingRequirementSetting | null
  isSaving: boolean
  errorMessage: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  onCancel: () => void
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <ApiErrorAlert
          title="Unable to save financing requirement"
          message={errorMessage}
        />
        <FieldGroup>
          <Field>
            <FieldLabel>Requirement name</FieldLabel>
            <Input
              name="label"
              defaultValue={requirement?.label ?? ""}
              placeholder="Valid government ID"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              name="description"
              defaultValue={requirement?.description ?? ""}
              rows={3}
              placeholder="Optional instructions for the buyer"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Requirement"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
