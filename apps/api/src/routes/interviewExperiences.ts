import { Router } from "express";
import { z } from "zod";
import { prisma } from "@placepro/database";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import type { InterviewExperienceItem } from "@placepro/shared";
import { demoInterviewExperiences } from "../demo/interviewExperience.js";
import { randomBytes } from "crypto";

const router = Router();

const createSchema = z.object({
  companyName: z.string().min(1),
  role: z.string().min(1),
  interviewDate: z.string().optional(),
  questionsAsked: z.string().min(20),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  tips: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

function mapRow(
  row: {
    id: string;
    companyName: string;
    role: string;
    interviewDate: Date | null;
    questionsAsked: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    tips: string | null;
    tags: string[];
    upvoteCount: number;
    downvoteCount: number;
    shareCount: number;
    createdAt: Date;
    user: { name: string; avatar: string | null };
    _count?: { comments: number };
  },
  userVote?: number,
  saved?: boolean
): InterviewExperienceItem {
  return {
    id: row.id,
    companyName: row.companyName,
    role: row.role,
    interviewDate: row.interviewDate?.toISOString() ?? null,
    questionsAsked: row.questionsAsked,
    difficulty: row.difficulty,
    tips: row.tips,
    tags: row.tags,
    upvoteCount: row.upvoteCount,
    downvoteCount: row.downvoteCount,
    shareCount: row.shareCount,
    commentCount: row._count?.comments ?? 0,
    author: { name: row.user.name, avatar: row.user.avatar },
    userVote: userVote === 1 ? 1 : userVote === -1 ? -1 : 0,
    saved,
    createdAt: row.createdAt.toISOString(),
    trendingScore: row.upvoteCount - row.downvoteCount + (row._count?.comments ?? 0) * 2,
  };
}

router.get("/", authenticate, async (req, res, next) => {
  try {
    const company = req.query.company ? String(req.query.company) : undefined;
    const tag = req.query.tag ? String(req.query.tag) : undefined;
    const sort = req.query.sort === "trending" ? "trending" : "recent";
    const q = req.query.q ? String(req.query.q) : undefined;

    if (isGuestUser(req)) {
      let items = [...demoInterviewExperiences];
      if (company) items = items.filter((i) => i.companyName.toLowerCase().includes(company.toLowerCase()));
      if (tag) items = items.filter((i) => i.tags.includes(tag.toLowerCase()));
      if (q) {
        const lower = q.toLowerCase();
        items = items.filter(
          (i) =>
            i.companyName.toLowerCase().includes(lower) ||
            i.role.toLowerCase().includes(lower) ||
            i.questionsAsked.toLowerCase().includes(lower)
        );
      }
      if (sort === "trending") items.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0));
      return res.json({ success: true, data: items });
    }

    const userId = req.user!.userId;
    const rows = await prisma.interviewExperience.findMany({
      where: {
        status: "APPROVED",
        ...(company
          ? { companyName: { contains: company, mode: "insensitive" } }
          : {}),
        ...(tag ? { tags: { has: tag.toLowerCase() } } : {}),
        ...(q
          ? {
              OR: [
                { companyName: { contains: q, mode: "insensitive" } },
                { role: { contains: q, mode: "insensitive" } },
                { questionsAsked: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      take: 50,
      orderBy: sort === "trending" ? { upvoteCount: "desc" } : { createdAt: "desc" },
      include: {
        user: { select: { name: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    });

    const [votes, saves] = await Promise.all([
      prisma.interviewExperienceVote.findMany({
        where: { userId, experienceId: { in: rows.map((r) => r.id) } },
      }),
      prisma.interviewExperienceSave.findMany({
        where: { userId, experienceId: { in: rows.map((r) => r.id) } },
      }),
    ]);

    const voteMap = new Map(votes.map((v) => [v.experienceId, v.vote]));
    const saveSet = new Set(saves.map((s) => s.experienceId));

    res.json({
      success: true,
      data: rows.map((r) => mapRow(r, voteMap.get(r.id), saveSet.has(r.id))),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const input = createSchema.parse(req.body);

    if (isGuestUser(req)) {
      const item: InterviewExperienceItem = {
        id: `exp-${randomBytes(3).toString("hex")}`,
        companyName: input.companyName,
        role: input.role,
        interviewDate: input.interviewDate ?? null,
        questionsAsked: input.questionsAsked,
        difficulty: input.difficulty,
        tips: input.tips,
        tags: input.tags ?? [],
        upvoteCount: 0,
        downvoteCount: 0,
        shareCount: 0,
        commentCount: 0,
        author: { name: "Guest" },
        createdAt: new Date().toISOString(),
      };
      demoInterviewExperiences.unshift(item);
      return res.status(201).json({ success: true, data: item });
    }

    const row = await prisma.interviewExperience.create({
      data: {
        userId: req.user!.userId,
        companyName: input.companyName,
        role: input.role,
        interviewDate: input.interviewDate ? new Date(input.interviewDate) : undefined,
        questionsAsked: input.questionsAsked,
        difficulty: input.difficulty,
        tips: input.tips,
        tags: (input.tags ?? []).map((t) => t.toLowerCase()),
        status: "APPROVED",
      },
      include: {
        user: { select: { name: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    });

    res.status(201).json({ success: true, data: mapRow(row) });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/vote", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const vote = Number(req.body.vote);
    if (vote !== 1 && vote !== -1) throw new AppError(400, "vote must be 1 or -1");

    if (isGuestUser(req)) {
      const item = demoInterviewExperiences.find((e) => e.id === id);
      if (!item) throw new AppError(404, "Not found");
      if (vote === 1) item.upvoteCount++;
      else item.downvoteCount++;
      return res.json({ success: true, data: { vote } });
    }

    const userId = req.user!.userId;
    const existing = await prisma.interviewExperienceVote.findUnique({
      where: { experienceId_userId: { experienceId: id, userId } },
    });

    if (existing?.vote === vote) {
      await prisma.$transaction([
        prisma.interviewExperienceVote.delete({ where: { id: existing.id } }),
        prisma.interviewExperience.update({
          where: { id },
          data: vote === 1 ? { upvoteCount: { decrement: 1 } } : { downvoteCount: { decrement: 1 } },
        }),
      ]);
      return res.json({ success: true, data: { vote: 0 } });
    }

    if (existing) {
      await prisma.$transaction([
        prisma.interviewExperienceVote.update({
          where: { id: existing.id },
          data: { vote },
        }),
        prisma.interviewExperience.update({
          where: { id },
          data:
            vote === 1
              ? { upvoteCount: { increment: 1 }, downvoteCount: { decrement: 1 } }
              : { upvoteCount: { decrement: 1 }, downvoteCount: { increment: 1 } },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.interviewExperienceVote.create({ data: { experienceId: id, userId, vote } }),
        prisma.interviewExperience.update({
          where: { id },
          data: vote === 1 ? { upvoteCount: { increment: 1 } } : { downvoteCount: { increment: 1 } },
        }),
      ]);
    }

    res.json({ success: true, data: { vote } });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/save", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    if (isGuestUser(req)) {
      return res.json({ success: true, data: { saved: true } });
    }

    const userId = req.user!.userId;
    const existing = await prisma.interviewExperienceSave.findUnique({
      where: { experienceId_userId: { experienceId: id, userId } },
    });

    if (existing) {
      await prisma.interviewExperienceSave.delete({ where: { id: existing.id } });
      return res.json({ success: true, data: { saved: false } });
    }

    await prisma.interviewExperienceSave.create({ data: { experienceId: id, userId } });
    res.json({ success: true, data: { saved: true } });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/share", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    if (!isGuestUser(req)) {
      await prisma.interviewExperience.update({
        where: { id },
        data: { shareCount: { increment: 1 } },
      });
    }
    res.json({ success: true, data: { shared: true } });
  } catch (e) {
    next(e);
  }
});

router.get("/:id/comments", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    if (isGuestUser(req)) {
      return res.json({ success: true, data: [] });
    }

    const comments = await prisma.interviewExperienceComment.findMany({
      where: { experienceId: id },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, avatar: true } } },
    });

    res.json({
      success: true,
      data: comments.map((c) => ({
        id: c.id,
        content: c.content,
        author: { name: c.user.name, avatar: c.user.avatar },
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/comments", authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const content = String(req.body.content ?? "").trim();
    if (!content) throw new AppError(400, "content required");

    if (isGuestUser(req)) {
      return res.status(201).json({
        success: true,
        data: {
          id: `c-${Date.now()}`,
          content,
          author: { name: "Guest" },
          createdAt: new Date().toISOString(),
        },
      });
    }

    const comment = await prisma.interviewExperienceComment.create({
      data: { experienceId: id, userId: req.user!.userId, content },
      include: { user: { select: { name: true, avatar: true } } },
    });

    res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        author: { name: comment.user.name, avatar: comment.user.avatar },
        createdAt: comment.createdAt.toISOString(),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
