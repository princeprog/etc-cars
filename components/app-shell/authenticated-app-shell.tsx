"use client"

import type { CSSProperties, ReactNode } from "react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { Spinner } from "@/components/ui/spinner"

export function AuthenticatedAppShell({
  title,
  breadcrumbs,
  children,
}: Readonly<{
  title: string
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  children: ReactNode
}>) {
  const authQuery = useAuthenticatedUserQuery()
  const user = authQuery.data?.user

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as CSSProperties
        }
      >
        {!user ? (
          <div className="flex min-h-svh w-full items-center justify-center">
            <Spinner className="size-5" />
          </div>
        ) : (
          <>
            <AppSidebar
              variant="inset"
              user={{
                name: user.fullName,
                email: user.email,
                avatar: "/placeholder-user.jpg",
                role: user.role,
              }}
            />
            <SidebarInset>
              <SiteHeader title={title} breadcrumbs={breadcrumbs} />
              <div className="flex flex-1 flex-col">{children}</div>
            </SidebarInset>
          </>
        )}
      </SidebarProvider>
    </ProtectedRoute>
  )
}
