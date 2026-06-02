export type ReferralListingType = "REQUEST" | "OFFER";
export type ReferralListingStatus = "OPEN" | "MATCHED" | "CLOSED";
export type ReferralConnectionStatus =
  | "PENDING"
  | "ACTIVE"
  | "REFERRED"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

export interface ReferralListingAuthor {
  id: string;
  name: string;
  avatar?: string | null;
  college?: string | null;
}

export interface ReferralListingItem {
  id: string;
  type: ReferralListingType;
  companyId?: string | null;
  companyName: string;
  targetRole: string;
  description: string;
  skills: string[];
  status: ReferralListingStatus;
  author: ReferralListingAuthor;
  isOwner: boolean;
  connectionsCount: number;
  createdAt: string;
}

export interface ReferralConnectionItem {
  id: string;
  listingId: string;
  listingType: ReferralListingType;
  companyName: string;
  targetRole: string;
  status: ReferralConnectionStatus;
  trackingNotes?: string | null;
  referredAt?: string | null;
  completedAt?: string | null;
  otherUser: ReferralListingAuthor;
  isInitiator: boolean;
  lastMessage?: string | null;
  unreadCount?: number;
  createdAt: string;
}

export interface ReferralMessageItem {
  id: string;
  connectionId: string;
  senderId: string;
  senderName: string;
  body: string;
  isMine: boolean;
  createdAt: string;
}

export interface ReferralTrackingSummary {
  requestsPosted: number;
  offersPosted: number;
  activeConnections: number;
  referralsGiven: number;
  referralsReceived: number;
  completedReferrals: number;
  pendingResponses: number;
}
