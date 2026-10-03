import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { STATUSES, PRIORITIES } from "../constants/status.js";
import ROLES from "../constants/roles.js";

// @desc    Get dashboard statistics for Admin or Agent
// @route   GET /api/v1/dashboard
// @access  Agent / Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;

  // Agent Dashboard Analytics (PRD Sec 15)
  if (role === ROLES.AGENT) {
    const [
      assignedTotal,
      pending,
      inProgress,
      resolved,
      closed,
      recentAssigned,
    ] = await Promise.all([
      Complaint.countDocuments({ assignedTo: userId }),
      Complaint.countDocuments({
        assignedTo: userId,
        status: STATUSES.PENDING,
      }),
      Complaint.countDocuments({
        assignedTo: userId,
        status: STATUSES.IN_PROGRESS,
      }),
      Complaint.countDocuments({
        assignedTo: userId,
        status: STATUSES.RESOLVED,
      }),
      Complaint.countDocuments({ assignedTo: userId, status: STATUSES.CLOSED }),
      Complaint.find({ assignedTo: userId })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Agent dashboard stats retrieved", {
        summary: {
          assignedTotal,
          pending,
          inProgress,
          resolved,
          closed,
        },
        recentAssigned,
      }),
    );
  }

  // Admin Dashboard Analytics (PRD Sec 15)
  if (role === ROLES.ADMIN) {
    const [
      total,
      pending,
      inProgress,
      resolved,
      closed,
      critical,
      categoryBreakdown,
      priorityBreakdown,
      recentComplaints,
      agentWorkload,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: STATUSES.PENDING }),
      Complaint.countDocuments({ status: STATUSES.IN_PROGRESS }),
      Complaint.countDocuments({ status: STATUSES.RESOLVED }),
      Complaint.countDocuments({ status: STATUSES.CLOSED }),
      Complaint.countDocuments({ priority: PRIORITIES.CRITICAL }),
      // Group count by Category
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      // Group count by Priority
      Complaint.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      // Recent Complaints list
      Complaint.find()
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email department")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      // Agent Workload Breakdown
      Complaint.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "agent",
          },
        },
        { $unwind: "$agent" },
        {
          $project: {
            _id: 1,
            count: 1,
            name: "$agent.name",
            email: "$agent.email",
            department: "$agent.department",
          },
        },
      ]),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Admin dashboard stats retrieved", {
        summary: {
          total,
          pending,
          inProgress,
          resolved,
          closed,
          critical,
        },
        breakdowns: {
          category: categoryBreakdown,
          priority: priorityBreakdown,
        },
        agentWorkload,
        recentComplaints,
      }),
    );
  }
});
