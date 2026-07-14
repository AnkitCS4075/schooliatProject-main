import bcryptjs from "bcryptjs";

/**
 * Password policy configuration
 */
const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
};

/**
 * Validate password against policy
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password || typeof password !== "string") {
    return {
      isValid: false,
      errors: ["Password is required"],
      strength: 0,
    };
  }

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  }

  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must be at most ${PASSWORD_POLICY.maxLength} characters long`);
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Calculate password strength (0-4)
  let strength = 0;
  if (password.length >= PASSWORD_POLICY.minLength) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  if (password.length >= 12) strength++; // Bonus for longer passwords

  return {
    isValid: errors.length === 0,
    errors,
    strength: Math.min(strength, 4), // Cap at 4
  };
};

/**
 * Hash password
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password, saltRounds = 10) => {
  return await bcryptjs.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (password, hash) => {
  return await bcryptjs.compare(password, hash);
};

/**
 * Get password strength label
 * @param {number} strength - Password strength (0-4)
 * @returns {string} - Strength label
 */
const getPasswordStrengthLabel = (strength) => {
  const labels = {
    0: "Very Weak",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };
  return labels[strength] || "Very Weak";
};

const passwordUtil = {
  validatePassword,
  hashPassword,
  comparePassword,
  getPasswordStrengthLabel,
  PASSWORD_POLICY,
};

export default passwordUtil;

