export interface Link {
  index: number;
  url: string;
  name: string;
}

export interface LinksResponse {
  messages: string;
  data: Link[];
  status_code: number;
}