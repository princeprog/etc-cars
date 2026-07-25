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
  LandmarkIcon,
  LockIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  ScanSearchIcon,
  SettingsIcon,
  ShoppingBagIcon,
  UsersRoundIcon,
} from "lucide-react";
import { can } from "@/lib/permissions";

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
          title: "Financing",
          url: "/financing",
          icon: <LandmarkIcon />,
          permission: "financing.view",
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
        icon: <SettingsIcon />,
        items: [
          {
            title: "Vehicle Catalog",
            url: "/settings/vehicle-catalog",
            icon: <CarFrontIcon />,
          },
          {
            title: "Roles & Access",
            url: "/settings/roles",
            icon: <UsersRoundIcon />,
          },
          {
            title: "Expense Categories",
            url: "/settings/expense-categories",
            icon: <ReceiptTextIcon />,
          },
          {
            title: "Inspection Checklists",
            url: "/settings/inspection-checklists",
            icon: <ClipboardListIcon />,
          },
          {
            title: "Financing",
            url: "/settings/financing",
            icon: <LandmarkIcon />,
            permissionAny: [
              "financing.manage_partners",
              "financing.manage_templates",
            ],
          },
          {
            title: "Dealership Profile",
            icon: <LockIcon />,
            locked: true,
          },
          {
            title: "Sales Preferences",
            icon: <LockIcon />,
            locked: true,
          },
        ],
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
    permissions?: Record<string, "assigned" | "all">;
  };
}) {
  const navGroups = data.navGroups
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, user),
    }))
    .filter((group) => group.items.length > 0);
  const adminItems = filterNavItems(data.adminGroup.items, user);

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
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
        {adminItems.length ? (
          <NavMain
            label={data.adminGroup.label}
            items={adminItems}
          />
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

type NavItem = {
  title: string;
  url?: string;
  icon: React.ReactNode;
  permission?: string;
  permissionAny?: string[];
  locked?: boolean;
  items?: NavItem[];
};

function filterNavItems(
  items: NavItem[],
  user: { permissions?: Record<string, "assigned" | "all">; role: "admin" | "staff" },
): NavItem[] {
  return items
    .filter((item) => {
      if (item.permission && !can(user, item.permission)) {
        return false;
      }

      if (item.permissionAny?.length && !item.permissionAny.some((permission) => can(user, permission))) {
        return false;
      }

      return item.url || item.items?.length || item.locked;
    })
    .map((item) => ({
      ...item,
      items: item.items ? filterNavItems(item.items, user) : undefined,
    }))
    .filter((item) => item.url || item.items?.length || item.locked);
}
