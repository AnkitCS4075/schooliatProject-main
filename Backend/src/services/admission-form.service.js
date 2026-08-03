import { renderBillingHtmlToPdfBuffer } from "../billing/billing-html-to-pdf.service.js";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function labelRow(label, value) {
  return `<tr><td class="label">${esc(label)}</td><td class="value">${esc(value || "—")}</td></tr>`;
}

/**
 * Build a printable admission form HTML document for a student.
 * @param {Object} params
 * @param {Object} params.student - User record with studentProfile + class + school
 */
export function buildAdmissionFormHtml({ student }) {
  const p = student.studentProfile || {};
  const cls = p.class || {};
  const school = student.school || {};

  const className = `${cls.grade || ""}${cls.division ? ` - ${cls.division}` : ""}`.trim();

  const rows = [
    labelRow("Student Name", `${student.firstName || ""} ${student.lastName || ""}`.trim()),
    labelRow("Admission Number", student.publicUserId),
    labelRow("Class", className || p.classId),
    labelRow("Roll Number", p.rollNumber || ""),
    labelRow("Gender", student.gender === "MALE" ? "Male" : student.gender === "FEMALE" ? "Female" : student.gender),
    labelRow("Date of Birth", formatDate(student.dateOfBirth)),
    labelRow("Blood Group", p.bloodGroup || ""),
    labelRow("Aadhaar Number", student.aadhaarId || ""),
    labelRow("APAAR ID", p.apaarId || ""),
    labelRow("Contact Number", student.contact || ""),
    labelRow("Email", student.email || ""),
    labelRow("Address", Array.isArray(student.address) ? student.address.join(", ") : student.address),
    labelRow("Father's Name", p.fatherName || ""),
    labelRow("Mother's Name", p.motherName || ""),
    labelRow("Father's Contact", p.fatherContact || ""),
    labelRow("Mother's Contact", p.motherContact || ""),
    labelRow("Father's Occupation", p.fatherOccupation || ""),
    labelRow("Annual Income", p.annualIncome != null ? `₹${p.annualIncome}` : ""),
    labelRow("Accommodation", p.accommodationType || ""),
  ];

  const prevSchoolRows = [
    labelRow("Previous School", p.previousSchoolName || ""),
    labelRow("Previous School Board", p.previousSchoolBoard || ""),
    labelRow("Previous Class Attended", p.previousClassAttended || ""),
    labelRow("Year of Leaving", p.previousYearOfLeaving || ""),
    labelRow("Previous School TC Number", p.previousSchoolTcNumber || ""),
  ].join("\n");

  const today = formatDate(new Date());

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Admission Form — ${esc(student.firstName || "")} ${esc(student.lastName || "")}</title>
  <style>
    body { font-family: 'Georgia', serif; color: #222; margin: 0; padding: 24px; }
    .header { text-align: center; border-bottom: 3px double #6f8f3e; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { margin: 0; color: #6f8f3e; font-size: 24px; }
    .header p { margin: 4px 0 0; color: #666; font-size: 12px; }
    h2 { color: #6f8f3e; font-size: 15px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 22px 0 10px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 7px 10px; border: 1px solid #e0e0e0; font-size: 13px; }
    .label { width: 38%; background: #f7f7f7; color: #555; font-weight: bold; }
    .value { font-weight: normal; }
    .sign { display: flex; justify-content: space-between; margin-top: 60px; }
    .sign .block { width: 45%; }
    .sign .line { border-top: 1px solid #333; margin-top: 50px; padding-top: 6px; font-size: 12px; color: #666; text-align: center; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; }
    .meta { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ADMISSION FORM</h1>
    <p>${esc(school.name || "School")}</p>
    ${school.address && school.address.length ? `<p>${esc(Array.isArray(school.address) ? school.address.join(", ") : school.address)}</p>` : ""}
    <p class="meta">Admission Form # ${esc(student.publicUserId)} · Generated ${today}</p>
  </div>

  <h2>Student Details</h2>
  <table>${rows.join("\n")}</table>

  <h2>Previous School Details</h2>
  <table>${prevSchoolRows}</table>

  <div class="sign">
    <div class="block"><div class="line">Parent / Guardian Signature</div></div>
    <div class="block"><div class="line">Authorised Signatory</div></div>
  </div>

  <div class="footer">This is a computer generated document from SchooliAT. No signature required for digital acceptance.</div>
</body>
</html>`;
}

/**
 * Render the admission form to a PDF buffer.
 */
export async function renderAdmissionFormPdf({ student }) {
  const html = buildAdmissionFormHtml({ student });
  return renderBillingHtmlToPdfBuffer(html);
}

const admissionFormService = {
  buildAdmissionFormHtml,
  renderAdmissionFormPdf,
};

export default admissionFormService;
