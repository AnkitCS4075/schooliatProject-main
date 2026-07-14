/** Central Prisma include/select shapes for invoice ↔ receipt APIs. */

export const invoiceReceiptSummaryInclude = {
  where: { deletedAt: null },
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    receiptNumber: true,
    amount: true,
    status: true,
    createdAt: true,
  },
};

export const receiptInvoiceSummarySelect = {
  select: {
    id: true,
    invoiceNumber: true,
    status: true,
  },
};

export const receiptInvoiceDetailSelect = {
  select: {
    id: true,
    invoiceNumber: true,
    status: true,
    amount: true,
  },
};

export const receiptInvoiceGenerateSelect = {
  select: {
    id: true,
    invoiceNumber: true,
  },
};

export const receiptSchoolListSelect = {
  select: {
    id: true,
    name: true,
    code: true,
  },
};

export const receiptVendorListSelect = {
  select: {
    id: true,
    name: true,
    contact: true,
  },
};

export const receiptSchoolDetailSelect = {
  select: {
    id: true,
    name: true,
    code: true,
    email: true,
    phone: true,
    address: true,
  },
};

export const receiptVendorDetailSelect = {
  select: {
    id: true,
    name: true,
    contact: true,
    address: true,
    email: true,
  },
};

export function receiptIncludeForList() {
  return {
    school: receiptSchoolListSelect,
    vendor: receiptVendorListSelect,
    invoice: receiptInvoiceSummarySelect,
  };
}

export function receiptIncludeForDetail() {
  return {
    school: receiptSchoolDetailSelect,
    vendor: receiptVendorDetailSelect,
    invoice: receiptInvoiceDetailSelect,
  };
}

export function receiptIncludeForGenerate() {
  return {
    school: receiptSchoolDetailSelect,
    vendor: receiptVendorDetailSelect,
    invoice: receiptInvoiceGenerateSelect,
  };
}
