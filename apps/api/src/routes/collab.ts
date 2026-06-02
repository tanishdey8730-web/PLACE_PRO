import { Router } from "express";
import { randomBytes } from "crypto";
import { prisma } from "@placepro/database";
import { COLLAB_LANGUAGES } from "@placepro/shared";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { ensureLiveRoom, getLiveRoom } from "../socket/collabRooms.js";

const router = Router();

const DEFAULT_CODE: Record<string, string> = {
  python: `# Pair programming — edit together in real time
def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []

if __name__ == "__main__":
    print(two_sum([2, 7, 11, 15], 9))
`,
  javascript: `// Pair programming — edit together in real time
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
};

function generateRoomCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

router.post("/rooms", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const title = String(req.body?.title || "Pair Programming Session").slice(0, 80);
    const language = String(req.body?.language || "python");
    const langOk = COLLAB_LANGUAGES.some((l) => l.id === language);
    if (!langOk) {
      throw new AppError(400, "Unsupported language");
    }

    const code =
      typeof req.body?.code === "string"
        ? req.body.code
        : DEFAULT_CODE[language] || DEFAULT_CODE.python!;

    let roomCode = generateRoomCode();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.collaborativeCodingRoom.findUnique({
        where: { roomCode },
      });
      if (!exists) break;
      roomCode = generateRoomCode();
    }

    if (!isGuestUser(userId)) {
      const room = await prisma.collaborativeCodingRoom.create({
        data: { roomCode, title, language, code, createdById: userId },
      });
      ensureLiveRoom({
        roomId: room.id,
        roomCode: room.roomCode,
        title: room.title,
        language: room.language,
        code: room.code,
      });
      return res.json({
        success: true,
        data: {
          id: room.id,
          roomCode: room.roomCode,
          title: room.title,
          language: room.language,
          code: room.code,
        },
      });
    }

    const demo = {
      id: `demo-${roomCode}`,
      roomCode,
      title,
      language,
      code,
    };
    ensureLiveRoom({
      roomId: demo.id,
      roomCode: demo.roomCode,
      title: demo.title,
      language: demo.language,
      code: demo.code,
    });
    res.json({ success: true, data: demo });
  } catch (e) {
    next(e);
  }
});

router.get("/rooms/:roomCode", authenticate, async (req, res, next) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const room = await prisma.collaborativeCodingRoom.findUnique({
      where: { roomCode },
      select: {
        id: true,
        roomCode: true,
        title: true,
        language: true,
        code: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!room) {
      const live = getLiveRoom(roomCode);
      if (live) {
        return res.json({
          success: true,
          data: {
            id: live.roomId,
            roomCode: live.roomCode,
            title: live.title,
            language: live.language,
            code: live.code,
            isActive: true,
          },
        });
      }
      throw new AppError(404, "Room not found");
    }

    res.json({ success: true, data: room });
  } catch (e) {
    next(e);
  }
});

router.get("/rooms", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    if (isGuestUser(userId)) {
      return res.json({ success: true, data: [] });
    }
    const rooms = await prisma.collaborativeCodingRoom.findMany({
      where: { createdById: userId, isActive: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        roomCode: true,
        title: true,
        language: true,
        updatedAt: true,
      },
    });
    res.json({ success: true, data: rooms });
  } catch (e) {
    next(e);
  }
});

export default router;
