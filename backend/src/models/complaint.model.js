import mongoose from "mongoose";
import { CATEGORIES, PRIORITIES, STATUSES } from "../constants/status.js";

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Recommended index (PRD Sec 21)
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [150, "Title cannot exceed 150 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(CATEGORIES),
      required: [true, "Category is required"],
      index: true, // Recommended index (PRD Sec 21)
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITIES),
      default: PRIORITIES.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.PENDING,
      index: true, // Recommended index (PRD Sec 21)
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Recommended index (PRD Sec 21)
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true, // Recommended index (PRD Sec 21)
    },
    attachments: [
      {
        type: String, // Public file URLs / relative paths
      },
    ],
    resolutionNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Handles createdAt and updatedAt
  },
);

// Compound index for optimized filtering queries (PRD Sec 21)
complaintSchema.index({ createdAt: -1 });

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
