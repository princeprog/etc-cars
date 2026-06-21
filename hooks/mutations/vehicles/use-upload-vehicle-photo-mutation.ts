"use client"

import { useMutation } from "@tanstack/react-query"

import { uploadVehiclePhoto } from "@/services/uploads.service"

export function useUploadVehiclePhotoMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadVehiclePhoto(file),
  })
}
