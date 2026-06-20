"use client"

import * as React from "react"
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
  CommandIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  ScanSearchIcon,
  ShoppingBagIcon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Vehicles",
      url: "/vehicles",
      icon: (
        <CarFrontIcon
        />
      ),
    },
    {
      title: "Seller Leads",
      url: "/seller-leads",
      icon: (
        <ScanSearchIcon
        />
      ),
    },
    {
      title: "Buyer Leads",
      url: "/buyer-leads",
      icon: (
        <ShoppingBagIcon
        />
      ),
    },
    {
      title: "Follow-Ups",
      url: "/follow-ups",
      icon: (
        <BellRingIcon
        />
      ),
    },
    {
      title: "Sales",
      url: "/sales",
      icon: (
        <HandCoinsIcon
        />
      ),
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
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">ETC Cars</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
