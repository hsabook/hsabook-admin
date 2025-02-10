export interface UploadResponse {
  messages: string;
  data: {
    url: string;
  };
  status_code: number;
}