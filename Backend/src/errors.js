class ApiError extends Error {
  constructor(errorCode, statusCode, message) {
    super();
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.message = message;
  }
}

const ApiErrors = {
  UNAUTHORIZED: new ApiError("SA001", 401, "Unauthorized"),
  FORBIDDEN: new ApiError("SA002", 403, "Forbidden"),
  USER_NOT_FOUND: new ApiError(
    "SA003",
    401, // Changed from 404 to 401 - authentication failures should return 401 Unauthorized
    "Invalid email or password.",
  ),
  INVALID_OTP: new ApiError("SA004", 400, "Invalid or expired OTP"),
  OTP_NOT_FOUND: new ApiError("SA005", 404, "OTP not found. Please request a new OTP"),
  MAX_OTP_ATTEMPTS: new ApiError("SA006", 429, "Maximum OTP verification attempts exceeded"),
  INVALID_RESET_TOKEN: new ApiError("SA007", 400, "Invalid or expired password reset token"),
  WEAK_PASSWORD: new ApiError("SA008", 400, "Password does not meet security requirements"),
  PASSWORD_MISMATCH: new ApiError("SA009", 400, "Current password is incorrect"),
};

export { ApiError, ApiErrors };
