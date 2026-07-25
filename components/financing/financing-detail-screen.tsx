"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CheckIcon,
  FileUpIcon,
  LinkIcon,
  SendIcon,
  XIcon,
} from "lucide-react"
import { toast } from "@/components/ui/sileo"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFinancingMutations } from "@/hooks/mutations/financing/use-financing-mutations"
import { useFinancingApplicationQuery } from "@/hooks/queries/financing/use-financing-queries"
import { getApiErrorMessage } from "@/types/api"
import { CopyUploadLinkButton, formatStatus } from "./financing-screen"

export function FinancingDetailScreen({ id }: { id: string }) {
  const router = useRouter()
  const applicationQuery = useFinancingApplicationQuery(id)
  const mutations = useFinancingMutations()
  const [generatedToken, setGeneratedToken] = React.useState<string | null>(null)
  const application = applicationQuery.data?.application

  async function generateLink() {
    const result = await mutations.generateUploadLink.mutateAsync(id)
    setGeneratedToken(result.uploadLink.token)
  }

  async function reviewRequirement(
    requirementId: string,
    status: "accepted" | "revision_requested",
  ) {
    const revisionReason =
      status === "revision_requested"
        ? window.prompt("Revision reason")
        : undefined
    await mutations.reviewRequirement.mutateAsync(
      {
        applicationId: id,
        requirementId,
        payload: { status, revisionReason },
      },
      { onSuccess: () => toast.success("Requirement updated") },
    )
  }

  async function decide(decision: "approved" | "rejected") {
    const note =
      decision === "rejected" ? window.prompt("Rejection reason") : undefined
    await mutations.decideApplication.mutateAsync(
      { id, payload: { decision, note } },
      { onSuccess: () => toast.success(`Application ${decision}`) },
    )
  }

  async function handleLoanRelease(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await mutations.recordLoanRelease.mutateAsync(
      {
        id,
        payload: {
          releasedLoanAmount: String(form.get("releasedLoanAmount") ?? ""),
          loanReleasedAt: String(form.get("loanReleasedAt") ?? ""),
          loanReleaseReference:
            String(form.get("loanReleaseReference") ?? "") || null,
        },
      },
      { onSuccess: () => toast.success("Loan release recorded") },
    )
  }

  async function handleVehicleRelease(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await mutations.recordVehicleRelease.mutateAsync(
      {
        id,
        payload: {
          vehicleReleasedAt: String(form.get("vehicleReleasedAt") ?? "") || null,
          note: String(form.get("note") ?? "") || null,
        },
      },
      { onSuccess: () => toast.success("Vehicle release recorded") },
    )
  }

  if (applicationQuery.isPending) {
    return (
      <AuthenticatedAppShell title="Financing">
        <ModuleLoadingState label="Loading financing application..." />
      </AuthenticatedAppShell>
    )
  }

  if (!application) {
    return (
      <AuthenticatedAppShell title="Financing">
        <div className="p-6">
          <ApiErrorAlert
            title="Unable to load financing application"
            message={getApiErrorMessage(applicationQuery.error, "")}
          />
        </div>
      </AuthenticatedAppShell>
    )
  }

  return (
    <AuthenticatedAppShell
      title={application.applicationNumber}
      breadcrumbs={[
        { label: "Financing", href: "/financing" },
        { label: application.applicationNumber },
      ]}
    >
      <div className="space-y-5 p-4 md:p-6">
        <Button variant="ghost" onClick={() => router.push("/financing")}>
          <ArrowLeftIcon />
          Back
        </Button>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Summary label="Status" value={formatStatus(application.status)} />
                <Summary label="Buyer" value={application.buyer.name} />
                <Summary label="Vehicle" value={application.vehicle.label} />
                <Summary label="Partner" value={application.partner.name} />
                <Summary
                  label="Representative"
                  value={application.representative.name}
                />
                <Summary
                  label="Assigned staff"
                  value={application.assignedStaff.name}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ApiErrorAlert
                  title="Unable to update requirement"
                  message={getApiErrorMessage(
                    mutations.reviewRequirement.error ||
                      mutations.uploadDocument.error,
                    "",
                  )}
                />
                {application.requirements.map((requirement) => (
                  <div
                    key={requirement.id}
                    className="rounded-md border p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium">{requirement.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatStatus(requirement.status)}
                        </p>
                        {requirement.revisionReason ? (
                          <p className="mt-2 text-sm text-amber-700">
                            {requirement.revisionReason}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            reviewRequirement(requirement.id, "accepted")
                          }
                        >
                          <CheckIcon />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            reviewRequirement(
                              requirement.id,
                              "revision_requested",
                            )
                          }
                        >
                          <XIcon />
                          Revision
                        </Button>
                        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm">
                          <FileUpIcon className="size-4" />
                          Upload
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,image/jpeg,image/png,image/webp"
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (file) {
                                mutations.uploadDocument.mutate({
                                  applicationId: id,
                                  requirementId: requirement.id,
                                  file,
                                })
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    {requirement.documents.length ? (
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {requirement.documents.map((document) => (
                          <li key={document.id}>
                            {document.originalFilename}{" "}
                            {document.isCurrent ? "(current)" : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Upload Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={generateLink} className="w-full">
                  <LinkIcon />
                  Generate Link
                </Button>
                {generatedToken ? <CopyUploadLinkButton token={generatedToken} /> : null}
                {application.activeUploadLink ? (
                  <p className="text-xs text-muted-foreground">
                    Active link expires {application.activeUploadLink.expires_at}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decision</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button onClick={() => decide("approved")} variant="outline">
                  <CheckIcon />
                  Approve
                </Button>
                <Button onClick={() => decide("rejected")} variant="outline">
                  <XIcon />
                  Reject
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Release</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoanRelease} className="space-y-3">
                  <Field>
                    <FieldLabel>Released amount</FieldLabel>
                    <Input name="releasedLoanAmount" required />
                  </Field>
                  <Field>
                    <FieldLabel>Released at</FieldLabel>
                    <Input name="loanReleasedAt" type="datetime-local" required />
                  </Field>
                  <Field>
                    <FieldLabel>Reference</FieldLabel>
                    <Input name="loanReleaseReference" />
                  </Field>
                  <Button type="submit" className="w-full">
                    <SendIcon />
                    Record Loan
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Release</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVehicleRelease} className="space-y-3">
                  <Field>
                    <FieldLabel>Released at</FieldLabel>
                    <Input name="vehicleReleasedAt" type="datetime-local" />
                  </Field>
                  <Field>
                    <FieldLabel>Note</FieldLabel>
                    <Textarea name="note" rows={3} />
                  </Field>
                  <Button type="submit" className="w-full">
                    Record Vehicle Release
                  </Button>
                </form>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AuthenticatedAppShell>
  )
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}
