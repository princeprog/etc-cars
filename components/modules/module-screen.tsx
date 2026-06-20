"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRightIcon } from "lucide-react"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ModuleLink = {
  label: string
  href: string
}

export function ModuleScreen({
  title,
  eyebrow,
  description,
  status,
  highlights,
  nextSteps,
  primaryAction,
}: Readonly<{
  title: string
  eyebrow: string
  description: string
  status: string
  highlights: ReactNode[]
  nextSteps: string[]
  primaryAction: ModuleLink
}>) {
  return (
    <AuthenticatedAppShell title={title}>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-xs">
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit">
              {eyebrow}
            </Badge>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="rounded-md px-2.5 py-1 text-xs">{status}</Badge>
            <Link
              href={primaryAction.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              {primaryAction.label}
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>What this module will hold</CardTitle>
              <CardDescription>First-pass page for the approved MVP information architecture.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight, index) => (
                <div key={index} className="rounded-md border p-4 text-sm text-muted-foreground">
                  {highlight}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next wiring step</CardTitle>
              <CardDescription>Prepared for the next ETC issue without changing the app shell again.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextSteps.map((item) => (
                <div key={item} className="rounded-md border p-3 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AuthenticatedAppShell>
  )
}
