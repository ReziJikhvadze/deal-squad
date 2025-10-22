// Participation Types
export interface Participation {
  id: string;
  userId: string;
  campaignId: string;
  quantity: number;
  depositAmount: number;
  depositPaid: boolean;
  finalPaymentAmount?: number;
  finalPaymentPaid: boolean;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled' | 'Refunded';
  joinedAt: string;
}

export interface CreateParticipationRequest {
  campaignId: string;
  quantity: number;
}
