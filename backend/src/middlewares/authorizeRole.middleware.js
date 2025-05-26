//?MIDDLEWARE TO AUTHORIZE ROLE OF USER AND RESTRICT ACCESS
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// accepts one or more allowed roles
export const authorizeRole = (...allowedRoles) => {
  return asyncHandler(async (req, _, next) => {
    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(403, "Access denied: insufficient permissions");
    }

    next();
  });
};
