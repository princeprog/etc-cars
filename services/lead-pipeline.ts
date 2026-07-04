import type { BuyerLead } from "@/types/buyer-leads"
import type { LeadPipelineAction, LeadPipelineBlocker, LeadPipelineState } from "@/types/lead-pipeline"
import type { SellerLead } from "@/types/seller-leads"

function createAction(
  code: string,
  label: string,
  description: string,
  target?: LeadPipelineAction["target"],
): LeadPipelineAction {
  return { code, label, description, target }
}

function createBlocker(
  code: string,
  label: string,
  description: string,
  severity: LeadPipelineBlocker["severity"],
  target?: LeadPipelineBlocker["target"],
): LeadPipelineBlocker {
  return { code, label, description, severity, target }
}

function getLeadAgeState(lastActivityAt: string | null, updatedAt: string, staleDays: number) {
  const activityAt = lastActivityAt ?? updatedAt
  const ageMs = Date.now() - new Date(activityAt).getTime()
  return {
    lastActivityAt: activityAt,
    isStale: ageMs > staleDays * 24 * 60 * 60 * 1000,
  }
}

export function buildBuyerLeadPipelineState(lead: BuyerLead): LeadPipelineState {
  if (lead.pipeline) {
    return lead.pipeline
  }

  const isClosed = lead.status === "Won" || lead.status === "Lost"
  const ageState = getLeadAgeState(lead.latestActivityAt, lead.updatedAt, lead.status === "New Inquiry" ? 2 : 5)
  const blockers: LeadPipelineBlocker[] = []
  const warnings: LeadPipelineBlocker[] = []

  if (!lead.contactNumber.trim()) {
    blockers.push(
      createBlocker(
        "missing_contact",
        "Missing contact information",
        "Add a working contact number before progressing this buyer lead.",
        "critical",
        "lead_edit",
      ),
    )
  }

  if (!isClosed && lead.vehicles.length === 0) {
    blockers.push(
      createBlocker(
        "missing_vehicle_link",
        "No linked vehicle",
        "Link a vehicle before reserving or finalizing this buyer lead.",
        "critical",
        "vehicle_link",
      ),
    )
  }

  if (lead.status === "Reserved") {
    blockers.push(
      createBlocker(
        "sale_pending",
        "Sale finalization pending",
        "This buyer already has a reserved unit but still needs the sale to be finalized.",
        "warning",
        "sale_finalization",
      ),
    )
  }

  if (!isClosed && ageState.isStale) {
    warnings.push(
      createBlocker(
        "stale_buyer_lead",
        "Lead is stale",
        "No recent activity was recorded for this buyer lead, so it should be reviewed soon.",
        "warning",
        "follow_up",
      ),
    )
  }

  if (lead.status === "Negotiating") {
    warnings.push(
      createBlocker(
        "active_negotiation",
        "Negotiation needs momentum",
        "Keep follow-ups tight while terms are being negotiated so the buyer stays warm.",
        "info",
        "follow_up",
      ),
    )
  }

  let stage = "buyer_pipeline"
  let stageLabel = "Pipeline"
  let progressPercent = 10
  let nextAction: LeadPipelineAction | null

  switch (lead.status) {
    case "New Inquiry":
      stage = "new_lead"
      stageLabel = "New Lead"
      progressPercent = 10
      nextAction = createAction("make_first_contact", "Update Lead", "Capture first contact progress and buyer details.", "lead_edit")
      break
    case "Contacted":
      stage = "contacted"
      stageLabel = "Contacted / In Follow-up"
      progressPercent = 25
      nextAction = createAction("qualify_buyer", "Update Lead", "Capture preferences, budget, and follow-up context for this buyer.", "lead_edit")
      break
    case "Interested":
      stage = lead.vehicles.length > 0 ? "vehicle_matched" : "interested"
      stageLabel = lead.vehicles.length > 0 ? "Vehicle Matched" : "Contacted / In Follow-up"
      progressPercent = lead.vehicles.length > 0 ? 55 : 40
      nextAction = lead.vehicles.length > 0
        ? createAction("review_matched_vehicle", "Open Lead", "Review linked vehicles and confirm the best unit for this buyer.", "view")
        : createAction("link_vehicle", "Match Vehicles", "Link candidate units so this buyer can move toward reservation.", "vehicle_link")
      break
    case "Negotiating":
      stage = lead.vehicles.length > 0 ? "ready_to_reserve" : "negotiating"
      stageLabel = lead.vehicles.length > 0 ? "Ready to Reserve" : "Contacted / In Follow-up"
      progressPercent = lead.vehicles.length > 0 ? 70 : 50
      nextAction = lead.vehicles.length > 0
        ? createAction("confirm_reservation", "Open Lead", "Confirm terms and move the buyer toward reservation.", "view")
        : createAction("link_vehicle", "Match Vehicles", "Link a vehicle before trying to reserve this buyer.", "vehicle_link")
      break
    case "Reserved":
      stage = "sale_finalization_pending"
      stageLabel = "Sale Finalization Pending"
      progressPercent = 85
      nextAction = createAction("finalize_sale", "Finalize Workflow", "Open the existing sale workflow and complete this deal.", "sale_finalization")
      break
    case "Won":
      stage = "won"
      stageLabel = "Won / Sale Finalized"
      progressPercent = 100
      nextAction = createAction("view_completed_lead", "View Details", "Review the completed lead record.", "view")
      break
    case "Lost":
      stage = "closed_lost"
      stageLabel = "Lost / Closed"
      progressPercent = 100
      nextAction = createAction("view_closed_lead", "View Details", "Review the closed buyer lead record.", "view")
      break
    default:
      nextAction = createAction("review_lead", "Open Lead", "Review this lead and decide the next operational step.", "view")
  }

  return {
    stage,
    stageLabel,
    progressPercent,
    nextAction,
    blockers,
    warnings,
    lastActivityAt: ageState.lastActivityAt,
    isStale: !isClosed && ageState.isStale,
  }
}

