export interface ApiFileBlob {
  uri: string;
  name: string;
  contentType: string;
  size: number;
}

export interface ApiUploadResult {
  status: string;
  error: boolean;
  blob: ApiFileBlob;
}
