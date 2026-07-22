"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, LockIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  url?: string;
  icon?: ReactNode;
  locked?: boolean;
  items?: NavItem[];
};

export function NavMain({
  label,
  items,
}: {
  label?: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <NavMainItem key={item.title} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavMainItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const hasChildren = Boolean(item.items?.length);
  const isActive =
    Boolean(item.url && isActiveNavItem(pathname, item.url)) ||
    Boolean(
      item.items?.some(
        (child) => child.url && isActiveNavItem(pathname, child.url),
      ),
    );

  if (hasChildren) {
    return (
      <Collapsible defaultOpen={isActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title} isActive={isActive}>
              {item.icon}
              <span>{item.title}</span>
              <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent
            className="group/settings-submenu overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
            style={
              {
                "--radix-accordion-content-height":
                  "var(--radix-collapsible-content-height)",
              } as CSSProperties
            }
          >
            <SidebarMenuSub className="origin-top transition-[opacity,transform] duration-200 ease-out group-data-[state=closed]/settings-submenu:-translate-y-1 group-data-[state=closed]/settings-submenu:opacity-0 group-data-[state=open]/settings-submenu:translate-y-0 group-data-[state=open]/settings-submenu:opacity-100 motion-reduce:transition-none">
              {item.items?.map((child) => (
                <SidebarMenuSubItem key={child.title}>
                  <SettingsSubNavItem item={child} pathname={pathname} />
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  if (!item.url || item.locked) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          disabled
          tooltip={item.locked ? `${item.title} is locked` : item.title}
        >
          {item.icon}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        isActive={isActiveNavItem(pathname, item.url)}
      >
        <Link href={item.url}>
          {item.icon}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SettingsSubNavItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  if (!item.url || item.locked) {
    return (
      <SidebarMenuSubButton
        asChild
        aria-disabled="true"
        className="cursor-not-allowed text-muted-foreground"
      >
        <button type="button" disabled>
          {item.icon ?? <LockIcon />}
          <span>{item.title}</span>
        </button>
      </SidebarMenuSubButton>
    );
  }

  return (
    <SidebarMenuSubButton
      asChild
      isActive={isActiveNavItem(pathname, item.url)}
      className={cn(item.icon && "[&>svg]:text-sidebar-foreground")}
    >
      <Link href={item.url}>
        {item.icon}
        <span>{item.title}</span>
      </Link>
    </SidebarMenuSubButton>
  );
}

function isActiveNavItem(pathname: string, url?: string) {
  if (!url) {
    return false;
  }

  if (url === "/dashboard") {
    return pathname === url;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}
