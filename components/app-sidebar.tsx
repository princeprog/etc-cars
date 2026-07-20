"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BellRingIcon,
  CarFrontIcon,
  ChartColumnIcon,
  ClipboardListIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  ScanSearchIcon,
  SettingsIcon,
  ShoppingBagIcon,
  UsersRoundIcon,
} from "lucide-react";

const data = {
  navGroups: [
    {
      label: "Workspace",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: <LayoutDashboardIcon />,
        },
      ],
    },
    {
      label: "Inventory & Leads",
      items: [
        {
          title: "Vehicles",
          url: "/vehicles",
          icon: <CarFrontIcon />,
        },
        {
          title: "Seller Leads",
          url: "/seller-leads",
          icon: <ScanSearchIcon />,
        },
        {
          title: "Buyer Leads",
          url: "/buyer-leads",
          icon: <ShoppingBagIcon />,
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          title: "Follow-Ups",
          url: "/follow-ups",
          icon: <BellRingIcon />,
        },
        {
          title: "Sales",
          url: "/sales",
          icon: <HandCoinsIcon />,
        },
        {
          title: "Bills & Expenses",
          url: "/bills-expenses",
          icon: <ReceiptTextIcon />,
        },
      ],
    },
    {
      label: "Insights",
      items: [
        {
          title: "Reports",
          url: "/reports",
          icon: <ChartColumnIcon />,
        },
        {
          title: "Activity History",
          url: "/activity-history",
          icon: <ClipboardListIcon />,
        },
      ],
    },
  ],
  adminGroup: {
    label: "Administration",
    items: [
      {
        title: "Staff",
        url: "/staff",
        icon: <UsersRoundIcon />,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: <SettingsIcon />,
      },
    ],
  },
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    avatar: string;
    role: "admin" | "staff";
  };
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:h-16! data-[slot=sidebar-menu-button]:justify-start data-[slot=sidebar-menu-button]:p-2!"
            >
              <Link href="/dashboard" aria-label="ETC Cars dashboard">
                <div className="relative h-12 w-44 shrink-0 overflow-hidden">
                  <Image
                    src="/etc_light_logo.png"
                    alt="ETC Cars"
                    fill
                    className="object-contain dark:hidden"
                    sizes="176px"
                    priority
                  />
                  <Image
                    src="/etc_dark_logo.png"
                    alt="ETC Cars"
                    fill
                    className="hidden object-contain dark:block"
                    sizes="176px"
                    priority
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
        {user.role === "admin" ? (
          <NavMain
            label={data.adminGroup.label}
            items={data.adminGroup.items}
          />
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
