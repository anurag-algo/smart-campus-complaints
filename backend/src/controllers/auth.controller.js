import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import generateToken from "../utils/token.js";
import ROLES, { normalizeRole } from "../constants/roles.js";

//register a new user
//POST /api/v1/auth/register

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRole = normalizeRole(role || ROLES.USER);
  const allowedRoles = [ROLES.USER, ROLES.ADMIN, ROLES.AGENT];

  if (!allowedRoles.includes(normalizedRole)) {
    throw new ApiError(400, "Invalid role provided");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const generatedUsername =
    username || `${normalizedEmail.split("@")[0]}_${Date.now()}`;

  const user = await User.create({
    username: generatedUsername,
    name,
    email: normalizedEmail,
    password,
    role: normalizedRole,
    department: department || null,
  });

  const token = generateToken(user._id, user.role);

  const userResponse = {
    _id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    createdAt: user.createdAt,
  };

  res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      user: userResponse,
      token,
    }),
  );
});

/// login user and return JWT token
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id, user.role);

  const userResponse = {
    _id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  };

  res.status(200).json(
    new ApiResponse(200, "User logged in successfully", {
      user: userResponse,
      token,
    }),
  );
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, "User logged out successfully"));
});
