import { Router } from "express";
import { z } from "zod";
import { prisma, Prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import type {
  ReferralConnectionItem,
  ReferralListingItem,
  ReferralMessageItem,
  ReferralTrackingSummary,
} from "@placepro/shared";
import {
  addDemoMessage,
  demoConnections,
  demoListings,
  demoTracking,
  filterDemoListings,
  getDemoConnections,
  getDemoListing,
  getDemoMessages,
} from "../demo/referral.js";
import { randomBytes } from "crypto";

const router = Router();

function mapAuthor(user: {
  id: string;
  name: string;
  avatar: string | null;
  college: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    college: user.college,
  };
}

function mapListing(
  row: {
    id: string;
    type: "REQUEST" | "OFFER";
    companyId: string | null;
    companyName: string;
    targetRole: string;
    description: string;
    skills: string[];
    status: "OPEN" | "MATCHED" | "CLOSED";
    createdAt: Date;
    user: { id: string; name: string; avatar: string | null; college: string | null };
    _count?: { connections: number };
  },
  viewerId: string
): ReferralListingItem {
  return {
    id: row.id,
    type: row.type,
    companyId: row.companyId,
    companyName: row.companyName,
    targetRole: row.targetRole,
    description: row.description,
    skills: row.skills,
    status: row.status,
    author: mapAuthor(row.user),
    isOwner: row.user.id === viewerId,
    connectionsCount: row._count?.connections ?? 0,
    createdAt: row.createdAt.toISOString(),
  };
}

const listingSchema = z.object({
  type: z.enum(["REQUEST", "OFFER"]),
  companyId: z.string().optional(),
  companyName: z.string().min(1),
  targetRole: z.string().min(2),
  description: z.string().min(20),
  skills: z.array(z.string()).optional(),
});

router.get("/companies", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: [
          { id: "co-google", name: "Google", industry: "Tech" },
          { id: "co-microsoft", name: "Microsoft", industry: "Tech" },
          { id: "co-amazon", name: "Amazon", industry: "Tech" },
          { id: "co-meta", name: "Meta", industry: "Tech" },
        ],
      });
    }
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, industry: true },
    });
    res.json({ success: true, data: companies });
  } catch (e) {
    next(e);
  }
});

