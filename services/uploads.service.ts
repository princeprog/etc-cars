import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  UploadExpenseReceiptResponse,
  UploadVehiclePhotoResponse,
} from "@/types/uploads"

export function uploadVehiclePhoto(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  return apiRequest<UploadVehiclePhotoResponse, FormData>(
    API_ENDPOINTS.uploads.vehiclePhoto,
    {
      method: "POST",
      body: formData,
    },
  )
}

export function uploadExpenseReceipt(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  return apiRequest<UploadExpenseReceiptResponse, FormData>(
    API_ENDPOINTS.uploads.expenseReceipt,
    {
      method: "POST",
      body: formData,
    },
  )
}
