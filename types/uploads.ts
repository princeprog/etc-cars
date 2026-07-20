export interface UploadedFile {
  path: string
  url: string
  filename: string
  originalFilename?: string
  mimeType: string
  size: number
  publicId?: string
  width?: number
  height?: number
  format?: string
  optimizedUrl?: string
}

export interface UploadVehiclePhotoResponse {
  file: UploadedFile
}

export interface UploadExpenseReceiptResponse {
  file: UploadedFile
}
