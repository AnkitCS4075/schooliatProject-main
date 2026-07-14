# SchooliAt Mobile Application - Complete API Documentation

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Base URL:** `https://api.schooliat.com/api/v1`  
**Platform:** Mobile (Android/iOS)

---

## Table of Contents

1. [Overview](#overview)
2. [How the mobile app works](#how-the-mobile-app-works)
3. [Authentication](#authentication)
4. [Common Headers](#common-headers)
5. [Teacher APIs](#teacher-apis)
6. [Student APIs](#student-apis)
7. [Employee (Company) APIs](#employee-company-apis)
8. [Shared APIs](#shared-apis)
9. [Error Handling](#error-handling)
10. [Response Format](#response-format)

---

## Overview

This documentation covers all API endpoints available for the SchooliAt mobile application. The mobile app supports three types of user logins:

1. **Teacher** - School teachers who can manage classes, students, attendance, homework, and marks
2. **Student** - Students who can view their attendance, homework, results, timetable, and fees
3. **Employee** - SchooliAt company employees who manage schools, vendors, licenses, and system administration

### Platform Support
- **Android** - All three user types
- **iOS** - All three user types
- **Web** - Not supported for these roles (only SUPER_ADMIN and SCHOOL_ADMIN use web)

---

## How the mobile app works

The mobile app works by **role**: each user logs in once, and the app only calls APIs that their role is allowed to use. The backend enforces this; calling an API your role cannot use returns **403 Forbidden**.

### Flow

1. **Login**  
   - User enters email/password; app sends `POST /auth/authenticate` with header `x-platform: android` or `x-platform: ios`.  
   - Backend returns `token` and `user` (including `user.role.name`: `TEACHER`, `STUDENT`, or `EMPLOYEE`).

2. **Use the role to drive the UI and API calls**  
   - **TEACHER** → Show Teacher screens only; call only [Teacher APIs](#teacher-apis) (dashboard, students, attendance, homework, marks, timetables, etc.). Do **not** call Employee APIs (e.g. `GET /employees`, `GET /schools`) or Student-only endpoints that require student context.  
   - **STUDENT** → Show Student screens only; call only [Student APIs](#student-apis) (dashboard, own profile, attendance, homework, marks, timetable, fees, etc.). Do **not** call Teacher or Employee management APIs.  
   - **EMPLOYEE** → Show Employee screens only; call only [Employee (Company) APIs](#employee-company-apis) (dashboard, schools, employees, vendors, licenses, etc.). Do **not** call Teacher-only or Student-only APIs.

3. **Store and send the token**  
   - Save the JWT from login. Send it on every authenticated request as `Authorization: Bearer <token>`.  
   - If any request returns **401 Unauthorized**, treat the token as invalid/expired and redirect to login.

4. **Handle 403 and 503**  
   - **403 Forbidden** = the current role is not allowed to use this endpoint. The app should not offer this action for this role (e.g. do not show “Manage employees” to a Teacher). If the app only calls APIs documented for the logged-in role, 403 should not occur in normal use.  
   - **503 Service Unavailable** = backend or a dependent service is temporarily unavailable. Show a retry/offline message; do not assume the API is “forbidden” for the role.

### Quick reference: which APIs by role

| Role     | Use only these sections |
|----------|--------------------------|
| TEACHER  | [Teacher APIs](#teacher-apis), [Shared APIs](#shared-apis) (auth, profile, files, etc.) |
| STUDENT  | [Student APIs](#student-apis), [Shared APIs](#shared-apis) |
| EMPLOYEE | [Employee (Company) APIs](#employee-company-apis), [Shared APIs](#shared-apis) |

If the app follows this (one login → one role → only that role’s APIs), the APIs documented here will work for the mobile app. The Postman collection runs **all** endpoints with a single account (e.g. Teacher); 403 there is expected for endpoints that are not for that role.

---

## Authentication

### Login Endpoint

**POST** `/auth/authenticate`

Authenticate user and receive JWT token. The platform header determines which roles can login.

**Request Headers:**
```
Content-Type: application/json
x-platform: android | ios
```

**Request Body:**
```json
{
  "request": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

**Response:**
```json
{
  "message": "User authenticated!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "SCHOOL",
      "role": {
        "id": "role-id",
        "name": "TEACHER" | "STUDENT" | "EMPLOYEE",
        "permissions": ["GET_STUDENTS", "CREATE_HOMEWORK", ...]
      },
      "schoolId": "school-id",
      "school": {
        "id": "school-id",
        "name": "School Name",
        "code": "SCH001"
      }
    }
  }
}
```

**Role-Based Platform Access:**
- `TEACHER` - Can login via `android` or `ios`
- `STUDENT` - Can login via `android` or `ios`
- `EMPLOYEE` - Can login via `android` or `ios`
- `SUPER_ADMIN` - Web only (not mobile)
- `SCHOOL_ADMIN` - Web only (not mobile)

**Error Responses:**
- `401 Unauthorized` - Invalid credentials or platform mismatch
- `404 Not Found` - User not found (treated as invalid credentials for security)

---

### Forgot Password

**POST** `/auth/forgot-password`

Request password reset OTP.

**Request Body:**
```json
{
  "request": {
    "email": "user@example.com"
  }
}
```

**Response:**
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

---

### Reset Password

**POST** `/auth/reset-password`

Reset password using OTP or reset token.

**Request Body:**
```json
{
  "request": {
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newPassword123"
  }
}
```

**OR using reset token:**
```json
{
  "request": {
    "token": "reset-token-from-email",
    "password": "newPassword123",
    "otp": "123456" // optional
  }
}
```

---

### Change Password

**POST** `/auth/change-password`

Change password for authenticated users.

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "request": {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123"
  }
}
```

---

### Request OTP

**POST** `/auth/request-otp`

Request OTP for various purposes.

**Request Body:**
```json
{
  "request": {
    "email": "user@example.com",
    "purpose": "verification" | "password-reset" | "login" | "deletion"
  }
}
```

**Response:**
```json
{
  "message": "OTP sent successfully. Please check your email.",
  "data": {
    "id": "otp-id",
    "expiresAt": "2026-02-09T12:00:00Z"
  }
}
```

---

### Verify OTP

**POST** `/auth/verify-otp`

Verify OTP code.

**Request Body:**
```json
{
  "request": {
    "email": "user@example.com",
    "otp": "123456",
    "purpose": "verification" | "password-reset" | "login" | "deletion"
  }
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

---

## Common Headers

All authenticated requests must include:

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
x-platform: android | ios
```

---

## Teacher APIs

### Dashboard

**GET** `/statistics/dashboard`

Get teacher dashboard statistics.

**Response:**
```json
{
  "message": "Dashboard data fetched successfully",
  "data": {
    "timetable": [
      {
        "id": "timetable-id",
        "name": "Class 10A Timetable",
        "class": {
          "id": "class-id",
          "name": "Class 10A"
        },
        "slots": [
          {
            "dayOfWeek": 1,
            "periodNumber": 1,
            "subject": {
              "id": "subject-id",
              "name": "Mathematics"
            },
            "startTime": "09:00",
            "endTime": "09:45",
            "room": "Room 101"
          }
        ]
      }
    ],
    "pendingHomeworks": 5,
    "submittedHomeworks": 12,
    "upcomingExams": 3,
    "totalStudents": 45,
    "classes": [
      {
        "id": "class-id",
        "name": "Class 10A",
        "studentCount": 45
      }
    ]
  }
}
```

---

### Students

**GET** `/students`

Get list of students (filtered by teacher's classes).

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50)
- `search` (string, optional): Search by name or email
- `classId` (string, optional): Filter by class

**Response:**
```json
{
  "message": "Students fetched successfully",
  "data": [
    {
      "id": "student-id",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "studentProfile": {
        "id": "profile-id",
        "rollNumber": 1,
        "class": {
          "id": "class-id",
          "name": "Class 10A"
        },
        "fatherName": "Father Name",
        "motherName": "Mother Name",
        "fatherContact": "1234567890",
        "motherContact": "0987654321"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

**GET** `/students/:id`

Get student details by ID.

---

### Attendance

**POST** `/attendance/mark`

Mark daily attendance for a student.

**Request Body:**
```json
{
  "request": {
    "studentId": "student-id",
    "classId": "class-id",
    "date": "2026-02-09",
    "status": "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY",
    "periodId": "period-id", // optional
    "lateArrivalTime": "2026-02-09T09:15:00Z", // optional
    "absenceReason": "Sick" // optional
  }
}
```

**POST** `/attendance/mark-bulk`

Mark attendance for multiple students at once.

**Request Body:**
```json
{
  "request": {
    "classId": "class-id",
    "date": "2026-02-09",
    "attendance": [
      {
        "studentId": "student-id-1",
        "status": "PRESENT"
      },
      {
        "studentId": "student-id-2",
        "status": "ABSENT",
        "absenceReason": "Sick"
      }
    ]
  }
}
```

**GET** `/attendance`

Get attendance records.

**Query Parameters:**
- `studentId` (string, optional)
- `classId` (string, optional)
- `startDate` (string, optional): ISO date
- `endDate` (string, optional): ISO date
- `status` (string, optional): PRESENT, ABSENT, LATE, HALF_DAY

**GET** `/attendance/statistics`

Get attendance statistics.

**Query Parameters:**
- `studentId` (string, optional)
- `classId` (string, optional)
- `startDate` (string, optional)
- `endDate` (string, optional)

**Response:**
```json
{
  "message": "Attendance statistics fetched successfully",
  "data": {
    "totalDays": 30,
    "presentDays": 28,
    "absentDays": 2,
    "lateDays": 0,
    "halfDays": 0,
    "attendancePercentage": 93.33
  }
}
```

---

### Homework

**POST** `/homework`

Create a new homework assignment.

**Request Body:**
```json
{
  "request": {
    "title": "Math Assignment 1",
    "description": "Complete exercises 1-10",
    "classIds": ["class-id-1", "class-id-2"],
    "subjectId": "subject-id",
    "dueDate": "2026-02-15T23:59:59Z",
    "isMCQ": false,
    "attachments": ["file-id-1", "file-id-2"],
    "mcqQuestions": [] // if isMCQ is true
  }
}
```

**GET** `/homework`

Get homework assignments.

**Query Parameters:**
- `studentId` (string, optional)
- `classId` (string, optional)
- `status` (string, optional): PENDING, SUBMITTED, GRADED

**Response:**
```json
{
  "message": "Homework fetched successfully",
  "data": [
    {
      "id": "homework-id",
      "title": "Math Assignment 1",
      "description": "Complete exercises 1-10",
      "subject": {
        "id": "subject-id",
        "name": "Mathematics"
      },
      "classes": [
        {
          "id": "class-id",
          "name": "Class 10A"
        }
      ],
      "dueDate": "2026-02-15T23:59:59Z",
      "createdAt": "2026-02-09T10:00:00Z",
      "submissions": [
        {
          "id": "submission-id",
          "student": {
            "id": "student-id",
            "firstName": "John",
            "lastName": "Doe"
          },
          "status": "SUBMITTED",
          "submittedAt": "2026-02-14T15:00:00Z"
        }
      ]
    }
  ]
}
```

**POST** `/homework/:id/grade`

Grade a homework submission.

**Request Body:**
```json
{
  "request": {
    "submissionId": "submission-id",
    "grade": "A+",
    "feedback": "Excellent work!",
    "marksObtained": 95, // optional
    "maxMarks": 100 // optional
  }
}
```

---

### Marks & Results

**POST** `/marks`

Enter marks for a student in an exam.

**Request Body:**
```json
{
  "request": {
    "examId": "exam-id",
    "studentId": "student-id",
    "subjectId": "subject-id",
    "classId": "class-id",
    "marksObtained": 85,
    "maxMarks": 100
  }
}
```

**POST** `/marks/bulk`

Enter marks for multiple students.

**Request Body:**
```json
{
  "request": {
    "examId": "exam-id",
    "classId": "class-id",
    "subjectId": "subject-id",
    "maxMarks": 100,
    "marks": [
      {
        "studentId": "student-id-1",
        "marksObtained": 85
      },
      {
        "studentId": "student-id-2",
        "marksObtained": 90
      }
    ]
  }
}
```

**GET** `/marks`

Get marks with filters.

**Query Parameters:**
- `examId` (string, optional)
- `studentId` (string, optional)
- `classId` (string, optional)
- `subjectId` (string, optional)

**POST** `/marks/calculate-result`

Calculate and generate results for an exam.

**Request Body:**
```json
{
  "request": {
    "examId": "exam-id",
    "classId": "class-id"
  }
}
```

**POST** `/marks/publish-results`

Publish results for students.

**Request Body:**
```json
{
  "request": {
    "resultIds": ["result-id-1", "result-id-2"]
  }
}
```

---

### Timetable

**GET** `/timetables`

Get timetables for teacher.

**Query Parameters:**
- `classId` (string, optional)
- `teacherId` (string, optional): Defaults to current teacher
- `subjectId` (string, optional)
- `isActive` (boolean, optional)

**Response:**
```json
{
  "message": "Timetables fetched successfully",
  "data": [
    {
      "id": "timetable-id",
      "name": "Class 10A Timetable",
      "class": {
        "id": "class-id",
        "name": "Class 10A"
      },
      "effectiveFrom": "2026-02-01",
      "effectiveTill": "2026-12-31",
      "slots": [
        {
          "dayOfWeek": 1,
          "periodNumber": 1,
          "subject": {
            "id": "subject-id",
            "name": "Mathematics"
          },
          "teacher": {
            "id": "teacher-id",
            "firstName": "Teacher",
            "lastName": "Name"
          },
          "startTime": "09:00",
          "endTime": "09:45",
          "room": "Room 101"
        }
      ]
    }
  ]
}
```

**GET** `/timetables/:id`

Get timetable details by ID.

---

### Notes & Syllabus

**POST** `/notes`

Upload a note/document.

**Request Body:**
```json
{
  "request": {
    "title": "Chapter 1 Notes",
    "subjectId": "subject-id",
    "classId": "class-id",
    "chapter": "Chapter 1",
    "fileId": "file-id",
    "description": "Introduction to Algebra"
  }
}
```

**GET** `/notes`

Get notes with filters.

**Query Parameters:**
- `subjectId` (string, optional)
- `classId` (string, optional)
- `chapter` (string, optional)

**PUT** `/notes/:id`

Update note information.

**DELETE** `/notes/:id`

Delete a note.

---

### Leave Management

**POST** `/leave/request`

Create a leave request.

**Request Body:**
```json
{
  "request": {
    "leaveTypeId": "leave-type-id",
    "startDate": "2026-02-15",
    "endDate": "2026-02-17",
    "reason": "Personal work"
  }
}
```

**GET** `/leave/requests`

Get leave requests.

**Query Parameters:**
- `userId` (string, optional): Defaults to current user
- `status` (string, optional): PENDING, APPROVED, REJECTED
- `startDate` (string, optional)
- `endDate` (string, optional)

**GET** `/leave/balance`

Get leave balance.

**Query Parameters:**
- `userId` (string, optional): Defaults to current user

---

## Student APIs

### Dashboard

**GET** `/statistics/dashboard`

Get student dashboard statistics.

**Response:**
```json
{
  "message": "Dashboard data fetched successfully",
  "data": {
    "attendance": {
      "totalDays": 30,
      "presentDays": 28,
      "attendancePercentage": 93.33
    },
    "pendingHomeworks": 3,
    "upcomingExams": 2,
    "recentResults": [
      {
        "examId": "exam-id",
        "examName": "Mid Term Exam",
        "totalMarks": 500,
        "obtainedMarks": 450,
        "percentage": 90,
        "grade": "A+",
        "rank": 5
      }
    ],
    "timetable": {
      "id": "timetable-id",
      "name": "Class 10A Timetable",
      "slots": [...]
    },
    "feeStatus": {
      "totalAmount": 50000,
      "paidAmount": 30000,
      "pendingAmount": 20000,
      "installments": [...]
    }
  }
}
```

---

### Profile

**GET** `/students/:id`

Get student profile (use own ID).

**Response:**
```json
{
  "message": "Student fetched successfully",
  "data": {
    "id": "student-id",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "studentProfile": {
      "id": "profile-id",
      "rollNumber": 1,
      "apaarId": "APAAR123456",
      "class": {
        "id": "class-id",
        "name": "Class 10A"
      },
      "fatherName": "Father Name",
      "motherName": "Mother Name",
      "fatherContact": "1234567890",
      "motherContact": "0987654321",
      "dateOfBirth": "2010-01-01",
      "gender": "MALE"
    }
  }
}
```

---

### Attendance

**GET** `/attendance`

Get own attendance records.

**Query Parameters:**
- `startDate` (string, optional): ISO date
- `endDate` (string, optional): ISO date
- `status` (string, optional): PRESENT, ABSENT, LATE, HALF_DAY

**Response:**
```json
{
  "message": "Attendance fetched successfully",
  "data": [
    {
      "id": "attendance-id",
      "date": "2026-02-09",
      "status": "PRESENT",
      "class": {
        "id": "class-id",
        "name": "Class 10A"
      },
      "period": {
        "id": "period-id",
        "name": "Period 1"
      },
      "lateArrivalTime": null,
      "absenceReason": null
    }
  ]
}
```

**GET** `/attendance/statistics`

Get own attendance statistics.

**Query Parameters:**
- `startDate` (string, optional)
- `endDate` (string, optional)

---

### Homework

**GET** `/homework`

Get homework assignments for student.

**Query Parameters:**
- `status` (string, optional): PENDING, SUBMITTED, GRADED

**Response:**
```json
{
  "message": "Homework fetched successfully",
  "data": [
    {
      "id": "homework-id",
      "title": "Math Assignment 1",
      "description": "Complete exercises 1-10",
      "subject": {
        "id": "subject-id",
        "name": "Mathematics"
      },
      "dueDate": "2026-02-15T23:59:59Z",
      "createdAt": "2026-02-09T10:00:00Z",
      "submission": {
        "id": "submission-id",
        "status": "PENDING",
        "submittedAt": null,
        "grade": null,
        "feedback": null
      }
    }
  ]
}
```

**POST** `/homework/:id/submit`

Submit homework.

**Request Body:**
```json
{
  "request": {
    "files": ["file-id-1", "file-id-2"],
    "answers": [] // for MCQ homework
  }
}
```

---

### Marks & Results

**GET** `/marks`

Get own marks.

**Query Parameters:**
- `examId` (string, optional)
- `subjectId` (string, optional)

**Response:**
```json
{
  "message": "Marks fetched successfully",
  "data": [
    {
      "id": "mark-id",
      "exam": {
        "id": "exam-id",
        "name": "Mid Term Exam"
      },
      "subject": {
        "id": "subject-id",
        "name": "Mathematics"
      },
      "marksObtained": 85,
      "maxMarks": 100,
      "percentage": 85,
      "grade": "A"
    }
  ]
}
```

**GET** `/marks/results`

Get published results.

**Query Parameters:**
- `examId` (string, optional)

**Response:**
```json
{
  "message": "Results fetched successfully",
  "data": [
    {
      "id": "result-id",
      "exam": {
        "id": "exam-id",
        "name": "Mid Term Exam"
      },
      "totalMarks": 500,
      "obtainedMarks": 450,
      "percentage": 90,
      "grade": "A+",
      "rank": 5,
      "classRank": 5,
      "subjects": [
        {
          "subject": {
            "id": "subject-id",
            "name": "Mathematics"
          },
          "marksObtained": 90,
          "maxMarks": 100,
          "grade": "A+"
        }
      ]
    }
  ]
}
```

---

### Timetable

**GET** `/timetables`

Get class timetable.

**Query Parameters:**
- `classId` (string, optional): Defaults to student's class

**Response:**
```json
{
  "message": "Timetables fetched successfully",
  "data": [
    {
      "id": "timetable-id",
      "name": "Class 10A Timetable",
      "class": {
        "id": "class-id",
        "name": "Class 10A"
      },
      "slots": [
        {
          "dayOfWeek": 1,
          "periodNumber": 1,
          "subject": {
            "id": "subject-id",
            "name": "Mathematics"
          },
          "teacher": {
            "id": "teacher-id",
            "firstName": "Teacher",
            "lastName": "Name"
          },
          "startTime": "09:00",
          "endTime": "09:45",
          "room": "Room 101"
        }
      ]
    }
  ]
}
```

---

### Notes & Syllabus

**GET** `/notes`

Get notes for student's class and subjects.

**Query Parameters:**
- `subjectId` (string, optional)
- `chapter` (string, optional)

**GET** `/syllabus`

Get syllabus for student's class and subjects.

**Query Parameters:**
- `subjectId` (string, optional)
- `academicYear` (string, optional)

---

### Fees

**GET** `/fees`

Get fee records for student.

**Query Parameters:**
- `year` (number, optional)

**Response:**
```json
{
  "message": "Fees fetched successfully",
  "data": [
    {
      "id": "fee-id",
      "installmentNumber": 1,
      "amount": 5000,
      "dueDate": "2026-02-15",
      "status": "PENDING",
      "paidAmount": 0,
      "paymentDate": null
    }
  ]
}
```

**GET** `/fees/status`

Get fee status summary.

**Response:**
```json
{
  "message": "Fee status fetched successfully",
  "data": {
    "totalAmount": 50000,
    "paidAmount": 30000,
    "pendingAmount": 20000,
    "installments": [
      {
        "installmentNumber": 1,
        "amount": 5000,
        "status": "PAID",
        "paymentDate": "2026-01-15"
      },
      {
        "installmentNumber": 2,
        "amount": 5000,
        "status": "PENDING",
        "dueDate": "2026-02-15"
      }
    ]
  }
}
```

---

## Employee (Company) APIs

### Dashboard

**GET** `/statistics/dashboard`

Get employee dashboard statistics.

**Response:**
```json
{
  "message": "Dashboard data fetched successfully",
  "data": {
    "totalSchools": 150,
    "totalEmployees": 500,
    "totalStudents": 50000,
    "totalStaff": 2000,
    "recentSchools": [
      {
        "id": "school-id",
        "name": "School Name",
        "code": "SCH001",
        "createdAt": "2026-02-01T10:00:00Z"
      }
    ],
    "pendingLicenses": 5,
    "activeVendors": 20
  }
}
```

---

### Schools Management

**GET** `/schools`

Get list of schools.

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `search` (string, optional)

**Response:**
```json
{
  "message": "Schools fetched successfully",
  "data": [
    {
      "id": "school-id",
      "name": "School Name",
      "code": "SCH001",
      "email": "school@example.com",
      "phone": "1234567890",
      "address": "School Address",
      "createdAt": "2026-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

**GET** `/schools/:id`

Get school details by ID.

**POST** `/schools`

Create a new school.

**Request Body:**
```json
{
  "request": {
    "name": "School Name",
    "code": "SCH001",
    "email": "school@example.com",
    "phone": "1234567890",
    "address": "School Address"
  }
}
```

**PUT** `/schools/:id`

Update school information.

**DELETE** `/schools/:id`

Delete a school (soft delete).

---

### Employees Management

**GET** `/employees`

Get list of SchooliAt employees.

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `search` (string, optional)

**Response:**
```json
{
  "message": "Employees fetched successfully",
  "data": [
    {
      "id": "employee-id",
      "email": "employee@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": {
        "id": "role-id",
        "name": "EMPLOYEE"
      },
      "createdAt": "2026-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "totalPages": 10
  }
}
```

**GET** `/employees/:id`

Get employee details by ID.

**POST** `/employees`

Create a new employee.

**Request Body:**
```json
{
  "request": {
    "email": "employee@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "role-id"
  }
}
```

**PUT** `/employees/:id`

Update employee information.

**DELETE** `/employees/:id`

Delete an employee (soft delete).

---

### Vendors Management

**GET** `/vendors`

Get list of vendors.

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `search` (string, optional)
- `employeeId` (string, optional)

**POST** `/vendors`

Create a new vendor.

**Request Body:**
```json
{
  "request": {
    "name": "Vendor Name",
    "contactPerson": "Contact Person",
    "email": "vendor@example.com",
    "phone": "1234567890",
    "address": "Vendor Address",
    "employeeId": "employee-id"
  }
}
```

**GET** `/vendors/:id`

Get vendor details by ID.

**PUT** `/vendors/:id`

Update vendor information.

**DELETE** `/vendors/:id`

Delete a vendor.

---

### Licenses Management

**GET** `/licenses`

Get list of school licenses.

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `schoolId` (string, optional)
- `status` (string, optional): ACTIVE, EXPIRED, PENDING

**Response:**
```json
{
  "message": "Licenses fetched successfully",
  "data": [
    {
      "id": "license-id",
      "school": {
        "id": "school-id",
        "name": "School Name"
      },
      "startDate": "2026-01-01",
      "endDate": "2026-12-31",
      "status": "ACTIVE",
      "maxStudents": 1000,
      "maxStaff": 100
    }
  ]
}
```

**POST** `/licenses`

Create a new license.

**Request Body:**
```json
{
  "request": {
    "schoolId": "school-id",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "maxStudents": 1000,
    "maxStaff": 100
  }
}
```

**GET** `/licenses/:id`

Get license details by ID.

**PUT** `/licenses/:id`

Update license information.

---

### Receipts Management

**GET** `/receipts`

Get list of receipts.

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `schoolId` (string, optional)
- `startDate` (string, optional)
- `endDate` (string, optional)

**POST** `/receipts`

Create a new receipt.

**Request Body:**
```json
{
  "request": {
    "schoolId": "school-id",
    "amount": 50000,
    "paymentDate": "2026-02-09",
    "paymentMethod": "BANK_TRANSFER",
    "transactionId": "TXN123456",
    "remarks": "License renewal payment"
  }
}
```

---

### Statistics

**GET** `/statistics/schools`

Get statistics for all schools.

**Response:**
```json
{
  "message": "School statistics fetched successfully",
  "data": [
    {
      "id": "school-id",
      "name": "School Name",
      "code": "SCH001",
      "studentCount": 500,
      "teacherCount": 25,
      "staffCount": 10,
      "adminCount": 1
    }
  ]
}
```

---

## Shared APIs

### File Upload

**POST** `/files`

Upload a file.

**Request:** Multipart form data
- `file` (File): The file to upload

**Response:**
```json
{
  "message": "File uploaded successfully",
  "data": {
    "id": "file-id",
    "filename": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "url": "https://api.schooliat.com/files/file-id"
  }
}
```

**GET** `/files/:id`

Get file by ID (returns file URL or metadata).

---

### Communication

**POST** `/communication/conversations`

Create a new conversation.

**Request Body:**
```json
{
  "request": {
    "participants": ["user-id-1", "user-id-2"],
    "type": "DIRECT" | "GROUP" | "CLASS" | "SCHOOL",
    "title": "Group Chat" // optional for GROUP
  }
}
```

**GET** `/communication/conversations`

Get user conversations.

**POST** `/communication/conversations/:id/messages`

Send a message in a conversation.

**Request Body:**
```json
{
  "request": {
    "content": "Hello, how are you?",
    "attachments": ["file-id-1"]
  }
}
```

**GET** `/communication/conversations/:id/messages`

Get messages in a conversation.

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)

---

### Notifications

**GET** `/notifications`

Get user notifications.

**Query Parameters:**
- `isRead` (boolean, optional)
- `type` (string, optional)
- `page` (number, optional)
- `limit` (number, optional)

**Response:**
```json
{
  "message": "Notifications fetched successfully",
  "data": [
    {
      "id": "notification-id",
      "title": "New Homework Assigned",
      "content": "You have a new homework assignment",
      "type": "HOMEWORK_ASSIGNED",
      "isRead": false,
      "createdAt": "2026-02-09T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "totalPages": 1
  }
}
```

**PUT** `/notifications/:id/read`

Mark a notification as read.

---

### Announcements

**GET** `/communication/announcements`

Get announcements.

**Query Parameters:**
- `startDate` (string, optional)
- `endDate` (string, optional)

**Response:**
```json
{
  "message": "Announcements fetched successfully",
  "data": [
    {
      "id": "announcement-id",
      "title": "School Holiday",
      "content": "School will be closed on...",
      "targetRoles": ["STUDENT", "PARENT"],
      "createdAt": "2026-02-09T10:00:00Z",
      "attachments": []
    }
  ]
}
```

---

### Circulars

**GET** `/circulars`

Get circulars.

**Query Parameters:**
- `type` (string, optional): ANNOUNCEMENT, NOTICE, CIRCULAR
- `status` (string, optional): DRAFT, PUBLISHED, ARCHIVED
- `startDate` (string, optional)
- `endDate` (string, optional)

---

### Calendar & Events

**GET** `/calendar/events`

Get events.

**Query Parameters:**
- `startDate` (string, optional)
- `endDate` (string, optional)
- `type` (string, optional): HOLIDAY, EXAM, FUNCTION, OTHER

**Response:**
```json
{
  "message": "Events fetched successfully",
  "data": [
    {
      "id": "event-id",
      "title": "Annual Day",
      "description": "School annual day function",
      "startDate": "2026-03-15",
      "endDate": "2026-03-15",
      "type": "FUNCTION",
      "isAllDay": true
    }
  ]
}
```

**GET** `/calendar`

Get calendar view with events and holidays.

---

### Gallery

**GET** `/gallery`

Get galleries.

**Query Parameters:**
- `eventId` (string, optional)
- `privacy` (string, optional): PUBLIC, PRIVATE, SCHOOL_ONLY
- `startDate` (string, optional)
- `endDate` (string, optional)

**Response:**
```json
{
  "message": "Galleries fetched successfully",
  "data": [
    {
      "id": "gallery-id",
      "title": "Annual Day 2026",
      "description": "Photos from annual day function",
      "date": "2026-02-09",
      "images": [
        {
          "id": "image-id",
          "fileId": "file-id",
          "url": "https://api.schooliat.com/files/file-id",
          "caption": "Stage performance"
        }
      ]
    }
  ]
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "status": "error"
}
```

### Common Error Codes

- `UNAUTHORIZED` (401) - Authentication required or invalid token. Redirect to login (see [How the mobile app works](#how-the-mobile-app-works)).
- `FORBIDDEN` (403) - Insufficient permissions. The current role cannot call this API; the app should only call APIs for the logged-in role (see [How the mobile app works](#how-the-mobile-app-works)).
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Request validation failed
- `OTP_INVALID` (400) - Invalid OTP
- `OTP_EXPIRED` (400) - OTP expired
- `DELETION_OTP_REQUIRED` (400) - Deletion requires OTP verification
- `USER_NOT_FOUND` (404) - User not found (for login, treated as invalid credentials)
- `PASSWORD_MISMATCH` (400) - Current password is incorrect
- `MAX_OTP_ATTEMPTS` (429) - Maximum OTP verification attempts exceeded

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Backend or a dependent service is temporarily down; show retry/offline message

---

## Response Format

### Success Response

```json
{
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Paginated Response

```json
{
  "message": "Data fetched successfully",
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Error Response

```json
{
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "status": "error"
}
```

---

## Rate Limiting

The API implements rate limiting:

- **Authentication endpoints:** 5 requests per 15 minutes per IP
- **General API:** 100 requests per 15 minutes per IP
- **File uploads:** 10 requests per 15 minutes per IP

Rate limit headers are included in responses:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Time when limit resets

---

## Token Expiration

JWT tokens expire after **48 hours** (configurable). When a token expires, the client should:

1. Call `/auth/authenticate` again to get a new token
2. Handle 401 responses and redirect to login screen

---

## Best Practices

1. **Always include Authorization header** for authenticated requests
2. **Include x-platform header** (android or ios) for all requests
3. **Handle token expiration** gracefully
4. **Implement retry logic** for network errors
5. **Cache responses** where appropriate (timetable, syllabus, etc.)
6. **Use pagination** for large data sets
7. **Validate data** before sending requests
8. **Handle errors** with user-friendly messages

---

---

## Implementation Reference (Backend)

This section is the **single source of truth** for backend route implementation. All paths below are supported under the base path `/api/v1` (and `/auth` for auth). The backend implements these exact paths so the mobile app can call them without path rewrites.

### Auth (no prefix; mounted at `/auth`)
| Method | Path | Implemented |
|--------|------|-------------|
| POST | `/auth/authenticate` | ✓ |
| POST | `/auth/forgot-password` | ✓ |
| POST | `/auth/reset-password` | ✓ |
| POST | `/auth/change-password` | ✓ |
| POST | `/auth/request-otp` | ✓ |
| POST | `/auth/verify-otp` | ✓ |
| GET  | `/auth/roles` | ✓ |
| GET  | `/auth/me` | ✓ |
| PATCH | `/auth/me` | ✓ |

### Students (mobile path)
| Method | Path | Notes |
|--------|------|--------|
| GET | `/students` | List students (teacher/school admin). Also available at `/users/students`. |
| GET | `/students/:id` | Student by ID. Also at `/users/students/:id`. |

### Employees (mobile path)
| Method | Path | Notes |
|--------|------|--------|
| GET | `/employees` | List employees. Also at `/users/employees`. |
| GET | `/employees/:id` | Employee by ID. Also at `/users/employees/:id`. |
| POST | `/employees` | Create employee. Also at `/users/employees`. |
| PUT / PATCH | `/employees/:id` | Update employee. Backend uses PATCH at `/users/employees/:id`. |
| DELETE | `/employees/:id` | Soft delete. Also at `/users/employees/:id`. |

### Homework
| Method | Path | Notes |
|--------|------|--------|
| POST | `/homework` | Create homework. |
| GET | `/homework` | List homework (query: studentId, classId, status, etc.). |
| POST | `/homework/:id/submit` | Submit homework (id = homeworkId). Body: `{ request: { files?, mcqAnswers? } }`. |
| POST | `/homework/:id/grade` | Grade submission. Body: `{ request: { submissionId, grade?, feedback?, marksObtained?, totalMarks? } }`. Also at `/homework/grade` with submissionId in body. |

### Marks
| Method | Path | Notes |
|--------|------|--------|
| POST | `/marks` | Enter marks. |
| POST | `/marks/bulk` | Bulk enter marks. |
| GET | `/marks` | Get marks (role-based). |
| POST | `/marks/calculate-result` | Calculate result. |
| POST | `/marks/publish-results` | Publish results. Same as `/marks/publish` (body: examId, classId?). |
| GET | `/marks/my-summary` | Student academic summary. |
| GET | `/marks/results` | Published results. |

### Timetables
| Method | Path | Notes |
|--------|------|--------|
| GET | `/timetables` | List/filter (query: classId, teacherId, subjectId, timetableId, date). |
| GET | `/timetables/my-classes` | Teacher’s classes. |
| GET | `/timetables/:id` | Timetable by ID. |

### Notes
| Method | Path | Notes |
|--------|------|--------|
| POST | `/notes` | Create note. Also at `/notes/notes`. |
| GET | `/notes` | List notes (query: subjectId, classId, chapter). Also at `/notes/notes`. |
| PUT | `/notes/:id` | Update note. Also at `/notes/notes/:id`. |
| DELETE | `/notes/:id` | Delete note. Also at `/notes/notes/:id`. |

### Syllabus
| Method | Path | Notes |
|--------|------|--------|
| GET | `/syllabus` | List syllabus (query: subjectId, classId, academicYear). Also at `/notes/syllabus`. |

### Leave
| Method | Path | Notes |
|--------|------|--------|
| POST | `/leave/request` | Create leave request. |
| GET | `/leave/requests` | List leave requests (same data as `/leave/history`). |
| GET | `/leave/balance` | Leave balance. |
| GET | `/leave/history` | Leave history (paginated). |

### Fees
| Method | Path | Notes |
|--------|------|--------|
| GET | `/fees` | Fees overview / list. |
| GET | `/fees/status` | Fee status summary (totalAmount, paidAmount, pendingAmount, installments). For current student or studentId. |
| GET | `/fees/student/:studentId` | Installments for a student. |
| GET | `/fees/installments/:installmentNumber` | Installments by number. |

### Communication & Notifications
| Method | Path | Notes |
|--------|------|--------|
| POST | `/communication/conversations` | Create conversation. |
| GET | `/communication/conversations` | List conversations. |
| POST | `/communication/conversations/:id/messages` | Send message (id = conversationId). Body: `{ request: { content, attachments? } }`. Also at `/communication/messages` with conversationId in body. |
| GET | `/communication/conversations/:id/messages` | Get messages. |
| GET | `/communication/announcements` | List announcements (query: startDate, endDate). |
| GET | `/notifications` | List notifications. Same as `/communication/notifications`. |
| PUT | `/notifications/:id/read` | Mark read. Same as `/communication/notifications/:id/read`. |

### Calendar & Files
| Method | Path | Notes |
|--------|------|--------|
| GET | `/calendar` | Calendar view (aggregate). Same as `/calendar/events` or use `/calendar/:date` for day view. |
| GET | `/calendar/events` | List events. |
| GET | `/calendar/:date` | Calendar items for a date (YYYY-MM-DD). |
| POST | `/files` | Upload file (multipart). |
| GET | `/files/:id` | Get file by ID (stream or redirect). |

### Other (schools, attendance, statistics, etc.)
All other endpoints (schools, attendance, statistics, vendors, licenses, receipts, circulars, gallery, etc.) are implemented as documented in the sections above; paths match the table of contents.

---

**End of Mobile API Documentation**




