"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangleIcon,
  CalendarPlusIcon,
  CarFrontIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  Clock3Icon,
  EyeIcon,
  FileTextIcon,
  FlagIcon,
  FunnelIcon,
  HeartIcon,
  MailIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  ReceiptTextIcon,
  SearchIcon,
  TargetIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ListPagination } from "@/components/operations/list-pagination";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { SubmitButton } from "@/components/operations/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhilippinePhoneInput } from "@/components/ui/philippine-phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useCreateBuyerLeadMutation } from "@/hooks/mutations/buyer-leads/use-create-buyer-lead-mutation";
import { useUpdateBuyerLeadMutation } from "@/hooks/mutations/buyer-leads/use-update-buyer-lead-mutation";
import { useCreateFollowUpMutation } from "@/hooks/mutations/follow-ups/use-create-follow-up-mutation";
import { useActivityHistoryQuery } from "@/hooks/queries/activity-history/use-activity-history-query";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { useBuyerLeadsQuery } from "@/hooks/queries/buyer-leads/use-buyer-leads-query";
import {
  formatPhilippineMobileNumberInput,
  getPhilippineMobileNumberError,
  PHILIPPINE_MOBILE_NUMBER_PREFIX,
} from "@/lib/philippine-phone";
import { getApiErrorMessage } from "@/types/api";
import {
  BUYER_LEAD_STATUSES,
  type BuyerLead,
  type BuyerLeadListFilters,
  type BuyerLeadStatus,
  type CreateBuyerLeadPayload,
  type UpdateBuyerLeadPayload,
} from "@/types/buyer-leads";
import type { ActivityHistoryEvent } from "@/types/activity-history";
import { formatVehicleMoney } from "../vehicles/vehicles.helpers";

const BUYER_LEAD_INQUIRY_SOURCES = [
  "Facebook Marketplace",
  "Facebook Page",
  "Website",
  "Walk-in",
  "Referral",
  "Phone Call",
  "SMS / Viber",
  "WhatsApp",
  "Car Listing Platform",
  "Existing Customer",
  "Other",
] as const;

type BuyerLeadFormValues = {
  buyerName: string;
  contactNumber: string;
  email: string;
  facebookName: string;
  inquirySource: string;
  desiredBudget: string;
  notes: string;
  status: BuyerLeadStatus;
};

type BuyerLeadFormErrors = {
  contactNumber?: string;
};

type BuyerLeadNextActionCta = {
  label: string;
  helper: string;
  action: "edit" | "view" | "follow-up" | "sale";
};

function getEmptyBuyerLeadFormValues(): BuyerLeadFormValues {
  return {
    buyerName: "",
    contactNumber: PHILIPPINE_MOBILE_NUMBER_PREFIX,
    email: "",
    facebookName: "",
    inquirySource: "",
    desiredBudget: "",
    notes: "",
    status: "New Inquiry",
  };
}

function getBuyerLeadFormValues(lead: BuyerLead): BuyerLeadFormValues {
  return {
    buyerName: lead.buyerName,
    contactNumber: formatPhilippineMobileNumberInput(lead.contactNumber),
    email: lead.email ?? "",
    facebookName: lead.facebookName ?? "",
    inquirySource: lead.inquirySource ?? "",
    desiredBudget: lead.desiredBudget ?? "",
    notes: lead.notes ?? "",
    status: lead.status,
  };
}

function parseBuyerLeadPayload(
  values: BuyerLeadFormValues,
  assigneeUserId: string | null,
): CreateBuyerLeadPayload {
  return {
    buyerName: values.buyerName,
    contactNumber: values.contactNumber,
    email: values.email || null,
    facebookName: values.facebookName || null,
    inquirySource: values.inquirySource || null,
    desiredBudget: values.desiredBudget || null,
    notes: values.notes || null,
    status: values.status,
    assigneeUserId,
  };
}

function parseUpdateBuyerLeadPayload(
  values: BuyerLeadFormValues,
): UpdateBuyerLeadPayload {
  return {
    buyerName: values.buyerName,
    contactNumber: values.contactNumber,
    email: values.email || null,
    facebookName: values.facebookName || null,
    inquirySource: values.inquirySource || null,
    desiredBudget: values.desiredBudget || null,
    notes: values.notes || null,
    status: values.status,
  };
}

function getBuyerLeadFormErrors(
  values: BuyerLeadFormValues,
): BuyerLeadFormErrors {
  return {
    contactNumber:
      getPhilippineMobileNumberError(values.contactNumber) ?? undefined,
  };
}

function hasBuyerLeadFormErrors(errors: BuyerLeadFormErrors) {
  return Boolean(errors.contactNumber);
}

function getInquirySourceOptions(currentValue: string) {
  if (
    !currentValue ||
    BUYER_LEAD_INQUIRY_SOURCES.some((source) => source === currentValue)
  ) {
    return BUYER_LEAD_INQUIRY_SOURCES;
  }

  return [currentValue, ...BUYER_LEAD_INQUIRY_SOURCES];
}

