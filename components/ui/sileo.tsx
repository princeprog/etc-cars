"use client"

import {
  Toaster as SileoToaster,
  sileo,
  type SileoOptions,
} from "sileo"
import { useTheme } from "next-themes"

type ToastMessage = string | SileoOptions

type ToastAction = {
  label?: string
  title?: string
  onClick: () => void
}

type ToastOptions = Omit<SileoOptions, "button" | "description"> & {
  action?: ToastAction
  button?: SileoOptions["button"]
  description?: SileoOptions["description"]
  details?: SileoOptions["description"]
}

type PromiseToastMessage<T = unknown> =
  | ToastMessage
  | ((value: T) => ToastMessage)

type PromiseToastOptions<T = unknown> = {
  loading: ToastMessage
  success: PromiseToastMessage<T>
  error: PromiseToastMessage<unknown>
  position?: SileoOptions["position"]
}

type ToastDetails = ToastOptions | string
type ToastKind = "success" | "error" | "warning" | "info" | "loading"

const DEFAULT_TOAST_DETAILS: Record<ToastKind, string> = {
  success: "The requested action completed successfully.",
  error: "Review the message, correct any required information, and try again.",
  warning: "Review the highlighted condition before continuing.",
  info: "Review this update before continuing.",
  loading: "The requested action is still in progress.",
}

const TOAST_TITLE_DETAILS: Array<{
  pattern: string | RegExp
  details: string
}> = [
  {
    pattern: /^Buyer lead moved to /,
    details: "The buyer lead status was updated in the sales pipeline.",
  },
  {
    pattern: "Buyer lead created",
    details: "The buyer lead is now available for matching and follow-up.",
  },
  {
    pattern: "Buyer lead updated",
    details: "The buyer lead record now reflects the latest customer details.",
  },
  {
    pattern: /^Seller lead moved to /,
    details: "The seller lead status was updated in the acquisition pipeline.",
  },
  {
    pattern: "Seller lead created",
    details: "The seller lead is ready for vehicle details and acquisition review.",
  },
  {
    pattern: "Seller lead converted to inventory",
    details: "A vehicle inventory record was created from this seller lead.",
  },
  {
    pattern: "Sales draft updated",
    details: "The current sale draft now has the latest buyer, vehicle, and pricing details.",
  },
  {
    pattern: "Sales draft saved",
    details: "The draft sale is saved and can be resumed from the sales workspace.",
  },
  {
    pattern: "Sales draft deleted",
    details: "The draft was removed from the active sales workflow.",
  },
  {
    pattern: "Sale finalized",
    details: "The sale record was completed and inventory availability was updated.",
  },
  {
    pattern: "Vehicle stock number copied",
    details: "The stock number is ready to paste into messages, forms, or records.",
  },
  {
    pattern: /^Vehicle moved to /,
    details: "The vehicle status was updated across inventory workflows.",
  },
  {
    pattern: "Vehicle created",
    details: "The vehicle was added to inventory and is ready for details, photos, and pricing.",
  },
  {
    pattern: "Vehicle updated",
    details: "The inventory record now reflects the latest vehicle information.",
  },
  {
    pattern: "Vehicle brand added",
    details: "The new brand is available in vehicle catalog selections.",
  },
  {
    pattern: "Vehicle model added",
    details: "The new model is available under the selected vehicle brand.",
  },
  {
    pattern: "Vehicle variant added",
    details: "The new variant can now be selected for matching vehicle records.",
  },
  {
    pattern: "Vehicle pricing updated",
    details: "The target and minimum acceptable prices were saved.",
  },
  {
    pattern: "Tracked cost added",
    details: "The cost was included in the vehicle investment total.",
  },
  {
    pattern: "Tracked cost updated",
    details: "The vehicle investment total now reflects the revised cost.",
  },
  {
    pattern: "Tracked cost removed",
    details: "The cost was removed from the vehicle investment total.",
  },
  {
    pattern: "Expense created",
    details: "The expense was added to bills and expense tracking.",
  },
  {
    pattern: "Expense updated",
    details: "The bills and expenses record now has the latest information.",
  },
  {
    pattern: "Expense marked as paid",
    details: "The expense payment status and paid date were recorded.",
  },
  {
    pattern: "Expense voided",
    details: "The expense was removed from active payment tracking.",
  },
  {
    pattern: "Receipt uploaded",
    details: "The receipt file is attached to this expense record.",
  },
  {
    pattern: "Receipt updated",
    details: "The expense now points to the latest receipt file.",
  },
  {
    pattern: "Receipt removed",
    details: "The receipt attachment was cleared from this expense.",
  },
  {
    pattern: "Recurring rule created",
    details: "Future expenses will be generated from this recurring rule.",
  },
  {
    pattern: "Recurring rule updated",
    details: "Upcoming generated expenses will use the revised rule details.",
  },
  {
    pattern: "Recurring rule deactivated",
    details: "The rule will no longer create future expense records.",
  },
  {
    pattern: "Expense category created",
    details: "The category is ready for classifying bills and expenses.",
  },
  {
    pattern: "Expense category updated",
    details: "The category name and description were saved.",
  },
  {
    pattern: "Follow-up scheduled",
    details: "The reminder is saved and will appear in the follow-up workflow.",
  },
  {
    pattern: "Follow-up rescheduled",
    details: "The follow-up reminder now uses the updated date and time.",
  },
  {
    pattern: "Follow-up created",
    details: "The follow-up was added to the active lead workflow.",
  },
  {
    pattern: "Follow-up completed",
    details: "The follow-up was marked done and moved out of the active queue.",
  },
  {
    pattern: "Follow-up note copied",
    details: "The note text is ready to paste into another record or message.",
  },
  {
    pattern: "Follow-up note updated",
    details: "The follow-up now shows the revised note.",
  },
  {
    pattern: "Existing follow-up loaded. Review and reschedule it.",
    details: "The current reminder details were loaded into the follow-up form.",
  },
  {
    pattern: "Notifications marked as read",
    details: "Unread notification counters were cleared for the selected items.",
  },
  {
    pattern: "Staff account created",
    details: "The new staff member can now sign in with the generated credentials.",
  },
  {
    pattern: /^Password reset/,
    details: "The staff account password was updated and recorded in activity history.",
  },
  {
    pattern: "Password updated",
    details: "Your new password is active for future sign-ins.",
  },
  {
    pattern: "Logged out",
    details: "Your current session has ended and the sign-in screen is ready.",
  },
  {
    pattern: "Catalog item added",
    details: "The catalog option is available in matching vehicle fields.",
  },
  {
    pattern: "Catalog item renamed",
    details: "Records using this catalog option will show the updated label.",
  },
  {
    pattern: /^Catalog item /,
    details: "The catalog item's active status was updated for future selections.",
  },
  {
    pattern: "Inspection draft saved",
    details: "The seller lead inspection can be resumed with the saved answers.",
  },
  {
    pattern: "Inspection completed for review",
    details: "The inspection is ready for the acquisition decision step.",
  },
  {
    pattern: /^Select a buyer lead and vehicle/,
    details: "Choose both records so the draft can link the buyer to an inventory unit.",
  },
  {
    pattern: /^Please complete the required sale details/,
    details: "Fill in the highlighted sale fields before finalizing the transaction.",
  },
  {
    pattern: /^Minimum acceptable price cannot exceed/,
    details: "Lower the minimum acceptable price or raise the target selling price.",
  },
  {
    pattern: /^Unable to /,
    details: "The request did not complete. Review the message and try again.",
  },
  {
    pattern: / failed$/,
    details: "The request did not complete. Review the message and try again.",
  },
]

