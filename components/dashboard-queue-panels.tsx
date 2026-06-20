"use client"

import { format } from "date-fns"

import type { DashboardResponse } from "@/types/dashboard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>
}

export function DashboardQueuePanels({
  queues,
}: {
  queues: DashboardResponse["queues"]
}) {
  return (
    <div className="grid gap-4 px-4 lg:px-6 @5xl/main:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Overdue Follow-ups</CardTitle>
          <CardDescription>Incomplete follow-ups past their due time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {queues.overdueFollowUps.length === 0 ? (
            <EmptyState label="No overdue follow-ups." />
          ) : (
            queues.overdueFollowUps.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.note}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.leadType === "buyer" ? "Buyer lead" : "Seller lead"} • due{" "}
                    {format(new Date(item.dueAt), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <Badge variant="destructive">Overdue</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Due Today</CardTitle>
          <CardDescription>Follow-ups scheduled for the current day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {queues.dueTodayFollowUps.length === 0 ? (
            <EmptyState label="No follow-ups due today." />
          ) : (
            queues.dueTodayFollowUps.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.note}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.leadType === "buyer" ? "Buyer lead" : "Seller lead"} • due{" "}
                    {format(new Date(item.dueAt), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <Badge variant="outline">Due</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Seller Leads</CardTitle>
          <CardDescription>Incoming acquisition inquiries awaiting triage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {queues.newSellerLeads.length === 0 ? (
            <EmptyState label="No new seller leads." />
          ) : (
            queues.newSellerLeads.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{item.sellerName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.vehicleBrand} {item.vehicleModel}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Buyer Leads</CardTitle>
          <CardDescription>Fresh buyer inquiries that still need first contact.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {queues.newBuyerLeads.length === 0 ? (
            <EmptyState label="No new buyer leads." />
          ) : (
            queues.newBuyerLeads.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{item.buyerName}</p>
                <p className="text-xs text-muted-foreground">{item.contactNumber}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
