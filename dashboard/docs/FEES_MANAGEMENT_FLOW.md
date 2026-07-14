# School Admin – Fees Management (Root-Level Flow)

This document describes the **fees management** flow on the School Admin panel: recording payments (online/offline), generating receipts, and exporting reports. It reflects the current architecture and root-level fixes.

## Overview

- **Page**: Admin → Finance → Fees (`/admin/finance/fees`)
- **Use cases**: View installments, record payments (online/offline), generate receipts, export CSV, and **review the school-wide transaction ledger** (payments, waivers, cancellation reversals) on the **Transaction ledger** tab.
- **Backend**: `/api/v1/fees/*` (and legacy `/fees/*`).

## Flow

### 1. View fee installments

- **UI**: `FeesManagement` shows a table of installments (by installment number range and optional academic year).
- **API**: `GET /api/v1/fees/installments/:installmentNumber?end=&academicYear=`  
  Returns installments for the school with student info and `receiptFileUrl` when a receipt exists.
- **Filters**: **Academic year** uses the same control as the rest of the portal (`AcademicYearProvider` / navbar storage), not a separate hardcoded year — so installment and ledger queries match the year you use elsewhere. Also: status, installment range, student search. `academicYear` is sent URL-encoded on API calls.

### 2. Record payment (online / offline)

- **UI**: “Record Payment” opens `PaymentModal` with:
  - **Payment method**: CASH (Offline), CHEQUE (Offline), UPI (Online), BANK_TRANSFER (Online).
  - **Amount**, **Transaction/Ref ID** (for online/bank), **Remarks**, **Waiver** toggle.
- **API**: `PATCH /api/v1/fees/installments/:id/payment`  
  Body: `{ request: { amount, paymentMethod, isWaiver, transactionId, remarks } }`.
- **Backend**:
  - Validates amount (integer; must be ≤ remaining amount; waived installments can omit amount).
  - Generates fee receipt HTML, uploads it, stores `receiptFileId` on the installment.
  - Updates installment (`paidAmount`, `remainingAmount`, `paymentStatus`, **paymentMethod**) and fee totals.
  - Returns updated installment with `receiptFileUrl`.
- **Amount**: All amounts are **integers** (DB and API). Dashboard rounds the entered value before sending.

### 2b. Cancel installment

- **UI**: Cancel action opens `CancelFeeInstallmentModal` with optional **reason** only (no OTP).
- **API**: `PATCH /api/v1/fees/installments/:id/cancel`  
  Body: `{ request: { reason?: string } }`.
- **Backend**: `Permission.RECORD_FEE_PAYMENT`; runs `feeService.cancelFeeInstallment`.

### 3. Receipt generation and download

- **When**: A receipt is generated **automatically** on each successful “Record Payment” and linked to the installment (`receiptFileId` → file storage).
- **URL**: Installment responses include `receiptFileUrl` (e.g. `/files/:fileId` or full URL depending on config). Next.js rewrites `/files/*` to the backend in dev.
- **Where to download**:
  - **Main table**: Each row has a receipt icon that opens `receiptFileUrl` in a new tab (when present).
  - **Fee details modal**: Per-installment “Receipt” button opens that installment’s receipt when `receiptFileUrl` is present.

### 4. Export reports

- **Installments CSV** (Fee desk tab): **Installments CSV** button.
- **API**: `GET /api/v1/fees/export?academicYear=`  
  Returns CSV (student, installment, amount, paid at, status, **payment method**).
- **Ledger CSV** (Transaction ledger tab): **Ledger CSV** with the same filters as the ledger table (academic year, optional student, entry type).
- **API**: `GET /api/v1/fees/ledger/export?academicYear=&studentId=&entryType=&dateFrom=&dateTo=`
- **Implementation**: Dashboard uses `downloadFromApi()` for both exports so auth and `/api/v1` prefix match dev rewrites.

### 5. Transaction ledger (school-wide)

- **UI**: **Transaction ledger** tab on Fees Management — paginated table of all `FeeLedgerEntry` rows for the school (date, type, student, amount, receipt no., installment #, method, recorded by, receipt link).
- **Filters**: Academic year (April–March window), entry type (All / Payment / Waiver / Cancellation reversal), and the **same student lookup** as the fee desk (`lookupStudentId`). **Clear student filter** resets without leaving the tab.
- **API**: `GET /api/v1/fees/ledger?academicYear=&studentId=&entryType=&page=&limit=`
- **Per-student ledger** (profile / modal): `GET /api/v1/fees/student/:studentId/ledger?limit=`
- **Fee Details modal**: **Installments** and **Payment history** tabs; history uses the per-student ledger endpoint.

## Root-level fixes applied

1. **Export URLs**  
   Exports use `downloadFromApi()` so paths include `/api/v1` and auth matches dev rewrites.

2. **Payment amount as integer**  
   - Dashboard rounds the payment amount with `Math.round(Number(data.amount) || 0)` before sending.  
   - Backend schema uses `z.coerce.number().int()` for `amount` so decimals are coerced to integers and validation stays consistent with the DB.

3. **Payment method persistence**  
   - `paymentMethod` was added to the **FeeInstallements** model (optional) and persisted in `fee.service.js` when recording a payment.  
   - Export and any future “view payment” can show the actual method (CASH, UPI, etc.).  
   - Migration: `20260310000000_add_fee_installment_payment_method` adds `payment_method` to `fee_installments`.

4. **Receipt in Fee Details Modal**  
   - Fee details modal shows each installment with a “Receipt” button when `receiptFileUrl` is present, and displays status (Paid / Partially Paid / Waived / Pending) correctly.

5. **No OTP on fees**  
   - Fee payment and installment cancel do not use email OTP. Authorization is via session + `RECORD_FEE_PAYMENT` (and related fee permissions).

6. **Validate middleware**  
   - PATCH/POST bodies always assign `req.body.request` after Zod validation, including when every field is optional and the validated `request` object is empty—so handlers never read `undefined` where an empty object was validated.

## Configuration

- **Fees config** (Settings → Fees): Default student fee amount and number of installments. Used when creating new fee structures.
- **Payment info card** (same page): Shows school bank details and UPI for manual/online payments; links to Settings if not configured.

## API summary

| Action           | Method | Endpoint                                      |
|-----------------|--------|-----------------------------------------------|
| List installments | GET  | `/api/v1/fees/installments/:n?end=&academicYear=` |
| Student fees    | GET    | `/api/v1/fees/student/:studentId`            |
| Record payment  | PATCH  | `/api/v1/fees/installments/:id/payment`      |
| Cancel installment | PATCH | `/api/v1/fees/installments/:id/cancel`   |
| Export installments CSV | GET | `/api/v1/fees/export?academicYear=` |
| School ledger (paginated) | GET | `/api/v1/fees/ledger?academicYear=&studentId=&entryType=&page=&limit=` |
| Export ledger CSV | GET | `/api/v1/fees/ledger/export?...` |
| Student ledger  | GET    | `/api/v1/fees/student/:studentId/ledger?limit=` |
| Receipt file    | GET    | `/files/:fileId` (via backend)               |

All dashboard requests use the same API client (auth token, `x-platform: web`, and base URL with `/api/v1` where applicable).