function getBuyerLeadStatusBadgeVariant(
  status: BuyerLeadStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Won":
      return "secondary";
    case "Lost":
      return "destructive";
    default:
      return "outline";
  }
}

function getBuyerLeadStatusClassName(status: BuyerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";
    case "Contacted":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300";
    case "Interested":
      return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300";
    case "Negotiating":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    case "Reserved":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300";
    case "Won":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "Lost":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300";
    default:
      return "";
  }
}

function getBuyerLeadStatusTextClassName(status: BuyerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "text-sky-700 dark:text-sky-300";
    case "Contacted":
      return "text-slate-700 dark:text-slate-300";
    case "Interested":
      return "text-indigo-700 dark:text-indigo-300";
    case "Negotiating":
      return "text-amber-700 dark:text-amber-300";
    case "Reserved":
      return "text-orange-700 dark:text-orange-300";
    case "Won":
      return "text-emerald-700 dark:text-emerald-300";
    case "Lost":
      return "text-rose-700 dark:text-rose-300";
    default:
      return "";
  }
}

function getAssigneeLabel(
  assigneeUserId: string | null,
  currentUserId?: string,
) {
  if (!assigneeUserId) {
    return "Unassigned";
  }

  if (assigneeUserId === currentUserId) {
    return "You";
  }

  return "Assigned";
}

function getBuyerLeadStage(status: BuyerLeadStatus) {
  switch (status) {
    case "New Inquiry":
      return "Intake";
    case "Contacted":
      return "First Contact";
    case "Interested":
      return "Qualified Demand";
    case "Negotiating":
      return "Active Deal";
    case "Reserved":
      return "Reserved Unit";
    case "Won":
      return "Closed Won";
    case "Lost":
      return "Closed Lost";
    default:
      return "Pipeline";
  }
}

function getBuyerLeadNextAction(lead: BuyerLead) {
  if (lead.pipeline?.nextAction) {
    return lead.pipeline.nextAction.label;
  }

  if (lead.status === "Won" || lead.status === "Lost") {
    return "No immediate action";
  }

  if (lead.status === "New Inquiry") {
    return "Make first contact";
  }

  if (lead.status === "Contacted") {
    return "Qualify budget and preferences";
  }

  if (lead.status === "Interested") {
    return "Schedule follow-up and confirm buyer requirements";
  }

  if (lead.status === "Negotiating") {
    return "Confirm terms and reserve unit";
  }

  if (lead.status === "Reserved") {
    return "Finalize sale workflow";
  }

  return "Review lead status";
}

function getBuyerLeadNextActionCta(lead: BuyerLead): BuyerLeadNextActionCta {
  if (lead.pipeline?.nextAction) {
    if (lead.pipeline.nextAction.target === "follow_up") {
      return {
        label: "Schedule Follow-Up",
        helper: "Create a dated task so the next contact is clear.",
        action: "follow-up" as const,
      };
    }

    if (lead.pipeline.nextAction.target === "lead_edit") {
      return {
        label: "Update Lead",
        helper: lead.pipeline.nextAction.description,
        action: "edit" as const,
      };
    }

    if (lead.pipeline.nextAction.target === "sale_finalization") {
      return {
        label: "Finalize Sale",
        helper: lead.pipeline.nextAction.description,
        action: "sale" as const,
      };
    }

    return {
      label: "Open Lead",
      helper: lead.pipeline.nextAction.description,
      action: "view" as const,
    };
  }

  if (lead.status === "Won" || lead.status === "Lost") {
    return {
      label: "View Details",
      helper: "Review the completed lead record.",
      action: "view" as const,
    };
  }

  if (lead.status === "New Inquiry" || lead.status === "Contacted") {
    return {
      label: "Update Lead",
      helper: "Capture contact progress and buyer details.",
      action: "edit" as const,
    };
  }

  if (lead.status === "Reserved") {
    return {
      label: "Finalize Workflow",
      helper: "Review the record before closing the sale.",
      action: "view" as const,
    };
  }

  return {
    label: "Open Lead",
    helper: "Review status, notes, and buyer details.",
    action: "view" as const,
  };
}

function BuyerLeadNextActionIcon({
  action,
}: {
  action: BuyerLeadNextActionCta["action"];
}) {
  if (action === "follow-up") return <CalendarPlusIcon />;
  if (action === "edit") return <PencilIcon />;
  if (action === "sale") return <ReceiptTextIcon />;
  return <EyeIcon />;
}

function getDefaultFollowUpDueAt() {
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 1);
  dueAt.setHours(9, 0, 0, 0);
  return dueAt;
}

function getDefaultBuyerFollowUpNote(lead: BuyerLead) {
  return `Follow up with ${lead.buyerName} about their buyer lead.`;
}

