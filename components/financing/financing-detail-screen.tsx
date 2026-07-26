"use client"

import * as React from "react"
import {
  CalendarClockIcon,
  CarIcon,
  CheckCircle2Icon,
  CheckIcon,
  CircleIcon,
  ClipboardListIcon,
  Clock3Icon,
  CopyIcon,
  FileTextIcon,
  FileUpIcon,
  GavelIcon,
  LinkIcon,
  MoreVerticalIcon,
  RefreshCwIcon,
  SendIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react"
import { toast } from "@/components/ui/sileo"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
import { useFinancingApplicationQuery } from "@/hooks/queries/financing/use-financing-queries"
import { cn } from "@/lib/utils"
import { getFinancingDocumentDownloadUrl } from "@/services/financing.service"
import { getApiErrorMessage } from "@/types/api"
import type {
  FinancingApplication,
  FinancingApplicationStatus,
  FinancingRequirement,
  FinancingRequirementStatus,
} from "@/types/financing"
import { formatStatus } from "./financing-screen"

type ActivityEvent = {
  id?: string
  summary?: string
  actionType?: string
  actorDisplayName?: string | null
  createdAt?: string
}

type PreviewDocument = {
  id: string
  filename: string
  mimeType: string
  url: string
}

type ViewableDocument = {
  id: string
  originalFilename: string
  mimeType: string
}

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

export function FinancingDetailScreen({ id }: { id: string }) {
  const applicationQuery = useFinancingApplicationQuery(id)
  const mutations = useFinancingMutations()
  const [generatedToken, setGeneratedToken] = React.useState<string | null>(null)
  const [openingDocumentId, setOpeningDocumentId] = React.useState<string | null>(null)
  const [previewDocument, setPreviewDocument] =
    React.useState<PreviewDocument | null>(null)
  const application = applicationQuery.data?.application

  async function generateLink() {
    const result = await mutations.generateUploadLink.mutateAsync(id)
    setGeneratedToken(result.uploadLink.token)
    toast.success("Secure upload link generated")
  }

  async function copyGeneratedLink() {
    if (!generatedToken) return
    const url = `${window.location.origin}/financing/upload/${generatedToken}`
    await navigator.clipboard.writeText(url)
    toast.success("Secure upload link copied")
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

  async function openDocument(document: ViewableDocument) {
    setOpeningDocumentId(document.id)
    try {
      const result = await getFinancingDocumentDownloadUrl(id, document.id)
      setPreviewDocument({
        id: document.id,
        filename: document.originalFilename,
        mimeType: document.mimeType,
        url: result.downloadUrl,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to open uploaded file"))
    } finally {
      setOpeningDocumentId(null)
    }
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

  const documentHistory = buildDocumentHistory(application)
  const activity = normalizeActivity(application.activity)
  const canDecide = canDecideApplication(application)

  return (
    <AuthenticatedAppShell
      title={application.applicationNumber}
      breadcrumbs={[
        { label: "Financing", href: "/financing" },
        { label: application.applicationNumber },
      ]}
    >
      <div className="flex flex-col gap-5 bg-muted/20 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {application.applicationNumber}
          </h1>
          <ReleaseActions
            application={application}
            isRecordingLoanRelease={mutations.recordLoanRelease.isPending}
            isRecordingVehicleRelease={mutations.recordVehicleRelease.isPending}
            onRecordLoanRelease={handleLoanRelease}
            onRecordVehicleRelease={handleVehicleRelease}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <main className="flex min-w-0 flex-col gap-5">
            <ApplicationSummaryCard application={application} />
            <RequirementsChecklistCard
              requirements={application.requirements}
              reviewError={getApiErrorMessage(
                mutations.reviewRequirement.error || mutations.uploadDocument.error,
                "",
              )}
              isUploading={mutations.uploadDocument.isPending}
              onReview={reviewRequirement}
              onUpload={(requirementId, file) =>
                mutations.uploadDocument.mutate({
                  applicationId: id,
                  requirementId,
                  file,
                })
              }
              openingDocumentId={openingDocumentId}
              onOpenDocument={openDocument}
            />
            <DocumentVersionHistoryCard
              documents={documentHistory}
              openingDocumentId={openingDocumentId}
              onOpenDocument={openDocument}
            />
          </main>

          <aside className="flex min-w-0 flex-col gap-3">
            <BuyerUploadLinkCard
              activeExpiresAt={application.activeUploadLink?.expires_at ?? null}
              generatedToken={generatedToken}
              isGenerating={mutations.generateUploadLink.isPending}
              onGenerate={generateLink}
              onCopy={copyGeneratedLink}
            />
            <DecisionCard
              canDecide={canDecide}
              isPending={mutations.decideApplication.isPending}
              onApprove={() => decide("approved")}
              onReject={() => decide("rejected")}
            />
            <ActivityHistoryCard activity={activity} />
          </aside>
        </div>

        <DocumentPreviewDialog
          document={previewDocument}
          onOpenChange={(open) => {
            if (!open) setPreviewDocument(null)
          }}
        />
      </div>
    </AuthenticatedAppShell>
  )
}

function ApplicationSummaryCard({
  application,
}: {
  application: FinancingApplication
}) {
  return (
    <DetailCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileTextIcon className="text-muted-foreground" />
          Application Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem
            label="Status"
            value={<StatusBadge status={application.status} />}
          />
          <SummaryItem label="Buyer" value={application.buyer.name} />
          <SummaryItem
            label="Contact Number"
            value={application.buyer.contactNumber || "—"}
          />
          <SummaryItem label="Vehicle" value={application.vehicle.label} />
          <SummaryItem label="Stock Number" value={application.vehicle.stockNumber} />
          <SummaryItem label="Financing Partner" value={application.partner.name} />
          <SummaryItem label="Representative" value={application.representative.name} />
          <SummaryItem label="Assigned Staff" value={application.assignedStaff.name} />
          <SummaryItem
            label="Requested Amount"
            value={formatMoney(application.requestedAmount)}
          />
          <SummaryItem label="Down Payment" value={formatMoney(application.downPayment)} />
          <SummaryItem
            label="Term"
            value={application.termMonths ? `${application.termMonths} months` : "—"}
          />
        </div>
      </CardContent>
    </DetailCard>
  )
}

function RequirementsChecklistCard({
  requirements,
  reviewError,
  isUploading,
  onReview,
  onUpload,
  openingDocumentId,
  onOpenDocument,
}: {
  requirements: FinancingRequirement[]
  reviewError: string
  isUploading: boolean
  onReview: (
    requirementId: string,
    status: "accepted" | "revision_requested",
  ) => Promise<void>
  onUpload: (requirementId: string, file: File) => void
  openingDocumentId: string | null
  onOpenDocument: (document: ViewableDocument) => Promise<void>
}) {
  return (
    <DetailCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardListIcon className="text-muted-foreground" />
          Requirements Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ApiErrorAlert title="Unable to update requirement" message={reviewError} />
        <div className="overflow-hidden rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Requirement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded Files</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.map((requirement) => (
                <RequirementRow
                  key={requirement.id}
                  requirement={requirement}
                  isUploading={isUploading}
                  onReview={onReview}
                  onUpload={onUpload}
                  openingDocumentId={openingDocumentId}
                  onOpenDocument={onOpenDocument}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </DetailCard>
  )
}

function RequirementRow({
  requirement,
  isUploading,
  onReview,
  onUpload,
  openingDocumentId,
  onOpenDocument,
}: {
  requirement: FinancingRequirement
  isUploading: boolean
  onReview: (
    requirementId: string,
    status: "accepted" | "revision_requested",
  ) => Promise<void>
  onUpload: (requirementId: string, file: File) => void
  openingDocumentId: string | null
  onOpenDocument: (document: ViewableDocument) => Promise<void>
}) {
  const currentDocuments = requirement.documents.filter((document) => document.isCurrent)
  const firstDocument = currentDocuments[0] ?? requirement.documents[0]

  return (
    <TableRow className="h-14">
      <TableCell className="font-medium">{requirement.label}</TableCell>
      <TableCell>
        <RequirementStatusBadge status={requirement.status} />
      </TableCell>
      <TableCell>
        {firstDocument ? (
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => onOpenDocument(firstDocument)}
            disabled={openingDocumentId === firstDocument.id}
          >
            <FileTextIcon className="size-4" />
            <span className="font-medium text-foreground">
              {openingDocumentId === firstDocument.id
                ? "Opening..."
                : firstDocument.originalFilename}
            </span>
            {currentDocuments.length > 1 ? (
              <span>+{currentDocuments.length - 1}</span>
            ) : null}
          </button>
        ) : (
          <span className="text-sm italic text-muted-foreground">
            No file uploaded
          </span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          {requirement.status === "submitted" ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onReview(requirement.id, "accepted")}
                className="border-green-500 text-green-700 hover:bg-green-50"
              >
                <CheckIcon />
                Accept
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onReview(requirement.id, "revision_requested")}
                className="border-orange-400 text-orange-700 hover:bg-orange-50"
              >
                <RefreshCwIcon />
                Request Revision
              </Button>
            </>
          ) : requirement.status === "accepted" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => firstDocument && onOpenDocument(firstDocument)}
              disabled={!firstDocument || openingDocumentId === firstDocument.id}
            >
              {firstDocument && openingDocumentId === firstDocument.id
                ? "Opening..."
                : "View"}
            </Button>
          ) : requirement.status === "revision_requested" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-orange-400 text-orange-700"
              disabled
            >
              Needs replacement
            </Button>
          ) : (
            <Button type="button" variant="secondary" size="sm" disabled>
              Waiting
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Requirement actions">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <label className="flex cursor-pointer items-center gap-2">
                  <FileUpIcon />
                  Upload staff file
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    disabled={isUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) onUpload(requirement.id, file)
                    }}
                  />
                </label>
              </DropdownMenuItem>
              {firstDocument ? (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    void onOpenDocument(firstDocument)
                  }}
                >
                  <FileTextIcon />
                  View uploaded file
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  void onReview(requirement.id, "accepted")
                }}
              >
                <CheckIcon />
                Mark accepted
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  void onReview(requirement.id, "revision_requested")
                }}
              >
                <XIcon />
                Request revision
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function DocumentVersionHistoryCard({
  documents,
  openingDocumentId,
  onOpenDocument,
}: {
  documents: Array<{
    id: string
    filename: string
    mimeType: string
    createdAt: string
    requirementLabel: string
    isCurrent: boolean
  }>
  openingDocumentId: string | null
  onOpenDocument: (document: ViewableDocument) => Promise<void>
}) {
  return (
    <DetailCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock3Icon className="text-muted-foreground" />
          Document Version History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length ? (
          <div className="flex flex-col">
            {documents.slice(0, 6).map((document, index) => (
              <div
                key={document.id}
                className="grid grid-cols-[24px_minmax(0,1fr)_auto] gap-3 border-b py-3 last:border-b-0"
              >
                <div className="relative flex justify-center">
                  <span className="mt-1 size-3 rounded-full border-2 border-primary bg-background" />
                  {index < documents.length - 1 ? (
                    <span className="absolute top-5 bottom-[-14px] w-px bg-border" />
                  ) : null}
                </div>
                <button
                  type="button"
                  className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() =>
                    onOpenDocument({
                      id: document.id,
                      originalFilename: document.filename,
                      mimeType: document.mimeType,
                    })
                  }
                  disabled={openingDocumentId === document.id}
                >
                  <span className="font-medium text-foreground">
                    {openingDocumentId === document.id
                      ? "Opening..."
                      : document.filename}
                  </span>{" "}
                  uploaded for {document.requirementLabel}
                  {document.isCurrent ? "" : " (older version)"}
                </button>
                <p className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDateTime(document.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No document uploads yet.
          </p>
        )}
      </CardContent>
    </DetailCard>
  )
}

function BuyerUploadLinkCard({
  activeExpiresAt,
  generatedToken,
  isGenerating,
  onGenerate,
  onCopy,
}: {
  activeExpiresAt: string | null
  generatedToken: string | null
  isGenerating: boolean
  onGenerate: () => Promise<void>
  onCopy: () => Promise<void>
}) {
  return (
    <DetailCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LinkIcon className="text-primary" />
          Buyer Upload Link
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
          <Button onClick={onGenerate} disabled={isGenerating}>
            <LinkIcon />
            {isGenerating ? "Generating..." : "Generate Link"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCopy}
            disabled={!generatedToken}
          >
            <CopyIcon />
            Copy Link
          </Button>
        </div>
        {activeExpiresAt ? (
          <p className="text-center text-sm text-muted-foreground">
            Active link expires{" "}
            <span className="font-semibold text-primary">
              {formatDate(activeExpiresAt)}
            </span>
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Send this secure link to the buyer through Messenger.
        </p>
      </CardContent>
    </DetailCard>
  )
}

function DecisionCard({
  canDecide,
  isPending,
  onApprove,
  onReject,
}: {
  canDecide: boolean
  isPending: boolean
  onApprove: () => Promise<void>
  onReject: () => Promise<void>
}) {
  return (
    <DetailCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GavelIcon className="text-muted-foreground" />
          Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canDecide || isPending}
            onClick={onApprove}
          >
            <CheckCircle2Icon />
            Approve Application
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canDecide || isPending}
            onClick={onReject}
          >
            <XCircleIcon />
            Reject Application
          </Button>
        </div>
        {!canDecide ? (
          <p className="text-sm text-muted-foreground">
            Complete all requirements to enable decision actions.
          </p>
        ) : null}
      </CardContent>
    </DetailCard>
  )
}

function ReleaseActions({
  application,
  isRecordingLoanRelease,
  isRecordingVehicleRelease,
  onRecordLoanRelease,
  onRecordVehicleRelease,
}: {
  application: FinancingApplication
  isRecordingLoanRelease: boolean
  isRecordingVehicleRelease: boolean
  onRecordLoanRelease: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  onRecordVehicleRelease: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <LoanReleaseAction
        application={application}
        isPending={isRecordingLoanRelease}
        onSubmit={onRecordLoanRelease}
      />
      <VehicleReleaseAction
        application={application}
        isPending={isRecordingVehicleRelease}
        onSubmit={onRecordVehicleRelease}
      />
    </div>
  )
}

function LoanReleaseAction({
  application,
  isPending,
  onSubmit,
}: {
  application: FinancingApplication
  isPending: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    await onSubmit(event)
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={isPending || Boolean(application.loanReleasedAt)}
        >
          <SendIcon />
          Record Loan Release
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record loan release</DialogTitle>
          <DialogDescription>
            Enter the loan release details from the financing partner. This will
            move the application to loan released.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel>Released Loan Amount</FieldLabel>
              <Input name="releasedLoanAmount" placeholder="950000" required />
            </Field>
            <Field>
              <FieldLabel>Release Date</FieldLabel>
              <Input name="loanReleasedAt" type="datetime-local" required />
            </Field>
            <Field>
              <FieldLabel>Reference Number</FieldLabel>
              <Input name="loanReleaseReference" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recording..." : "Record Loan Release"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VehicleReleaseAction({
  application,
  isPending,
  onSubmit,
}: {
  application: FinancingApplication
  isPending: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    await onSubmit(event)
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={isPending || Boolean(application.vehicleReleasedAt)}
        >
          <CarIcon />
          Record Vehicle Release
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record vehicle release</DialogTitle>
          <DialogDescription>
            Add the physical vehicle release date and any handoff notes for this
            financing application.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel>Vehicle Release Date</FieldLabel>
              <Input name="vehicleReleasedAt" type="datetime-local" />
            </Field>
            <Field>
              <FieldLabel>Notes</FieldLabel>
              <Textarea name="note" rows={3} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recording..." : "Record Vehicle Release"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ActivityHistoryCard({ activity }: { activity: ActivityEvent[] }) {
  return (
    <DetailCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClockIcon className="text-primary" />
          Activity History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length ? (
          <div className="flex flex-col gap-3">
            {activity.slice(0, 5).map((event, index) => (
              <div
                key={event.id ?? `${event.summary}-${index}`}
                className="grid grid-cols-[14px_minmax(0,1fr)_auto] gap-3"
              >
                <CircleIcon className="mt-1 fill-primary text-primary" />
                <p className="text-sm text-muted-foreground">
                  {event.summary ?? event.actionType ?? "Activity recorded"}
                </p>
                <p className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDateTime(event.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No activity history yet.
          </p>
        )}
      </CardContent>
    </DetailCard>
  )
}

function DocumentPreviewDialog({
  document,
  onOpenChange,
}: {
  document: PreviewDocument | null
  onOpenChange: (open: boolean) => void
}) {
  const isImage = document?.mimeType.startsWith("image/")
  const isPdf = document?.mimeType === "application/pdf"

  return (
    <Dialog open={Boolean(document)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{document?.filename ?? "Uploaded file"}</DialogTitle>
          <DialogDescription>
            Previewing the uploaded financing requirement file inside ETC Cars.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[72vh] bg-muted/30 p-4">
          {document && isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={document.url}
              alt={document.filename}
              className="mx-auto h-full max-w-full rounded-lg object-contain"
            />
          ) : document && isPdf ? (
            <iframe
              src={document.url}
              title={document.filename}
              className="h-full w-full rounded-lg border bg-background"
            />
          ) : document ? (
            <iframe
              src={document.url}
              title={document.filename}
              className="h-full w-full rounded-lg border bg-background"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="rounded-xl border bg-background shadow-sm">
      {children}
    </Card>
  )
}

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: FinancingApplicationStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "w-fit",
        status === "collecting_requirements" &&
          "bg-orange-100 text-orange-700 hover:bg-orange-100",
        status === "under_review" &&
          "bg-blue-100 text-blue-700 hover:bg-blue-100",
        status === "approved" &&
          "bg-green-100 text-green-700 hover:bg-green-100",
        status === "needs_revision" &&
          "bg-orange-100 text-orange-700 hover:bg-orange-100",
        ["rejected", "cancelled"].includes(status) &&
          "bg-destructive/10 text-destructive hover:bg-destructive/10",
      )}
    >
      {formatStatus(status)}
    </Badge>
  )
}

function RequirementStatusBadge({
  status,
}: {
  status: FinancingRequirementStatus
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "w-fit",
        status === "accepted" && "bg-green-100 text-green-700 hover:bg-green-100",
        status === "submitted" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
        status === "pending" && "bg-muted text-muted-foreground hover:bg-muted",
        status === "revision_requested" &&
          "bg-orange-100 text-orange-700 hover:bg-orange-100",
      )}
    >
      {formatStatus(status)}
    </Badge>
  )
}

function buildDocumentHistory(application: FinancingApplication) {
  return application.requirements
    .flatMap((requirement) =>
      requirement.documents.map((document) => ({
        id: document.id,
        filename: document.originalFilename,
        mimeType: document.mimeType,
        createdAt: document.createdAt,
        requirementLabel: requirement.label,
        isCurrent: document.isCurrent,
      })),
    )
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
}

function normalizeActivity(activity: unknown): ActivityEvent[] {
  if (!Array.isArray(activity)) {
    return []
  }

  return activity
    .filter((event): event is Record<string, unknown> => Boolean(event))
    .map((event) => ({
      id: typeof event.id === "string" ? event.id : undefined,
      summary: typeof event.summary === "string" ? event.summary : undefined,
      actionType:
        typeof event.actionType === "string" ? event.actionType : undefined,
      actorDisplayName:
        typeof event.actorDisplayName === "string"
          ? event.actorDisplayName
          : null,
      createdAt: typeof event.createdAt === "string" ? event.createdAt : undefined,
    }))
}

function canDecideApplication(application: FinancingApplication) {
  return (
    application.status === "under_review" &&
    application.requirementProgress.total > 0 &&
    application.requirementProgress.accepted === application.requirementProgress.total
  )
}

function formatMoney(value: string | null) {
  if (!value) return "—"
  const amount = Number(value)
  if (Number.isNaN(amount)) return value
  return pesoFormatter.format(amount)
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}
