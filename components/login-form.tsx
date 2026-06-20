"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { useLoginMutation } from "@/hooks/mutations/auth/use-login-mutation"
import { isAppApiError } from "@/types/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { TriangleAlertIcon } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const loginMutation = useLoginMutation()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await loginMutation.mutateAsync(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          router.replace("/dashboard")
        },
      },
    )
  }

  const errorMessage = isAppApiError(loginMutation.error)
    ? loginMutation.error.message
    : loginMutation.error instanceof Error
      ? loginMutation.error.message
      : null

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-white/70 bg-white/96 text-slate-900 shadow-2xl shadow-slate-900/15">
        <CardHeader className="gap-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-slate-600">
            Sign in to access your dealership workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FieldGroup className="gap-6">
              {errorMessage ? (
                <Alert variant="destructive">
                  <TriangleAlertIcon />
                  <AlertTitle>Unable to sign in</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-11 bg-white"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-11 bg-white"
                />
              </Field>
              <Field className="gap-2">
                <Button type="submit" className="h-11" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <Spinner className="size-4" />
                      Signing in
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <FieldDescription className="pt-1 text-center text-slate-500">
                  Use your assigned email and password to continue.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
