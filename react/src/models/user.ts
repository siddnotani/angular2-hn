// Mirrors src/app/shared/models/user.ts (including the `crated_time` typo from node-hnapi).
export interface User {
  id: string;
  crated_time: number;
  created: string;
  karma: number;
  avg?: number;
  about?: string;
}
