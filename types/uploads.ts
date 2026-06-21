export interface UploadedFile {
  path: string
  url: string
  filename: string
  mimeType: string
  size: number
}

export interface UploadVehiclePhotoResponse {
  file: UploadedFile
}
