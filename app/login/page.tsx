import { createPageMetadata } from "@/lib/metadata";
import { LightThemeEnforcer } from "@/components/light-theme-enforcer";
import { GuestRoute } from "@/components/auth/guest-route";
import { LoginForm } from "@/components/login-form";

export const metadata = createPageMetadata({
  title: "Login",
  description: "Sign in to the ETC Cars dealership management workspace.",
});

export default function Page() {
  return (
    <GuestRoute>
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-slate-100 p-6 md:p-10">
        <LightThemeEnforcer />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-background.png')" }}
        />
        <div className="relative z-10 w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </GuestRoute>
  );
}
