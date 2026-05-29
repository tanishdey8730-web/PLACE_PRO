import { Router } from "express";
import { prisma } from "@placepro/database";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/posts", async (req, res, next) => {
  try {
    const { type } = req.query;
    const where = type ? { type: type as "DISCUSSION" } : {};
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    });
    res.json({ success: true, data: posts });
  } catch (e) {
    next(e);
  }
});

router.post("/posts", authenticate, async (req, res, next) => {
  try {
    const post = await prisma.post.create({
      data: { ...req.body, userId: req.user!.userId },
      include: { user: { select: { name: true, avatar: true } } },
    });
    res.status(201).json({ success: true, data: post });
  } catch (e) {
    next(e);
  }
});

router.post("/posts/:id/upvote", authenticate, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.userId;
    const existing = await prisma.upvote.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.upvote.delete({ where: { id: existing.id } }),
        prisma.post.update({ where: { id: postId }, data: { upvoteCount: { decrement: 1 } } }),
      ]);
      return res.json({ success: true, data: { upvoted: false } });
    }

    await prisma.$transaction([
      prisma.upvote.create({ data: { postId, userId } }),
      prisma.post.update({ where: { id: postId }, data: { upvoteCount: { increment: 1 } } }),
    ]);
    res.json({ success: true, data: { upvoted: true } });
  } catch (e) {
    next(e);
  }
});

router.post("/posts/:id/comments", authenticate, async (req, res, next) => {
  try {
    const comment = await prisma.comment.create({
      data: {
        postId: req.params.id,
        userId: req.user!.userId,
        content: req.body.content,
      },
      include: { user: { select: { name: true, avatar: true } } },
    });
    res.status(201).json({ success: true, data: comment });
  } catch (e) {
    next(e);
  }
});

export default router;
