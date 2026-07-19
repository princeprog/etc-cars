import { createPageMetadata } from "@/lib/metadata";
import { LightThemeEnforcer } from "@/components/light-theme-enforcer";
import { PasswordChangeRequired } from "@/components/auth/password-change-required";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const metadata = createPageMetadata({
  title: "Change Password",
  description:
    "Update account credentials and complete required password changes.",
});

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-slate-100 p-6 md:p-10">
        <LightThemeEnforcer />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-background.png')" }}
        />
        <div className="relative z-10 w-full max-w-md">
          <PasswordChangeRequired />
        </div>
      </div>
    </ProtectedRoute>
  );
}
