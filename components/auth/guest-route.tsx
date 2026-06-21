"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { Spinner } from "@/components/ui/spinner"

export function GuestRoute({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const { data, isPending } = useAuthenticatedUserQuery()

  React.useEffect(() => {
    if (data?.user) {
      router.replace(
        data.user.mustChangePassword ? "/change-password" : "/dashboard",
      )
    }
  }, [data?.user, router])

  if (isPending || data?.user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  return <>{children}</>
}
