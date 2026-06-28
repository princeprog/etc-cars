"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  BellRingIcon,
  CarFrontIcon,
  ChartColumnIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  ScanSearchIcon,
  ShoppingBagIcon,
  UsersRoundIcon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
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
      title: "Reports",
      url: "/reports",
      icon: <ChartColumnIcon />,
    },
  ],
  adminNav: [
    {
      title: "Staff",
      url: "/staff",
      icon: <UsersRoundIcon />,
    },
  ],
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    avatar: string
    role: "admin" | "staff"
  }
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <div className="relative size-7 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src="/etc_light_logo.png"
                    alt="ETC Cars"
                    fill
                    className="object-contain dark:hidden"
                    sizes="28px"
                    priority
                  />
                  <Image
                    src="/etc_dark_logo.png"
                    alt="ETC Cars"
                    fill
                    className="hidden object-contain dark:block"
                    sizes="28px"
                    priority
                  />
                </div>
                <span className="text-base font-semibold">ETC Cars</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Workspace" items={data.navMain} />
        {user.role === "admin" ? (
          <NavMain label="Administration" items={data.adminNav} />
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
