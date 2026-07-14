# Database Seeding Guide

This document explains how to use the comprehensive seed file to populate the SchooliAt backend database with test data.

## Overview

The seed file (`prisma/seed.js`) creates a complete dataset including:

- **Roles & Permissions**: All 6 roles (Super Admin, Employee, School Admin, Teacher, Student, Staff) with their respective permissions
- **Regions & Locations**: 5 regions with 2-3 locations each
- **Schools**: 3 sample schools with complete details
- **Classes & Subjects**: Classes for grades 1-12 with common subjects
- **Users**: 
  - 1 Super Admin
  - 3 Employees
  - 3 School Admins (one per school)
  - 5-8 Teachers per school
  - 20-30 Students per school
  - 2-3 Staff members per school
- **Transport**: 2-4 transport vehicles per school
- **Fees**: Complete fee structure with 12 monthly installments per student
- **Exams**: Multiple exam types with exam calendars
- **Calendar Items**: Events, holidays, and notices
- **Receipts**: Sample receipts for each school
- **Licenses**: Various license types
- **Vendors**: Sample vendors with different lead statuses
- **Settings**: School-specific settings
- **Grievances**: Sample grievances with comments
- **Salaries**: Salary structures and payment records
- **Phase 1 - Academic & Administrative Modules**:
  - **Attendance**: Attendance periods and 30 days of attendance records per student
  - **Timetables**: Complete timetables with slots for each class
  - **Homeworks**: Homework assignments with MCQ questions and student submissions
  - **Marks & Results**: Exam marks for all subjects and calculated results
  - **Leave Management**: Leave types, leave requests, and leave balances
  - **Communication**: Conversations, messages, and notifications
- **Phase 2 - Supporting Modules**:
  - **Library**: (Placeholder - models not yet in schema)
  - **Notes & Syllabus**: (Placeholder - models not yet in schema)
  - **Gallery**: (Placeholder - models not yet in schema)
  - **Circulars**: (Placeholder - models not yet in schema)
- **Phase 3 - Additional Features**:
  - **Parent-Child Links**: (Note: Parent role not yet in schema)
  - **Transfer Certificates**: Sample TCs for students
  - **Emergency Contacts**: Emergency contact information for students

## Prerequisites

1. **Database Setup**: Ensure your database is set up and migrations are run
   ```bash
   npm run prisma:migrate
   ```

2. **Environment Variables**: Make sure your `.env` file has the correct `DATABASE_URL` configured

3. **PostgreSQL & Redis**: Ensure Postgres (and Redis if your app uses it) are running and reachable from `DATABASE_URL` / your env.

## Running the Seed

### Option 1: Using npm script (Recommended)
```bash
npm run seed
```
This runs `prisma/seed-run.js`, which loads `.env` (and on the server, deployment shared `.env`) and validates `DATABASE_URL` before running the seed. Use this so you never hit "SASL: client password must be a string" from a missing or invalid `DATABASE_URL`.

### Option 2: Direct execution (only when DATABASE_URL is already set)
```bash
node prisma/seed.js
```

### Production / deployment server
- **Env file**: Put `DATABASE_URL` in `/opt/schooliat/backend/production/shared/.env` (or symlink `current/.env` to that file). Ensure the value is a full URL, e.g. `postgresql://user:YOUR_PASSWORD@host:5432/dbname`, and that the password is a real string (not empty or unset).
- **Run seed**: From backend dir, `npm run seed` (preferred), or run `scripts/migrate-and-seed-production.sh` which sources the shared `.env` then runs the seed. If you see "DATABASE_URL is not set" or "client password must be a string", fix the env file and re-run.

## Default Login Credentials

After seeding, you can use these credentials to log in:

### Super Admin
- **Email**: `admin@schooliat.com`
- **Password**: `Admin@123`

### Employee
- **Email**: `john.doe@schooliat.com`
- **Password**: `Employee@123`

### School Admin (Greenwood International School)
- **Email**: `admin@gis001.edu`
- **Password**: `Admin@123`

### Teacher (Greenwood International School)
- **Email**: `teacher1@gis001.edu`
- **Password**: `Teacher@123`

### Student (Greenwood International School)
- **Email**: `student1@gis001.edu`
- **Password**: `Student@123`

### Staff (Greenwood International School)
- **Email**: `staff1@gis001.edu`
- **Password**: `Staff@123`

**Note**: Similar credentials exist for other schools (SPS002, BFA003) with the same password patterns.

## Seed Data Details

### Schools Created
1. **Greenwood International School** (GIS001)
   - 1200 students
   - CBSE board
   - Established 1995

2. **Sunshine Public School** (SPS002)
   - 800 students
   - ICSE board
   - Established 2000

3. **Bright Future Academy** (BFA003)
   - 600 students
   - State Board
   - Established 2010

### Data Relationships
- Each school has multiple classes (grades 1-12)
- Each class has multiple students
- Teachers are assigned to schools
- Students have fee installments (12 per year)
- Transport vehicles are assigned to schools
- Exams and calendars are created for each school
- Attendance records are created for the last 30 days
- Timetables are created for each class with daily slots
- Homeworks are assigned to classes with MCQ questions
- Marks and results are calculated for all exams
- Leave requests and balances are tracked for teachers and staff
- Conversations and messages link teachers and students
- Notifications are sent to students for various events
- Transfer certificates are issued for some students
- Emergency contacts are linked to students

## Important Notes

1. **Idempotency**: The seed file checks for existing data before creating new records. You can run it multiple times safely.

2. **Data Volume**: The seed creates a substantial amount of data. For production, use with caution or modify the counts.

3. **Passwords**: All passwords are hashed using bcryptjs with 10 rounds.

4. **Dates**: Most dates are set relative to the current year for realistic data.

5. **Unique Constraints**: The seed handles unique constraints (emails, codes, etc.) by checking for existing records.

6. **Phase 2 & 3 Models**: Some models (Library, Gallery, Circular, Notes, Syllabus) may not be in the schema yet. The seed file includes placeholders that will be activated when these models are added.

7. **Parent Role**: The Parent role is not yet in the schema. Parent-child links will be created when the Parent role is added.

## Troubleshooting

### Error: "Role already exists"
This is normal - the seed checks for existing roles and skips creation if they exist.

### Error: "Email already exists"
The seed checks for existing users by email. If you want to re-seed, you may need to:
1. Reset the database: `npm run prisma:migrate:reset`
2. Or manually delete specific records

### Error: Database connection failed
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running and credentials are correct

### Error: Prisma client not generated
Run: `npm run prisma:generate`

## Customization

To customize the seed data:

1. **Modify counts**: Change the `randomInt()` calls to adjust the number of records
2. **Add more schools**: Add entries to the `schoolsData` array
3. **Change credentials**: Modify the email/password patterns in the seed functions
4. **Adjust dates**: Modify date ranges in the helper functions

## Resetting and Re-seeding

To completely reset and re-seed:

```bash
# Reset database (WARNING: This deletes all data)
npm run prisma:migrate:reset

# Run seed
npm run seed
```

## Next Steps

After seeding:
1. Start the backend server: `npm run dev`
2. Test API endpoints using the provided credentials
3. Explore the dashboard with different user roles
4. Verify data relationships in the database

## Support

For issues or questions about the seed file, refer to:
- Prisma documentation: https://www.prisma.io/docs
- Backend documentation: `Backend/CODEBASE_ANALYSIS.md`

