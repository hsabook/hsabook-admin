export interface StatisticsData {
  users: number;
  books: number;
  questions: number;
}

export interface StatisticsResponse {
  messages: string;
  data: StatisticsData;
  status_code: number;
} 