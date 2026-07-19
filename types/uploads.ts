export interface UploadedFile {
  path: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  optimizedUrl?: string;
}

export interface UploadVehiclePhotoResponse {
  file: UploadedFile;
}
