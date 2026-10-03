import express from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all user routes
router.use(authenticate);

router.get("/me", getProfile);
router.put("/me", updateProfile);

export default router;
