export interface DisputeMessage {
  id: string;
  sender: 'buyer' | 'vendor';
  text: string;
  timestamp: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  raisedBy: 'buyer' | 'vendor';
  buyerReason: string;
  vendorResponse?: string;
  tier: 'negotiation' | 'admin_review';
  adminDecision: 'pending' | 'resolved_vendor' | 'resolved_buyer';
  adminNotes?: string;
  autoReleaseAt: string;
  resolvedAt?: string;
  createdAt: string;
  messages: DisputeMessage[];
}
