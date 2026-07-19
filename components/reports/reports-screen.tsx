"use client"

import * as React from "react"
import { format } from "date-fns"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { cn } from "@/lib/utils"
import type { ExpenseReportFilters } from "@/types/expenses"
import type { ReportFilters } from "@/types/reports"
import { ExpensesReport } from "./expenses-report"
import { InventoryReport } from "./inventory-report"
import { LeadsReport } from "./leads-report"
import { OverviewReport } from "./overview-report"
import { ProfitabilityReport } from "./profitability-report"
import { SalesReport } from "./sales-report"
import {
  DEFAULT_REPORT_FILTERS,
  ReportFilterBar,
  type ReportFilterState,
} from "./report-filter-bar"

type ReportTab =
  | "overview"
  | "sales"
  | "inventory"
  | "leads"
  | "profitability"
  | "expenses"

const TABS: { value: ReportTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "sales", label: "Sales" },
  { value: "inventory", label: "Inventory" },
  { value: "leads", label: "Leads" },
  { value: "profitability", label: "Profitability" },
  { value: "expenses", label: "Expenses" },
]

function AnimatedTabsList({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { value: string; label: string }[]
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())
  const [pill, setPill] = React.useState({ left: 3, width: 0 })
  const [ready, setReady] = React.useState(false)

  React.useLayoutEffect(() => {
    const container = containerRef.current
    const el = tabRefs.current.get(activeTab)
    if (!container || !el) return
    const cr = container.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    setPill({ left: er.left - cr.left, width: er.width })
    setReady(true)
  }, [activeTab])

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Report sections"
      className="relative inline-flex h-9 w-full max-w-xl items-center rounded-lg bg-muted p-[3px]"
    >
      {ready ? (
        <div
          aria-hidden
          className="pointer-events-none absolute top-[3px] bottom-[3px] rounded-md bg-background shadow-sm"
          style={{
            left: pill.left,
            width: pill.width,
            transition: "left 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      ) : null}

      {tabs.map((tab) => (
        <button
          key={tab.value}
          ref={(el) => {
            if (el) tabRefs.current.set(tab.value, el)
            else tabRefs.current.delete(tab.value)
          }}
          type="button"
          role="tab"
          aria-selected={tab.value === activeTab}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "relative z-10 flex-1 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-200",
            tab.value === activeTab
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

export function ReportsScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const [activeTab, setActiveTab] = React.useState<ReportTab>("overview")
  const [filters, setFilters] = React.useState<ReportFilterState>(
    DEFAULT_REPORT_FILTERS,
  )
  const isAdmin = authQuery.data?.user.role === "admin"
  const visibleTabs = React.useMemo(
    () => TABS.filter((tab) => isAdmin || tab.value !== "expenses"),
    [isAdmin],
  )
  const safeActiveTab = !isAdmin && activeTab === "expenses" ? "overview" : activeTab

  function handleTabChange(tab: string) {
    if (tab === "expenses" && !isAdmin) {
      return
    }

    setActiveTab(tab as ReportTab)
  }

  // Sales/profitability: full filter set (date range + groupBy + agent)
  const salesFilters = React.useMemo<ReportFilters>(
    () => ({
      startDate: filters.dateRange?.from
        ? toDateStr(filters.dateRange.from)
        : undefined,
      endDate: filters.dateRange?.to
        ? toDateStr(filters.dateRange.to)
        : undefined,
      groupBy: filters.groupBy,
      agentName: filters.agentName.trim() || undefined,
    }),
    [filters],
  )

  // Overview: date range + agent only (no groupBy)
  const overviewFilters = React.useMemo<ReportFilters>(
    () => ({
      startDate: filters.dateRange?.from
        ? toDateStr(filters.dateRange.from)
        : undefined,
      endDate: filters.dateRange?.to
        ? toDateStr(filters.dateRange.to)
        : undefined,
      agentName: filters.agentName.trim() || undefined,
    }),
    [filters.dateRange, filters.agentName],
  )

  // Leads: date range only
  const leadsFilters = React.useMemo<ReportFilters>(
    () => ({
      startDate: filters.dateRange?.from
        ? toDateStr(filters.dateRange.from)
        : undefined,
      endDate: filters.dateRange?.to
        ? toDateStr(filters.dateRange.to)
        : undefined,
    }),
    [filters.dateRange],
  )

  const expenseFilters = React.useMemo<ExpenseReportFilters>(
    () => ({
      startDate: filters.dateRange?.from
        ? toDateStr(filters.dateRange.from)
        : undefined,
      endDate: filters.dateRange?.to
        ? toDateStr(filters.dateRange.to)
        : undefined,
    }),
    [filters.dateRange],
  )

  const showFilterBar = safeActiveTab !== "inventory"
  const showGrouping = safeActiveTab === "sales" || safeActiveTab === "profitability"
  const showAgent = safeActiveTab !== "leads" && safeActiveTab !== "expenses"

  return (
    <AuthenticatedAppShell title="Reports">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Review sales, inventory, lead conversion and profitability using live
            system data. Apply filters, then export any report as CSV.
          </p>
        </div>

        <Tabs
          value={safeActiveTab}
          onValueChange={handleTabChange}
          className="gap-6"
        >
          <AnimatedTabsList
            tabs={visibleTabs}
            activeTab={safeActiveTab}
            onTabChange={handleTabChange}
          />

          {showFilterBar ? (
            <ReportFilterBar
              value={filters}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_REPORT_FILTERS)}
              showGrouping={showGrouping}
              showAgent={showAgent}
            />
          ) : null}

          <TabsContent value="overview">
            <OverviewReport
              filters={overviewFilters}
              enabled={safeActiveTab === "overview"}
            />
          </TabsContent>
          <TabsContent value="sales">
            <SalesReport filters={salesFilters} enabled={safeActiveTab === "sales"} />
          </TabsContent>
          <TabsContent value="inventory">
            <InventoryReport filters={{}} enabled={safeActiveTab === "inventory"} />
          </TabsContent>
          <TabsContent value="leads">
            <LeadsReport filters={leadsFilters} enabled={safeActiveTab === "leads"} />
          </TabsContent>
          <TabsContent value="profitability">
            <ProfitabilityReport
              filters={salesFilters}
              enabled={safeActiveTab === "profitability"}
            />
          </TabsContent>
          {isAdmin ? (
            <TabsContent value="expenses">
              <ExpensesReport
                filters={expenseFilters}
                enabled={isAdmin && safeActiveTab === "expenses"}
              />
            </TabsContent>
          ) : null}
        </Tabs>
      </div>
    </AuthenticatedAppShell>
  )
}
