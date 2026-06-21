"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ApiErrorAlert } from "@/components/operations/api-error-alert"
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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useChangePasswordMutation } from "@/hooks/mutations/auth/use-change-password-mutation"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/types/api"

const MIN_PASSWORD_LENGTH = 6

export function PasswordChangeRequired({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const changePasswordMutation = useChangePasswordMutation()
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [localError, setLocalError] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setLocalError(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setLocalError("New password and confirmation do not match.")
      return
    }

    await changePasswordMutation.mutateAsync(
      {
        newPassword,
      },
      {
        onSuccess: () => {
          setNewPassword("")
          setConfirmPassword("")
          toast.success("Password updated")
          router.replace("/dashboard")
        },
      },
    )
  }

  const apiError = getApiErrorMessage(changePasswordMutation.error, "")

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-white/70 bg-white/96 text-slate-900 shadow-2xl shadow-slate-900/15">
        <CardHeader className="gap-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Change password
          </CardTitle>
          <CardDescription className="text-slate-600">
            Set your own password before entering your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FieldGroup className="gap-6">
              <ApiErrorAlert
                title="Unable to change password"
                message={localError || apiError}
              />
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  className="h-11 bg-white"
                />
                <FieldDescription className="text-slate-500">
                  Choose a password you will use the next time you sign in.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm new password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  className="h-11 bg-white"
                />
              </Field>
              <Button
                type="submit"
                className="h-11"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Spinner className="size-4" />
                    Saving password
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
