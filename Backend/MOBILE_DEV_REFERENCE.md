# Mobile Developer API Reference

This document provides the native backend endpoint mapping for the SchoolIt mobile application.

## Base URL and paths

- **Production API**: `https://api.schooliat.com`
- **Auth** (no version prefix): `POST /auth/authenticate`, `GET /auth/roles`, `GET /auth/me`, etc.
- **API v1**: All other endpoints under `https://api.schooliat.com/api/v1/` (e.g. `/api/v1/statistics/dashboard`, `/api/v1/timetables/my-classes`).
- **Legacy (backward compatibility)**: The same handlers are also mounted without the `/api/v1` prefix (e.g. `https://api.schooliat.com/statistics/dashboard`). Prefer `/api/v1` for new integration.
- **Headers**: `Content-Type: application/json`, `x-platform: android` or `x-platform: ios`, and for protected routes `Authorization: Bearer <token>`.

## Testing the mobile API against production

From the **repository root** (parent of `Backend/`):

```bash
BASE_URL=https://api.schooliat.com node scripts/test-mobile-api-all-endpoints.js
```

With credentials (for full flow):

```bash
BASE_URL=https://api.schooliat.com MOBILE_API_EMAIL=your@email.com MOBILE_API_PASSWORD=xxx node scripts/test-mobile-api-all-endpoints.js
```

Or from `Backend/`: `npm run test:mobile:production`

---

## 1. Authentication

### Login
- **Endpoint**: `POST /auth/authenticate`
- **Body**: `{ "request": { "email": "<email>", "password": "<password>" } }`
- **Headers**: `Content-Type: application/json`, `x-platform: android` or `x-platform: ios`
- **Response**: `{ "message": "...", "token": "<jwt>", "user": { "id", "email", "firstName", "lastName", "role", "school", ... } }`

### Get Roles
- **Endpoint**: `GET /auth/roles`
- **Description**: Returns all roles available for mobile login.
- **Response**:
  ```json
  {
    "data": [
      { "id": "uuid", "name": "TEACHER" },
      { "id": "uuid", "name": "STUDENT" }
    ]
  }
  ```

### Get Current Profile
- **Endpoint**: `GET /auth/me`
- **Requires**: `Authorization: Bearer <TOKEN>`
- **Description**: Returns full profile data including nested `studentProfile` or `teacherProfile`.

---

## 2. Teacher Features

### My Classes (Schedule)
- **Endpoint**: `GET /api/v1/timetables/my-classes` (or legacy: `GET /timetables/my-classes`)
- **Requires**: `Authorization: Bearer <TOKEN>`
- **Description**: Returns grouped slots by day for the teacher.

---

## 3. Student Features

### Academic Summary
- **Endpoint**: `GET /api/v1/marks/my-summary` (or legacy: `GET /marks/my-summary`)
- **Requires**: `Authorization: Bearer <TOKEN>`
- **Description**: Returns marks and results.

---

## 4. Platform Content

### Static Content
- **Endpoint**: `GET /api/v1/settings/content/:slug` (or legacy: `GET /settings/content/:slug`)
- **Slugs**: `terms`, `privacy`, `support`
- **Description**: Returns the value from platform platformConfig.
