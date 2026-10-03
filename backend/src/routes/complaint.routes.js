import express from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  reopenComplaint,
  getComplaintAuditHistory,
} from "../controllers/complaint.controller.js";
import { addComment, getComments } from "../controllers/comment.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadAttachments } from "../middleware/upload.middleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize(ROLES.USER), uploadAttachments, createComplaint);
router.get("/", getComplaints);

router.get(
  "/:id/audit",
  authorize(ROLES.AGENT, ROLES.ADMIN),
  getComplaintAuditHistory,
);
router.post("/:id/comments", addComment);
router.get("/:id/comments", getComments);
router.get("/:id", getComplaintById);

router.patch(
  "/:id/status",
  authorize(ROLES.AGENT, ROLES.ADMIN),
  updateComplaintStatus,
);
router.patch("/:id/assign", authorize(ROLES.ADMIN), assignComplaint);
router.patch(
  "/:id/reopen",
  authorize(ROLES.USER, ROLES.ADMIN),
  reopenComplaint,
);

export default router;
