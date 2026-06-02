import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@placepro/database";
import { signToken } from "../utils/jwt.js";
import { generateOtp } from "../utils/otp.js";
import { authRateLimit } from "../middleware/rateLimit.js";
import { AppError } from "../middleware/errorHandler.js";

import { DEMO_TOKEN, DEMO_USER, DEMO_RECRUITER_TOKEN, DEMO_RECRUITER_USER } from "../demo/user.js";

const router = Router();

router.post("/guest", (_req, res) => {
  res.json({
    success: true,
    data: {
      token: DEMO_TOKEN,
      user: {
        id: DEMO_USER.userId,
        email: DEMO_USER.email,
        name: "Guest User",
        role: DEMO_USER.role,
      },
    },
  });
});

router.post("/guest-recruiter", (_req, res) => {
  res.json({
    success: true,
    data: {
      token: DEMO_RECRUITER_TOKEN,
      user: {
        id: DEMO_RECRUITER_USER.userId,
        email: DEMO_RECRUITER_USER.email,
        name: "Demo Recruiter",
        role: DEMO_RECRUITER_USER.role,
      },
    },
  });
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["STUDENT", "MENTOR", "RECRUITER"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/register", authRateLimit, async (req, res, next) => {
  try {
    const { email, password, name, role } = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || "STUDENT",
        profile: { create: {} },
        streak: { create: {} },
      },
    });

    const otp = generateOtp();
    await prisma.otpCode.create({
      data: {
        email,
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        userId: user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Account created. Verify OTP sent to email.",
      data: { userId: user.id, requiresOtp: true },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", authRateLimit, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new AppError(401, "Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/verify-otp", authRateLimit, async (req, res, next) => {
  try {
    const { email, code } = z
      .object({ email: z.string().email(), code: z.string().length(6) })
      .parse(req.body);

    const otp = await prisma.otpCode.findFirst({
      where: { email, code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) throw new AppError(400, "Invalid or expired OTP");

    await prisma.$transaction([
      prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } }),
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
    ]);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(404, "User not found");

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ success: true, data: { token, verified: true } });
  } catch (e) {
    next(e);
  }
});

router.post("/forgot-password", authRateLimit, async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const otp = generateOtp();
      await prisma.otpCode.create({
        data: {
          email,
          code: otp,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          userId: user.id,
        },
      });
    }
    res.json({ success: true, message: "If account exists, reset OTP sent to email." });
  } catch (e) {
    next(e);
  }
});

router.post("/reset-password", authRateLimit, async (req, res, next) => {
  try {
    const { email, code, password } = z
      .object({
        email: z.string().email(),
        code: z.string().length(6),
        password: z.string().min(8),
      })
      .parse(req.body);

    const otp = await prisma.otpCode.findFirst({
      where: { email, code, used: false, expiresAt: { gt: new Date() } },
    });
    if (!otp) throw new AppError(400, "Invalid or expired OTP");

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } }),
      prisma.user.update({ where: { email }, data: { passwordHash } }),
    ]);

    res.json({ success: true, message: "Password reset successful" });
  } catch (e) {
    next(e);
  }
});

router.post("/oauth", authRateLimit, async (req, res, next) => {
  try {
    const { provider, providerAccountId, email, name, accessToken } = z
      .object({
        provider: z.enum(["google", "github"]),
        providerAccountId: z.string(),
        email: z.string().email(),
        name: z.string(),
        accessToken: z.string().optional(),
      })
      .parse(req.body);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          emailVerified: new Date(),
          profile: { create: {} },
          streak: { create: {} },
          accounts: {
            create: {
              type: "oauth",
              provider,
              providerAccountId,
              access_token: accessToken,
            },
          },
        },
      });
    } else {
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: { provider, providerAccountId },
        },
        update: { access_token: accessToken },
        create: {
          userId: user.id,
          type: "oauth",
          provider,
          providerAccountId,
          access_token: accessToken,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
