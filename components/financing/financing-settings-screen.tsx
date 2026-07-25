"use client"

import * as React from "react"
import { toast } from "@/components/ui/sileo"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useFinancingMutations } from "@/hooks/mutations/financing/use-financing-mutations"
import {
  useFinancingPartnersQuery,
  useFinancingTemplatesQuery,
} from "@/hooks/queries/financing/use-financing-queries"
import { useUsersQuery } from "@/hooks/queries/auth/use-users-query"
import { getApiErrorMessage } from "@/types/api"
import type {
  FinancingPartner,
  FinancingPartnerRepresentative,
  FinancingRequirementTemplate,
} from "@/types/financing"

const EMPTY_PARTNERS: FinancingPartner[] = []
const EMPTY_TEMPLATES: FinancingRequirementTemplate[] = []

export function FinancingSettingsScreen() {
  const partnersQuery = useFinancingPartnersQuery()
  const templatesQuery = useFinancingTemplatesQuery()
  const usersQuery = useUsersQuery({ page: 1, pageSize: 100, status: "active" })
  const mutations = useFinancingMutations()
  const [selectedPartnerId, setSelectedPartnerId] = React.useState("")

  const partners = partnersQuery.data?.partners ?? EMPTY_PARTNERS
  const templates = templatesQuery.data?.templates ?? EMPTY_TEMPLATES
  const effectiveSelectedPartnerId = selectedPartnerId || partners[0]?.id || ""
  const representatives = React.useMemo(
    () =>
      partners.flatMap((partner) =>
        (partner.representatives ?? []).map((representative) => ({
          ...representative,
          partnerName: partner.name,
        })),
      ),
    [partners],
  )
  const partnerNameById = React.useMemo(
    () => new Map(partners.map((partner) => [partner.id, partner.name])),
    [partners],
  )
  const isLoading =
    partnersQuery.isLoading || templatesQuery.isLoading || usersQuery.isLoading

  async function createPartner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    await mutations.createPartner.mutateAsync(
      {
        name: String(form.get("name") ?? ""),
        contactPerson: String(form.get("contactPerson") ?? "") || null,
        contactNumber: String(form.get("contactNumber") ?? "") || null,
        email: String(form.get("email") ?? "") || null,
      },
      { onSuccess: () => toast.success("Financing partner saved") },
    )
    formElement.reset()
  }

  async function addRepresentative(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await mutations.addRepresentative.mutateAsync(
      {
        partnerId: String(form.get("partnerId") ?? ""),
        payload: { userId: String(form.get("userId") ?? "") },
      },
      { onSuccess: () => toast.success("Representative linked") },
    )
  }

  async function createTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const rawItems = String(form.get("items") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
    await mutations.createTemplate.mutateAsync(
      {
        partnerId: String(form.get("partnerId") ?? ""),
        name: String(form.get("name") ?? ""),
        isDefault: true,
        items: rawItems.map((label, index) => ({
          label,
          isRequired: true,
          sortOrder: index,
        })),
      },
      { onSuccess: () => toast.success("Requirement template saved") },
    )
    formElement.reset()
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
          <CardHeader>
            <CardTitle>Financing Settings</CardTitle>
            <CardDescription>
              Manage financing partners, their representatives, and the buyer
              requirement templates used when creating applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="partners" className="gap-5">
              <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-3">
                <TabsTrigger value="partners">
                  Partners
                  <Badge variant="secondary">{partners.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="representatives">
                  Representatives
                  <Badge variant="secondary">{representatives.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="templates">
                  Requirement Templates
                  <Badge variant="secondary">{templates.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="partners"
                className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
              >
                <PartnersTab
                  isLoading={isLoading}
                  partners={partners}
                  selectedPartnerId={effectiveSelectedPartnerId}
                  isSaving={mutations.createPartner.isPending}
                  errorMessage={getApiErrorMessage(mutations.createPartner.error, "")}
                  onCreatePartner={createPartner}
                  onSelectPartner={setSelectedPartnerId}
                />
              </TabsContent>

              <TabsContent
                value="representatives"
                className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
              >
                <RepresentativesTab
                  isLoading={isLoading}
                  partners={partners}
                  representatives={representatives}
                  users={usersQuery.data?.users ?? []}
                  selectedPartnerId={effectiveSelectedPartnerId}
                  isSaving={mutations.addRepresentative.isPending}
                  errorMessage={getApiErrorMessage(mutations.addRepresentative.error, "")}
                  onPartnerChange={setSelectedPartnerId}
                  onAddRepresentative={addRepresentative}
                />
              </TabsContent>

              <TabsContent
                value="templates"
                className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
              >
                <TemplatesTab
                  isLoading={isLoading}
                  templates={templates}
                  partners={partners}
                  partnerNameById={partnerNameById}
                  selectedPartnerId={effectiveSelectedPartnerId}
                  isSaving={mutations.createTemplate.isPending}
                  errorMessage={getApiErrorMessage(mutations.createTemplate.error, "")}
                  onPartnerChange={setSelectedPartnerId}
                  onCreateTemplate={createTemplate}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedAppShell>
  )
}

function PartnersTab({
  isLoading,
  partners,
  selectedPartnerId,
  isSaving,
  errorMessage,
  onCreatePartner,
  onSelectPartner,
}: {
  isLoading: boolean
  partners: FinancingPartner[]
  selectedPartnerId: string
  isSaving: boolean
  errorMessage: string
  onCreatePartner: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  onSelectPartner: (partnerId: string) => void
}) {
  return (
    <div className="animate-in fade-in-0 duration-300">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Partners Table</CardTitle>
            <CardDescription>
              Select a partner row to prefill the representative and template tabs.
            </CardDescription>
          </div>
          <PartnerDialog
            isSaving={isSaving}
            errorMessage={errorMessage}
            onCreatePartner={onCreatePartner}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SettingsTableSkeleton />
          ) : partners.length === 0 ? (
            <SettingsEmptyState
              title="No financing partners yet"
              description="Add a partner above before linking representatives or templates."
              action={
                <PartnerDialog
                  isSaving={isSaving}
                  errorMessage={errorMessage}
                  onCreatePartner={onCreatePartner}
                />
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Representatives</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow
                    key={partner.id}
                    data-state={partner.id === selectedPartnerId ? "selected" : undefined}
                    className="cursor-pointer transition-all duration-200 hover:translate-x-0.5"
                    onClick={() => onSelectPartner(partner.id)}
                  >
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>{partner.contactPerson || "—"}</TableCell>
                    <TableCell>{partner.contactNumber || "—"}</TableCell>
                    <TableCell>{partner.email || "—"}</TableCell>
                    <TableCell>{partner.representatives.length}</TableCell>
                    <TableCell>
                      <StatusBadge isActive={partner.isActive} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RepresentativesTab({
  isLoading,
  partners,
  representatives,
  users,
  selectedPartnerId,
  isSaving,
  errorMessage,
  onPartnerChange,
  onAddRepresentative,
}: {
  isLoading: boolean
  partners: FinancingPartner[]
  representatives: Array<FinancingPartnerRepresentative & { partnerName: string }>
  users: Array<{ id: string; fullName: string; roleName: string; email: string }>
  selectedPartnerId: string
  isSaving: boolean
  errorMessage: string
  onPartnerChange: (partnerId: string) => void
  onAddRepresentative: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}) {
  return (
    <div className="animate-in fade-in-0 duration-300">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Representatives Table</CardTitle>
            <CardDescription>
              Financing representatives grouped by their assigned partner.
            </CardDescription>
          </div>
          <RepresentativeDialog
            partners={partners}
            users={users}
            selectedPartnerId={selectedPartnerId}
            isSaving={isSaving}
            errorMessage={errorMessage}
            onPartnerChange={onPartnerChange}
            onAddRepresentative={onAddRepresentative}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SettingsTableSkeleton />
          ) : representatives.length === 0 ? (
            <SettingsEmptyState
              title="No representatives linked"
              description="Choose a partner and active user above to create the first representative link."
              action={
                <RepresentativeDialog
                  partners={partners}
                  users={users}
                  selectedPartnerId={selectedPartnerId}
                  isSaving={isSaving}
                  errorMessage={errorMessage}
                  onPartnerChange={onPartnerChange}
                  onAddRepresentative={onAddRepresentative}
                />
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {representatives.map((representative) => (
                  <TableRow
                    key={representative.id}
                    className="transition-colors duration-200"
                  >
                    <TableCell className="font-medium">
                      {representative.fullName}
                    </TableCell>
                    <TableCell>{representative.roleName || "—"}</TableCell>
                    <TableCell>{representative.email}</TableCell>
                    <TableCell>{representative.partnerName}</TableCell>
                    <TableCell>
                      <StatusBadge isActive={representative.isActive} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TemplatesTab({
  isLoading,
  templates,
  partners,
  partnerNameById,
  selectedPartnerId,
  isSaving,
  errorMessage,
  onPartnerChange,
  onCreateTemplate,
}: {
  isLoading: boolean
  templates: FinancingRequirementTemplate[]
  partners: FinancingPartner[]
  partnerNameById: Map<string, string>
  selectedPartnerId: string
  isSaving: boolean
  errorMessage: string
  onPartnerChange: (partnerId: string) => void
  onCreateTemplate: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}) {
  return (
    <div className="animate-in fade-in-0 duration-300">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Requirement Templates Table</CardTitle>
            <CardDescription>
              Active and inactive templates available per financing partner.
            </CardDescription>
          </div>
          <TemplateDialog
            partners={partners}
            selectedPartnerId={selectedPartnerId}
            isSaving={isSaving}
            errorMessage={errorMessage}
            onPartnerChange={onPartnerChange}
            onCreateTemplate={onCreateTemplate}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SettingsTableSkeleton />
          ) : templates.length === 0 ? (
            <SettingsEmptyState
              title="No requirement templates yet"
              description="Create a template above so applications can copy a stable checklist."
              action={
                <TemplateDialog
                  partners={partners}
                  selectedPartnerId={selectedPartnerId}
                  isSaving={isSaving}
                  errorMessage={errorMessage}
                  onPartnerChange={onPartnerChange}
                  onCreateTemplate={onCreateTemplate}
                />
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} className="transition-colors duration-200">
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{partnerNameById.get(template.partnerId) ?? "—"}</TableCell>
                    <TableCell>{template.items.length}</TableCell>
                    <TableCell>
                      {template.isDefault ? (
                        <Badge>Default</Badge>
                      ) : (
                        <Badge variant="secondary">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge isActive={template.isActive} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "secondary" : "outline"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

function PartnerDialog({
  isSaving,
  errorMessage,
  onCreatePartner,
}: {
  isSaving: boolean
  errorMessage: string
  onCreatePartner: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    await onCreatePartner(event)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Partner</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Financing Partner</DialogTitle>
          <DialogDescription>
            Create a financing partner that can be assigned to buyer loan applications.
          </DialogDescription>
        </DialogHeader>
        <ApiErrorAlert title="Unable to save partner" message={errorMessage} />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input name="name" required />
            </Field>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input name="email" type="email" />
            </Field>
            <Field>
              <FieldLabel>Contact person</FieldLabel>
              <Input name="contactPerson" />
            </Field>
            <Field>
              <FieldLabel>Contact number</FieldLabel>
              <Input name="contactNumber" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Partner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RepresentativeDialog({
  partners,
  users,
  selectedPartnerId,
  isSaving,
  errorMessage,
  onPartnerChange,
  onAddRepresentative,
}: {
  partners: FinancingPartner[]
  users: Array<{ id: string; fullName: string; roleName: string; email: string }>
  selectedPartnerId: string
  isSaving: boolean
  errorMessage: string
  onPartnerChange: (partnerId: string) => void
  onAddRepresentative: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    await onAddRepresentative(event)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={partners.length === 0}>Link Representative</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Link Financing Representative</DialogTitle>
          <DialogDescription>
            Attach an active system user to the selected financing partner.
          </DialogDescription>
        </DialogHeader>
        <ApiErrorAlert title="Unable to link representative" message={errorMessage} />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Partner</FieldLabel>
              <Select
                name="partnerId"
                value={selectedPartnerId}
                onValueChange={onPartnerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>User</FieldLabel>
              <Select name="userId">
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName} - {user.roleName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSaving || !selectedPartnerId}>
              {isSaving ? "Linking..." : "Link Representative"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TemplateDialog({
  partners,
  selectedPartnerId,
  isSaving,
  errorMessage,
  onPartnerChange,
  onCreateTemplate,
}: {
  partners: FinancingPartner[]
  selectedPartnerId: string
  isSaving: boolean
  errorMessage: string
  onPartnerChange: (partnerId: string) => void
  onCreateTemplate: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    await onCreateTemplate(event)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={partners.length === 0}>Create Template</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Requirement Template</DialogTitle>
          <DialogDescription>
            Define the buyer document checklist copied into new financing applications.
          </DialogDescription>
        </DialogHeader>
        <ApiErrorAlert title="Unable to save template" message={errorMessage} />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Field>
              <FieldLabel>Partner</FieldLabel>
              <Select
                name="partnerId"
                value={selectedPartnerId}
                onValueChange={onPartnerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Template name</FieldLabel>
              <Input name="name" required />
            </Field>
            <Field className="lg:col-span-2">
              <FieldLabel>Requirements</FieldLabel>
              <Textarea
                name="items"
                rows={8}
                placeholder={"Valid ID\nProof of billing\nCertificate of employment"}
                required
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSaving || !selectedPartnerId}>
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SettingsTableSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading settings table">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

function SettingsEmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}
