import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import emailService from "./email.service.js";

const COMPANY_DETAILS = {
  name: "Winforge Private Limited",
  tagline: "One School, One Vendor",
  product: "SchooliAT",
  services: [
    "Student Information System",
    "Fee Management & Accounting",
    "Attendance Tracking (Biometric, Geo-Fencing)",
    "Homework & Assignment Management",
    "Exam & Result Management",
    "Timetable Scheduling",
    "Library Management",
    "Transport Management",
    "Communication Portal (SMS, Email, In-App)",
    "ID Card & Document Generation",
    "Gate Entry & Visitor Management",
    "CRM & Lead Management",
    "Calendar & Event Management",
    "Inventory Management",
    "Report & Analytics Dashboard",
    "Multi-Branch Support",
    "Mobile App for Students, Parents & Teachers",
  ],
  termsAndConditions: [
    "This Agreement is entered into between Winforge Private Limited ('Provider') and the School ('Client').",
    "The Provider agrees to deliver the SchooliAT platform services as described in the service scope section.",
    "The Client agrees to pay the fees as per the payment terms specified in this contract.",
    "This agreement shall be valid for the contract duration specified herein, subject to renewal.",
    "Either party may terminate this agreement by giving the minimum notice period specified.",
    "The Provider shall maintain 99.5% uptime for the platform during business hours.",
    "Support shall be provided via email, phone, and remote access during business hours (9 AM - 6 PM IST).",
    "Data backup shall be performed daily with 30-day retention.",
    "The Provider shall comply with all applicable data protection regulations.",
    "All data uploaded by the Client remains the property of the Client.",
    "The Provider shall not share Client data with third parties without explicit consent.",
    "Disputes shall be resolved through arbitration in accordance with Indian law.",
  ],
  dataPrivacyAnnexure: {
    title: "Data Privacy Annexure",
    sections: [
      {
        heading: "1. Data Collection & Usage",
        content: "The Provider collects and processes student, staff, and school operational data solely for the purpose of delivering the SchooliAT platform services. Data is processed in accordance with the Information Technology Act, 2000 and applicable rules.",
      },
      {
        heading: "2. Data Storage & Security",
        content: "All data is stored on encrypted servers with industry-standard security measures. Access is restricted to authorized personnel only. Regular security audits are conducted.",
      },
      {
        heading: "3. Data Retention",
        content: "School data is retained for the duration of the service agreement. Upon termination, the Client may request export of their data within 30 days. Data is permanently deleted after the retention period.",
      },
      {
        heading: "4. Data Sharing",
        content: "The Provider does not share school data with third parties unless explicitly authorized by the Client or required by law.",
      },
      {
        heading: "5. Breach Notification",
        content: "In the event of a data breach, the Provider shall notify the Client within 72 hours of discovery and take immediate remedial action.",
      },
    ],
  },
};

