import multer from "multer";
import { upload } from "../config/multer.js";
import ApiError from "../utils/apiError.js";

export const uploadAttachments = (req, res, next) => {
  // Allow up to 5 attachments per complaint submission
  const uploadArray = upload.array("attachments", 5);

  uploadArray(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new ApiError(
            400,
            "File size limit exceeded. Maximum size allowed is 5MB",
          ),
        );
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(
          new ApiError(400, "Maximum of 5 attachment files allowed per upload"),
        );
      }
      return next(new ApiError(400, err.message));
    } else if (err) {
      return next(err);
    }
    next();
  });
};
