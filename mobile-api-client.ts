/**
 * SchooliAt Mobile API Client
 * 
 * Comprehensive API client for mobile applications (Android/iOS)
 * Supports three user types: Teacher, Student, and Employee (Company)
 * 
 * Usage:
 *   import { MobileApiClient } from './mobile-api-client';
 *   
 *   const client = new MobileApiClient('https://api.schooliat.com/api/v1', 'android');
 *   await client.auth.login('user@example.com', 'password');
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type Platform = 'android' | 'ios';
export type UserRole = 'TEACHER' | 'STUDENT' | 'EMPLOYEE';

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  pagination?: Pagination;
  errorCode?: string;
  status?: 'success' | 'error';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'APP' | 'SCHOOL';
  role: {
    id: string;
    name: UserRole;
    permissions?: string[];
  };
  schoolId?: string;
  school?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentProfile?: {
    id: string;
    rollNumber: number;
    apaarId?: string;
    class?: {
      id: string;
      name: string;
    };
    fatherName?: string;
    motherName?: string;
    fatherContact?: string;
    motherContact?: string;
    dateOfBirth?: string;
    gender?: string;
  };
}

export interface Attendance {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  studentId: string;
  classId: string;
  periodId?: string;
  lateArrivalTime?: string;
  absenceReason?: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subject?: {
    id: string;
    name: string;
  };
  classes?: Array<{
    id: string;
    name: string;
  }>;
  dueDate: string;
  createdAt: string;
  isMCQ: boolean;
  attachments?: string[];
  submission?: {
    id: string;
    status: 'PENDING' | 'SUBMITTED' | 'GRADED';
    submittedAt?: string;
    grade?: string;
    feedback?: string;
  };
}

export interface Mark {
  id: string;
  exam?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
  };
  studentId: string;
  marksObtained: number;
  maxMarks: number;
  percentage?: number;
  grade?: string;
}

export interface Result {
  id: string;
  exam?: {
    id: string;
    name: string;
  };
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
  classRank?: number;
  subjects?: Array<{
    subject: {
      id: string;
      name: string;
    };
    marksObtained: number;
    maxMarks: number;
    grade: string;
  }>;
}

export interface Timetable {
  id: string;
  name: string;
  class?: {
    id: string;
    name: string;
  };
  effectiveFrom?: string;
  effectiveTill?: string;
  slots: Array<{
    dayOfWeek: number;
    periodNumber: number;
    subject?: {
      id: string;
      name: string;
    };
    teacher?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    startTime: string;
    endTime: string;
    room?: string;
  }>;
}

export interface Fee {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidAmount: number;
  paymentDate?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: {
    id: string;
    name: string;
  };
  createdAt?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  employeeId?: string;
}

export interface License {
  id: string;
  school?: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  maxStudents: number;
  maxStaff: number;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
}

// ============================================================================
// API Client Class
// ============================================================================

export class MobileApiClient {
  private baseUrl: string;
  private platform: Platform;
  private token: string | null = null;

  constructor(baseUrl: string = 'https://api.schooliat.com/api/v1', platform: Platform = 'android') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.platform = platform;
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: any;
      query?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { body, query, headers = {} } = options;

    // Build URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    let url = `${this.baseUrl}${cleanPath}`;

    // Add query parameters
    if (query && Object.keys(query).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    // Prepare headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'x-platform': this.platform,
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      // Handle errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        if (response.status === 401) {
          // Token expired or invalid
          this.token = null;
        }

        throw new ApiError(
          errorData?.message || `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { message: 'Success' } as ApiResponse<T>;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error. Please check your connection and try again.',
        0
      );
    }
  }

  // ========================================================================
  // Authentication APIs
  // ========================================================================

  auth = {
    /**
     * Login user
     */
    login: async (email: string, password: string): Promise<LoginResponse> => {
      const response = await this.request<{ token: string; user?: User }>(
        'POST',
        '/auth/authenticate',
        {
          body: {
            request: { email, password },
          },
        }
      );

      if (response.data?.token) {
        this.token = response.data.token;
        return {
          token: response.data.token,
          user: response.data.user,
        };
      }

      throw new ApiError('Login response missing token', 400);
    },

    /**
     * Request OTP
     */
    requestOTP: async (email: string, purpose: 'verification' | 'password-reset' | 'login' | 'deletion'): Promise<void> => {
      await this.request('POST', '/auth/request-otp', {
        body: {
          request: { email, purpose },
        },
      });
    },

    /**
     * Verify OTP
     */
    verifyOTP: async (email: string, otp: string, purpose: string): Promise<boolean> => {
      const response = await this.request<{ verified: boolean }>(
        'POST',
        '/auth/verify-otp',
        {
          body: {
            request: { email, otp, purpose },
          },
        }
      );
      return response.data?.verified || false;
    },

    /**
     * Forgot password
     */
    forgotPassword: async (email: string): Promise<void> => {
      await this.request('POST', '/auth/forgot-password', {
        body: {
          request: { email },
        },
      });
    },

    /**
     * Reset password
     */
    resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
      await this.request('POST', '/auth/reset-password', {
        body: {
          request: { email, otp, newPassword },
        },
      });
    },

    /**
     * Change password
     */
    changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
      await this.request('POST', '/auth/change-password', {
        body: {
          request: { currentPassword, newPassword },
        },
      });
    },

    /**
     * Logout (clear token locally)
     */
    logout: (): void => {
      this.token = null;
    },
  };

  // ========================================================================
  // Teacher APIs
  // ========================================================================

  teacher = {
    /**
     * Get teacher dashboard
     */
    getDashboard: async (): Promise<any> => {
      const response = await this.request('GET', '/statistics/dashboard');
      return response.data;
    },

    /**
     * Get students
     */
    getStudents: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      classId?: string;
    }): Promise<{ data: Student[]; pagination?: Pagination }> => {
      const response = await this.request<Student[]>('GET', '/students', {
        query: params,
      });
      return {
        data: response.data || [],
        pagination: response.pagination,
      };
    },

    /**
     * Get student by ID
     */
    getStudent: async (id: string): Promise<Student> => {
      const response = await this.request<Student>('GET', `/students/${id}`);
      return response.data!;
    },

    /**
     * Mark attendance
     */
    markAttendance: async (data: {
      studentId: string;
      classId: string;
      date: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
      periodId?: string;
      lateArrivalTime?: string;
      absenceReason?: string;
    }): Promise<void> => {
      await this.request('POST', '/attendance/mark', {
        body: { request: data },
      });
    },

    /**
     * Mark bulk attendance
     */
    markBulkAttendance: async (data: {
      classId: string;
      date: string;
      attendance: Array<{
        studentId: string;
        status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
        absenceReason?: string;
      }>;
    }): Promise<void> => {
      await this.request('POST', '/attendance/mark-bulk', {
        body: { request: data },
      });
    },

    /**
     * Get attendance records
     */
    getAttendance: async (params?: {
      studentId?: string;
      classId?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    }): Promise<Attendance[]> => {
      const response = await this.request<Attendance[]>('GET', '/attendance', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get attendance statistics
     */
    getAttendanceStatistics: async (params?: {
      studentId?: string;
      classId?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<any> => {
      const response = await this.request('GET', '/attendance/statistics', {
        query: params,
      });
      return response.data;
    },

    /**
     * Create homework
     */
    createHomework: async (data: {
      title: string;
      description: string;
      classIds: string[];
      subjectId: string;
      dueDate: string;
      isMCQ: boolean;
      attachments?: string[];
      mcqQuestions?: any[];
    }): Promise<Homework> => {
      const response = await this.request<Homework>('POST', '/homework', {
        body: { request: data },
      });
      return response.data!;
    },

    /**
     * Get homework assignments
     */
    getHomework: async (params?: {
      studentId?: string;
      classId?: string;
      status?: string;
    }): Promise<Homework[]> => {
      const response = await this.request<Homework[]>('GET', '/homework', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Grade homework
     */
    gradeHomework: async (homeworkId: string, data: {
      submissionId: string;
      grade: string;
      feedback: string;
      marksObtained?: number;
      maxMarks?: number;
    }): Promise<void> => {
      await this.request('POST', `/homework/${homeworkId}/grade`, {
        body: { request: data },
      });
    },

    /**
     * Enter marks
     */
    enterMarks: async (data: {
      examId: string;
      studentId: string;
      subjectId: string;
      classId: string;
      marksObtained: number;
      maxMarks: number;
    }): Promise<void> => {
      await this.request('POST', '/marks', {
        body: { request: data },
      });
    },

    /**
     * Enter bulk marks
     */
    enterBulkMarks: async (data: {
      examId: string;
      classId: string;
      subjectId: string;
      maxMarks: number;
      marks: Array<{
        studentId: string;
        marksObtained: number;
      }>;
    }): Promise<void> => {
      await this.request('POST', '/marks/bulk', {
        body: { request: data },
      });
    },

    /**
     * Get marks
     */
    getMarks: async (params?: {
      examId?: string;
      studentId?: string;
      classId?: string;
      subjectId?: string;
    }): Promise<Mark[]> => {
      const response = await this.request<Mark[]>('GET', '/marks', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Calculate results
     */
    calculateResults: async (examId: string, classId: string): Promise<void> => {
      await this.request('POST', '/marks/calculate-result', {
        body: { request: { examId, classId } },
      });
    },

    /**
     * Publish results
     */
    publishResults: async (resultIds: string[]): Promise<void> => {
      await this.request('POST', '/marks/publish-results', {
        body: { request: { resultIds } },
      });
    },

    /**
     * Get timetables
     */
    getTimetables: async (params?: {
      classId?: string;
      teacherId?: string;
      subjectId?: string;
      isActive?: boolean;
    }): Promise<Timetable[]> => {
      const response = await this.request<Timetable[]>('GET', '/timetables', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Create note
     */
    createNote: async (data: {
      title: string;
      subjectId: string;
      classId: string;
      chapter: string;
      fileId: string;
      description?: string;
    }): Promise<any> => {
      const response = await this.request('POST', '/notes', {
        body: { request: data },
      });
      return response.data;
    },

    /**
     * Get notes
     */
    getNotes: async (params?: {
      subjectId?: string;
      classId?: string;
      chapter?: string;
    }): Promise<any[]> => {
      const response = await this.request<any[]>('GET', '/notes', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Request leave
     */
    requestLeave: async (data: {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason: string;
    }): Promise<void> => {
      await this.request('POST', '/leave/request', {
        body: { request: data },
      });
    },

    /**
     * Get leave requests
     */
    getLeaveRequests: async (params?: {
      userId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<any[]> => {
      const response = await this.request<any[]>('GET', '/leave/requests', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get leave balance
     */
    getLeaveBalance: async (userId?: string): Promise<any> => {
      const response = await this.request('GET', '/leave/balance', {
        query: userId ? { userId } : {},
      });
      return response.data;
    },
  };

  // ========================================================================
  // Student APIs
  // ========================================================================

  student = {
    /**
     * Get student dashboard
     */
    getDashboard: async (): Promise<any> => {
      const response = await this.request('GET', '/statistics/dashboard');
      return response.data;
    },

    /**
     * Get student profile
     */
    getProfile: async (id: string): Promise<Student> => {
      const response = await this.request<Student>('GET', `/students/${id}`);
      return response.data!;
    },

    /**
     * Get attendance
     */
    getAttendance: async (params?: {
      startDate?: string;
      endDate?: string;
      status?: string;
    }): Promise<Attendance[]> => {
      const response = await this.request<Attendance[]>('GET', '/attendance', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get attendance statistics
     */
    getAttendanceStatistics: async (params?: {
      startDate?: string;
      endDate?: string;
    }): Promise<any> => {
      const response = await this.request('GET', '/attendance/statistics', {
        query: params,
      });
      return response.data;
    },

    /**
     * Get homework
     */
    getHomework: async (params?: {
      status?: string;
    }): Promise<Homework[]> => {
      const response = await this.request<Homework[]>('GET', '/homework', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Submit homework
     */
    submitHomework: async (homeworkId: string, data: {
      files: string[];
      answers?: any[];
    }): Promise<void> => {
      await this.request('POST', `/homework/${homeworkId}/submit`, {
        body: { request: data },
      });
    },

    /**
     * Get marks
     */
    getMarks: async (params?: {
      examId?: string;
      subjectId?: string;
    }): Promise<Mark[]> => {
      const response = await this.request<Mark[]>('GET', '/marks', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get results
     */
    getResults: async (params?: {
      examId?: string;
    }): Promise<Result[]> => {
      const response = await this.request<Result[]>('GET', '/marks/results', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get timetable
     */
    getTimetable: async (classId?: string): Promise<Timetable[]> => {
      const response = await this.request<Timetable[]>('GET', '/timetables', {
        query: classId ? { classId } : {},
      });
      return response.data || [];
    },

    /**
     * Get notes
     */
    getNotes: async (params?: {
      subjectId?: string;
      chapter?: string;
    }): Promise<any[]> => {
      const response = await this.request<any[]>('GET', '/notes', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get syllabus
     */
    getSyllabus: async (params?: {
      subjectId?: string;
      academicYear?: string;
    }): Promise<any[]> => {
      const response = await this.request<any[]>('GET', '/syllabus', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get fees
     */
    getFees: async (params?: {
      year?: number;
    }): Promise<Fee[]> => {
      const response = await this.request<Fee[]>('GET', '/fees', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get fee status
     */
    getFeeStatus: async (): Promise<any> => {
      const response = await this.request('GET', '/fees/status');
      return response.data;
    },
  };

  // ========================================================================
  // Employee (Company) APIs
  // ========================================================================

  employee = {
    /**
     * Get employee dashboard
     */
    getDashboard: async (): Promise<any> => {
      const response = await this.request('GET', '/statistics/dashboard');
      return response.data;
    },

    /**
     * Get schools
     */
    getSchools: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
    }): Promise<{ data: School[]; pagination?: Pagination }> => {
      const response = await this.request<School[]>('GET', '/schools', {
        query: params,
      });
      return {
        data: response.data || [],
        pagination: response.pagination,
      };
    },

    /**
     * Get school by ID
     */
    getSchool: async (id: string): Promise<School> => {
      const response = await this.request<School>('GET', `/schools/${id}`);
      return response.data!;
    },

    /**
     * Create school
     */
    createSchool: async (data: {
      name: string;
      code: string;
      email?: string;
      phone?: string;
      address?: string;
    }): Promise<School> => {
      const response = await this.request<School>('POST', '/schools', {
        body: { request: data },
      });
      return response.data!;
    },

    /**
     * Update school
     */
    updateSchool: async (id: string, data: Partial<School>): Promise<School> => {
      const response = await this.request<School>('PUT', `/schools/${id}`, {
        body: { request: data },
      });
      return response.data!;
    },

    /**
     * Delete school
     */
    deleteSchool: async (id: string): Promise<void> => {
      await this.request('DELETE', `/schools/${id}`);
    },

    /**
     * Get employees
     */
    getEmployees: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
    }): Promise<{ data: Employee[]; pagination?: Pagination }> => {
      const response = await this.request<Employee[]>('GET', '/employees', {
        query: params,
      });
      return {
        data: response.data || [],
        pagination: response.pagination,
      };
    },

    /**
     * Get employee by ID
     */
    getEmployee: async (id: string): Promise<Employee> => {
      const response = await this.request<Employee>('GET', `/employees/${id}`);
      return response.data!;
    },

    /**
     * Create employee
     */
    createEmployee: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      roleId: string;
    }): Promise<Employee> => {
      const response = await this.request<Employee>('POST', '/employees', {
        body: { request: data },
      });
      return response.data!;
    },

    /**
     * Update employee
     */
    updateEmployee: async (id: string, data: Partial<Employee>): Promise<Employee> => {
      const response = await this.request<Employee>('PUT', `/employees/${id}`, {
        body: { request: data },
      });
      return response.data!;
    },

    /**
     * Delete employee
     */
    deleteEmployee: async (id: string): Promise<void> => {
      await this.request('DELETE', `/employees/${id}`);
    },

    /**
     * Get vendors
     */
    getVendors: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      employeeId?: string;
    }): Promise<{ data: Vendor[]; pagination?: Pagination }> => {
      const response = await this.request<Vendor[]>('GET', '/vendors', {
        query: params,
      });
      return {
        data: response.data || [],
        pagination: response.pagination,
      };
    },

    /**
     * Create vendor
     */
    createVendor: async (data: {
      name: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      address?: string;
      employeeId?: string;
    }): Promise<Vendor> => {
      const response = await this.request<Vendor>('POST', '/vendors', {
        body: { request: data },
      });
      return response.data!;
    },

    /**
     * Get vendor by ID
     */
    getVendor: async (id: string): Promise<Vendor> => {
      const response = await this.request<Vendor>('GET', `/vendors/${id}`);
      return response.data!;
    },

    /**
     * Update vendor
     */
    updateVendor: async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
      const response = await this.request<Vendor>('PUT', `/vendors/${id}`, {
        body: { request: data },
      });
      return response.data!;
    },

    /**
     * Delete vendor
     */
    deleteVendor: async (id: string): Promise<void> => {
      await this.request('DELETE', `/vendors/${id}`);
    },

    /**
     * Get licenses
     */
    getLicenses: async (params?: {
      page?: number;
      limit?: number;
      schoolId?: string;
      status?: string;
    }): Promise<{ data: License[]; pagination?: Pagination }> => {
      const response = await this.request<License[]>('GET', '/licenses', {
        query: params,
      });
      return {
        data: response.data || [],
        pagination: response.pagination,
      };
    },

    /**
     * Create license
     */
    createLicense: async (data: {
      schoolId: string;
      startDate: string;
      endDate: string;
      maxStudents: number;
      maxStaff: number;
    }): Promise<License> => {
      const response = await this.request<License>('POST', '/licenses', {
        body: { request: data },
      });
      return response.data!;
    },

    /**
     * Get license by ID
     */
    getLicense: async (id: string): Promise<License> => {
      const response = await this.request<License>('GET', `/licenses/${id}`);
      return response.data!;
    },

    /**
     * Update license
     */
    updateLicense: async (id: string, data: Partial<License>): Promise<License> => {
      const response = await this.request<License>('PUT', `/licenses/${id}`, {
        body: { request: data },
      });
      return response.data!;
    },

    /**
     * Get receipts
     */
    getReceipts: async (params?: {
      page?: number;
      limit?: number;
      schoolId?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<{ data: any[]; pagination?: Pagination }> => {
      const response = await this.request<any[]>('GET', '/receipts', {
        query: params,
      });
      return {
        data: response.data || [],
        pagination: response.pagination,
      };
    },

    /**
     * Create receipt
     */
    createReceipt: async (data: {
      schoolId: string;
      amount: number;
      paymentDate: string;
      paymentMethod: string;
      transactionId?: string;
      remarks?: string;
    }): Promise<any> => {
      const response = await this.request('POST', '/receipts', {
        body: { request: data },
      });
      return response.data;
    },

    /**
     * Get school statistics
     */
    getSchoolStatistics: async (): Promise<any[]> => {
      const response = await this.request<any[]>('GET', '/statistics/schools');
      return response.data || [];
    },
  };

  // ========================================================================
  // Shared APIs
  // ========================================================================

  shared = {
    /**
     * Upload file
     */
    uploadFile: async (file: File | Blob, filename?: string): Promise<FileUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file, filename);

      const headers: HeadersInit = {
        'x-platform': this.platform,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const url = `${this.baseUrl}/files`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ApiError(
          `File upload failed: ${errorText}`,
          response.status
        );
      }

      const result = await response.json();
      return result.data;
    },

    /**
     * Get file URL
     */
    getFileUrl: (fileId: string): string => {
      return `${this.baseUrl}/files/${fileId}`;
    },

    /**
     * Get notifications
     */
    getNotifications: async (params?: {
      isRead?: boolean;
      type?: string;
      page?: number;
      limit?: number;
    }): Promise<{ data: Notification[]; pagination?: Pagination }> => {
      const response = await this.request<Notification[]>('GET', '/notifications', {
        query: params,
      });
      return {
        data: response.data || [],
        pagination: response.pagination,
      };
    },

    /**
     * Mark notification as read
     */
    markNotificationAsRead: async (id: string): Promise<void> => {
      await this.request('PUT', `/notifications/${id}/read`);
    },

    /**
     * Get announcements
     */
    getAnnouncements: async (params?: {
      startDate?: string;
      endDate?: string;
    }): Promise<any[]> => {
      const response = await this.request<any[]>('GET', '/communication/announcements', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get circulars
     */
    getCirculars: async (params?: {
      type?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<any[]> => {
      const response = await this.request<any[]>('GET', '/circulars', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get events
     */
    getEvents: async (params?: {
      startDate?: string;
      endDate?: string;
      type?: string;
    }): Promise<any[]> => {
      const response = await this.request<any[]>('GET', '/calendar/events', {
        query: params,
      });
      return response.data || [];
    },

    /**
     * Get calendar
     */
    getCalendar: async (): Promise<any> => {
      const response = await this.request('GET', '/calendar');
      return response.data;
    },

    /**
     * Get galleries
     */
    getGalleries: async (params?: {
      eventId?: string;
      privacy?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<any[]> => {
      const response = await this.request<any[]>('GET', '/gallery', {
        query: params,
      });
      return response.data || [];
    },
  };
}

// ============================================================================
// Error Class
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: any = null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Export default instance factory
// ============================================================================

export function createApiClient(baseUrl?: string, platform?: Platform): MobileApiClient {
  return new MobileApiClient(baseUrl, platform);
}