export function buildSellerLeadPipelineState(lead: SellerLead): LeadPipelineState {
  if (lead.pipeline) {
    return lead.pipeline
  }

  const isClosed = lead.status === "Purchased" || lead.status === "Rejected"
  const ageState = getLeadAgeState(lead.latestActivityAt, lead.updatedAt, lead.status === "New Inquiry" ? 2 : 5)
  const blockers: LeadPipelineBlocker[] = []
  const warnings: LeadPipelineBlocker[] = []

  if (!lead.contactNumber.trim()) {
    blockers.push(
      createBlocker(
        "missing_contact",
        "Missing seller contact information",
        "Add a valid contact number before progressing this seller lead.",
        "critical",
        "lead_edit",
      ),
    )
  }

  if (!lead.vehicleBrand.trim() || !lead.vehicleModel.trim() || !lead.vehicleYear) {
    blockers.push(
      createBlocker(
        "missing_vehicle_details",
        "Vehicle details are incomplete",
        "Capture the vehicle brand, model, and year before acquisition review can move forward.",
        "critical",
        "lead_edit",
      ),
    )
  }

  if (!isClosed && !lead.targetBuyPrice && !lead.askingPrice) {
    blockers.push(
      createBlocker(
        "missing_pricing",
        "Pricing is still missing",
        "Add the asking price or target buy price so the team can review acquisition readiness.",
        "warning",
        "evaluation",
      ),
    )
  }

  if (lead.status === "Approved to Buy" && !lead.approvedToBuyAt) {
    blockers.push(
      createBlocker(
        "missing_approval_timestamp",
        "Approval timing is missing",
        "This lead is approved to buy but does not have approval timing recorded yet.",
        "warning",
        "evaluation",
      ),
    )
  }

  if (!isClosed && ageState.isStale) {
    warnings.push(
      createBlocker(
        "stale_seller_lead",
        "Seller lead is stale",
        "No recent activity was recorded for this seller lead, so it should be reviewed soon.",
        "warning",
        "follow_up",
      ),
    )
  }

  if (lead.recommendedAction === "Walk Away") {
    warnings.push(
      createBlocker(
        "walk_away_recommended",
        "Economics look weak",
        "Current evaluation suggests walking away unless new information changes the deal.",
        "info",
        "evaluation",
      ),
    )
  }

  let stage = "seller_pipeline"
  let stageLabel = "Pipeline"
  let progressPercent = 10
  let nextAction: LeadPipelineAction | null

  switch (lead.status) {
    case "New Inquiry":
      stage = "new_seller_lead"
      stageLabel = "New Seller Lead"
      progressPercent = 10
      nextAction = createAction("make_first_contact", "Open Evaluation", "Start qualification and capture the first seller conversation.", "evaluation")
      break
    case "Contacted":
      stage = "contacted"
      stageLabel = "Contacted / In Follow-up"
      progressPercent = 25
      nextAction = createAction("capture_vehicle_details", "Open Evaluation", "Complete the core vehicle details needed for review.", "evaluation")
      break
    case "Inspection Scheduled":
      stage = "vehicle_details_captured"
      stageLabel = "Vehicle Details Captured"
      progressPercent = 45
      nextAction = createAction("complete_inspection", "Open Evaluation", "Complete the inspection and fill in the evaluation details.", "evaluation")
      break
    case "Evaluated":
      stage = "acquisition_review"
      stageLabel = "Acquisition Review"
      progressPercent = 60
      nextAction = createAction("lock_buy_decision", "Open Evaluation", "Review pricing and lock the acquisition decision.", "evaluation")
      break
    case "Negotiating":
      stage = "acquisition_review"
      stageLabel = "Acquisition Review"
      progressPercent = 70
      nextAction = createAction("review_acquisition_pricing", "Open Evaluation", "Finish negotiating and confirm whether the deal is ready to buy.", "evaluation")
      break
    case "Approved to Buy":
      stage = "ready_for_vehicle_create"
      stageLabel = "Acquisition Review"
      progressPercent = 85
      nextAction = createAction("create_inventory_vehicle", "Convert to Vehicle", "Create the inventory record from this approved seller lead.", "vehicle_create")
      break
    case "Purchased":
      stage = "acquired"
      stageLabel = "Acquired / Vehicle Created"
      progressPercent = 100
      nextAction = createAction("view_acquisition", "View Evaluation", "Review the completed acquisition record.", "view")
      break
    case "Rejected":
      stage = "rejected"
      stageLabel = "Rejected / Closed"
      progressPercent = 100
      nextAction = createAction("view_closed_lead", "View Evaluation", "Review the closed seller lead record.", "view")
      break
    default:
      nextAction = createAction("review_lead", "Open Evaluation", "Review this seller lead and decide the next operational step.", "evaluation")
  }

  return {
    stage,
    stageLabel,
    progressPercent,
    nextAction,
    blockers,
    warnings,
    lastActivityAt: ageState.lastActivityAt,
    isStale: !isClosed && ageState.isStale,
  }
}
