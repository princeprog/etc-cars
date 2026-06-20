"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DashboardQueuePanels } from "@/components/dashboard-queue-panels"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useDashboardQuery } from "@/hooks/queries/dashboard/use-dashboard-query"
import { TriangleAlertIcon } from "lucide-react"

function DashboardContent() {
  const authQuery = useAuthenticatedUserQuery()
  const dashboardQuery = useDashboardQuery()

  if (dashboardQuery.isPending || !authQuery.data?.user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (dashboardQuery.error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
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
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        user={{
          name: authQuery.data.user.fullName,
          email: authQuery.data.user.email,
          avatar: "/placeholder-user.jpg",
        }}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards metrics={dashboardQuery.data.metrics} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DashboardQueuePanels queues={dashboardQuery.data.queues} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
