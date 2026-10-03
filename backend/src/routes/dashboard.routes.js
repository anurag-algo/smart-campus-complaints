import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.use(authenticate);

// Dashboard access for Agents and Admins (PRD Sec 5 & 15)
router.get("/", authorize(ROLES.AGENT, ROLES.ADMIN), getDashboardStats);

export default router;
