import Comment from "../models/comment.model.js";
import Complaint from "../models/complaint.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ROLES from "../constants/roles.js";

// @desc    Add a comment or internal note to a complaint
// @route   POST /api/v1/complaints/:id/comments
// @access  Authorized (Users, Agents, Admins)
export const addComment = asyncHandler(async (req, res) => {
  const { message, isInternal } = req.body;
  const complaintId = req.params.id;

  if (!message) {
    throw new ApiError(400, "Comment message is required");
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Permission Check for regular users
  if (req.user.role === ROLES.USER) {
    // Normal users cannot create internal notes (PRD Sec 12)
    if (isInternal === true) {
      throw new ApiError(
        403,
        "Regular users are not authorized to create internal notes",
      );
    }
    // Users can only comment on their own complaints
    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized to comment on this complaint");
    }
  }

  const comment = await Comment.create({
    complaintId,
    author: req.user._id,
    message,
    isInternal: req.user.role === ROLES.USER ? false : Boolean(isInternal),
  });

  const populatedComment = await comment.populate("author", "name email role");

  res
    .status(201)
    .json(new ApiResponse(201, "Comment added successfully", populatedComment));
});

// @desc    Get comments for a complaint (Filters internal notes for regular users)
// @route   GET /api/v1/complaints/:id/comments
// @access  Authorized
export const getComments = asyncHandler(async (req, res) => {
  const complaintId = req.params.id;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const query = { complaintId };

  // Strict isolation: Hide internal notes from normal users (PRD Sec 12)
  if (req.user.role === ROLES.USER) {
    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(
        403,
        "Unauthorized to view comments for this complaint",
      );
    }
    query.isInternal = false;
  }

  const comments = await Comment.find(query)
    .populate("author", "name email role department")
    .sort({ createdAt: 1 });

  res
    .status(200)
    .json(new ApiResponse(200, "Comments retrieved successfully", comments));
});
