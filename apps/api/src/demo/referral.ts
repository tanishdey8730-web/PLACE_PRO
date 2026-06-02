import type {
  ReferralConnectionItem,
  ReferralListingItem,
  ReferralMessageItem,
  ReferralTrackingSummary,
} from "@placepro/shared";
import { randomBytes } from "crypto";

const author = (id: string, name: string) => ({
  id,
  name,
  avatar: null,
  college: "Demo College",
});

export let demoListings: ReferralListingItem[] = [
  {
    id: "ref-list-1",
    type: "REQUEST",
    companyName: "Google",
    companyId: null,
    targetRole: "Software Engineer Intern",
    description:
      "Final-year CS student with strong DSA and two internships. Looking for an employee referral for SWE intern 2026.",
    skills: ["Java", "Python", "DSA"],
    status: "OPEN",
    author: author("student-1", "Arjun Mehta"),
    isOwner: false,
    connectionsCount: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "ref-list-2",
    type: "OFFER",
    companyName: "Microsoft",
    companyId: null,
    targetRole: "SDE",
    description:
      "SDE at Microsoft, can refer 2 strong candidates per quarter. Prefer full-stack or backend profiles with internship experience.",
    skills: ["C#", ".NET", "Azure"],
    status: "OPEN",
    author: author("alumni-1", "Sneha Reddy"),
    isOwner: false,
    connectionsCount: 0,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "ref-list-3",
    type: "REQUEST",
    companyName: "Amazon",
    companyId: null,
    targetRole: "SDE-1",
    description: "Need referral for Amazon SDE role. 500+ LeetCode, good system design basics.",
    skills: ["Java", "AWS"],
    status: "OPEN",
    author: author("student-2", "Rahul Verma"),
    isOwner: false,
    connectionsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ref-list-4",
    type: "OFFER",
    companyName: "Meta",
    companyId: null,
    targetRole: "Production Engineer",
    description: "Can refer for PE roles. Must have strong networking/OS fundamentals.",
    skills: ["C++", "Linux"],
    status: "OPEN",
    author: author("alumni-2", "Ananya Iyer"),
    isOwner: false,
    connectionsCount: 2,
    createdAt: new Date().toISOString(),
  },
];

export let demoConnections: ReferralConnectionItem[] = [
  {
    id: "ref-conn-1",
    listingId: "ref-list-1",
    listingType: "REQUEST",
    companyName: "Google",
    targetRole: "Software Engineer Intern",
    status: "ACTIVE",
    trackingNotes: "Resume shared; awaiting recruiter screen",
    otherUser: author("student-1", "Arjun Mehta"),
    isInitiator: true,
    lastMessage: "Thanks for connecting!",
    createdAt: new Date().toISOString(),
  },
];

const demoMessages: Record<string, ReferralMessageItem[]> = {
  "ref-conn-1": [
    {
      id: "msg-1",
      connectionId: "ref-conn-1",
      senderId: "student-1",
      senderName: "Arjun Mehta",
      body: "Hi! I'd love a referral for the SWE intern role. Happy to share my resume.",
      isMine: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "msg-2",
      connectionId: "ref-conn-1",
      senderId: "demo-guest",
      senderName: "You",
      body: "Thanks for connecting! Please send your resume and Job ID.",
      isMine: true,
      createdAt: new Date().toISOString(),
    },
  ],
};

export const demoTracking: ReferralTrackingSummary = {
  requestsPosted: 1,
  offersPosted: 0,
  activeConnections: 1,
  referralsGiven: 0,
  referralsReceived: 0,
  completedReferrals: 0,
  pendingResponses: 1,
};

export function filterDemoListings(params: {
  type?: string;
  company?: string;
  mine?: boolean;
}): ReferralListingItem[] {
  let list = [...demoListings];
  if (params.type) list = list.filter((l) => l.type === params.type);
  if (params.company) {
    const c = params.company.toLowerCase();
    list = list.filter((l) => l.companyName.toLowerCase().includes(c));
  }
  return list;
}

export function getDemoListing(id: string): ReferralListingItem | undefined {
  return demoListings.find((l) => l.id === id);
}

export function getDemoConnections(userId: string): ReferralConnectionItem[] {
  return demoConnections.map((c) => ({
    ...c,
    isInitiator: c.otherUser.id !== userId,
    otherUser: c.otherUser,
  }));
}

export function getDemoMessages(
  connectionId: string,
  userId: string
): ReferralMessageItem[] {
  return (demoMessages[connectionId] ?? []).map((m) => ({
    ...m,
    isMine: m.senderId === userId || m.senderId === "demo-guest",
  }));
}

export function addDemoMessage(
  connectionId: string,
  senderId: string,
  senderName: string,
  body: string
): ReferralMessageItem {
  const msg: ReferralMessageItem = {
    id: `msg-${randomBytes(4).toString("hex")}`,
    connectionId,
    senderId,
    senderName,
    body,
    isMine: true,
    createdAt: new Date().toISOString(),
  };
  if (!demoMessages[connectionId]) demoMessages[connectionId] = [];
  demoMessages[connectionId].push(msg);
  return msg;
}
