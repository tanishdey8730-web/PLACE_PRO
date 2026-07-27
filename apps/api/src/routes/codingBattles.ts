import { Router } from "express";
import { z } from "zod";
import { prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import type { CodingBattleRoom } from "@placepro/shared";
import { randomBytes } from "crypto";

const router = Router();

function roomCode() {
  return randomBytes(3).toString("hex").toUpperCase();
}

async function mapBattle(
  battle: {
    id: string;
    roomCode: string;
    mode: "ONE_VS_ONE" | "MULTIPLAYER";
    status: "WAITING" | "MATCHMAKING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    durationSeconds: number;
    maxPlayers: number;
    startedAt: Date | null;
    endedAt: Date | null;
    winnerId: string | null;
    problem: { id: string; slug: string; title: string; difficulty: string } | null;
    participants: {
      id: string;
      userId: string;
      score: number;
      rank: number | null;
      user: { name: string; avatar: string | null };
    }[];
  }
): Promise<CodingBattleRoom> {
  const endsAt =
    battle.startedAt && battle.status === "ACTIVE"
      ? new Date(battle.startedAt.getTime() + battle.durationSeconds * 1000).toISOString()
      : null;

  return {
    id: battle.id,
    roomCode: battle.roomCode,
    mode: battle.mode,
    status: battle.status,
    durationSeconds: battle.durationSeconds,
    maxPlayers: battle.maxPlayers,
    problem: battle.problem
      ? {
          id: battle.problem.id,
          slug: battle.problem.slug,
          title: battle.problem.title,
          difficulty: battle.problem.difficulty,
        }
      : null,
    participants: battle.participants.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.user.name,
      avatar: p.user.avatar,
      score: p.score,
      rank: p.rank,
    })),
    startedAt: battle.startedAt?.toISOString() ?? null,
    endsAt,
    winnerId: battle.winnerId,
  };
}

const includeBattle = {
  problem: { select: { id: true, slug: true, title: true, difficulty: true } },
  participants: {
    include: { user: { select: { name: true, avatar: true } } },
  },
};

router.get("/leaderboard", async (_req, res, next) => {
  try {
    const top = await prisma.codingBattleParticipant.groupBy({
      by: ["userId"],
      _sum: { score: true },
      orderBy: { _sum: { score: "desc" } },
      take: 20,
    }).catch(() => []);

    if (top.length === 0) {
      return res.json({
        success: true,
        data: [
          { userId: "demo-1", name: "Rahul K.", score: 2450, rank: 1 },
          { userId: "demo-2", name: "Priya S.", score: 2280, rank: 2 },
          { userId: "demo-3", name: "Ankit M.", score: 2100, rank: 3 },
        ],
      });
    }

    const users = await prisma.user.findMany({
      where: { id: { in: top.map((t) => t.userId) } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(users.map((u) => [u.id, u.name]));

    res.json({
      success: true,
      data: top.map((t, i) => ({
        userId: t.userId,
        name: nameMap.get(t.userId) ?? "Player",
        score: t._sum.score ?? 0,
        rank: i + 1,
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/matchmake", authenticate, async (req, res, next) => {
  try {
    const mode = (req.body.mode === "MULTIPLAYER" ? "MULTIPLAYER" : "ONE_VS_ONE") as
      | "ONE_VS_ONE"
      | "MULTIPLAYER";
    const userId = req.user!.userId;

    if (isGuestUser(req)) {
      return res.json({
        success: true,
        data: {
          id: "demo-battle",
          roomCode: "DEMO01",
          mode,
          status: "WAITING",
          durationSeconds: 1800,
          maxPlayers: mode === "MULTIPLAYER" ? 4 : 2,
          participants: [{ id: "p1", userId, name: "Guest", score: 0, rank: null }],
          problem: null,
        } satisfies CodingBattleRoom,
      });
    }

    const waiting = await prisma.codingBattle.findFirst({
      where: {
        status: "WAITING",
        mode,
        creatorId: { not: userId },
      },
      include: includeBattle,
    });

    if (waiting) {
      await prisma.codingBattleParticipant.create({
        data: { battleId: waiting.id, userId },
      });
      const updated = await prisma.codingBattle.findUnique({
        where: { id: waiting.id },
        include: includeBattle,
      });
      if (updated && updated.participants.length >= updated.maxPlayers) {
        const problem = await prisma.codingProblem.findFirst({
          where: { isPublished: true, difficulty: "MEDIUM" },
          orderBy: { acceptance: "desc" },
        });
        await prisma.codingBattle.update({
          where: { id: waiting.id },
          data: {
            status: "ACTIVE",
            startedAt: new Date(),
            problemId: problem?.id,
          },
        });
      }
      const final = await prisma.codingBattle.findUnique({
        where: { id: waiting.id },
        include: includeBattle,
      });
      return res.json({ success: true, data: await mapBattle(final!) });
    }

    const problem = await prisma.codingProblem.findFirst({
      where: { isPublished: true },
      orderBy: { totalSubs: "desc" },
    });

    const battle = await prisma.codingBattle.create({
      data: {
        roomCode: roomCode(),
        creatorId: userId,
        mode,
        maxPlayers: mode === "MULTIPLAYER" ? 4 : 2,
        problemId: problem?.id,
        participants: { create: { userId } },
      },
      include: includeBattle,
    });

    res.status(201).json({ success: true, data: await mapBattle(battle) });
  } catch (e) {
    next(e);
  }
});

router.get("/:roomCode", authenticate, async (req, res, next) => {
  try {
    const code = String(req.params.roomCode).toUpperCase();
    const battle = await prisma.codingBattle.findUnique({
      where: { roomCode: code },
      include: includeBattle,
    });
    if (!battle) throw new AppError(404, "Battle not found");
    res.json({ success: true, data: await mapBattle(battle) });
  } catch (e) {
    next(e);
  }
});

router.post("/:roomCode/join", authenticate, async (req, res, next) => {
  try {
    const code = String(req.params.roomCode).toUpperCase();
    const userId = req.user!.userId;

    const battle = await prisma.codingBattle.findUnique({ where: { roomCode: code } });
    if (!battle) throw new AppError(404, "Battle not found");
    if (battle.status !== "WAITING" && battle.status !== "MATCHMAKING") {
      throw new AppError(400, "Battle already started");
    }

    await prisma.codingBattleParticipant.upsert({
      where: { battleId_userId: { battleId: battle.id, userId } },
      update: {},
      create: { battleId: battle.id, userId },
    });

    const updated = await prisma.codingBattle.findUnique({
      where: { id: battle.id },
      include: includeBattle,
    });

    res.json({ success: true, data: await mapBattle(updated!) });
  } catch (e) {
    next(e);
  }
});

export default router;