router.get("/tracking", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    if (isGuestUser(req)) {
      return res.json({ success: true, data: demoTracking });
    }

    const [requestsPosted, offersPosted, connections] = await Promise.all([
      prisma.referralListing.count({ where: { userId, type: "REQUEST" } }),
      prisma.referralListing.count({ where: { userId, type: "OFFER" } }),
      prisma.referralConnection.findMany({
        where: {
          OR: [{ initiatorId: userId }, { participantId: userId }],
        },
        include: { listing: true },
      }),
    ]);

    const activeConnections = connections.filter((c) =>
      ["PENDING", "ACTIVE", "REFERRED"].includes(c.status)
    ).length;
    const referralsGiven = connections.filter(
      (c) =>
        c.participantId === userId &&
        c.listing.type === "OFFER" &&
        ["REFERRED", "COMPLETED"].includes(c.status)
    ).length;
    const referralsReceived = connections.filter(
      (c) =>
        c.initiatorId === userId &&
        c.listing.type === "REQUEST" &&
        ["REFERRED", "COMPLETED"].includes(c.status)
    ).length;
    const completedReferrals = connections.filter((c) => c.status === "COMPLETED").length;
    const pendingResponses = connections.filter(
      (c) => c.participantId === userId && c.status === "PENDING"
    ).length;

    const data: ReferralTrackingSummary = {
      requestsPosted,
      offersPosted,
      activeConnections,
      referralsGiven,
      referralsReceived,
      completedReferrals,
      pendingResponses,
    };

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/listings", authenticate, async (req, res, next) => {
  try {
    const type = req.query.type ? String(req.query.type) : undefined;
    const company = req.query.company ? String(req.query.company) : undefined;
    const companyId = req.query.companyId ? String(req.query.companyId) : undefined;
    const mine = req.query.mine === "true";

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: filterDemoListings({ type, company, mine }),
      });
    }

    const userId = req.user!.userId;
    const where: Prisma.ReferralListingWhereInput = {
      status: "OPEN",
      ...(mine ? { userId } : { NOT: { userId } }),
      ...(type ? { type: type as "REQUEST" | "OFFER" } : {}),
      ...(companyId ? { companyId } : {}),
      ...(company
        ? { companyName: { contains: company, mode: "insensitive" } }
        : {}),
    };

    const rows = await prisma.referralListing.findMany({
      where,
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatar: true, college: true } },
        _count: { select: { connections: true } },
      },
    });

    res.json({
      success: true,
      data: rows.map((r) => mapListing(r, userId)),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/listings", authenticate, async (req, res, next) => {
  try {
    const input = listingSchema.parse(req.body);

    if (isGuestUser(req)) {
      const item: ReferralListingItem = {
        id: `ref-list-${randomBytes(3).toString("hex")}`,
        type: input.type,
        companyId: input.companyId,
        companyName: input.companyName,
        targetRole: input.targetRole,
        description: input.description,
        skills: input.skills ?? [],
        status: "OPEN",
        author: { id: "demo-guest", name: "You", avatar: null, college: "Demo" },
        isOwner: true,
        connectionsCount: 0,
        createdAt: new Date().toISOString(),
      };
      demoListings.unshift(item);
      return res.status(201).json({ success: true, data: item });
    }

    const row = await prisma.referralListing.create({
      data: {
        userId: req.user!.userId,
        type: input.type,
        companyId: input.companyId,
        companyName: input.companyName,
        targetRole: input.targetRole,
        description: input.description,
        skills: input.skills ?? [],
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, college: true } },
        _count: { select: { connections: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: mapListing(row, req.user!.userId),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/listings/:id", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    if (isGuestUser(req)) {
      const listing = getDemoListing(id);
      if (!listing) throw new AppError(404, "Listing not found");
      return res.json({ success: true, data: { ...listing, isOwner: false } });
    }

    const row = await prisma.referralListing.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true, college: true } },
        _count: { select: { connections: true } },
      },
    });
    if (!row) throw new AppError(404, "Listing not found");

    res.json({
      success: true,
      data: mapListing(row, req.user!.userId),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/listings/:id/connect", authenticate, async (req, res, next) => {
  try {
    const listingId = String(req.params.id);
    const userId = req.user!.userId;

    if (isGuestUser(req)) {
      const listing = getDemoListing(listingId);
      if (!listing) throw new AppError(404, "Listing not found");
      const conn: ReferralConnectionItem = {
        id: `ref-conn-${randomBytes(3).toString("hex")}`,
        listingId,
        listingType: listing.type,
        companyName: listing.companyName,
        targetRole: listing.targetRole,
        status: "PENDING",
        otherUser: listing.author,
        isInitiator: true,
        createdAt: new Date().toISOString(),
      };
      demoConnections.unshift(conn);
      return res.status(201).json({ success: true, data: conn });
    }

    const listing = await prisma.referralListing.findUnique({ where: { id: listingId } });
    if (!listing) throw new AppError(404, "Listing not found");
    if (listing.userId === userId) {
      throw new AppError(400, "Cannot connect to your own listing");
    }
    if (listing.status !== "OPEN") {
      throw new AppError(400, "Listing is no longer open");
    }

    const existing = await prisma.referralConnection.findFirst({
      where: {
        listingId,
        OR: [
          { initiatorId: userId, participantId: listing.userId },
          { initiatorId: listing.userId, participantId: userId },
        ],
      },
    });
    if (existing) {
      return res.json({ success: true, data: await formatConnection(existing.id, userId) });
    }

    const row = await prisma.referralConnection.create({
      data: {
        listingId,
        initiatorId: userId,
        participantId: listing.userId,
        status: "PENDING",
      },
    });

    await prisma.referralMessage.create({
      data: {
        connectionId: row.id,
        senderId: userId,
        body: `Hi! I'm interested in your ${listing.type === "OFFER" ? "referral offer" : "referral request"} for ${listing.companyName} (${listing.targetRole}).`,
      },
    });

    res.status(201).json({
      success: true,
      data: await formatConnection(row.id, userId),
    });
  } catch (e) {
    next(e);
  }
});

