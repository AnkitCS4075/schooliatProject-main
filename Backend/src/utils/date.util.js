/**
 * Get the first day of a given month
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year (defaults to current year)
 * @returns {Date} - First day of the month at 00:00:00.000
 */
const getFirstDayOfMonth = (month, year = new Date().getFullYear()) => {
  return new Date(year, month - 1, 1, 0, 0, 0, 0);
};

/**
 * Get the last day of a given month
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year (defaults to current year)
 * @returns {Date} - Last day of the month at 23:59:59.999
 */
const getLastDayOfMonth = (month, year = new Date().getFullYear()) => {
  // Setting day to 0 of next month gives last day of current month
  return new Date(year, month, 0, 23, 59, 59, 999);
};

/**
 * Get start of day for a given date
 * @param {Date|string} date - Date object or date string
 * @returns {Date} - Start of the day (00:00:00.000)
 */
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day for a given date
 * @param {Date|string} date - Date object or date string
 * @returns {Date} - End of the day (23:59:59.999)
 */
const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Validate if a string is in YYYY-MM-DD format
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} - True if valid format
 */
const isValidDateFormat = (dateStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Validate if a string is in YYYY-MM format
 * @param {string} monthStr - Month string to validate
 * @returns {boolean} - True if valid format
 */
const isValidMonthFormat = (monthStr) => {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(monthStr)) return false;
  const [year, month] = monthStr.split("-").map(Number);
  return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
};

/**
 * Parse YYYY-MM format string to year and month
 * @param {string} monthStr - Month string in YYYY-MM format
 * @returns {{year: number, month: number}} - Parsed year and month
 */
const parseMonthFormat = (monthStr) => {
  const [year, month] = monthStr.split("-").map(Number);
  return { year, month };
};

/**
 * Determine dateType based on from and till dates
 * @param {Date|string} from - From date
 * @param {Date|string} till - Till date
 * @returns {"SINGLE_DATE"|"DATE_RANGE"} - SINGLE_DATE if same day, DATE_RANGE otherwise
 */
const determineDateType = (from, till) => {
  const fromDate = new Date(from);
  const tillDate = new Date(till);
  // Compare dates only (ignoring time)
  const fromDateOnly = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
  );
  const tillDateOnly = new Date(
    tillDate.getFullYear(),
    tillDate.getMonth(),
    tillDate.getDate(),
  );
  return fromDateOnly.getTime() === tillDateOnly.getTime()
    ? "SINGLE_DATE"
    : "DATE_RANGE";
};

const dateUtil = {
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getStartOfDay,
  getEndOfDay,
  isValidDateFormat,
  isValidMonthFormat,
  parseMonthFormat,
  determineDateType,
};

export default dateUtil;
