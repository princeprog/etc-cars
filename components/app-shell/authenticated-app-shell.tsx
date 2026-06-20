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
  children,
}: Readonly<{
  title: string
  children: ReactNode
}>) {
  const authQuery = useAuthenticatedUserQuery()

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
        {!authQuery.data?.user ? (
          <div className="flex min-h-svh w-full items-center justify-center">
            <Spinner className="size-5" />
          </div>
        ) : (
          <>
            <AppSidebar
              variant="inset"
              user={{
                name: authQuery.data.user.fullName,
                email: authQuery.data.user.email,
                avatar: "/placeholder-user.jpg",
              }}
            />
            <SidebarInset>
              <SiteHeader title={title} />
              <div className="flex flex-1 flex-col">{children}</div>
            </SidebarInset>
          </>
        )}
      </SidebarProvider>
    </ProtectedRoute>
  )
}
