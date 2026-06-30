export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';

export interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  vendorId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  evidenceUrls: string[];
  createdAt: string;
  resolvedAt?: string;
}
