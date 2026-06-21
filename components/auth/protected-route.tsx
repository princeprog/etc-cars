"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { isAppApiError } from "@/types/api"
import { Spinner } from "@/components/ui/spinner"

export function ProtectedRoute({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const pathname = usePathname()
  const { data, isPending, error } = useAuthenticatedUserQuery()
  const mustChangePassword = Boolean(data?.user?.mustChangePassword)
  const isChangePasswordPage = pathname === "/change-password"

  React.useEffect(() => {
    if (isPending) {
      return
    }

    if (!data?.user && isAppApiError(error) && error.status === 401) {
      router.replace("/login")
      return
    }

    if (data?.user?.mustChangePassword && !isChangePasswordPage) {
      router.replace("/change-password")
      return
    }

    if (data?.user && !data.user.mustChangePassword && isChangePasswordPage) {
      router.replace("/dashboard")
    }
  }, [data?.user, error, isChangePasswordPage, isPending, router])

  if (
    isPending ||
    (!data?.user && isAppApiError(error) && error.status === 401) ||
    (mustChangePassword && !isChangePasswordPage) ||
    (Boolean(data?.user) && !mustChangePassword && isChangePasswordPage)
  ) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  return <>{children}</>
}
