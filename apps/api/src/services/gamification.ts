import { prisma } from "@placepro/database";
import { XP_REWARDS } from "@placepro/shared";

export async function awardXp(userId: string, amount: number, reason: string) {
  await prisma.$transaction([
    prisma.xpLog.create({ data: { userId, amount, reason } }),
    prisma.studentProfile.update({
      where: { userId },
      data: { totalXp: { increment: amount } },
    }),
  ]);
}

export async function updateStreak(userId: string) {
  const streak = await prisma.streak.findUnique({ where: { userId } });
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!streak) {
    await prisma.streak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastActiveAt: now },
    });
    await awardXp(userId, XP_REWARDS.DAILY_STREAK, "daily_streak");
    return;
  }

  const last = new Date(streak.lastActiveAt);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (86400000));

  if (diffDays === 0) return;

  const newStreak = diffDays === 1 ? streak.currentStreak + 1 : 1;
  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastActiveAt: now,
    },
  });

  if (diffDays === 1) await awardXp(userId, XP_REWARDS.DAILY_STREAK, "daily_streak");
}
