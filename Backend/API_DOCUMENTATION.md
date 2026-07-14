# SchooliAt ERP - Complete API Documentation

**Version:** 1.0.0  
**Last Updated:** February 9, 2026  
**Base URL:** `/api/v1`

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [User Management](#user-management)
3. [School Management](#school-management)
4. [Student Management](#student-management)
5. [Teacher Management](#teacher-management)
6. [Attendance Management](#attendance-management)
7. [Timetable Management](#timetable-management)
8. [Homework & Assignments](#homework--assignments)
9. [Exams, Marks & Results](#exams-marks--results)
10. [Fees & Payment Management](#fees--payment-management)
11. [Leave Management](#leave-management)
12. [Communication & Notifications](#communication--notifications)
13. [Library Management](#library-management)
14. [Notes & Syllabus](#notes--syllabus)
15. [Gallery & Events](#gallery--events)
16. [Circular Management](#circular-management)
17. [Parent Portal](#parent-portal)
18. [Reports & Analytics](#reports--analytics)
19. [AI Integration](#ai-integration)
20. [Transport Management](#transport-management)
21. [Transfer Certificate (TC)](#transfer-certificate-tc)
22. [Emergency Contacts](#emergency-contacts)
23. [Audit Logs](#audit-logs)
24. [Calendar & Events](#calendar--events)
25. [ID Cards](#id-cards)
26. [Settings](#settings)
27. [Statistics & Dashboards](#statistics--dashboards)
28. [Super Admin Features](#super-admin-features)
29. [Error Handling](#error-handling)
30. [Rate Limiting](#rate-limiting)

---

## Authentication & Authorization

### Base URL: `/auth`

#### Request OTP
**POST** `/auth/request-otp`

Request an OTP for email verification or password reset.

**Request Body:**
```json
{
  "request": {
    "email": "user@example.com",
    "purpose": "verification" // or "password-reset", "login", "deletion"
  }
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "data": {
    "id": "otp-id",
    "expiresAt": "2026-02-09T12:00:00Z"
  }
}
```

#### Verify OTP
**POST** `/auth/verify-otp`

Verify an OTP code.

**Request Body:**
```json
{
  "request": {
    "email": "user@example.com",
    "otp": "123456",
    "purpose": "verification"
  }
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "data": {
    "valid": true
  }
}
```

#### Login
**POST** `/auth/authenticate`

Authenticate user and get JWT token.

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
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": {
        "name": "SCHOOL_ADMIN",
        "permissions": [...]
      }
    }
  }
}
```

#### Forgot Password
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

#### Reset Password
**POST** `/auth/reset-password`

Reset password using OTP.

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

#### Change Password
**POST** `/auth/change-password`

Change password (requires authentication).

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

## User Management

### Base URL: `/users`

#### Get Users
**GET** `/users`

Get list of users with pagination and filters.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50)
- `search` (string, optional): Search by name or email
- `roleId` (string, optional): Filter by role
- `schoolId` (string, optional): Filter by school

**Response:**
```json
{
  "message": "Users fetched successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

#### Get User by ID
**GET** `/users/:id`

Get user details by ID.

#### Create User
**POST** `/users`

Create a new user.

**Request Body:**
```json
{
  "request": {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "role-id",
    "schoolId": "school-id",
    "userType": "SCHOOL"
  }
}
```

#### Update User
**PUT** `/users/:id`

Update user information.

#### Delete User
**DELETE** `/users/:id`

Soft delete a user (requires deletion OTP for admins).

---

## Student Management

### Base URL: `/students`

All student endpoints require `CREATE_STUDENT`, `GET_STUDENTS`, `EDIT_STUDENT`, or `DELETE_STUDENT` permissions.

#### Get Students
**GET** `/students`

Get list of students with filters.

**Query Parameters:**
- `page`, `limit`, `search`
- `classId` (string, optional): Filter by class
- `schoolId` (string, optional): Filter by school

#### Get Student by ID
**GET** `/students/:id`

Get student details including profile.

#### Create Student
**POST** `/students`

Create a new student with profile.

**Request Body:**
```json
{
  "request": {
    "email": "student@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "MALE",
    "dateOfBirth": "2010-01-01",
    "classId": "class-id",
    "rollNumber": 1,
    "apaarId": "APAAR123456",
    "fatherName": "Father Name",
    "motherName": "Mother Name",
    "fatherContact": "1234567890",
    "motherContact": "0987654321"
  }
}
```

#### Update Student
**PUT** `/students/:id`

Update student information.

#### Delete Student
**DELETE** `/students/:id`

Soft delete a student (requires deletion OTP for admins).

---

## Attendance Management

### Base URL: `/attendance`

#### Mark Attendance
**POST** `/attendance/mark`

Mark daily attendance for a student.

**Request Body:**
```json
{
  "request": {
    "studentId": "student-id",
    "classId": "class-id",
    "date": "2026-02-09",
    "status": "PRESENT", // PRESENT, ABSENT, LATE, HALF_DAY
    "periodId": "period-id", // optional
    "lateArrivalTime": "2026-02-09T09:15:00Z", // optional
    "absenceReason": "Sick" // optional
  }
}
```

#### Mark Bulk Attendance
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

#### Get Attendance
**GET** `/attendance`

Get attendance records with filters.

**Query Parameters:**
- `studentId` (string, optional)
- `classId` (string, optional)
- `startDate` (string, optional): ISO date
- `endDate` (string, optional): ISO date
- `status` (string, optional): PRESENT, ABSENT, LATE, HALF_DAY

#### Get Attendance Statistics
**GET** `/attendance/statistics`

Get attendance statistics for a student or class.

**Query Parameters:**
- `studentId` (string, optional)
- `classId` (string, optional)
- `startDate` (string, optional)
- `endDate` (string, optional)

#### Get Attendance Report
**GET** `/attendance/report`

Generate attendance report.

**Query Parameters:**
- `studentId` (string, optional)
- `classId` (string, optional)
- `startDate` (string, required)
- `endDate` (string, required)
- `format` (string, optional): "pdf" or "excel"

---

## Timetable Management

### Base URL: `/timetables`

#### Create Timetable
**POST** `/timetables`

Create a new timetable for a class.

**Request Body:**
```json
{
  "request": {
    "name": "Class 10A Timetable",
    "classId": "class-id",
    "effectiveFrom": "2026-02-01",
    "effectiveTill": "2026-12-31",
    "slots": [
      {
        "dayOfWeek": 1, // 0=Sunday, 1=Monday, etc.
        "periodNumber": 1,
        "subjectId": "subject-id",
        "teacherId": "teacher-id",
        "startTime": "09:00",
        "endTime": "09:45",
        "room": "Room 101"
      }
    ]
  }
}
```

#### Get Timetable
**GET** `/timetables`

Get timetables with filters.

**Query Parameters:**
- `classId` (string, optional)
- `teacherId` (string, optional)
- `subjectId` (string, optional)
- `isActive` (boolean, optional)

#### Get Timetable by ID
**GET** `/timetables/:id`

Get timetable details with all slots.

#### Update Timetable
**PUT** `/timetables/:id`

Update timetable information.

#### Check Conflicts
**POST** `/timetables/check-conflicts`

Check for scheduling conflicts.

**Request Body:**
```json
{
  "request": {
    "teacherId": "teacher-id",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "09:45"
  }
}
```

---

## Homework & Assignments

### Base URL: `/homework`

#### Create Homework
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

#### Get Homework
**GET** `/homework`

Get homework assignments with filters.

**Query Parameters:**
- `studentId` (string, optional)
- `teacherId` (string, optional)
- `classId` (string, optional)
- `status` (string, optional): PENDING, SUBMITTED, GRADED

#### Submit Homework
**POST** `/homework/:id/submit`

Submit homework as a student.

**Request Body:**
```json
{
  "request": {
    "files": ["file-id-1"],
    "answers": [] // for MCQ
  }
}
```

#### Grade Homework
**POST** `/homework/:id/grade`

Grade a homework submission.

**Request Body:**
```json
{
  "request": {
    "submissionId": "submission-id",
    "grade": "A+",
    "feedback": "Excellent work!"
  }
}
```

---

## Exams, Marks & Results

### Base URL: `/marks`

#### Enter Marks
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

#### Enter Bulk Marks
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

#### Calculate Result
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

#### Publish Results
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

#### Get Marks
**GET** `/marks`

Get marks with filters.

**Query Parameters:**
- `examId` (string, optional)
- `studentId` (string, optional)
- `classId` (string, optional)
- `subjectId` (string, optional)

#### Get Results
**GET** `/marks/results`

Get published results.

**Query Parameters:**
- `studentId` (string, optional)
- `examId` (string, optional)
- `classId` (string, optional)

---

## Fees & Payment Management

### Base URL: `/fees`

#### Get Fees
**GET** `/fees`

Get fee records with filters.

**Query Parameters:**
- `studentId` (string, optional)
- `schoolId` (string, optional)
- `year` (number, optional)

#### Record Fee Payment
**POST** `/fees/payment`

Record a fee payment.

**Request Body:**
```json
{
  "request": {
    "feeInstallmentId": "installment-id",
    "amount": 5000,
    "paymentMethod": "CASH", // CASH, BANK_TRANSFER, CHEQUE
    "paymentDate": "2026-02-09",
    "transactionId": "TXN123456",
    "remarks": "Payment received"
  }
}
```

#### Get Fee Status
**GET** `/fees/status`

Get fee status for a student.

**Query Parameters:**
- `studentId` (string, required)

---

## Leave Management

### Base URL: `/leave`

#### Create Leave Request
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

#### Get Leave Requests
**GET** `/leave/requests`

Get leave requests with filters.

**Query Parameters:**
- `userId` (string, optional)
- `status` (string, optional): PENDING, APPROVED, REJECTED
- `startDate` (string, optional)
- `endDate` (string, optional)

#### Approve Leave
**POST** `/leave/:id/approve`

Approve a leave request.

#### Reject Leave
**POST** `/leave/:id/reject`

Reject a leave request.

**Request Body:**
```json
{
  "request": {
    "rejectionReason": "Insufficient leave balance"
  }
}
```

#### Get Leave Balance
**GET** `/leave/balance`

Get leave balance for a user.

**Query Parameters:**
- `userId` (string, optional): Defaults to current user

---

## Communication & Notifications

### Base URL: `/communication`

#### Create Conversation
**POST** `/communication/conversations`

Create a new conversation.

**Request Body:**
```json
{
  "request": {
    "participants": ["user-id-1", "user-id-2"],
    "type": "DIRECT", // DIRECT, GROUP, CLASS, SCHOOL
    "title": "Group Chat" // optional for GROUP
  }
}
```

#### Send Message
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

#### Get Messages
**GET** `/communication/conversations/:id/messages`

Get messages in a conversation.

**Query Parameters:**
- `page`, `limit`

#### Create Announcement
**POST** `/communication/announcements`

Create a school-wide announcement.

**Request Body:**
```json
{
  "request": {
    "title": "School Holiday",
    "content": "School will be closed on...",
    "targetRoles": ["STUDENT", "PARENT"],
    "attachments": []
  }
}
```

### Base URL: `/notifications`

#### Get Notifications
**GET** `/notifications`

Get user notifications.

**Query Parameters:**
- `isRead` (boolean, optional)
- `type` (string, optional)
- `page`, `limit`

#### Mark Notification as Read
**PUT** `/notifications/:id/read`

Mark a notification as read.

---

## Library Management

### Base URL: `/library`

#### Create Book
**POST** `/library/books`

Add a new book to the library.

**Request Body:**
```json
{
  "request": {
    "title": "Mathematics Textbook",
    "author": "John Doe",
    "isbn": "978-1234567890",
    "publisher": "ABC Publishers",
    "category": "Textbook",
    "totalCopies": 10,
    "availableCopies": 10
  }
}
```

#### Get Books
**GET** `/library/books`

Get library books with filters.

**Query Parameters:**
- `search` (string, optional): Search by title, author, ISBN
- `category` (string, optional)
- `status` (string, optional): AVAILABLE, ISSUED, RESERVED

#### Issue Book
**POST** `/library/books/:id/issue`

Issue a book to a user.

**Request Body:**
```json
{
  "request": {
    "userId": "user-id",
    "dueDate": "2026-03-09"
  }
}
```

#### Return Book
**POST** `/library/books/:id/return`

Return an issued book.

**Request Body:**
```json
{
  "request": {
    "issueId": "issue-id"
  }
}
```

#### Reserve Book
**POST** `/library/books/:id/reserve`

Reserve a book.

**Request Body:**
```json
{
  "request": {
    "userId": "user-id"
  }
}
```

#### Get Library History
**GET** `/library/history`

Get library issue/return history.

**Query Parameters:**
- `userId` (string, optional)
- `bookId` (string, optional)
- `status` (string, optional): ISSUED, RETURNED, OVERDUE

---

## Notes & Syllabus

### Base URL: `/notes`

#### Create Note
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

#### Get Notes
**GET** `/notes`

Get notes with filters.

**Query Parameters:**
- `subjectId` (string, optional)
- `classId` (string, optional)
- `chapter` (string, optional)

#### Update Note
**PUT** `/notes/:id`

Update note information.

#### Delete Note
**DELETE** `/notes/:id`

Delete a note.

### Base URL: `/syllabus`

#### Create Syllabus
**POST** `/syllabus`

Create syllabus entry.

**Request Body:**
```json
{
  "request": {
    "subjectId": "subject-id",
    "classId": "class-id",
    "academicYear": "2026-2027",
    "chapters": [
      {
        "chapterNumber": 1,
        "title": "Introduction",
        "topics": ["Topic 1", "Topic 2"]
      }
    ],
    "fileId": "file-id"
  }
}
```

#### Get Syllabus
**GET** `/syllabus`

Get syllabus with filters.

**Query Parameters:**
- `subjectId` (string, optional)
- `classId` (string, optional)
- `academicYear` (string, optional)

---

## Gallery & Events

### Base URL: `/gallery`

#### Create Gallery
**POST** `/gallery`

Create a new gallery/album.

**Request Body:**
```json
{
  "request": {
    "title": "Annual Day 2026",
    "description": "Photos from annual day function",
    "eventId": "event-id", // optional
    "privacy": "PUBLIC", // PUBLIC, PRIVATE, SCHOOL_ONLY
    "date": "2026-02-09"
  }
}
```

#### Upload Image
**POST** `/gallery/:id/images`

Upload an image to a gallery.

**Request Body:**
```json
{
  "request": {
    "fileId": "file-id",
    "caption": "Stage performance"
  }
}
```

#### Get Galleries
**GET** `/gallery`

Get galleries with filters.

**Query Parameters:**
- `eventId` (string, optional)
- `privacy` (string, optional)
- `startDate` (string, optional)
- `endDate` (string, optional)

---

## Circular Management

### Base URL: `/circulars`

#### Create Circular
**POST** `/circulars`

Create a new circular.

**Request Body:**
```json
{
  "request": {
    "title": "Holiday Notice",
    "content": "School will be closed...",
    "type": "ANNOUNCEMENT", // ANNOUNCEMENT, NOTICE, CIRCULAR
    "targetRoles": ["STUDENT", "PARENT"],
    "attachments": ["file-id-1"],
    "publishDate": "2026-02-09"
  }
}
```

#### Get Circulars
**GET** `/circulars`

Get circulars with filters.

**Query Parameters:**
- `type` (string, optional)
- `status` (string, optional): DRAFT, PUBLISHED, ARCHIVED
- `startDate` (string, optional)
- `endDate` (string, optional)

---

## Parent Portal

### Base URL: `/parent`

#### Get Children
**GET** `/parent/children`

Get all children linked to the parent.

**Response:**
```json
{
  "message": "Children fetched successfully",
  "data": [
    {
      "id": "child-id",
      "firstName": "John",
      "lastName": "Doe",
      "relationship": "FATHER",
      "isPrimary": true,
      "class": {...}
    }
  ]
}
```

#### Get Child Data
**GET** `/parent/children/:childId`

Get comprehensive data for a specific child.

**Response includes:**
- Student profile
- Recent attendance
- Homework submissions
- Results
- Fee status

#### Link Child
**POST** `/parent/children/link`

Link a child to the parent account.

**Request Body:**
```json
{
  "request": {
    "childId": "child-id",
    "relationship": "FATHER", // FATHER, MOTHER, GUARDIAN
    "isPrimary": true
  }
}
```

---

## Reports & Analytics

### Base URL: `/reports`

#### Get Attendance Report
**GET** `/reports/attendance`

Generate attendance report.

**Query Parameters:**
- `studentId` (string, optional)
- `classId` (string, optional)
- `startDate` (string, required)
- `endDate` (string, required)
- `format` (string, optional): "pdf", "excel", "csv"

#### Get Fee Collection Report
**GET** `/reports/fee-collection`

Generate fee collection report.

**Query Parameters:**
- `schoolId` (string, optional)
- `startDate` (string, required)
- `endDate` (string, required)
- `format` (string, optional)

#### Get Academic Performance Report
**GET** `/reports/academic-performance`

Generate academic performance report.

**Query Parameters:**
- `studentId` (string, optional)
- `classId` (string, optional)
- `examId` (string, optional)
- `format` (string, optional)

---

## AI Integration

### Base URL: `/ai`

#### Send Chat Message
**POST** `/ai/chat`

Send a message to the AI chatbot.

**Request Body:**
```json
{
  "request": {
    "message": "What is my attendance percentage?",
    "conversationId": "conversation-id" // optional, for continuing conversation
  }
}
```

**Response:**
```json
{
  "message": "Chat response generated",
  "data": {
    "response": "Your attendance percentage is 95%",
    "conversationId": "conversation-id",
    "intent": "ATTENDANCE_QUERY"
  }
}
```

#### Get Conversation History
**GET** `/ai/conversations`

Get chat conversation history.

**Query Parameters:**
- `conversationId` (string, optional)

---

## Transport Management

### Base URL: `/transports`

#### Create Transport
**POST** `/transports`

Create a new transport/vehicle record.

**Request Body:**
```json
{
  "request": {
    "type": "BUS",
    "licenseNumber": "DL01AB1234",
    "vehicleNumber": "HR26AB1234",
    "ownerFirstName": "Owner",
    "ownerLastName": "Name",
    "driverFirstName": "Driver",
    "driverLastName": "Name",
    "driverDateOfBirth": "1980-01-01",
    "driverContact": "1234567890",
    "driverGender": "MALE"
  }
}
```

#### Create Route
**POST** `/transports/routes`

Create a transport route.

**Request Body:**
```json
{
  "request": {
    "name": "Route 1",
    "transportId": "transport-id",
    "startLocation": "School",
    "endLocation": "City Center",
    "stops": [
      {
        "name": "Stop 1",
        "sequence": 1,
        "arrivalTime": "07:00",
        "latitude": 28.6139,
        "longitude": 77.2090
      }
    ]
  }
}
```

#### Add Stop to Route
**POST** `/transports/routes/:routeId/stops`

Add a stop to an existing route.

---

## Transfer Certificate (TC)

### Base URL: `/transfer-certificates`

#### Create TC
**POST** `/transfer-certificates`

Create a Transfer Certificate for a student.

**Request Body:**
```json
{
  "request": {
    "studentId": "student-id",
    "reason": "Transfer to another school",
    "transferDate": "2026-02-09",
    "destinationSchool": "New School Name",
    "remarks": "Good academic record"
  }
}
```

**Response:**
```json
{
  "message": "Transfer Certificate created successfully",
  "data": {
    "id": "tc-id",
    "tcNumber": "TC-2026-00001",
    "status": "ISSUED",
    ...
  }
}
```

#### Get TCs
**GET** `/transfer-certificates`

Get Transfer Certificates with filters.

**Query Parameters:**
- `studentId` (string, optional)
- `status` (string, optional): ISSUED, COLLECTED, CANCELLED
- `tcNumber` (string, optional)

#### Update TC Status
**PATCH** `/transfer-certificates/:id/status`

Update TC status.

**Request Body:**
```json
{
  "request": {
    "status": "COLLECTED" // ISSUED, COLLECTED, CANCELLED
  }
}
```

---

## Emergency Contacts

### Base URL: `/emergency-contacts`

#### Create Emergency Contact
**POST** `/emergency-contacts`

Create an emergency contact for a student.

**Request Body:**
```json
{
  "request": {
    "studentId": "student-id",
    "name": "Emergency Contact Name",
    "relationship": "GUARDIAN", // FATHER, MOTHER, GUARDIAN, RELATIVE, OTHER
    "contact": "1234567890",
    "alternateContact": "0987654321",
    "address": "123 Main St, City",
    "isPrimary": true
  }
}
```

#### Get Emergency Contacts
**GET** `/emergency-contacts/student/:studentId`

Get all emergency contacts for a student.

#### Update Emergency Contact
**PATCH** `/emergency-contacts/:id`

Update emergency contact information.

#### Delete Emergency Contact
**DELETE** `/emergency-contacts/:id`

Delete an emergency contact.

---

## Audit Logs

### Base URL: `/audit`

#### Get Audit Logs
**GET** `/audit`

Get audit logs with filters (requires `VIEW_AUDIT_LOGS` permission).

**Query Parameters:**
- `userId` (string, optional)
- `action` (string, optional): CREATE, UPDATE, DELETE
- `entityType` (string, optional)
- `entityId` (string, optional)
- `result` (string, optional): SUCCESS, FAILURE
- `startDate` (string, optional)
- `endDate` (string, optional)
- `page`, `limit`

**Response:**
```json
{
  "message": "Audit logs fetched successfully",
  "data": [
    {
      "id": "log-id",
      "userId": "user-id",
      "action": "DELETE",
      "entityType": "User",
      "entityId": "deleted-user-id",
      "ipAddress": "192.168.1.1",
      "timestamp": "2026-02-09T10:00:00Z",
      "result": "SUCCESS",
      "user": {
        "email": "admin@example.com",
        "firstName": "Admin"
      }
    }
  ],
  "pagination": {...}
}
```

#### Get Audit Log by ID
**GET** `/audit/:id`

Get a specific audit log entry.

---

## Calendar & Events

### Base URL: `/calendar`

#### Create Event
**POST** `/calendar/events`

Create a new event.

**Request Body:**
```json
{
  "request": {
    "title": "Annual Day",
    "description": "School annual day function",
    "startDate": "2026-03-15",
    "endDate": "2026-03-15",
    "type": "FUNCTION", // HOLIDAY, EXAM, FUNCTION, OTHER
    "isAllDay": true
  }
}
```

#### Get Events
**GET** `/calendar/events`

Get events with filters.

**Query Parameters:**
- `startDate` (string, optional)
- `endDate` (string, optional)
- `type` (string, optional)

#### Create Holiday
**POST** `/calendar/holidays`

Create a holiday entry.

#### Get Calendar
**GET** `/calendar`

Get calendar view with events and holidays.

---

## ID Cards

### Base URL: `/id-cards`

#### Generate ID Cards
**POST** `/id-cards/generate`

Generate ID cards for students or staff.

**Request Body:**
```json
{
  "request": {
    "userIds": ["user-id-1", "user-id-2"],
    "templateId": "template-id",
    "type": "STUDENT" // STUDENT, STAFF
  }
}
```

#### Get ID Cards
**GET** `/id-cards`

Get generated ID cards.

**Query Parameters:**
- `userId` (string, optional)
- `type` (string, optional)

---

## Settings

### Base URL: `/settings`

#### Get Settings
**GET** `/settings`

Get school settings.

#### Update Settings
**PUT** `/settings`

Update school settings.

**Request Body:**
```json
{
  "request": {
    "studentFeeAmount": 50000,
    "studentFeeInstallments": 12,
    "currentInstallmentNumber": 1,
    "academicYear": "2026-2027"
  }
}
```

---

## Statistics & Dashboards

### Base URL: `/statistics`

#### Get Dashboard
**GET** `/statistics/dashboard`

Get role-specific dashboard data.

**Response varies by role:**
- **Super Admin:** Total schools, employees, students, staff
- **School Admin:** School stats, user counts, fee installments, notices
- **Teacher:** Timetable, pending homeworks, submitted homeworks, exams
- **Staff:** Notices, events, circulars
- **Student:** Attendance, homework, exams, results, timetable, fees
- **Parent:** Consolidated view across all children

#### Get School Statistics
**GET** `/statistics/schools`

Get statistics for all schools (Super Admin only).

---

## Super Admin Features

### Base URL: `/schools`, `/employees`, `/vendors`, `/licenses`, `/receipts`, `/regions`

All Super Admin endpoints require appropriate permissions.

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

- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `OTP_INVALID` - Invalid OTP
- `OTP_EXPIRED` - OTP expired
- `DELETION_OTP_REQUIRED` - Deletion requires OTP verification

---

## Rate Limiting

The API implements rate limiting:

- **Authentication endpoints:** 5 requests per 15 minutes per IP
- **General API:** 100 requests per 15 minutes per IP
- **File uploads:** 10 requests per 15 minutes per IP
- **ID card generation:** 5 requests per 15 minutes per IP

Rate limit headers are included in responses:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Time when limit resets

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

Tokens expire after 48 hours (configurable).

---

## Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

## File Uploads

File uploads are handled through the `/files` endpoint:

**POST** `/files`

**Request:** Multipart form data with `file` field

**Response:**
```json
{
  "message": "File uploaded successfully",
  "data": {
    "id": "file-id",
    "filename": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "url": "/files/file-id"
  }
}
```

---

## Webhooks & Notifications

The system sends notifications for:
- Attendance marked (absences)
- Homework assigned
- Homework due soon
- Exam results published
- Leave request status changes
- Fee payment reminders
- Circulars published

---

**End of API Documentation**

