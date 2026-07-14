# SchooliAt ERP - Backend Architecture Documentation

**Version:** 1.0.0  
**Last Updated:** February 9, 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Pattern](#architecture-pattern)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Data Flow](#data-flow)
7. [Security Architecture](#security-architecture)
8. [Performance Optimizations](#performance-optimizations)
9. [Error Handling](#error-handling)
10. [Logging & Monitoring](#logging--monitoring)

---

## System Overview

The SchooliAt ERP backend is a RESTful API built with Node.js and Express.js, designed to serve both web and mobile applications. It follows a modular, service-oriented architecture with clear separation of concerns.

### Key Characteristics:
- **Multi-tenant:** Supports multiple schools under a single Super Admin
- **Role-based:** Six distinct user roles with granular permissions
- **Scalable:** Designed to handle 500-2000 concurrent users
- **Secure:** Comprehensive security measures including audit logging
- **RESTful:** Standard REST API with JSON request/response format

---

## Architecture Pattern

### Layered Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer           │
│    (Web App / Mobile App)            │
└──────────────┬───────────────────────┘
               │
               │ HTTP/REST
               │
┌──────────────▼───────────────────────┐
│         API Layer (Express.js)        │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ Routers │  │   Middlewares     │  │
│  └────┬────┘  └────────┬──────────┘  │
│       │                │              │
│  ┌────▼────────────────▼──────┐      │
│  │      Service Layer          │      │
│  │  (Business Logic)           │      │
│  └────┬───────────────────────┘      │
│       │                               │
┌───────▼───────────────────────────────┐
│      Data Access Layer (Prisma)       │
│  ┌─────────────────────────────────┐ │
│  │    PostgreSQL Database          │ │
│  └─────────────────────────────────┘ │
└───────────────────────────────────────┘
```

### Request Flow

1. **Client Request** → Express Router
2. **Middleware Chain:**
   - Security headers (Helmet)
   - Compression
   - Request timeout
   - Request ID tracking
   - Body parsing
   - CORS
   - Rate limiting
   - Authentication (JWT)
   - IP whitelist (for admins)
   - Audit logging
   - Permission check
3. **Router** → Service Layer
4. **Service** → Data Access (Prisma)
5. **Response** ← Service ← Router ← Client

---

## Technology Stack

### Core Technologies

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | >=20.19.0 |
| Framework | Express.js | ^5.1.0 |
| Database | PostgreSQL | 14.x+ |
| ORM | Prisma | ^7.1.0 |
| Validation | Zod | ^3.22.4 |
| Authentication | JWT (jsonwebtoken) | ^9.0.3 |
| Password Hashing | bcryptjs | ^3.0.3 |
| Logging | Pino | ^9.6.0 |
| Email | Nodemailer | ^8.0.1 |
| PDF Generation | Puppeteer | ^24.32.0 |
| File Storage | Local filesystem / MinIO (S3-compatible) / AWS S3 | - |
| Caching | In-memory (Redis-ready) | - |

### Security Libraries

- **Helmet:** Security headers
- **express-rate-limit:** Rate limiting
- **CORS:** Cross-origin resource sharing
- **compression:** Response compression

---

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── logger.js          # Pino logger configuration
│   │   ├── docs.js            # API documentation setup
│   │   └── ...
│   ├── middlewares/
│   │   ├── authorize.middleware.js      # JWT authentication
│   │   ├── with-permission.middleware.js # Permission check
│   │   ├── security.middleware.js        # Helmet security headers
│   │   ├── rate-limit.middleware.js      # Rate limiting
│   │   ├── cors.middleware.js            # CORS configuration
│   │   ├── compression.middleware.js     # Response compression
│   │   ├── request-timeout.middleware.js # Request timeout
│   │   ├── request-id.middleware.js      # Request ID tracking
│   │   ├── audit.middleware.js           # Audit logging
│   │   ├── ip-whitelist.middleware.js    # IP whitelisting
│   │   ├── require-deletion-otp.middleware.js # Deletion OTP
│   │   ├── validate-request.middleware.js # Request validation
│   │   └── error-handler.middleware.js   # Error handling
│   ├── routers/
│   │   ├── auth.router.js
│   │   ├── user.router.js
│   │   ├── attendance.router.js
│   │   ├── timetable.router.js
│   │   ├── homework.router.js
│   │   ├── marks.router.js
│   │   ├── leave.router.js
│   │   ├── communication.router.js
│   │   ├── library.router.js
│   │   ├── notes.router.js
│   │   ├── gallery.router.js
│   │   ├── circular.router.js
│   │   ├── parent.router.js
│   │   ├── reports.router.js
│   │   ├── ai.router.js
│   │   ├── transport.router.js
│   │   ├── tc.router.js
│   │   ├── emergency-contact.router.js
│   │   ├── audit.router.js
│   │   └── ... (40+ routers)
│   ├── services/
│   │   ├── user.service.js
│   │   ├── attendance.service.js
│   │   ├── timetable.service.js
│   │   ├── homework.service.js
│   │   ├── marks.service.js
│   │   ├── leave.service.js
│   │   ├── communication.service.js
│   │   ├── notification.service.js
│   │   ├── library.service.js
│   │   ├── notes.service.js
│   │   ├── gallery.service.js
│   │   ├── circular.service.js
│   │   ├── parent.service.js
│   │   ├── reports.service.js
│   │   ├── ai.service.js
│   │   ├── transport-enhanced.service.js
│   │   ├── tc.service.js
│   │   ├── emergency-contact.service.js
│   │   ├── audit.service.js
│   │   ├── otp.service.js
│   │   ├── otp-deletion.service.js
│   │   ├── email.service.js
│   │   ├── password.util.js
│   │   ├── token-blacklist.service.js
│   │   ├── dashboard.service.js
│   │   ├── role.service.js
│   │   ├── cache.service.js
│   │   └── ... (30+ services)
│   ├── schemas/
│   │   ├── auth/
│   │   ├── attendance/
│   │   ├── timetable/
│   │   ├── homework/
│   │   ├── marks/
│   │   ├── leave/
│   │   ├── communication/
│   │   ├── library/
│   │   ├── notes/
│   │   ├── gallery/
│   │   ├── circular/
│   │   ├── transport/
│   │   └── ... (Zod validation schemas)
│   ├── utils/
│   │   ├── paginate.util.js
│   │   ├── date.util.js
│   │   └── password.util.js
│   ├── prisma/
│   │   ├── db/
│   │   │   └── schema.prisma      # Database schema
│   │   ├── generated/             # Prisma Client
│   │   └── client.js              # Prisma client instance
│   ├── errors.js                  # Error definitions
│   ├── config.js                  # Configuration
│   └── server.js                  # Express app entry point
├── scripts/                        # Utility scripts
├── test-phase1-apis.js            # API testing script
├── package.json
└── README.md
```

---

## Core Components

### 1. Routers

Routers handle HTTP requests and delegate business logic to services. Each router:
- Defines API endpoints
- Validates requests using Zod schemas
- Checks permissions using `withPermission` middleware
- Calls appropriate service methods
- Returns formatted responses

**Example:**
```javascript
router.post(
  "/",
  withPermission(Permission.CREATE_STUDENT),
  validateRequest(createStudentSchema),
  async (req, res) => {
    const student = await studentService.createStudent(req.body.request);
    return res.status(201).json({
      message: "Student created successfully",
      data: student,
    });
  }
);
```

### 2. Services

Services contain business logic and interact with the database through Prisma. They:
- Implement core business rules
- Handle data transformations
- Manage transactions
- Call other services when needed
- Return domain objects

**Example:**
```javascript
const createStudent = async (data) => {
  // Validate business rules
  // Transform data
  // Create in database
  // Send notifications
  // Return result
};
```

### 3. Middlewares

#### Authentication Middleware (`authorize.middleware.js`)
- Validates JWT token
- Checks token blacklist
- Verifies user exists and is active
- Loads user context and permissions
- Sets `req.context` for downstream middlewares

#### Permission Middleware (`with-permission.middleware.js`)
- Checks if user has required permission
- Returns 403 Forbidden if not authorized

#### Audit Middleware (`audit.middleware.js`)
- Logs all CREATE, UPDATE, DELETE operations
- Captures user, IP, timestamp, entity info
- Non-blocking (doesn't fail main operation)

#### IP Whitelist Middleware (`ip-whitelist.middleware.js`)
- Restricts admin access to whitelisted IPs
- Supports CIDR notation
- Only applies to Super Admin and School Admin

#### Deletion OTP Middleware (`require-deletion-otp.middleware.js`)
- Requires OTP verification for deletions
- Only applies to admin roles
- Returns error if OTP not provided

### 4. Database Layer (Prisma)

Prisma provides:
- Type-safe database access
- Migration management
- Query optimization
- Connection pooling
- Transaction support

**Schema Location:** `src/prisma/db/schema.prisma`

**Models:** 50+ models covering all system entities

---

## Data Flow

### Create Operation Example

```
1. Client → POST /api/v1/students
2. Router receives request
3. Middleware chain:
   - Security headers
   - Rate limiting
   - Authentication (JWT)
   - Permission check (CREATE_STUDENT)
   - Request validation (Zod)
   - Audit logging setup
4. Router → studentService.createStudent()
5. Service:
   - Validates business rules
   - Creates user record
   - Creates student profile
   - Links to class
   - Sends welcome email
   - Creates notifications
6. Service → Prisma → PostgreSQL
7. Response ← Service ← Router ← Client
8. Audit log created (async)
```

### Read Operation Example

```
1. Client → GET /api/v1/students?page=1&limit=50
2. Middleware chain (same as above)
3. Router → studentService.getStudents()
4. Service:
   - Builds query filters
   - Applies pagination
   - Fetches from database
   - Applies business logic
5. Response with pagination metadata
```

---

## Security Architecture

### Authentication Flow

1. **Login:**
   - User provides email/password
   - Password verified with bcrypt
   - JWT token generated
   - Token includes user ID, role, permissions
   - Token returned to client

2. **Request Authentication:**
   - Client sends token in `Authorization: Bearer <token>` header
   - Token verified and decoded
   - User loaded from database
   - Token checked against blacklist
   - User context set in `req.context`

3. **Authorization:**
   - Permission checked against user's role permissions
   - Access granted or denied (403)

### Security Features

1. **Password Security:**
   - Bcrypt hashing (10 rounds)
   - Password strength validation
   - Password history (prevents reuse)

2. **JWT Security:**
   - Strong secret key (required in production)
   - Token expiration (48 hours default)
   - Token blacklisting support
   - User validation on each request

3. **Rate Limiting:**
   - Auth endpoints: 5 req/15min
   - General API: 100 req/15min
   - File uploads: 10 req/15min
   - Per IP address

4. **Security Headers (Helmet):**
   - Content Security Policy (CSP)
   - XSS Protection
   - HSTS (HTTP Strict Transport Security)
   - Frame Options (prevent clickjacking)
   - No Sniff (prevent MIME sniffing)

5. **IP Whitelisting:**
   - Admin access restricted to whitelisted IPs
   - Supports CIDR notation
   - Configurable via environment variables

6. **Deletion Protection:**
   - Email OTP required for deletions
   - Only for Super Admin and School Admin
   - OTP expires in 10 minutes

7. **Audit Logging:**
   - All CUD operations logged
   - Immutable logs
   - Includes user, IP, timestamp, changes
   - Viewable by authorized users

8. **Input Validation:**
   - Zod schemas for all inputs
   - Type checking
   - Custom validation rules
   - Sanitization

9. **CORS:**
   - Configurable allowed origins
   - Prevents unauthorized cross-origin requests

10. **Request Size Limits:**
    - JSON body: 10MB
    - File uploads: Configurable
    - Prevents DoS attacks

---

## Performance Optimizations

### 1. Database Optimizations

- **Indexes:** Comprehensive indexes on frequently queried fields
  - Composite indexes for common query patterns
  - Indexes on foreign keys
  - Indexes on deletedAt for soft deletes

- **Query Optimization:**
  - Use `groupBy` instead of N+1 queries
  - Select only required fields
  - Pagination for large datasets
  - Connection pooling

- **Soft Deletes:**
  - All models use `deletedAt` instead of hard deletes
  - Allows data recovery
  - Maintains referential integrity

### 2. Caching

- **In-Memory Cache:**
  - Role lookups (1 hour TTL)
  - Dashboard statistics (5 minutes TTL)
  - Can be upgraded to Redis

- **Cache Service:**
  - TTL-based expiration
  - Automatic cleanup
  - Get-or-set pattern

### 3. Response Compression

- Gzip compression for all responses
- Reduces bandwidth usage
- Faster response times

### 4. Request Timeout

- 30-second default timeout
- Prevents hanging requests
- Graceful timeout handling

### 5. Connection Pooling

- Prisma connection pooling
- Supabase pooled connections
- Optimal concurrent connection handling

---

## Error Handling

### Error Structure

All errors follow a consistent format:

```javascript
{
  errorCode: "SA001",
  statusCode: 401,
  message: "Unauthorized"
}
```

### Error Types

1. **ApiError:** Custom application errors
2. **ValidationError:** Zod validation failures
3. **DatabaseError:** Prisma/database errors
4. **SystemError:** Unexpected errors

### Error Handler Middleware

Located at: `src/middlewares/error-handler.middleware.js`

- Catches all errors
- Logs errors with context
- Returns user-friendly messages
- Maintains security (doesn't leak sensitive info)

### Error Codes

- `SA001` - Unauthorized
- `SA002` - Forbidden
- `SA003` - User not found
- `SA004` - Invalid OTP
- `SA005` - OTP not found
- `SA006` - Max OTP attempts
- `SA007` - Invalid reset token
- `SA008` - Weak password
- `SA009` - Password mismatch

---

## Logging & Monitoring

### Logging

**Library:** Pino (structured JSON logging)

**Log Levels:**
- `error` - Errors requiring attention
- `warn` - Warnings
- `info` - Informational messages
- `debug` - Debug information (development only)

**Log Structure:**
```json
{
  "level": 30,
  "time": 1707484800000,
  "msg": "User created",
  "userId": "user-id",
  "email": "user@example.com"
}
```

### What Gets Logged

1. **Request Logging:**
   - Request method, path, IP
   - Request ID for tracing
   - Response status, duration

2. **Error Logging:**
   - Error stack traces
   - Request context
   - User information

3. **Audit Logging:**
   - All CUD operations
   - User actions
   - Security events

4. **Performance Logging:**
   - Slow queries
   - Cache hits/misses
   - Response times

### Monitoring

**Health Check Endpoint:**
- `GET /health` - Basic health check
- `GET /api/v1/health` - Versioned health check

**Metrics to Monitor:**
- Response times
- Error rates
- Request rates
- Database connection pool
- Memory usage
- CPU usage

---

## Database Schema

### Key Models

1. **User Management:**
   - `User` - Core user entity
   - `Role` - User roles
   - `Permission` - Permission enum
   - `StudentProfile` - Student-specific data
   - `TeacherProfile` - Teacher-specific data

2. **Academic:**
   - `Class` - Classes/grades
   - `Subject` - Subjects
   - `Attendance` - Attendance records
   - `AttendancePeriod` - Period definitions
   - `Timetable` - Timetables
   - `TimetableSlot` - Time slots
   - `Homework` - Homework assignments
   - `HomeworkSubmission` - Student submissions
   - `MCQQuestion` - MCQ questions
   - `MCQAnswer` - MCQ answers
   - `Exam` - Exams
   - `Marks` - Exam marks
   - `Result` - Published results

3. **Administrative:**
   - `School` - Schools
   - `Fee` - Fee records
   - `FeeInstallements` - Fee installments
   - `LeaveRequest` - Leave requests
   - `LeaveBalance` - Leave balances
   - `LeaveType` - Leave types
   - `TransferCertificate` - TCs
   - `EmergencyContact` - Emergency contacts

4. **Communication:**
   - `Conversation` - Chat conversations
   - `Message` - Chat messages
   - `Notification` - System notifications
   - `Circular` - Circulars/announcements

5. **Resources:**
   - `LibraryBook` - Library books
   - `LibraryIssue` - Book issues
   - `LibraryReservation` - Book reservations
   - `Note` - Subject notes
   - `Syllabus` - Syllabus documents
   - `Gallery` - Photo galleries
   - `GalleryImage` - Gallery images

6. **Transport:**
   - `Transport` - Vehicles
   - `Route` - Transport routes
   - `RouteStop` - Route stops

7. **System:**
   - `AuditLog` - Audit logs
   - `Settings` - School settings
   - `File` - File records
   - `Template` - Document templates

### Relationships

- **One-to-Many:** User → Attendance, User → Homework, etc.
- **Many-to-Many:** User ↔ Conversation (through Message)
- **One-to-One:** User → StudentProfile, User → TeacherProfile

### Indexes

Comprehensive indexing strategy:
- Foreign keys indexed
- Composite indexes for common queries
- Indexes on `deletedAt` for soft delete queries
- Unique constraints where needed

---

## API Versioning

Current version: **v1**

Base path: `/api/v1`

All endpoints are versioned to allow future updates without breaking existing clients.

---

## Best Practices

### Code Organization

1. **Separation of Concerns:**
   - Routers handle HTTP
   - Services handle business logic
   - Prisma handles data access

2. **Single Responsibility:**
   - Each service has one clear purpose
   - Each router handles one resource

3. **DRY (Don't Repeat Yourself):**
   - Reusable utilities
   - Shared services
   - Common middlewares

### Error Handling

1. **Always use try-catch** in async functions
2. **Return appropriate HTTP status codes**
3. **Provide meaningful error messages**
4. **Log errors with context**
5. **Don't expose sensitive information**

### Security

1. **Never trust client input** - Always validate
2. **Use parameterized queries** - Prisma handles this
3. **Hash passwords** - Never store plaintext
4. **Use HTTPS** - In production
5. **Rotate secrets** - Regularly
6. **Limit permissions** - Principle of least privilege

### Performance

1. **Use pagination** - For large datasets
2. **Cache frequently accessed data** - Roles, dashboards
3. **Optimize queries** - Use indexes, avoid N+1
4. **Compress responses** - Reduce bandwidth
5. **Set timeouts** - Prevent hanging requests

---

## Deployment Architecture

### Production Setup

```
┌─────────────┐
│   Nginx     │  (Reverse Proxy / Load Balancer)
└──────┬──────┘
       │
┌──────▼──────┐
│   Node.js   │  (Express App - PM2)
│   Backend   │
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │  (Database)
└─────────────┘
```

### Process Management

**PM2** is used for:
- Process management
- Auto-restart on crashes
- Log management
- Cluster mode (optional)

### Environment Separation

- **Staging:** Separate database, separate deployment
- **Production:** Isolated environment, backup strategy

---

**End of Architecture Documentation**

