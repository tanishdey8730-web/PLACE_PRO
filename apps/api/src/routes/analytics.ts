import { Router } from "express";
import { authenticate, isGuestUser } from "../middleware/auth.js";
import { buildAnalyticsDashboard } from "../services/analyticsDashboard.js";
import { demoAnalyticsDashboard } from "../demo/analytics.js";

const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    if (isGuestUser(req)) {
      return res.json({ success: true, data: demoAnalyticsDashboard });
    }

    const data = await buildAnalyticsDashboard(req.user!.userId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
