"use client"

import { TriangleAlertIcon } from "lucide-react"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { DashboardQueuePanels } from "@/components/dashboard-queue-panels"
import { SectionCards } from "@/components/section-cards"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useDashboardQuery } from "@/hooks/queries/dashboard/use-dashboard-query"

import { InventoryQualityWidget } from "./inventory-quality-widget"

export function DashboardScreen() {
  const dashboardQuery = useDashboardQuery()

  return (
    <AuthenticatedAppShell title="Dashboard">
      <div className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-6">
        <section className="px-4 lg:px-6">
          <div className="max-w-3xl space-y-2">
            <p className="text-sm font-medium text-primary">Operations Overview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Today&apos;s dealership workload</h2>
            <p className="text-sm text-muted-foreground">
              Live inventory health, current month sales, overdue follow-ups, and new inquiries.
            </p>
          </div>
        </section>

        {dashboardQuery.isPending ? (
          <div className="flex flex-1 items-center justify-center px-4 lg:px-6">
            <Spinner className="size-5" />
          </div>
        ) : dashboardQuery.error ? (
          <div className="px-4 lg:px-6">
            <Alert variant="destructive" className="max-w-lg">
              <TriangleAlertIcon />
              <AlertTitle>Dashboard unavailable</AlertTitle>
              <AlertDescription>
                {dashboardQuery.error instanceof Error
                  ? dashboardQuery.error.message
                  : "Unable to load dashboard data."}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <SectionCards metrics={dashboardQuery.data.metrics} />
            <section className="px-4 lg:px-6">
              <InventoryQualityWidget
                summary={dashboardQuery.data.metrics.inventoryQuality}
              />
            </section>
            <DashboardQueuePanels queues={dashboardQuery.data.queues} />
          </>
        )}
      </div>
    </AuthenticatedAppShell>
  )
}
