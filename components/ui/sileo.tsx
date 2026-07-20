"use client"

import {
  Toaster as SileoToaster,
  sileo,
  type SileoOptions,
} from "sileo"

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
): SileoOptions {
  return typeof message === "string"
    ? { title: message, ...normalizeOptions(options) }
    : { ...message, ...normalizeOptions(options) }
}

function normalizePromiseToast<T>(
  message: PromiseToastMessage<T>,
): SileoOptions | ((value: T) => SileoOptions) {
  return typeof message === "function"
    ? (value: T) => normalizeToast(message(value))
    : normalizeToast(message)
}

export const toast = {
  success: (message: ToastMessage, options?: ToastDetails) =>
    sileo.success(normalizeToast(message, options)),
  error: (message: ToastMessage, options?: ToastDetails) =>
    sileo.error(normalizeToast(message, options)),
  warning: (message: ToastMessage, options?: ToastDetails) =>
    sileo.warning(normalizeToast(message, options)),
  info: (message: ToastMessage, options?: ToastDetails) =>
    sileo.info(normalizeToast(message, options)),
  loading: (message: ToastMessage, options?: ToastDetails) =>
    sileo.show({ ...normalizeToast(message, options), type: "loading" }),
  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    options: PromiseToastOptions<T>,
  ) =>
    sileo.promise(promise, {
      loading: normalizeToast(options.loading),
      success: normalizePromiseToast(options.success),
      error: normalizePromiseToast(options.error),
      position: options.position,
    }),
  dismiss: sileo.dismiss,
  clear: sileo.clear,
}

export function Toaster() {
  return (
    <SileoToaster
      position="top-center"
      offset={18}
      theme="system"
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
