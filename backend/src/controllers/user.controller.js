import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get logged in user profile
// @route   GET /api/v1/users/me
// @access  Authenticated
export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "Profile fetched successfully", {
      user: req.user,
    }),
  );
});

// @desc    Update logged in user profile
// @route   PUT /api/v1/users/me
// @access  Authenticated
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, department } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (department !== undefined) fieldsToUpdate.department = department;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    fieldsToUpdate,
    { new: true, runValidators: true },
  );

  res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", {
      user: updatedUser,
    }),
  );
});
