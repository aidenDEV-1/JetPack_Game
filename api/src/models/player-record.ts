export interface PlayerRecordDocument {
  id: string;
  userId: string;
  displayName: string;
  tenantId: string;
  bestDistanceMeters: number;
  bestRunCoins: number;
  bestScore: number;
  bestAchievedAt: string;
  totalCoins: number;
  updatedAt: string;
}