function isBuyerLeadStale(lead: BuyerLead) {
  if (typeof lead.pipeline?.isStale === "boolean") {
    return lead.pipeline.isStale;
  }

  const activityAt = lead.latestActivityAt ?? lead.updatedAt;
  const ageMs = Date.now() - new Date(activityAt).getTime();
  const staleDays = lead.status === "New Inquiry" ? 2 : 5;
  return (
    ageMs > staleDays * 24 * 60 * 60 * 1000 &&
    lead.status !== "Won" &&
    lead.status !== "Lost"
  );
}
function getBuyerLeadBlocker(lead: BuyerLead) {
  if (lead.pipeline?.blockers.length) {
    return lead.pipeline.blockers[0]?.description ?? null;
  }

  if (lead.status === "New Inquiry") {
    return "The inquiry has not been contacted yet.";
  }

  if (lead.status === "Reserved") {
    return "The reserved unit still needs to be finalized into a sale.";
  }

  return null;
}

function getBuyerLeadWarning(lead: BuyerLead) {
  if (lead.pipeline?.warnings.length) {
    return lead.pipeline.warnings[0]?.description ?? null;
  }

  if (isBuyerLeadStale(lead)) {
    return "This lead has gone stale and needs attention before it drops further.";
  }

  if (lead.status === "Negotiating") {
    return "Negotiation is active. Keep follow-ups tight so the buyer does not cool off.";
  }

  return null;
}

