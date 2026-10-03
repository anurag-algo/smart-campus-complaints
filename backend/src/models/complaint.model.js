import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: { type: STATUS, required: true, default: STATUS.OPEN },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attachments: {
      type: Array,
    },
  },
  { timestamps: true },
);

export default Complaint = mongoose.Model("Complaint", ComplaintSchema);
