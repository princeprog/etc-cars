"use client"

import * as React from "react"
import { toast } from "@/components/ui/sileo"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useFinancingMutations } from "@/hooks/mutations/financing/use-financing-mutations"
import {
  useFinancingPartnersQuery,
  useFinancingTemplatesQuery,
} from "@/hooks/queries/financing/use-financing-queries"
import { useUsersQuery } from "@/hooks/queries/auth/use-users-query"
import { getApiErrorMessage } from "@/types/api"

export function FinancingSettingsScreen() {
  const partnersQuery = useFinancingPartnersQuery()
  const templatesQuery = useFinancingTemplatesQuery()
  const usersQuery = useUsersQuery({ page: 1, pageSize: 100, status: "active" })
  const mutations = useFinancingMutations()
  const [selectedPartnerId, setSelectedPartnerId] = React.useState("")

  async function createPartner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await mutations.createPartner.mutateAsync(
      {
        name: String(form.get("name") ?? ""),
        contactPerson: String(form.get("contactPerson") ?? "") || null,
        contactNumber: String(form.get("contactNumber") ?? "") || null,
        email: String(form.get("email") ?? "") || null,
      },
      { onSuccess: () => toast.success("Financing partner saved") },
    )
    event.currentTarget.reset()
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
    const form = new FormData(event.currentTarget)
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
    event.currentTarget.reset()
  }

  const partners = partnersQuery.data?.partners ?? []
  const templates = templatesQuery.data?.templates ?? []

  return (
    <AuthenticatedAppShell
      title="Financing Settings"
      breadcrumbs={[
        { label: "Financing", href: "/financing" },
        { label: "Settings" },
      ]}
    >
      <div className="grid gap-5 p-4 md:p-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Partners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ApiErrorAlert
              title="Unable to save partner"
              message={getApiErrorMessage(mutations.createPartner.error, "")}
            />
            <form onSubmit={createPartner} className="space-y-3">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input name="name" required />
              </Field>
              <Field>
                <FieldLabel>Contact person</FieldLabel>
                <Input name="contactPerson" />
              </Field>
              <Field>
                <FieldLabel>Contact number</FieldLabel>
                <Input name="contactNumber" />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input name="email" type="email" />
              </Field>
              <Button type="submit">Save Partner</Button>
            </form>
            <div className="space-y-2">
              {partners.map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  onClick={() => setSelectedPartnerId(partner.id)}
                  className="w-full rounded-md border px-3 py-2 text-left text-sm"
                >
                  {partner.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Representatives</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addRepresentative} className="space-y-3">
              <Field>
                <FieldLabel>Partner</FieldLabel>
                <Select name="partnerId" defaultValue={selectedPartnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
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
                    {(usersQuery.data?.users ?? []).map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName} - {user.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Button type="submit">Link Representative</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirement Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={createTemplate} className="space-y-3">
              <FieldGroup>
                <Field>
                  <FieldLabel>Partner</FieldLabel>
                  <Select name="partnerId" defaultValue={selectedPartnerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Template name</FieldLabel>
                  <Input name="name" required />
                </Field>
                <Field>
                  <FieldLabel>Requirements</FieldLabel>
                  <Textarea
                    name="items"
                    rows={8}
                    placeholder={"Valid ID\nProof of billing\nCertificate of employment"}
                    required
                  />
                </Field>
              </FieldGroup>
              <Button type="submit">Save Template</Button>
            </form>
            <div className="space-y-2 text-sm">
              {templates.map((template) => (
                <div key={template.id} className="rounded-md border p-3">
                  <p className="font-medium">{template.name}</p>
                  <p className="text-muted-foreground">
                    {template.items.length} requirements
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedAppShell>
  )
}