function hasDetails(description: SileoOptions["description"]) {
  return (
    description !== undefined &&
    description !== null &&
    (typeof description !== "string" || description.trim().length > 0)
  )
}

function getTitle(options: SileoOptions) {
  return typeof options.title === "string" ? options.title.trim() : ""
}

function getDetailsForTitle(title: string, kind: ToastKind) {
  const match = TOAST_TITLE_DETAILS.find(({ pattern }) =>
    typeof pattern === "string" ? pattern === title : pattern.test(title),
  )

  return match?.details ?? DEFAULT_TOAST_DETAILS[kind]
}

function requireDetails(options: SileoOptions, kind: ToastKind) {
  if (hasDetails(options.description)) {
    return options
  }

  const title = getTitle(options)

  return {
    ...options,
    description: getDetailsForTitle(title, kind),
  }
}

function normalizeOptions(options?: ToastDetails): SileoOptions {
  if (!options) {
    return {}
  }

  if (typeof options === "string") {
    return {
      description: options,
    }
  }

  const { action, button, details, description, ...rest } = options
  const normalizedButton =
    button ??
    (action
      ? {
          title: action.title ?? action.label ?? "Action",
          onClick: action.onClick,
        }
      : undefined)

  return {
    ...rest,
    button: normalizedButton,
    description: description ?? details,
  }
}

function normalizeToast(
  message: ToastMessage,
  options?: ToastDetails,
  kind: ToastKind = "info",
): SileoOptions {
  const normalized =
    typeof message === "string"
      ? { title: message, ...normalizeOptions(options) }
      : { ...message, ...normalizeOptions(options) }

  return requireDetails(normalized, kind)
}

function normalizePromiseToast<T>(
  message: PromiseToastMessage<T>,
  kind: ToastKind,
): SileoOptions | ((value: T) => SileoOptions) {
  return typeof message === "function"
    ? (value: T) => normalizeToast(message(value), undefined, kind)
    : normalizeToast(message, undefined, kind)
}

export const toast = {
  success: (message: ToastMessage, options?: ToastDetails) =>
    sileo.success(normalizeToast(message, options, "success")),
  error: (message: ToastMessage, options?: ToastDetails) =>
    sileo.error(normalizeToast(message, options, "error")),
  warning: (message: ToastMessage, options?: ToastDetails) =>
    sileo.warning(normalizeToast(message, options, "warning")),
  info: (message: ToastMessage, options?: ToastDetails) =>
    sileo.info(normalizeToast(message, options, "info")),
  loading: (message: ToastMessage, options?: ToastDetails) =>
    sileo.show({
      ...normalizeToast(message, options, "loading"),
      type: "loading",
    }),
  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    options: PromiseToastOptions<T>,
  ) =>
    sileo.promise(promise, {
      loading: normalizeToast(options.loading, undefined, "loading"),
      success: normalizePromiseToast(options.success, "success"),
      error: normalizePromiseToast(options.error, "error"),
      position: options.position,
    }),
  dismiss: sileo.dismiss,
  clear: sileo.clear,
}

export function Toaster() {
  const { resolvedTheme } = useTheme()
  const sileoTheme = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <SileoToaster
      position="top-center"
      offset={18}
      theme={sileoTheme}
      options={{
        roundness: 16,
        autopilot: {
          expand: 250,
          collapse: 2200,
        },
        styles: {
          description:
            "normal-case text-[13px] leading-5 text-foreground/75 dark:text-foreground/80",
        },
      }}
    />
  )
}
