import express from "express";
import { register, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();
console.log("Auth routes loaded successfully");
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
