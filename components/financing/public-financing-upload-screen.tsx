"use client"

import * as React from "react"
import { CheckCircleIcon, FileUpIcon, SendIcon } from "lucide-react"
import { toast } from "@/components/ui/sileo"

import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  submitPublicFinancingRequirements,
  uploadPublicFinancingRequirementDocument,
  verifyPublicFinancingUpload,
} from "@/services/financing.service"
import { getApiErrorMessage } from "@/types/api"
import type { PublicFinancingApplication } from "@/types/financing"
import { formatStatus } from "./financing-screen"

export function PublicFinancingUploadScreen({ token }: { token: string }) {
  const [contactNumber, setContactNumber] = React.useState("")
  const [sessionToken, setSessionToken] = React.useState<string | null>(null)
  const [application, setApplication] =
    React.useState<PublicFinancingApplication | null>(null)
  const [error, setError] = React.useState<unknown>(null)
  const [pending, setPending] = React.useState(false)

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const result = await verifyPublicFinancingUpload(token, contactNumber)
      setSessionToken(result.sessionToken)
      setApplication(result.application)
    } catch (caught) {
      setError(caught)
    } finally {
      setPending(false)
    }
  }

  async function upload(requirementId: string, file: File) {
    if (!sessionToken) return
    setPending(true)
    setError(null)
    try {
      const result = await uploadPublicFinancingRequirementDocument(
        token,
        sessionToken,
        requirementId,
        file,
      )
      setApplication(result.application)
      toast.success("Document uploaded")
    } catch (caught) {
      setError(caught)
    } finally {
      setPending(false)
    }
  }

  async function submit() {
    if (!sessionToken) return
    setPending(true)
    setError(null)
    try {
      const result = await submitPublicFinancingRequirements(token, sessionToken)
      setApplication(result.application)
      toast.success("Requirements submitted")
    } catch (caught) {
      setError(caught)
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-svh bg-muted/30 px-4 py-6 md:py-10">
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            ETC Cars Financing Requirements
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload PDF, JPG, PNG, or WEBP files up to 10 MB each.
          </p>
        </div>

        <ApiErrorAlert
          title="Unable to continue"
          message={getApiErrorMessage(error, "")}
        />

        {!sessionToken || !application ? (
          <Card>
            <CardHeader>
              <CardTitle>Verify Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={verify} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="contactNumber">
                    Buyer contact number
                  </FieldLabel>
                  <Input
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(event) => setContactNumber(event.target.value)}
                    placeholder="0917 123 4567"
                    required
                  />
                </Field>
                <Button type="submit" disabled={pending}>
                  Verify
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{application.applicationNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Status: {formatStatus(application.status)}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {application.requirements.map((requirement) => {
                const disabled =
                  requirement.status === "accepted" ||
                  application.status === "under_review" ||
                  application.status === "approved" ||
                  application.status === "loan_released" ||
                  application.status === "vehicle_released"

                return (
                  <Card key={requirement.id}>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{requirement.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatStatus(requirement.status)}
                          </p>
                        </div>
                        {requirement.status === "accepted" ? (
                          <CheckCircleIcon className="size-5 text-emerald-600" />
                        ) : null}
                      </div>
                      {requirement.revisionReason ? (
                        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          {requirement.revisionReason}
                        </p>
                      ) : null}
                      {requirement.documents.length ? (
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {requirement.documents.map((document) => (
                            <li key={document.id}>
                              {document.originalFilename}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-50">
                        <FileUpIcon className="size-4" />
                        Upload file
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,image/jpeg,image/png,image/webp"
                          disabled={disabled || pending}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) void upload(requirement.id, file)
                          }}
                        />
                      </label>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Button className="w-full" onClick={submit} disabled={pending}>
              <SendIcon />
              Submit Requirements
            </Button>
          </>
        )}
      </div>
    </main>
  )
}
