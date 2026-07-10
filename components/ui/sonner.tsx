"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast border-l-4 shadow-lg [&_[data-icon]]:mt-0.5 [&_[data-icon]]:shrink-0",
          success:
            "border-l-emerald-500 bg-emerald-50 text-emerald-950 [&_[data-icon]]:text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-50 dark:border-l-emerald-400 dark:[&_[data-icon]]:text-emerald-300",
          error:
            "border-l-destructive bg-destructive/10 text-destructive [&_[data-icon]]:text-destructive",
          warning:
            "border-l-amber-500 bg-amber-50 text-amber-950 [&_[data-icon]]:text-amber-600 dark:bg-amber-950/35 dark:text-amber-50 dark:border-l-amber-400 dark:[&_[data-icon]]:text-amber-300",
          info:
            "border-l-primary bg-primary/10 text-primary [&_[data-icon]]:text-primary",
          loading:
            "border-l-muted-foreground bg-muted text-foreground [&_[data-icon]]:text-muted-foreground",
          title: "font-semibold",
          description: "text-muted-foreground",
          actionButton:
            "border border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton:
            "border border-border bg-background text-foreground hover:bg-muted",
          closeButton:
            "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