async function formatConnection(
  id: string,
  viewerId: string
): Promise<ReferralConnectionItem> {
  const row = await prisma.referralConnection.findUniqueOrThrow({
    where: { id },
    include: {
      listing: true,
      initiator: { select: { id: true, name: true, avatar: true, college: true } },
      participant: { select: { id: true, name: true, avatar: true, college: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const isInitiator = row.initiatorId === viewerId;
  const other = isInitiator ? row.participant : row.initiator;

  return {
    id: row.id,
    listingId: row.listingId,
    listingType: row.listing.type,
    companyName: row.listing.companyName,
    targetRole: row.listing.targetRole,
    status: row.status,
    trackingNotes: row.trackingNotes,
    referredAt: row.referredAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    otherUser: mapAuthor(other),
    isInitiator,
    lastMessage: row.messages[0]?.body ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/connections", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    if (isGuestUser(req)) {
      return res.json({ success: true, data: getDemoConnections(userId) });
    }

    const rows = await prisma.referralConnection.findMany({
      where: {
        OR: [{ initiatorId: userId }, { participantId: userId }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        listing: true,
        initiator: { select: { id: true, name: true, avatar: true, college: true } },
        participant: { select: { id: true, name: true, avatar: true, college: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const data: ReferralConnectionItem[] = rows.map((row) => {
      const isInitiator = row.initiatorId === userId;
      const other = isInitiator ? row.participant : row.initiator;
      return {
        id: row.id,
        listingId: row.listingId,
        listingType: row.listing.type,
        companyName: row.listing.companyName,
        targetRole: row.listing.targetRole,
        status: row.status,
        trackingNotes: row.trackingNotes,
        referredAt: row.referredAt?.toISOString() ?? null,
        completedAt: row.completedAt?.toISOString() ?? null,
        otherUser: mapAuthor(other),
        isInitiator,
        lastMessage: row.messages[0]?.body ?? null,
        createdAt: row.createdAt.toISOString(),
      };
    });

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/connections/:id", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;

    if (isGuestUser(req)) {
      const conn = demoConnections.find((c) => c.id === id);
      if (!conn) throw new AppError(404, "Connection not found");
      return res.json({ success: true, data: conn });
    }

    await assertConnectionAccess(id, userId);
    res.json({ success: true, data: await formatConnection(id, userId) });
  } catch (e) {
    next(e);
  }
});

router.patch("/connections/:id/status", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;
    const input = z
      .object({
        status: z.enum([
          "PENDING",
          "ACTIVE",
          "REFERRED",
          "COMPLETED",
          "DECLINED",
          "CANCELLED",
        ]),
        trackingNotes: z.string().optional(),
      })
      .parse(req.body);

    if (isGuestUser(req)) {
      const idx = demoConnections.findIndex((c) => c.id === id);
      if (idx < 0) throw new AppError(404, "Connection not found");
      demoConnections[idx] = {
        ...demoConnections[idx]!,
        status: input.status,
        trackingNotes: input.trackingNotes ?? demoConnections[idx]!.trackingNotes,
        referredAt:
          input.status === "REFERRED" ? new Date().toISOString() : undefined,
        completedAt:
          input.status === "COMPLETED" ? new Date().toISOString() : undefined,
      };
      return res.json({ success: true, data: demoConnections[idx] });
    }

    await assertConnectionAccess(id, userId);

    const data: Prisma.ReferralConnectionUpdateInput = {
      status: input.status,
      trackingNotes: input.trackingNotes,
    };
    if (input.status === "REFERRED") data.referredAt = new Date();
    if (input.status === "COMPLETED") data.completedAt = new Date();
    const conn = await prisma.referralConnection.update({
      where: { id },
      data,
      select: { listingId: true },
    });

    if (input.status === "ACTIVE" || input.status === "REFERRED") {
      await prisma.referralListing.update({
        where: { id: conn.listingId },
        data: { status: "MATCHED" },
      });
    }

    res.json({ success: true, data: await formatConnection(id, userId) });
  } catch (e) {
    next(e);
  }
});

router.get("/connections/:id/messages", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;

    if (isGuestUser(req)) {
      return res.json({ success: true, data: getDemoMessages(id, userId) });
    }

    await assertConnectionAccess(id, userId);

    const rows = await prisma.referralMessage.findMany({
      where: { connectionId: id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true } } },
    });

    const data: ReferralMessageItem[] = rows.map((m) => ({
      id: m.id,
      connectionId: m.connectionId,
      senderId: m.senderId,
      senderName: m.sender.name,
      body: m.body,
      isMine: m.senderId === userId,
      createdAt: m.createdAt.toISOString(),
    }));

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post("/connections/:id/messages", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;
    const { body } = z.object({ body: z.string().min(1).max(4000) }).parse(req.body);

    if (isGuestUser(req)) {
      const msg = addDemoMessage(id, userId, "You", body);
      return res.status(201).json({ success: true, data: msg });
    }

    await assertConnectionAccess(id, userId);

    const row = await prisma.referralMessage.create({
      data: { connectionId: id, senderId: userId, body },
      include: { sender: { select: { id: true, name: true } } },
    });

    const conn = await prisma.referralConnection.findUnique({ where: { id } });
    if (conn?.status === "PENDING" && conn.participantId === userId) {
      await prisma.referralConnection.update({
        where: { id },
        data: { status: "ACTIVE" },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: row.id,
        connectionId: row.connectionId,
        senderId: row.senderId,
        senderName: row.sender.name,
        body: row.body,
        isMine: true,
        createdAt: row.createdAt.toISOString(),
      } satisfies ReferralMessageItem,
    });
  } catch (e) {
    next(e);
  }
});

async function assertConnectionAccess(connectionId: string, userId: string) {
  const conn = await prisma.referralConnection.findFirst({
    where: {
      id: connectionId,
      OR: [{ initiatorId: userId }, { participantId: userId }],
    },
  });
  if (!conn) throw new AppError(404, "Connection not found");
  return conn;
}

export default router;
