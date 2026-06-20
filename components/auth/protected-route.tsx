"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { isAppApiError } from "@/types/api"
import { Spinner } from "@/components/ui/spinner"

export function ProtectedRoute({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const { data, isPending, error } = useAuthenticatedUserQuery()

  React.useEffect(() => {
    if (isPending) {
      return
    }

    if (!data?.user && isAppApiError(error) && error.status === 401) {
      router.replace("/login")
    }
  }, [data?.user, error, isPending, router])

  if (isPending || (!data?.user && isAppApiError(error) && error.status === 401)) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  return <>{children}</>
}
