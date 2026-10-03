import Audit from "../models/audit.model.js";

export const logAuditTrail = async ({
  complaintId,
  performedBy,
  action,
  previousValue = null,
  newValue = null,
  description,
}) => {
  try {
    await Audit.create({
      complaintId,
      performedBy,
      action,
      previousValue,
      newValue,
      description,
    });
  } catch (error) {
    console.error("Audit logging failed:", error.message);
  }
};
