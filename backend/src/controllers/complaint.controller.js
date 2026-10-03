import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import Audit from "../models/audit.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { STATUSES, PRIORITIES } from "../constants/status.js";
import ROLES from "../constants/roles.js";
import { logAuditTrail } from "../services/audit.service.js";
import { generateTicketId } from "../utils/generateTicket.js";

const VALID_TRANSITIONS = {
  [STATUSES.PENDING]: [STATUSES.IN_PROGRESS],
  [STATUSES.IN_PROGRESS]: [STATUSES.RESOLVED],
  [STATUSES.RESOLVED]: [STATUSES.CLOSED, STATUSES.IN_PROGRESS],
  [STATUSES.CLOSED]: [STATUSES.IN_PROGRESS],
};

// @desc    Create a new complaint
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category) {
    throw new ApiError(400, "Title, description, and category are required");
  }

  const ticketId = await generateTicketId();
  const attachments = req.files
    ? req.files.map((file) => `/uploads/${file.filename}`)
    : [];

  const complaint = await Complaint.create({
    ticketId,
    title,
    description,
    category,
    priority: priority || PRIORITIES.MEDIUM,
    createdBy: req.user._id,
    attachments,
  });

  await logAuditTrail({
    complaintId: complaint._id,
    performedBy: req.user._id,
    action: "CREATED",
    newValue: complaint.status,
    description: `Complaint ${complaint.ticketId} created`,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Complaint submitted successfully", complaint));
});

export const getComplaints = asyncHandler(async (req, res) => {
  const { status, priority, category } = req.query;
  const filter = {};

  if (req.user.role === ROLES.USER) {
    filter.createdBy = req.user._id;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  const complaints = await Complaint.find(filter)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, "Complaints fetched successfully", complaints));
});

export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const creatorId = complaint.createdBy?._id
    ? complaint.createdBy._id.toString()
    : complaint.createdBy?.toString();

  if (req.user.role === ROLES.USER && creatorId !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to view this complaint");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Complaint fetched successfully", complaint));
});

// @desc    Update complaint status & resolution notes
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNotes } = req.body;
  const complaintId = req.params.id;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const allowedNextStatuses = VALID_TRANSITIONS[complaint.status] || [];
  if (!allowedNextStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status transition from '${complaint.status}' to '${status}'`,
    );
  }

  if (status === STATUSES.RESOLVED && !resolutionNotes) {
    throw new ApiError(
      400,
      "Resolution notes are required when marking as Resolved",
    );
  }

  const previousStatus = complaint.status;
  complaint.status = status;
  if (resolutionNotes) {
    complaint.resolutionNotes = resolutionNotes;
  }

  await complaint.save();

  await logAuditTrail({
    complaintId: complaint._id,
    performedBy: req.user._id,
    action: "STATUS_CHANGED",
    previousValue: previousStatus,
    newValue: status,
    description: `Status updated from ${previousStatus} to ${status}`,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, `Complaint status updated to ${status}`, complaint),
    );
});

// @desc    Assign complaint to an agent
export const assignComplaint = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  const complaintId = req.params.id;

  if (!agentId) {
    throw new ApiError(400, "Agent ID is required");
  }

  const agent = await User.findById(agentId);
  if (!agent || agent.role !== ROLES.AGENT) {
    throw new ApiError(400, "Provided ID does not belong to a valid Agent");
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const previousAgent = complaint.assignedTo;
  complaint.assignedTo = agent._id;
  if (complaint.status === STATUSES.PENDING) {
    complaint.status = STATUSES.IN_PROGRESS;
  }

  await complaint.save();

  await logAuditTrail({
    complaintId: complaint._id,
    performedBy: req.user._id,
    action: "ASSIGNED",
    previousValue: previousAgent,
    newValue: agent._id,
    description: `Assigned complaint to agent ${agent.name}`,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Complaint assigned successfully", complaint));
});

// @desc    Reopen a resolved or closed complaint
export const reopenComplaint = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const complaintId = req.params.id;

  if (!reason) {
    throw new ApiError(400, "Reopen reason is required");
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const isOwner = complaint.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      "Only the complaint creator or an admin can reopen this ticket",
    );
  }

  if (
    complaint.status !== STATUSES.RESOLVED &&
    complaint.status !== STATUSES.CLOSED
  ) {
    throw new ApiError(
      400,
      "Only Resolved or Closed complaints can be reopened",
    );
  }

  const previousStatus = complaint.status;
  complaint.status = STATUSES.IN_PROGRESS;
  await complaint.save();

  await logAuditTrail({
    complaintId: complaint._id,
    performedBy: req.user._id,
    action: "REOPENED",
    previousValue: previousStatus,
    newValue: STATUSES.IN_PROGRESS,
    description: `Complaint reopened. Reason: ${reason}`,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Complaint reopened successfully", complaint));
});

// @desc    Get Audit History for a Complaint
// @route   GET /api/v1/complaints/:id/audit
// @access  Agent / Admin
export const getComplaintAuditHistory = asyncHandler(async (req, res) => {
  const complaintId = req.params.id;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  if (
    req.user.role === ROLES.AGENT &&
    (!complaint.assignedTo ||
      complaint.assignedTo.toString() !== req.user._id.toString())
  ) {
    throw new ApiError(
      403,
      "Unauthorized to view audit history for this complaint",
    );
  }

  const auditHistory = await Audit.find({ complaintId })
    .populate("performedBy", "name email role")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Audit history retrieved successfully",
        auditHistory,
      ),
    );
});
