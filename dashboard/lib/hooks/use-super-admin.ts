import {
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { get, post, patch, put, del } from "@/lib/api/client";

/** Super-admin DELETE routes require `{ request: { otp } }` after email verification. */
export type SuperAdminDeleteWithOtpInput = { id: string; otp: string };

// Statistics
export function useSchoolStatistics(search?: string, academicYear?: string) {
  return useQuery({
    queryKey: ["schoolStatistics", search, academicYear],
    queryFn: () =>
      get("/statistics/schools", {
        ...(search ? { search } : {}),
        ...(academicYear ? { academicYear } : {}),
      }),
    staleTime: 30 * 1000,
  });
}

export function useSchoolRevenue(schoolId: string) {
  return useQuery({
    queryKey: ["schoolRevenue", schoolId],
    queryFn: () => get(`/statistics/schools/${schoolId}/revenue`),
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  });
}

export function useDashboardStats(academicYear?: string) {
  return useQuery({
    queryKey: ["dashboardStats", academicYear],
    queryFn: () => get("/statistics/dashboard", academicYear ? { academicYear } : undefined),
    staleTime: 30 * 1000,
  });
}

// Schools
export function useSchools(params?: { search?: string; regionId?: string }) {
  const { search, regionId } = params || {};
  return useQuery({
    queryKey: ["schools", search, regionId],
    queryFn: () =>
      get("/schools", {
        ...(search ? { search } : {}),
        ...(regionId ? { regionId } : {}),
      }),
    staleTime: 30 * 1000,
  });
}

/** Super Admin: school profile + aggregate stats (GET /schools/:id/overview) */
export function useSchoolMasterOverview(id: string) {
  return useQuery({
    queryKey: ["schoolMasterOverview", id],
    queryFn: async () => {
      const res = await get(`/schools/${id}/overview`);
      return res?.data ?? null;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useSchool(id: string) {
  return useQuery({
    queryKey: ["school", id],
    queryFn: async () => {
      // Get school from list and find by ID
      const response = await get("/schools");
      const schools = response?.data || [];
      return schools.find((s: School) => s.id === id) || null;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/** Super Admin: fetch single school by ID including bank details (GET /schools/:id) */
export function useSchoolById(id: string) {
  return useQuery({
    queryKey: ["schoolById", id],
    queryFn: async () => {
      const res = await get(`/schools/${id}`);
      return res?.data ?? null;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: CreateSchoolData) =>
      post("/schools", { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.invalidateQueries({ queryKey: ["schoolMasterOverview"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["schoolStatistics"] });
    },
  });
}

export function useSendSchoolAdminWelcome() {
  return useMutation({
    mutationFn: ({
      schoolId,
      password,
    }: {
      schoolId: string;
      password: string;
    }) =>
      post(`/schools/${schoolId}/send-admin-welcome`, {
        request: { password },
      }),
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { id: string } & SuperAdminSchoolPatchRequest>({
    mutationFn: ({ id, ...formData }) =>
      patch(`/schools/${id}`, { request: formData }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.invalidateQueries({ queryKey: ["school", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["schoolById", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["schoolMasterOverview", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["schoolStatistics"] });
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: SuperAdminDeleteWithOtpInput) =>
      del(`/schools/${id}`, { request: { otp } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.invalidateQueries({ queryKey: ["schoolMasterOverview"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["schoolStatistics"] });
    },
  });
}

// Employees
export function useEmployees(search?: string) {
  return useQuery({
    queryKey: ["employees", search],
    queryFn: () =>
      get("/users/employees", search ? { search } : {}),
    staleTime: 30 * 1000,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => get(`/users/employees/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: CreateEmployeeData) =>
      post("/users/employees", { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  type Vars = { id: string } & Partial<CreateEmployeeData>;
  return useMutation<unknown, Error, Vars>({
    mutationFn: ({ id, ...formData }) =>
      patch(`/users/employees/${id}`, { request: formData }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateEmployeePermissions() {
  const queryClient = useQueryClient();
  type Vars = { id: string; permissions: string[] };
  return useMutation<unknown, Error, Vars>({
    mutationFn: ({ id, permissions }) =>
      patch(`/users/employees/${id}/permissions`, { permissions }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

// Receipts
export function useReceipts(params?: { schoolId?: string; vendorId?: string; status?: string }) {
  const { schoolId, vendorId, status } = params || {};
  return useQuery({
    queryKey: ["receipts", schoolId, vendorId, status],
    queryFn: () => get("/receipts", { schoolId, vendorId, status }),
    staleTime: 30 * 1000,
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: CreateReceiptData) =>
      post("/receipts", { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useGenerateReceipt() {
  return useMutation({
    mutationFn: ({ receiptId, notes }: { receiptId: string; notes?: string }) =>
      post(`/receipts/${receiptId}/generate`, { notes }),
  });
}

export function useReceipt(id: string) {
  return useQuery({
    queryKey: ["receipt", id],
    queryFn: () => get(`/receipts/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useUpdateReceipt() {
  const queryClient = useQueryClient();
  type Vars = { id: string } & Partial<CreateReceiptData & { amount?: number }>;
  return useMutation<unknown, Error, Vars>({
    mutationFn: ({ id, ...formData }) =>
      patch(`/receipts/${id}`, { request: formData }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["receipt", variables.id] });
    },
  });
}

// Invoices
export function useInvoices(params?: { schoolId?: string; vendorId?: string; status?: string }) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => get("/invoices", params),
    staleTime: 30 * 1000,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: any) =>
      post("/invoices", { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useGenerateInvoice() {
  return useMutation({
    mutationFn: ({ invoiceId, notes }: { invoiceId: string; notes?: string }) =>
      post(`/invoices/${invoiceId}/generate`, { notes }),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => get(`/invoices/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  type Vars = { id: string } & Record<string, unknown>;
  return useMutation<unknown, Error, Vars>({
    mutationFn: ({ id, ...formData }) =>
      patch(`/invoices/${id}`, { request: formData }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: SuperAdminDeleteWithOtpInput) =>
      del(`/invoices/${id}`, { request: { otp } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

// Licenses
export function useLicenses() {
  return useQuery({
    queryKey: ["licenses"],
    queryFn: () => get("/licenses"),
    staleTime: 30 * 1000,
  });
}

export function useCreateLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: CreateLicenseData) =>
      post("/licenses", { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });
}

export function useUpdateLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...formData }: { id: string } & Partial<CreateLicenseData>) =>
      put(`/licenses/${id}`, { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });
}

export function useDeleteLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: SuperAdminDeleteWithOtpInput) =>
      del(`/licenses/${id}`, { request: { otp } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });
}

// Regions
export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: () => get("/regions"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: { name: string; zoneHeadId?: string }) =>
      post("/regions", { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}

// Vendors
export function useVendorStats() {
  return useQuery({
    queryKey: ["vendorStats"],
    queryFn: () => get("/vendors/stats"),
    staleTime: 30 * 1000,
  });
}

export function useVendors(params?: { status?: string; search?: string; employeeId?: string }) {
  return useQuery({
    queryKey: ["vendors", params],
    queryFn: () => get("/vendors", params),
    staleTime: 30 * 1000,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: CreateVendorData) =>
      post("/vendors", { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendorStats"] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...formData }: { id: string } & Partial<CreateVendorData & { status?: string }>) =>
      patch(`/vendors/${id}`, { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendorStats"] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: SuperAdminDeleteWithOtpInput) =>
      del(`/vendors/${id}`, { request: { otp } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendorStats"] });
    },
  });
}

// Letterhead
export function useGenerateLetterhead() {
  return useMutation({
    mutationFn: (formData: GenerateLetterheadData) =>
      post("/letterhead/generate", { request: formData }),
  });
}

// Types
export interface School {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string[];
  status?: string;
  createdAt: string;
  userCount?: number;
  gstNumber?: string;
  principalName?: string;
  principalEmail?: string;
  principalPhone?: string;
  establishedYear?: number;
  boardAffiliation?: string;
  studentStrength?: number;
  certificateLink?: string;
  regionId?: string;
  region?: {
    id?: string;
    name: string;
  };
}

/** GET /schools/:id/overview */
export interface SchoolMasterOverview {
  school: School & {
    region?: { id: string; name: string };
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankIfscCode?: string | null;
    bankBranchName?: string | null;
    upiId?: string | null;
    logoId?: string | null;
  };
  stats: {
    classes: number;
    subjects: number;
    students: number;
    teachers: number;
    staff: number;
    schoolAdmins: number;
  };
}

export interface CreateSchoolData {
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string[];
  regionId: string;
  gstNumber?: string;
  principalName?: string;
  principalEmail?: string;
  principalPhone?: string;
  establishedYear?: string | number;
  boardAffiliation?: string;
  studentStrength?: string | number;
  certificateLink?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankBranchName?: string;
  upiId?: string;
}

/** Super-admin PATCH /schools/:id — same writable fields as create, all optional except id; null clears nullable columns. */
export type SuperAdminSchoolPatchRequest = Partial<
  Omit<CreateSchoolData, "regionId" | "establishedYear" | "studentStrength">
> & {
  regionId?: string | null;
  establishedYear?: string | number | null;
  studentStrength?: string | number | null;
  upiId?: string | null;
};

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  assignedRegionId?: string;
  assignedRegion?: Region;
  totalLocations?: number;
  totalVendors?: number;
  status: string;
  permissions?: string[];
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  contact?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  address?: string[];
  aadhaarId?: string;
  assignedRegionId?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  schoolId?: string | null;
  vendorId?: string | null;
  invoiceId?: string | null;
  school?: School;
  vendor?: { id: string; name: string; contact?: string };
  invoice?: {
    id: string;
    invoiceNumber: string | null;
    status?: string;
    amount?: number;
  };
  amount: number;
  status: string;
  description?: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface InvoiceReceiptSummary {
  id: string;
  receiptNumber: string | null;
  amount: unknown;
  status: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  schoolId?: string;
  school?: School;
  vendorId?: string;
  vendor?: Vendor;
  amount: number;
  status: string;
  description?: string;
  dueDate?: string;
  createdAt: string;
  receipts?: InvoiceReceiptSummary[];
}

export interface CreateReceiptData {
  /** When set, creates a receipt that settles this invoice (amounts match invoice; marks invoice PAID). */
  invoiceId?: string;
  schoolId?: string;
  vendorId?: string;
  baseAmount?: number;
  description?: string;
  paymentMethod?: string;
  sgstPercent?: number | null;
  cgstPercent?: number | null;
  igstPercent?: number | null;
  ugstPercent?: number | null;
}

export interface License {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
  certificateNumber: string;
  documentUrl?: string;
}

export interface CreateLicenseData {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  certificateNumber: string;
  documentUrl?: string;
}

export interface Region {
  id: string;
  name: string;
  zoneHeadId?: string;
  zoneHead?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  contact: string;
  address: string[];
  comments?: string;
  status: "NEW" | "HOT" | "COLD" | "FOLLOW_UP" | "CONVERTED";
  regionId: string;
  region?: Region;
  employeeId?: string;
}

export interface CreateVendorData {
  name: string;
  email?: string;
  contact: string;
  address: string[];
  comments?: string;
  regionId: string;
  employeeId?: string;
}

export interface VendorStats {
  total: number;
  new: number;
  hot: number;
  cold: number;
  followUp: number;
  converted: number;
}

export interface DashboardStats {
  totalSchools: number;
  totalStudents: number;
  totalEmployees: number;
  recentSchools: School[];
}

export interface SchoolStatistics {
  schools: Array<{
    id: string;
    name: string;
    code: string;
    createdAt: string;
    totalStudents: number;
    totalStaff: number;
    teachers: number;
    adminStaff: number;
    totalRevenue: number;
    status: string;
  }>;
  totals: {
    totalStudents: number;
    totalStaff: number;
    totalTeachers: number;
    totalAdminStaff: number;
    totalRevenue: number;
  };
}

export interface SchoolRevenueData {
  school: { id: string; name: string; code: string };
  grandTotal: number;
  yearly: Array<{
    academicYear: string;
    totalRevenue: number;
    totalBase: number;
    totalGst: number;
    receiptCount: number;
  }>;
  receipts: Array<{
    id: string;
    receiptNumber: string;
    amount: string;
    baseAmount: string;
    totalGst: string;
    description: string;
    paymentMethod: string;
    createdAt: string;
  }>;
}

export interface GenerateLetterheadData {
  content: string;
  subject?: string | null;
  date: string;
  signatureName?: string | null;
  signatureDesignation?: string | null;
  companyName?: string | null;
  companyTagline?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyAddress?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  themeColorDark?: string | null;
  hideLogo?: boolean | null;
}

// Locations
export function useLocations(params?: { employeeId?: string; regionId?: string }) {
  return useQuery({
    queryKey: ["locations", params],
    queryFn: () => get("/locations", params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: CreateLocationData) =>
      post("/locations", { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...formData }: { id: string } & Partial<CreateLocationData>) =>
      patch(`/locations/${id}`, { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: SuperAdminDeleteWithOtpInput) =>
      del(`/locations/${id}`, { request: { otp } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useUpdateRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...formData }: { id: string } & Partial<{ name: string; zoneHeadId: string }>) =>
      patch(`/regions/${id}`, { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}

export function useDeleteRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: SuperAdminDeleteWithOtpInput) =>
      del(`/regions/${id}`, { request: { otp } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}

export {
  useTemplates,
  useTemplateDefaults,
  type Template,
} from "./use-templates";

// Audit Logs
export function useAuditLogs(params?: {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  result?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: async () => {
      // Filter out empty values to avoid sending empty query params
      const cleanParams: Record<string, any> = {};
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            cleanParams[key] = value;
          }
        });
      }
      return get("/audit", cleanParams);
    },
    staleTime: 30 * 1000,
  });
}

// System Health
export function useSystemHealth() {
  return useQuery({
    queryKey: ["systemHealth"],
    queryFn: () => get("/health"),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10 * 1000,
  });
}

// Types
export interface Location {
  id: string;
  name: string;
  regionId: string;
  region?: Region;
  employeeId?: string;
  employee?: Employee;
  createdAt: string;
}

export interface CreateLocationData {
  name: string;
  regionId: string;
  employeeId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: {
      name: string;
    };
  };
  action: string;
  entityType: string;
  entityId?: string;
  result: "SUCCESS" | "FAILURE";
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  errorMessage?: string;
  timestamp: string; // Backend uses 'timestamp' not 'createdAt'
}