const generateContractHtml = (onboarding) => {
  const today = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + (onboarding.contractDurationYears || 1));
  const expiryStr = expiryDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tAndC = COMPANY_DETAILS.termsAndConditions.map((t, i) => `<li>${t}</li>`).join("\n");
  const services = COMPANY_DETAILS.services.map((s) => `<li>${s}</li>`).join("\n");
  const privacySections = COMPANY_DETAILS.dataPrivacyAnnexure.sections
    .map((s) => `<h3>${s.heading}</h3><p>${s.content}</p>`)
    .join("\n");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Service Agreement — ${onboarding.schoolName}</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.8; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #6f8f3e; text-align: center; border-bottom: 3px solid #6f8f3e; padding-bottom: 15px; }
    h2 { color: #6f8f3e; margin-top: 30px; }
    h3 { color: #444; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td, th { padding: 10px 15px; border: 1px solid #ddd; text-align: left; }
    th { background-color: #f5f5f5; color: #6f8f3e; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { font-size: 28px; margin: 0; }
    .header p { color: #666; font-size: 14px; margin: 5px 0; }
    .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
    .signature-block { width: 45%; }
    .signature-block .line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
    ol li { margin-bottom: 8px; }
    .annexure { page-break-before: always; border-top: 2px solid #6f8f3e; padding-top: 20px; }
    .footer { text-align: center; color: #999; font-size: 11px; margin-top: 60px; border-top: 1px solid #eee; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <p style="font-size: 12px; color: #999;">${COMPANY_DETAILS.name}</p>
    <h1>SCHOOLiAT SERVICE AGREEMENT</h1>
    <p>${COMPANY_DETAILS.product} — ${COMPANY_DETAILS.tagline}</p>
  </div>

  <p><strong>Date:</strong> ${today}</p>
  <p><strong>Contract Reference:</strong> SA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}</p>

  <h2>Parties</h2>
  <table>
    <tr><th style="width:30%">Provider</th><td><strong>${COMPANY_DETAILS.name}</strong></td></tr>
    <tr><th>Client (School)</th><td><strong>${onboarding.schoolName}</strong></td></tr>
    <tr><th>School Address</th><td>${onboarding.schoolAddress}</td></tr>
    <tr><th>School Contact</th><td>${onboarding.schoolContactNumber}</td></tr>
    <tr><th>Email</th><td>${onboarding.concernedEmail}</td></tr>
    ${onboarding.pointOfContactName ? `<tr><th>Point of Contact</th><td>${onboarding.pointOfContactName}${onboarding.pointOfContactDesignation ? `, ${onboarding.pointOfContactDesignation}` : ""}</td></tr>` : ""}
    ${onboarding.principalPhone ? `<tr><th>Principal Phone</th><td>${onboarding.principalPhone}</td></tr>` : ""}
    ${onboarding.managementPhone ? `<tr><th>Management Phone</th><td>${onboarding.managementPhone}</td></tr>` : ""}
  </table>

  <h2>1. Service Scope</h2>
  <p>${COMPANY_DETAILS.name} agrees to provide the following services through the ${COMPANY_DETAILS.product} platform:</p>
  <ol>${services}</ol>

  <h2>2. Pricing & Payment</h2>
  <table>
    ${onboarding.pricingPerStudent ? `<tr><th>Per-Student Charge</th><td>₹${onboarding.pricingPerStudent} per student</td></tr>` : ""}
    ${onboarding.pricingPerMonth ? `<tr><th>Monthly Charge</th><td>₹${onboarding.pricingPerMonth} per month</td></tr>` : ""}
    ${onboarding.paymentMode ? `<tr><th>Payment Mode</th><td>${onboarding.paymentMode}</td></tr>` : ""}
    ${onboarding.paymentTermsDays ? `<tr><th>Payment Terms</th><td>${onboarding.paymentTermsDays} days from invoice date</td></tr>` : ""}
  </table>

  <h2>3. Contract Duration</h2>
  <p>This agreement shall be valid from <strong>${today}</strong> to <strong>${expiryStr}</strong>
  (${onboarding.contractDurationYears} year${onboarding.contractDurationYears > 1 ? "s" : ""}).
  The agreement shall automatically renew unless either party gives written notice of non-renewal at least ${onboarding.terminationNoticePeriod || 2} months prior to expiry.</p>

  <h2>4. Relationship Manager</h2>
  ${onboarding.relationshipManager ? `<p>A dedicated Relationship Manager (<strong>${onboarding.relationshipManager.firstName} ${onboarding.relationshipManager.lastName || ""}</strong>) will be assigned to this account for ongoing support and coordination.</p>` : `<p>A dedicated Relationship Manager will be assigned to this account upon activation.</p>`}

  <h2>5. Terms & Conditions</h2>
  <ol>${tAndC}</ol>

  <div class="signatures">
    <div class="signature-block">
      <div class="line">
        <p><strong>For ${COMPANY_DETAILS.name}</strong></p>
        <p style="color: #666; font-size: 13px;">Authorized Signatory</p>
      </div>
    </div>
    <div class="signature-block">
      <div class="line">
        <p><strong>For ${onboarding.schoolName}</strong></p>
        <p style="color: #666; font-size: 13px;">Authorized Signatory</p>
      </div>
    </div>
  </div>

  <div class="annexure">
    <h2>${COMPANY_DETAILS.dataPrivacyAnnexure.title}</h2>
    <p>This annexure forms an integral part of the Service Agreement between ${COMPANY_DETAILS.name} and the Client.</p>
    ${privacySections}
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} ${COMPANY_DETAILS.name}. All rights reserved.</p>
    <p>${COMPANY_DETAILS.product} — ${COMPANY_DETAILS.tagline}</p>
  </div>
</body>
</html>`;
};

const create = async (data, userId) => {
  const onboarding = await prisma.schoolOnboarding.create({
    data: {
      schoolName: data.schoolName,
      schoolAddress: data.schoolAddress,
      schoolContactNumber: data.schoolContactNumber,
      principalPhone: data.principalPhone || null,
      managementPhone: data.managementPhone || null,
      pointOfContactName: data.pointOfContactName || null,
      pointOfContactDesignation: data.pointOfContactDesignation || null,
      concernedEmail: data.concernedEmail,
      pricingPerStudent: data.pricingPerStudent || null,
      pricingPerMonth: data.pricingPerMonth || null,
      relationshipManagerId: data.relationshipManagerId || null,
      contractDurationYears: data.contractDurationYears || 1,
      paymentMode: data.paymentMode || null,
      paymentTermsDays: data.paymentTermsDays || null,
      terminationNoticePeriod: data.terminationNoticePeriod || null,
      notes: data.notes || null,
      status: "DRAFT",
      createdBy: userId,
    },
    include: {
      relationshipManager: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  logger.info({ onboardingId: onboarding.id }, "School onboarding created");
  return onboarding;
};

const getById = async (id) => {
  const onboarding = await prisma.schoolOnboarding.findFirst({
    where: { id, deletedAt: null },
    include: {
      relationshipManager: { select: { id: true, firstName: true, lastName: true, email: true } },
      school: { select: { id: true, name: true, code: true } },
      contractFile: { select: { id: true, name: true, extension: true } },
    },
  });
  if (!onboarding) throw new Error("Onboarding not found");
  return onboarding;
};

const list = async (filters = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { deletedAt: null };
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { schoolName: { contains: filters.search, mode: "insensitive" } },
      { concernedEmail: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.schoolOnboarding.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        relationshipManager: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.schoolOnboarding.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const generateContract = async (id, userId) => {
  const onboarding = await prisma.schoolOnboarding.findFirst({
    where: { id, deletedAt: null },
    include: {
      relationshipManager: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  if (!onboarding) throw new Error("Onboarding not found");

  const html = generateContractHtml(onboarding);

  const updated = await prisma.schoolOnboarding.update({
    where: { id },
    data: { status: "CONTRACT_SENT", updatedBy: userId },
  });

  logger.info({ onboardingId: id }, "Contract generated");
  return { ...updated, contractHtml: html };
};

const confirmContract = async (id, userId) => {
  const onboarding = await prisma.schoolOnboarding.findFirst({
    where: { id, deletedAt: null },
  });
  if (!onboarding) throw new Error("Onboarding not found");
  if (onboarding.status !== "CONTRACT_SENT") {
    throw new Error(`Cannot confirm onboarding in status: ${onboarding.status}`);
  }

  const updated = await prisma.schoolOnboarding.update({
    where: { id },
    data: { status: "CONTRACT_CONFIRMED", updatedBy: userId },
  });

  logger.info({ onboardingId: id }, "Contract confirmed");
  return updated;
};

const complete = async (id, userId) => {
  const onboarding = await prisma.schoolOnboarding.findFirst({
    where: { id, deletedAt: null },
  });
  if (!onboarding) throw new Error("Onboarding not found");
  if (onboarding.status !== "CONTRACT_CONFIRMED") {
    throw new Error(`Cannot complete onboarding in status: ${onboarding.status}`);
  }

  const updated = await prisma.schoolOnboarding.update({
    where: { id },
    data: { status: "COMPLETED", updatedBy: userId },
  });

  logger.info({ onboardingId: id }, "Onboarding completed");
  return updated;
};

const cancel = async (id, userId) => {
  const onboarding = await prisma.schoolOnboarding.findFirst({
    where: { id, deletedAt: null },
  });
  if (!onboarding) throw new Error("Onboarding not found");

  const updated = await prisma.schoolOnboarding.update({
    where: { id },
    data: { status: "CANCELLED", updatedBy: userId },
  });

  logger.info({ onboardingId: id }, "Onboarding cancelled");
  return updated;
};

const remove = async (id, userId) => {
  const existing = await prisma.schoolOnboarding.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new Error("Onboarding not found");
  return prisma.schoolOnboarding.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: userId },
  });
};

const getStats = async () => {
  const [total, byStatus] = await Promise.all([
    prisma.schoolOnboarding.count({ where: { deletedAt: null } }),
    prisma.schoolOnboarding.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: true,
    }),
  ]);

  return { total, byStatus };
};

const schoolOnboardingService = {
  create,
  getById,
  list,
  generateContract,
  confirmContract,
  complete,
  cancel,
  remove,
  getStats,
  COMPANY_DETAILS,
  generateContractHtml,
};

export default schoolOnboardingService;
