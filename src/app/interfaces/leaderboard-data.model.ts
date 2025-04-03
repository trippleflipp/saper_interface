import { LeaderTable } from "./leader-table.model";

export interface LeaderboardData {
  easy: LeaderTable[];
  medium: LeaderTable[];
  hard: LeaderTable[];
}