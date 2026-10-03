const ROLES = {
  USER: "user",
  ADMIN: "admin",
  AGENT: "agent",
};

export const normalizeRole = (role) =>
  typeof role === "string" ? role.trim().toLowerCase() : "";

export default ROLES;