function BuyerLeadForm({
  values,
  onChange,
  errors,
  onErrorsChange,
}: {
  values: BuyerLeadFormValues;
  onChange: (values: BuyerLeadFormValues) => void;
  errors?: BuyerLeadFormErrors;
  onErrorsChange?: (errors: BuyerLeadFormErrors) => void;
}) {
  const [selectPortalContainer, setSelectPortalContainer] =
    React.useState<HTMLDivElement | null>(null);
  const contactNumberError = errors?.contactNumber;

  function updateField<K extends keyof BuyerLeadFormValues>(
    key: K,
    value: BuyerLeadFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  function updateContactNumber(value: string) {
    const nextValues = {
      ...values,
      contactNumber: formatPhilippineMobileNumberInput(value),
    };

    onChange(nextValues);

    if (contactNumberError) {
      onErrorsChange?.(getBuyerLeadFormErrors(nextValues));
    }
  }

  function validateContactNumber() {
    onErrorsChange?.(getBuyerLeadFormErrors(values));
  }

  return (
    <FieldGroup ref={setSelectPortalContainer} className="gap-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Buyer Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Capture the core contact information for the buyer inquiry.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="buyerName">Buyer name</FieldLabel>
            <Input
              id="buyerName"
              value={values.buyerName}
              onChange={(e) => updateField("buyerName", e.target.value)}
              placeholder="Maria Santos"
              required
            />
          </Field>
          <Field data-invalid={Boolean(contactNumberError)}>
            <FieldLabel htmlFor="buyerContactNumber">Contact number</FieldLabel>
            <PhilippinePhoneInput
              id="buyerContactNumber"
              value={values.contactNumber}
              onChange={updateContactNumber}
              onBlur={validateContactNumber}
              aria-invalid={Boolean(contactNumberError)}
              aria-describedby={
                contactNumberError ? "buyerContactNumberError" : undefined
              }
              required
            />
            <FieldError id="buyerContactNumberError">
              {contactNumberError}
            </FieldError>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="buyerEmail">Email</FieldLabel>
            <Input
              id="buyerEmail"
              type="email"
              value={values.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="buyer@example.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="buyerFacebookName">Facebook name</FieldLabel>
            <Input
              id="buyerFacebookName"
              value={values.facebookName}
              onChange={(e) => updateField("facebookName", e.target.value)}
              placeholder="Maria Santos FB"
            />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Buyer Intent
          </h3>
          <p className="text-sm text-muted-foreground">
            Capture buying context so the team can match this lead with the
            right inventory.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldTitle id="buyerInquirySourceLabel">Inquiry source</FieldTitle>
            <Select
              value={values.inquirySource}
              onValueChange={(value) => updateField("inquirySource", value)}
            >
              <SelectTrigger
                id="buyerInquirySource"
                aria-labelledby="buyerInquirySourceLabel buyerInquirySource"
              >
                <SelectValue placeholder="Select inquiry source" />
              </SelectTrigger>
              <SelectContent portalContainer={selectPortalContainer}>
                {getInquirySourceOptions(values.inquirySource).map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="desiredBudget">Desired budget</FieldLabel>
            <Input
              id="desiredBudget"
              value={values.desiredBudget}
              onChange={(e) => updateField("desiredBudget", e.target.value)}
              placeholder="850000"
            />
          </Field>
        </div>
        <Field>
          <FieldTitle id="buyerStatusLabel">Status</FieldTitle>
          <Select
            value={values.status}
            onValueChange={(value) =>
              updateField("status", value as BuyerLeadStatus)
            }
          >
            <SelectTrigger
              id="buyerStatus"
              aria-labelledby="buyerStatusLabel buyerStatus"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent portalContainer={selectPortalContainer}>
              {BUYER_LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="buyerNotes">Notes</FieldLabel>
          <Textarea
            id="buyerNotes"
            rows={5}
            value={values.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Buyer prefers an automatic SUV, open to financing, and wants units available for viewing this week."
          />
        </Field>
      </section>
    </FieldGroup>
  );
}

export function BuyerLeadsScreen() {
  const router = useRouter();
  const authQuery = useAuthenticatedUserQuery();
  const createMutation = useCreateBuyerLeadMutation();
  const updateMutation = useUpdateBuyerLeadMutation();
  const createFollowUpMutation = useCreateFollowUpMutation();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<
    BuyerLeadStatus | "all"
  >("all");
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [viewLead, setViewLead] = React.useState<BuyerLead | null>(null);
  const [editLead, setEditLead] = React.useState<BuyerLead | null>(null);
  const [followUpLead, setFollowUpLead] = React.useState<BuyerLead | null>(
    null,
  );
  const [createForm, setCreateForm] = React.useState<BuyerLeadFormValues>(
    getEmptyBuyerLeadFormValues,
  );
  const [createFormErrors, setCreateFormErrors] =
    React.useState<BuyerLeadFormErrors>({});

  const filters = React.useMemo<BuyerLeadListFilters>(
    () => ({
      page,
      pageSize: 10,
      search: searchTerm.trim() || undefined,
      status: activeFilter,
    }),
    [activeFilter, page, searchTerm],
  );
  const buyerLeadsQuery = useBuyerLeadsQuery(filters);

  const currentUserId = authQuery.data?.user.id;
  const leads = buyerLeadsQuery.data?.buyerLeads ?? [];
  const total = buyerLeadsQuery.data?.total ?? 0;
  const totalPages = buyerLeadsQuery.data?.totalPages ?? 1;

  function handleNextActionClick(lead: BuyerLead) {
    const cta = getBuyerLeadNextActionCta(lead);

    if (cta.action === "edit") {
      setEditLead(lead);
      return;
    }

    if (cta.action === "follow-up") {
      setFollowUpLead(lead);
      return;
    }

    if (cta.action === "sale") {
      router.push(
        `/sales?action=finalize-sale&buyerLeadId=${encodeURIComponent(lead.id)}`,
      );
      return;
    }

    setViewLead(lead);
  }

  async function handleStatusChange(
    lead: BuyerLead,
    nextStatus: BuyerLeadStatus,
  ) {
    if (lead.status === nextStatus) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: lead.id,
        payload: {
          status: nextStatus,
        },
      });

      toast.success(`Buyer lead moved to ${nextStatus}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update buyer lead status"),
      );
    }
  }

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = getBuyerLeadFormErrors(createForm);
    setCreateFormErrors(nextErrors);

    if (hasBuyerLeadFormErrors(nextErrors)) {
      return;
    }

    await createMutation.mutateAsync(
      parseBuyerLeadPayload(createForm, currentUserId ?? null),
      {
        onSuccess: () => {
          toast.success("Buyer lead created");
          setCreateOpen(false);
          setCreateForm(getEmptyBuyerLeadFormValues());
          setCreateFormErrors({});
        },
      },
    );
  }

  return (
    <AuthenticatedAppShell title="Buyer Leads">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Buyer Leads
              </h2>
              <p className="text-sm text-muted-foreground">
                Track buyer demand, review contact context, and manage follow-up
                work from one table-first workspace.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Add Buyer Lead
            </Button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search buyer, contact, or budget"
                  className="pl-9"
                />
              </div>
              <Select
                value={activeFilter}
                onValueChange={(value) => {
                  setActiveFilter(value as BuyerLeadStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buyer Leads</SelectItem>
                  {BUYER_LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {leads.length} of {total} buyer leads
            </p>
          </div>
        </section>

        <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
          <CardContent className="p-0">
            {buyerLeadsQuery.isPending ? (
              <div className="p-6">
                <ModuleLoadingState label="Loading buyer leads" />
              </div>
            ) : buyerLeadsQuery.error ? (
              <div className="p-6">
                <ApiErrorAlert
                  title="Unable to load buyer leads"
                  message={getApiErrorMessage(buyerLeadsQuery.error, "")}
                />
              </div>
            ) : leads.length ? (
              <Table className="min-w-[940px] border-collapse">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Buyer
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Contact
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Budget
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Stage
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Next Action
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Assignee
                    </TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                      Updated
                    </TableHead>
                    <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const cta = getBuyerLeadNextActionCta(lead);

                    return (
                      <TableRow
                        key={lead.id}
                        className={
                          isBuyerLeadStale(lead)
                            ? "bg-amber-50/60 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
                            : "hover:bg-muted/15"
                        }
                      >
                        <TableCell className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {lead.buyerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {lead.email ??
                                lead.facebookName ??
                                "No secondary contact"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                          {lead.contactNumber}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium tabular-nums text-foreground">
                          {formatVehicleMoney(lead.desiredBudget)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant={getBuyerLeadStatusBadgeVariant(
                              lead.status,
                            )}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getBuyerLeadStatusClassName(lead.status)}`}
                          >
                            {lead.pipeline?.stageLabel ??
                              getBuyerLeadStage(lead.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Button
                            type="button"
                            variant={
                              cta.action === "follow-up" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleNextActionClick(lead)}
                          >
                            <BuyerLeadNextActionIcon action={cta.action} />
                            {cta.label}
                          </Button>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                          {getAssigneeLabel(lead.assigneeUserId, currentUserId)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {formatDistanceToNow(new Date(lead.updatedAt), {
                                addSuffix: true,
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(lead.updatedAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${lead.buyerName}`}
                              >
                                <MoreHorizontalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>
                                Lead actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => setViewLead(lead)}
                              >
                                <EyeIcon />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditLead(lead)}
                              >
                                <PencilIcon />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setFollowUpLead(lead)}
                              >
                                <CalendarPlusIcon />
                                Schedule Follow-Up
                              </DropdownMenuItem>
                              {cta.action === "sale" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/sales?action=finalize-sale&buyerLeadId=${encodeURIComponent(lead.id)}`,
                                    )
                                  }
                                >
                                  <ReceiptTextIcon />
                                  Finalize Sale
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>
                                Update status
                              </DropdownMenuLabel>
                              <DropdownMenuRadioGroup value={lead.status}>
                                {BUYER_LEAD_STATUSES.map((status) => (
                                  <DropdownMenuRadioItem
                                    key={status}
                                    value={status}
                                    className={`font-medium ${getBuyerLeadStatusTextClassName(status)}`}
                                    disabled={updateMutation.isPending}
                                    onSelect={(event) => {
                                      event.preventDefault();
                                      void handleStatusChange(lead, status);
                                    }}
                                  >
                                    {status}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No buyer leads yet"
                  description="Add the first buyer lead to start tracking demand and follow-ups."
                />
              </div>
            )}
          </CardContent>
          {!buyerLeadsQuery.isPending && !buyerLeadsQuery.error && total > 0 ? (
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="buyer leads"
              onPageChange={setPage}
            />
          ) : null}
        </Card>

        <Sheet
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);

            if (!open) {
              setCreateFormErrors({});
            }
          }}
        >
          <SheetContent
            side="right"
            onPointerDownOutside={(event) => event.preventDefault()}
            onFocusOutside={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
            className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[50vw] md:data-[side=right]:max-w-none"
          >
            <SheetHeader className="border-b px-6 py-5 pr-14">
              <SheetTitle className="text-lg">Add Buyer Lead</SheetTitle>
              <SheetDescription>
                Capture a new buyer inquiry and assign it to yourself by
                default.
              </SheetDescription>
            </SheetHeader>
            <form
              onSubmit={handleCreateSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-5">
                  <ApiErrorAlert
                    title="Unable to create buyer lead"
                    message={getApiErrorMessage(createMutation.error, "")}
                  />
                  <BuyerLeadForm
                    values={createForm}
                    onChange={setCreateForm}
                    errors={createFormErrors}
                    onErrorsChange={setCreateFormErrors}
                  />
                </div>
              </div>
              <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  This lead will be assigned to{" "}
                  <span className="font-medium text-foreground">you</span>.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <SubmitButton
                    type="submit"
                    pending={createMutation.isPending}
                    pendingLabel="Creating buyer lead"
                  >
                    Create Buyer Lead
                  </SubmitButton>
                </div>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <BuyerLeadDetailsDialog
          lead={viewLead}
          currentUserId={currentUserId}
          onOpenChange={(open) => {
            if (!open) {
              setViewLead(null);
            }
          }}
          onEdit={(lead) => {
            setViewLead(null);
            setEditLead(lead);
          }}
          onScheduleFollowUp={(lead) => {
            setViewLead(null);
            setFollowUpLead(lead);
          }}
          onFinalizeSale={(lead) => {
            setViewLead(null);
            router.push(
              `/sales?action=finalize-sale&buyerLeadId=${encodeURIComponent(lead.id)}`,
            );
          }}
        />

        <Dialog
          open={Boolean(editLead)}
          onOpenChange={(open) => !open && setEditLead(null)}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            {editLead ? (
              <EditBuyerLeadDialogForm
                key={editLead.id}
                lead={editLead}
                mutation={updateMutation}
                onClose={() => setEditLead(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(followUpLead)}
          onOpenChange={(open) => !open && setFollowUpLead(null)}
        >
          <DialogContent className="max-w-xl">
            {followUpLead ? (
              <ScheduleBuyerFollowUpDialogForm
                key={followUpLead.id}
                lead={followUpLead}
                currentUserId={currentUserId}
                mutation={createFollowUpMutation}
                onClose={() => setFollowUpLead(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedAppShell>
  );
}

function BuyerLeadDetailsDialog({
  lead,
  currentUserId,
  onOpenChange,
  onEdit,
  onScheduleFollowUp,
  onFinalizeSale,
}: {
  lead: BuyerLead | null;
  currentUserId?: string;
  onOpenChange: (open: boolean) => void;
  onEdit: (lead: BuyerLead) => void;
  onScheduleFollowUp: (lead: BuyerLead) => void;
  onFinalizeSale: (lead: BuyerLead) => void;
}) {
  const open = Boolean(lead);

  if (!lead) {
    return <Dialog open={open} onOpenChange={onOpenChange} />;
  }

  const cta = getBuyerLeadNextActionCta(lead);
  const blocker = getBuyerLeadBlocker(lead);
  const warning = getBuyerLeadWarning(lead);
  const stage = lead.pipeline?.stageLabel ?? getBuyerLeadStage(lead.status);
  const latestActivityAt = lead.latestActivityAt ?? lead.updatedAt;
  const attentionMessage =
    blocker ??
    warning ??
    "Continue with the next planned action for this buyer.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] max-w-none gap-0 overflow-x-hidden overflow-y-auto rounded-xl p-0 shadow-2xl sm:max-w-none"
        style={{
          width: "min(1100px, calc(100vw - 2rem))",
          maxWidth: "none",
        }}
      >
        <DialogHeader className="px-6 pt-5 pb-0 pr-14">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Buyer Lead Details
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <header className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 ring-1 ring-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900/70">
                <UserRoundIcon className="size-8" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">
                    {lead.buyerName}
                  </h2>
                  <BuyerLeadPill tone="amber">{stage}</BuyerLeadPill>
                </div>
                <DialogDescription className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <PhoneIcon className="size-4" />
                    {lead.contactNumber}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3Icon className="size-4" />
                    Active{" "}
                    {formatDistanceToNow(new Date(latestActivityAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <UserRoundIcon className="size-4" />
                    Assignee:{" "}
                    {getAssigneeLabel(lead.assigneeUserId, currentUserId)}
                  </span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-10 border-border/80 bg-background px-4 shadow-xs"
                onClick={() => onEdit(lead)}
              >
                <PencilIcon />
                Update Lead
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 border-border/80 bg-background px-4 shadow-xs"
                onClick={() => onScheduleFollowUp(lead)}
              >
                <CalendarPlusIcon />
                Schedule Follow-Up
              </Button>
              {cta.action === "sale" ? (
                <Button
                  type="button"
                  className="h-10 bg-blue-600 px-4 text-white shadow-xs hover:bg-blue-700"
                  onClick={() => onFinalizeSale(lead)}
                >
                  <CheckCircle2Icon />
                  Finalize Sale
                </Button>
              ) : null}
            </div>
          </header>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <BuyerLeadPanel
              title="Contact Information"
              icon={UserRoundIcon}
              iconClassName="text-blue-600"
            >
              <div className="space-y-4">
                <BuyerLeadInfoRow
                  icon={PhoneIcon}
                  label="Phone"
                  value={lead.contactNumber}
                />
                <BuyerLeadInfoRow
                  icon={MailIcon}
                  label="Email"
                  value={lead.email ?? "Not provided"}
                />
                <BuyerLeadInfoRow
                  icon={MessageCircleIcon}
                  label="Facebook Name"
                  value={lead.facebookName ?? "Not provided"}
                />
                <BuyerLeadInfoRow
                  icon={SearchIcon}
                  label="Inquiry Source"
                  value={lead.inquirySource ?? "Not provided"}
                />
              </div>
            </BuyerLeadPanel>

            <BuyerLeadPanel
              title="Buying Intent"
              icon={TargetIcon}
              iconClassName="text-blue-600"
            >
              <div className="space-y-4">
                <BuyerLeadInfoRow
                  icon={CircleDollarSignIcon}
                  label="Desired Budget"
                  value={formatVehicleMoney(lead.desiredBudget)}
                />
                <BuyerLeadInfoRow
                  icon={FunnelIcon}
                  label="Stage"
                  value={<BuyerLeadPill tone="amber">{stage}</BuyerLeadPill>}
                />
                <BuyerLeadInfoRow
                  icon={HeartIcon}
                  label="Status"
                  value={
                    <BuyerLeadPill tone="green">{lead.status}</BuyerLeadPill>
                  }
                />
                <BuyerLeadInfoRow
                  icon={ClipboardListIcon}
                  label="Next Action"
                  value={getBuyerLeadNextAction(lead)}
                />
              </div>
            </BuyerLeadPanel>
          </section>

          <Alert className="mt-4 border-amber-300 bg-amber-50/70 px-4 py-3 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangleIcon className="size-8 text-amber-600 dark:text-amber-300" />
            <AlertTitle className="text-base">Needs attention</AlertTitle>
            <AlertDescription className="text-sm text-amber-950/90 dark:text-amber-100/90">
              {attentionMessage}
            </AlertDescription>
          </Alert>

          <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            <BuyerLeadLinkedVehicles vehicles={lead.vehicles} />
            <BuyerLeadNotes lead={lead} />
          </section>

          <BuyerLeadActivityTimeline leadId={lead.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BuyerLeadPanel({
  title,
  icon: Icon,
  iconClassName,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border/80 bg-background p-5 shadow-xs">
      <div className="mb-5 flex items-center gap-3">
        <Icon
          className={`size-5 ${iconClassName ?? "text-muted-foreground"}`}
        />
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function BuyerLeadInfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[24px_minmax(0,1fr)] items-start gap-x-3 gap-y-1 text-sm sm:grid-cols-[24px_140px_minmax(0,1fr)]">
      <div className="pt-0.5 text-muted-foreground">
        {Icon ? <Icon className="size-4" /> : null}
      </div>
      <p className="min-w-0 text-muted-foreground">{label}</p>
      <div className="col-start-2 min-w-0 font-medium break-words text-foreground sm:col-start-auto">
        {value}
      </div>
    </div>
  );
}

function BuyerLeadPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "amber" | "green" | "blue" | "gray";
}) {
  const toneClassName = {
    amber:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    green:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    blue: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
    gray: "border-border bg-muted/40 text-muted-foreground",
  }[tone];

  return (
    <Badge
      variant="outline"
      className={`w-fit rounded-md px-2.5 py-0.5 text-xs font-medium ${toneClassName}`}
    >
      {children}
    </Badge>
  );
}

function BuyerLeadLinkedVehicles({
  vehicles,
}: {
  vehicles: BuyerLead["vehicles"];
}) {
  return (
    <BuyerLeadPanel
      title="Linked Vehicles"
      icon={CarFrontIcon}
      iconClassName="text-blue-600"
    >
      {vehicles.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-lg border border-border/80 bg-background p-3"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                <Image
                  src="/default-vehicle-image.png"
                  alt={`${vehicle.year} ${vehicle.brand} ${vehicle.model}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 py-1">
                <p className="truncate text-sm text-muted-foreground">
                  Stock {vehicle.stockNumber}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {vehicle.year} {vehicle.brand} {vehicle.model}
                </p>
                <BuyerLeadVehicleStatusPill status={vehicle.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No vehicles linked yet"
          description="Attach matching vehicles once this buyer is qualified."
        />
      )}
    </BuyerLeadPanel>
  );
}

function BuyerLeadVehicleStatusPill({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();
  const tone = normalizedStatus.includes("reserved")
    ? "amber"
    : normalizedStatus.includes("available")
      ? "green"
      : "gray";

  return (
    <div className="mt-2">
      <BuyerLeadPill tone={tone}>{status}</BuyerLeadPill>
    </div>
  );
}

function BuyerLeadNotes({ lead }: { lead: BuyerLead }) {
  const noteText = lead.notes?.trim() || "No notes recorded.";
  const closingNote = lead.closingNote?.trim();

  return (
    <BuyerLeadPanel
      title="Notes"
      icon={FileTextIcon}
      iconClassName="text-blue-600"
    >
      <div className="min-h-[108px] rounded-lg border border-border/80 bg-background p-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-foreground [overflow-wrap:anywhere]">
          {closingNote
            ? `${noteText}\n\nClosing note: ${closingNote}`
            : noteText}
        </p>
      </div>
    </BuyerLeadPanel>
  );
}

function BuyerLeadActivityTimeline({ leadId }: { leadId: string }) {
  const historyQuery = useActivityHistoryQuery("buyer_lead", leadId, 3);
  const events = historyQuery.data?.events.slice(0, 3) ?? [];

  return (
    <BuyerLeadPanel
      title="Activity History"
      icon={Clock3Icon}
      iconClassName="text-blue-600"
    >
      {historyQuery.isPending ? (
        <ModuleLoadingState label="Loading activity history" />
      ) : historyQuery.error ? (
        <ApiErrorAlert
          title="Unable to load activity history"
          message={getApiErrorMessage(historyQuery.error, "")}
        />
      ) : events.length ? (
        <div className="space-y-0">
          {events.map((event, index) => (
            <BuyerLeadActivityRow
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No activity yet"
          description="Operational history will appear here once the record starts moving through the workflow."
        />
      )}
    </BuyerLeadPanel>
  );
}

function BuyerLeadActivityRow({
  event,
  isLast,
}: {
  event: ActivityHistoryEvent;
  isLast: boolean;
}) {
  const Icon = getBuyerLeadActivityIcon(event.actionType);

  return (
    <div className="grid grid-cols-[92px_24px_minmax(0,1fr)] gap-3 py-2 text-sm md:grid-cols-[150px_32px_minmax(0,1fr)_160px] md:gap-4">
      <p className="pt-1 text-xs text-muted-foreground md:text-sm">
        {format(new Date(event.timestamp), "MMM d, h:mm a")}
      </p>
      <div className="relative flex justify-center">
        <span className="mt-2 size-2.5 rounded-full bg-blue-600" />
        {!isLast ? (
          <span className="absolute top-5 bottom-[-18px] w-px bg-blue-200 dark:bg-blue-900" />
        ) : null}
      </div>
      <div className="grid min-w-0 grid-cols-[32px_minmax(0,1fr)] gap-3 md:grid-cols-[36px_minmax(0,1fr)] md:gap-4">
        <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 font-semibold text-foreground [overflow-wrap:anywhere]">
            {event.summary}
          </p>
          <p className="mt-1 line-clamp-2 text-muted-foreground [overflow-wrap:anywhere]">
            {formatActivityDescription(event)}
          </p>
        </div>
      </div>
      <p className="hidden pt-1 text-right text-muted-foreground md:block">
        {event.actorDisplayName ?? "System"}
      </p>
    </div>
  );
}

function getBuyerLeadActivityIcon(actionType: string) {
  if (actionType.includes("follow")) return UserRoundIcon;
  if (actionType.includes("status")) return FlagIcon;
  return PencilIcon;
}

function formatActivityDescription(event: ActivityHistoryEvent) {
  const metadataSummary =
    typeof event.metadata.description === "string"
      ? event.metadata.description
      : null;

  return metadataSummary ?? getActionLabel(event.actionType);
}

function getActionLabel(actionType: string) {
  return actionType.split(".").at(-1)?.replaceAll("_", " ") ?? actionType;
}

function EditBuyerLeadDialogForm({
  lead,
  mutation,
  onClose,
}: {
  lead: BuyerLead;
  mutation: ReturnType<typeof useUpdateBuyerLeadMutation>;
  onClose: () => void;
}) {
  const [values, setValues] = React.useState<BuyerLeadFormValues>(() =>
    getBuyerLeadFormValues(lead),
  );
  const [formErrors, setFormErrors] = React.useState<BuyerLeadFormErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = getBuyerLeadFormErrors(values);
    setFormErrors(nextErrors);

    if (hasBuyerLeadFormErrors(nextErrors)) {
      return;
    }

    await mutation.mutateAsync(
      {
        id: lead.id,
        payload: parseUpdateBuyerLeadPayload(values),
      },
      {
        onSuccess: () => {
          toast.success("Buyer lead updated");
          onClose();
        },
      },
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Buyer Lead</DialogTitle>
        <DialogDescription>
          Update buyer details, demand context, and pipeline status.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ApiErrorAlert
          title="Unable to update buyer lead"
          message={getApiErrorMessage(mutation.error, "")}
        />
        <BuyerLeadForm
          values={values}
          onChange={setValues}
          errors={formErrors}
          onErrorsChange={setFormErrors}
        />
        <DialogFooter>
          <SubmitButton
            type="submit"
            pending={mutation.isPending}
            pendingLabel="Saving changes"
          >
            Save Changes
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  );
}

function ScheduleBuyerFollowUpDialogForm({
  lead,
  currentUserId,
  mutation,
  onClose,
}: {
  lead: BuyerLead;
  currentUserId?: string;
  mutation: ReturnType<typeof useCreateFollowUpMutation>;
  onClose: () => void;
}) {
  const assigneeUserId = currentUserId ?? lead.assigneeUserId ?? "";
  const [dueAt, setDueAt] = React.useState<Date | undefined>(() =>
    getDefaultFollowUpDueAt(),
  );
  const [note, setNote] = React.useState(() =>
    getDefaultBuyerFollowUpNote(lead),
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assigneeUserId || !dueAt || !note.trim()) {
      return;
    }

    await mutation.mutateAsync(
      {
        leadType: "buyer",
        buyerLeadId: lead.id,
        assigneeUserId,
        dueAt: dueAt.toISOString(),
        note: note.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Follow-up scheduled");
          onClose();
        },
      },
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Schedule Follow-Up</DialogTitle>
        <DialogDescription>
          Create the next contact task for {lead.buyerName}.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5">
        <ApiErrorAlert
          title="Unable to schedule follow-up"
          message={getApiErrorMessage(mutation.error, "")}
        />
        <div className="rounded-md border bg-muted/20 px-3 py-3 text-sm">
          <p className="font-medium text-foreground">{lead.buyerName}</p>
          <p className="text-muted-foreground">{lead.contactNumber}</p>
        </div>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="buyerFollowUpDueAt">Due at</FieldLabel>
            <DateTimePicker
              id="buyerFollowUpDueAt"
              value={dueAt}
              onChange={setDueAt}
              minDate={new Date()}
              placeholder="Select due date and time"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="buyerFollowUpNote">Follow-up note</FieldLabel>
            <Textarea
              id="buyerFollowUpNote"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              required
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            type="submit"
            pending={mutation.isPending}
            pendingLabel="Scheduling follow-up"
            disabled={!assigneeUserId || !dueAt || !note.trim()}
          >
            <CalendarPlusIcon />
            Schedule Follow-Up
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  );
}
