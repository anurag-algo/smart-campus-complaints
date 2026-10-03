import Complaint from "../models/complaint.model.js";

export const generateTicketId = async () => {
  const prefix = "CMP-";
  const startingNumber = 10000;

  // Find the last complaint sorted by ticket creation order
  const lastComplaint = await Complaint.findOne({}, { ticketId: 1 })
    .sort({ createdAt: -1 })
    .lean();

  if (!lastComplaint || !lastComplaint.ticketId) {
    return `${prefix}${startingNumber + 1}`;
  }

  const lastNumber = parseInt(lastComplaint.ticketId.replace(prefix, ""), 10);
  const nextNumber = isNaN(lastNumber) ? startingNumber + 1 : lastNumber + 1;

  return `${prefix}${nextNumber}`;
};
