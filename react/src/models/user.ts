export interface User {
  id: string;
  created_time: number;
  created: string;
  karma: number;
  avg: number | null;
  about?: string;
}
