# Root Cause: 403, 404, and 400 in Mobile API Postman Tests

## Summary

| Code | Root cause |
|------|------------|
| **403** | TEACHER and STUDENT roles in the backend have **too few permissions**. Routes require permissions (e.g. `GET_TIMETABLE`, `GET_HOMEWORK`, `MARK_ATTENDANCE`) that are **not** in the default role definitions. |
| **404** | (1) **Empty or invalid path params** when a setup request failed with 403 and did not set `{{variable}}`, so URLs become e.g. `/homework//submit`. (2) Valid UUID but **resource does not exist** in DB. |
| **400** | **Invalid or dummy request body**: e.g. reset-password / verify-otp with fake OTP `123456`, or validation errors (missing/invalid fields). |

---

## 403 Forbidden – Root Cause

The backend protects routes with **permission checks** via `withPermission(Permission.XXX)` middleware. The user’s **role** has a list of **permissions** stored in the DB (and seeded from `Backend/src/services/role.service.js` → `defaultRolePermissionsMap`).

### What TEACHER currently has (role.service.js)

```js
[RoleName.TEACHER]: [
  Permission.GET_STUDENTS,
  Permission.GET_CLASSES,
  Permission.GET_MY_SCHOOL,
  Permission.GET_EVENTS,
  Permission.GET_HOLIDAYS,
  Permission.GET_EXAM_CALENDARS,
  Permission.GET_NOTICES,
  Permission.GET_EXAMS,
  Permission.GET_CALENDAR,
  Permission.GET_DASHBOARD_STATS,
  Permission.GET_MESSAGES,
  Permission.SEND_MESSAGE,
  Permission.SEND_NOTIFICATION,
],
```

So TEACHER has **no**:

- `GET_TIMETABLE`, `CREATE_TIMETABLE`, `EDIT_TIMETABLE`, `DELETE_TIMETABLE`
- `GET_HOMEWORK`, `CREATE_HOMEWORK`, `SUBMIT_HOMEWORK`, `GRADE_HOMEWORK`, `EDIT_HOMEWORK`, `DELETE_HOMEWORK`
- `MARK_ATTENDANCE`, `GET_ATTENDANCE`, `EXPORT_ATTENDANCE`
- `ENTER_MARKS`, `GET_MARKS`, `EDIT_MARKS`, `PUBLISH_RESULTS`, `GET_RESULTS`
- `GET_FEES`, `RECORD_FEE_PAYMENT`
- `GET_GRIEVANCES`, `CREATE_GRIEVANCE`, `GET_MY_GRIEVANCES`, `ADD_GRIEVANCE_COMMENT`, `UPDATE_GRIEVANCE`
- `GET_NOTES`, `CREATE_NOTE`, `EDIT_NOTE`, `DELETE_NOTE`, `GET_SYLLABUS`, etc.
- `GET_STATISTICS` (only `GET_DASHBOARD_STATS` is present)
- Parent: `GET_CHILDREN`, `GET_CHILD_DATA`, `GET_CONSOLIDATED_DASHBOARD`
- Leave: `CREATE_LEAVE_REQUEST`, `GET_LEAVE_REQUESTS`, etc.

Routers use `withPermission(Permission.XXX)`. If the role does not have that permission, the middleware throws **403 Forbidden**.

**Conclusion:** 403 happens because **TEACHER (and STUDENT) default permissions in the codebase do not include the permissions required by the mobile app routes.** Fix: add the required permissions to `defaultRolePermissionsMap` for TEACHER and STUDENT in `role.service.js`, then run role sync so existing DB roles are updated.

---

## 404 Not Found – Root Cause

1. **Empty path parameter**  
   Postman uses `{{homework_id}}`, `{{timetable_id}}`, etc. Those are set by **setup requests** (e.g. GET homework?limit=1). If that setup request returns **403** (no permission), the test script never runs and the variable stays **empty**. The next request might be `POST /homework//submit` (empty `:id`). The backend then looks up an empty or invalid ID and returns **404** (or 400 for invalid UUID).

2. **Valid UUID but resource does not exist**  
   If the variable is set to a real UUID from a previous run but that resource was deleted or is from another environment, the backend correctly returns **404**.

**Conclusion:** Many 404s are a **cascade of 403**: no permission → setup doesn’t set IDs → later requests use empty or wrong IDs → 404. Fixing 403 (permissions) reduces 404s. The rest are “resource not found” and can be improved by ensuring setup requests run and succeed so IDs are always set.

---

## 400 Bad Request – Root Cause

1. **reset-password**  
   Request body uses a fake OTP (e.g. `123456`) or invalid token. Backend validates and returns **400** (e.g. `INVALID_OTP`, `INVALID_RESET_TOKEN`).

2. **verify-otp**  
   Same: OTP not valid for that email/purpose → **400** or **404** (OTP not found).

3. **Other validation**  
   Missing required fields, wrong types, or business rules (e.g. weak password) → **400**.

**Conclusion:** 400 in these tests is **expected** when using dummy OTPs/tokens or incomplete bodies. It is not a bug; it indicates validation is working. For real flows, use real OTPs/tokens.

---

## Fix applied

**`Backend/src/services/role.service.js`** was updated:

- **TEACHER** – Added permissions for timetable, homework, attendance, marks, notes, syllabus, fees, grievances, leave, and statistics so mobile app flows (and Postman) can call these APIs.
- **STUDENT** – Added `GET_ATTENDANCE`, `GET_HOMEWORK`, `SUBMIT_HOMEWORK`, `GET_MARKS`, `GET_RESULTS`, `GET_FEES`, `GET_MY_GRIEVANCES`, `CREATE_GRIEVANCE`, `ADD_GRIEVANCE_COMMENT`, `GET_LEAVE_REQUESTS`, `CREATE_LEAVE_REQUEST`.

**Applying the fix:**  
On startup, the backend runs `roleService.updateRolePermissions()`, which updates existing roles in the DB from `defaultRolePermissionsMap`. So after deploying this change and restarting the backend, TEACHER and STUDENT roles in the DB will get the new permissions. No separate migration or script is required.

After that, re-run the Postman collections; you should see fewer 403s and, as a result, fewer 404s from missing IDs.
