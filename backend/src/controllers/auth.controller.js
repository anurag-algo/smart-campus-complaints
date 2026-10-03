import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import generateToken from "../utils/token.js";
//register a new user
//POST /api/v1/auth/register

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  //check if user exist
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  //create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || "user",
    department: department || null,
  });

  //Generate token
  const token = genearateToken(user._id, user.role);

  //Exclude password from output
  const userReasponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    createdAt: user.createdAt,
  };
  res.status(201).json(
    new ApiResponse(true, "User registered successfully", {
      user: userReasponse,
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
  //Explicitly select password since it is hidden by default in model

  const user = await User.findOne({ email }).select("+password");
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
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  };

  res.status(200).json(
    new ApiResponse(true, "User logged in successfully", {
      user: userResponse,
      token,
    }),
  );
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(true, "User logged out successfully"));
});
