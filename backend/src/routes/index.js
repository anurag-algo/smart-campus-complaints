import express from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
export default router;
