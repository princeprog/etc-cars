"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  ActivityIcon,
  Building2Icon,
  CarFrontIcon,
  ChevronRightIcon,
  ClipboardClockIcon,
  LockIcon,
  PercentIcon,
  ShieldCheckIcon,
  StarIcon,
  UsersRoundIcon,
} from "lucide-react";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { cn } from "@/lib/utils";

type SettingsCard = {
  title: string;
  description: string;
  href?: string;
  actionLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  featured?: boolean;
  comingSoon?: boolean;
};

const SETTINGS_CARDS: SettingsCard[] = [
  {
    title: "Vehicle Catalog",
    description:
      "Manage brand, model, and variant suggestions used during vehicle intake.",
    href: "/settings/vehicle-catalog",
    actionLabel: "Open Vehicle Catalog",
    icon: CarFrontIcon,
    featured: true,
  },
  {
    title: "Staff & Access",
    description: "Manage staff accounts, roles, and access controls.",
    href: "/staff",
    actionLabel: "Manage Staff",
    icon: UsersRoundIcon,
  },
  {
    title: "Activity & Audit",
    description: "Review user actions and system events.",
    href: "/activity-history",
    actionLabel: "View Activity",
    icon: ClipboardClockIcon,
  },
  {
    title: "Dealership Profile",
    description: "Configure dealership identity and business details.",
    actionLabel: "Configure",
    icon: Building2Icon,
    comingSoon: true,
  },
  {
    title: "Sales Preferences",
    description:
      "Configure commission defaults and sales workflow preferences.",
    actionLabel: "Configure",
    icon: PercentIcon,
    comingSoon: true,
  },
];

export function SettingsScreen() {
  return (
    <AuthenticatedAppShell
      title="Settings"
      breadcrumbs={[{ label: "Administration" }, { label: "Settings" }]}
    >
      <SettingsScreenContent />
    </AuthenticatedAppShell>
  );
}

function SettingsScreenContent() {
  const authQuery = useAuthenticatedUserQuery();

  if (authQuery.data?.user.role !== "admin") {
    return (
      <div className="flex flex-1 items-start px-4 py-6 md:px-6">
        <Alert variant="destructive" className="max-w-xl">
          <ShieldCheckIcon />
          <AlertTitle>Admin access required</AlertTitle>
          <AlertDescription>
            Settings are available only to admin users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-4 py-8 md:px-8 lg:px-10">
      <header className="flex max-w-4xl flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-base text-muted-foreground">
          Manage dealership configuration, staff controls, catalog data, and
          system preferences.
        </p>
      </header>

      <section
        aria-label="Settings areas"
        className="grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {SETTINGS_CARDS.map((card) => (
          <SettingsAreaCard key={card.title} card={card} />
        ))}
      </section>
    </main>
  );
}

function SettingsAreaCard({ card }: { card: SettingsCard }) {
  const Icon = card.icon;

  return (
    <Card
      className={cn(
        "min-h-[330px] rounded-lg p-0 shadow-none transition-colors",
        card.featured && "border-primary/70 ring-1 ring-primary/70",
      )}
    >
      <CardContent className="flex h-full min-h-[330px] flex-col px-7 py-7">
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              "flex size-20 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg:not([class*='size-'])]:size-9",
              card.comingSoon && "bg-muted text-primary",
            )}
          >
            <Icon />
          </div>
          {card.featured ? (
            <Badge
              variant="outline"
              className="size-8 rounded-full border-primary bg-primary/10 p-0 text-primary"
              aria-label="Recommended setting"
            >
              <StarIcon />
            </Badge>
          ) : card.comingSoon ? (
            <Badge variant="outline">Coming soon</Badge>
          ) : null}
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <CardTitle className="text-2xl font-semibold leading-tight">
            {card.title}
          </CardTitle>
          <p className="max-w-sm text-base leading-7 text-muted-foreground">
            {card.description}
          </p>
        </div>
        {card.featured ? (
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <ActivityIcon />
            Used by vehicle intake forms
          </div>
        ) : null}
        <div className="mt-auto pt-8">
          {card.href && !card.comingSoon ? (
            <Button
              asChild
              className={cn("w-full", !card.featured && "bg-transparent")}
              variant={card.featured ? "default" : "outline"}
            >
              <Link href={card.href}>
                {card.actionLabel}
                <ChevronRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              {card.actionLabel}
              <LockIcon data-icon="inline-end" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
