"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  addFinancingRepresentative,
  createFinancingApplication,
  createFinancingPartner,
  createFinancingRequirement,
  createFinancingTemplate,
  deleteFinancingRequirement,
  decideFinancingApplication,
  generateFinancingUploadLink,
  recordFinancingLoanRelease,
  recordFinancingVehicleRelease,
  reviewFinancingRequirement,
  revokeFinancingUploadLink,
  updateFinancingRequirement,
  uploadFinancingRequirementDocument,
} from "@/services/financing.service"
import { financingQueryKeys } from "@/hooks/queries/financing/financing-query-keys"

export function useFinancingMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: financingQueryKeys.all })

  return {
    createPartner: useMutation({
      mutationFn: createFinancingPartner,
      onSuccess: invalidate,
    }),
    addRepresentative: useMutation({
      mutationFn: ({
        partnerId,
        payload,
      }: {
        partnerId: string
        payload: { userId: string; isActive?: boolean }
      }) => addFinancingRepresentative(partnerId, payload),
      onSuccess: invalidate,
    }),
    createTemplate: useMutation({
      mutationFn: createFinancingTemplate,
      onSuccess: invalidate,
    }),
    createRequirement: useMutation({
      mutationFn: createFinancingRequirement,
      onSuccess: invalidate,
    }),
    updateRequirementSetting: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string
        payload: { label?: string; description?: string | null }
      }) => updateFinancingRequirement(id, payload),
      onSuccess: invalidate,
    }),
    deleteRequirementSetting: useMutation({
      mutationFn: deleteFinancingRequirement,
      onSuccess: invalidate,
    }),
    createApplication: useMutation({
      mutationFn: createFinancingApplication,
      onSuccess: invalidate,
    }),
    generateUploadLink: useMutation({
      mutationFn: generateFinancingUploadLink,
      onSuccess: invalidate,
    }),
    revokeUploadLink: useMutation({
      mutationFn: revokeFinancingUploadLink,
      onSuccess: invalidate,
    }),
    reviewRequirement: useMutation({
      mutationFn: ({
        applicationId,
        requirementId,
        payload,
      }: {
        applicationId: string
        requirementId: string
        payload: {
          status: "accepted" | "revision_requested"
          revisionReason?: string | null
          note?: string | null
        }
      }) => reviewFinancingRequirement(applicationId, requirementId, payload),
      onSuccess: invalidate,
    }),
    decideApplication: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string
        payload: { decision: "approved" | "rejected"; note?: string | null }
      }) => decideFinancingApplication(id, payload),
      onSuccess: invalidate,
    }),
    recordLoanRelease: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string
        payload: {
          releasedLoanAmount: string
          loanReleasedAt: string
          loanReleaseReference?: string | null
        }
      }) => recordFinancingLoanRelease(id, payload),
      onSuccess: invalidate,
    }),
    recordVehicleRelease: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string
        payload: { vehicleReleasedAt?: string | null; note?: string | null }
      }) => recordFinancingVehicleRelease(id, payload),
      onSuccess: invalidate,
    }),
    uploadDocument: useMutation({
      mutationFn: ({
        applicationId,
        requirementId,
        file,
      }: {
        applicationId: string
        requirementId: string
        file: File
      }) =>
        uploadFinancingRequirementDocument(applicationId, requirementId, file),
      onSuccess: invalidate,
    }),
  }
}
