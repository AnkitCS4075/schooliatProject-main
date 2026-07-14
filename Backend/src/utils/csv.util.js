/**
 * CSV utilities: RFC 4180–style parsing (quoted fields, commas inside quotes, UTF-8 BOM strip)
 * and simple generation for exports.
 */

/**
 * Parse full CSV text into rows of string cells (handles quoted fields and embedded commas).
 * @param {string} csvString
 * @returns {string[][]}
 */
function parseCSVRows(csvString) {
  if (!csvString || typeof csvString !== "string") return [];

  let s = csvString;
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += c;
        i++;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
      } else if (c === ",") {
        row.push(field.trim());
        field = "";
        i++;
      } else if (c === "\n") {
        row.push(field.trim());
        field = "";
        if (row.some((cell) => cell !== "")) {
          rows.push(row);
        }
        row = [];
        i++;
      } else {
        field += c;
        i++;
      }
    }
  }

  row.push(field.trim());
  if (row.some((cell) => cell !== "")) {
    rows.push(row);
  }

  return rows;
}

/**
 * Parse CSV into array of row objects. Header row keys: lowercased, spaces removed
 * (matches existing API: FirstName → firstname).
 * @param {string} csvString
 * @returns {Record<string, string>[]}
 */
const parseCSV = (csvString) => {
  const rows = parseCSVRows(csvString);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const results = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.every((c) => !(c ?? "").toString().trim())) {
      continue;
    }
    const obj = {};
    headers.forEach((header, index) => {
      const key = header.toLowerCase().replace(/\s+/g, "");
      obj[key] = cells[index] ?? "";
    });
    results.push(obj);
  }

  return results;
};

const generateCSV = (data, headers) => {
  if (!data || !Array.isArray(data) || data.length === 0) return "";

  const headerRow = headers.map((h) => h.label).join(",");
  const rows = data.map((item) => {
    return headers.map((h) => {
      const value = h.key.split(".").reduce((obj, key) => obj?.[key], item) || "";
      const escaped = String(value).replace(/"/g, '""');
      return /[\n,"]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(",");
  });

  return [headerRow, ...rows].join("\n");
};

const csvUtil = {
  parseCSV,
  parseCSVRows,
  generateCSV,
};

export default csvUtil;
