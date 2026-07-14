











Table of Contents
1. Introduction 

1.1 Purpose

1.2 System Overview
  1.2.1 System Name
  1.2.2 System Description
  1.2.3 Core Technical Deliverables

1.3 Scope Definition
  1.3.1 In-Scope Features
  1.3.2 Out-of-Scope Features

1.4 Definitions, Acronyms, and Abbreviations

1.5 References
  1.5.1 Contractual References

1.6 Document Overview

2. Overall Description

2.1 Product Perspective
  2.1.1 System Classification
  2.1.2 System Architecture

2.2 User Classes and Characteristics
  2.2.1 Super Admin
  2.2.2 School Admin
  2.2.3 Teacher
  2.2.4 Staff
  2.2.5 Student
  2.2.6 Parent

2.3 Operating Environment
  2.3.1 Client Environment
  2.3.2 Server Environment

2.4 Design and Implementation Constraints
  2.4.1 Timeline Constraints
  2.4.2 Technology Constraints
  2.4.3 Security Constraints
  2.4.4 Business Constraints


2.5 Assumptions and Dependencies
  2.5.1 Assumptions
  2.5.2 Dependencies
3. System Features and Functional Requirements

3.1 User Roles & Access Control
3.1.1 Functional Requirements
3.2 Authentication & Onboarding
3.2.1 Functional Requirements
3.3 Dashboards (All Roles)
3.4 Student Profile Management
3.5 Attendance Management (Critical)
3.6 Timetable Management (Critical)
3.7 Homework & Assignments (Critical)
3.8 Exams, Marks & Results (Critical)
3.9 Fees & Payment Management (Critical)
3.10 Leave Management (Critical)
3.11 Teacher & Staff Module
3.12 Parent Portal
3.13 Communication & Notifications
3.14 Library Management
3.15 Notes & Syllabus
3.16 Gallery & Events
3.17 Transport Management
3.18 Inventory Management (Optional)
3.19 AI Integration
3.20 Reports & Analytics
3.21 Super Admin Panel
3.22 School Admin Panel

4. Non-Functional Requirements
      
     4.1 Security & Compliance
4.2 Performance Requirements
4.3 Availability & Reliability
4.4 Usability Requirements
4.5 Maintainability & Extensibility
4.6 Support & Monitoring







5. Project Constraints and Business Rules
    
     5.1 Timeline & Phased Delivery
5.2 Payment Terms & Conditions
5.3 Change Management
5.4 Intellectual Property Rights
5.5 Confidentiality & Data Protection
5.6 Acceptance Criteria & Testing
5.7 Training & Knowledge Transfer
5.8 Support & Maintenance Period
5.9 Termination Conditions


Appendices
Appendix A: Requirement Traceability Matrix (RTM)
Appendix B: Glossary of Terms
Appendix C: Open Issues and Assumptions
 











1. Introduction
1.1 Purpose
This Software Requirements Specification (SRS) document provides a comprehensive and detailed description of the functional and non-functional requirements for the SchooliAt School ERP / School Management Platform (hereinafter referred to as "the System").
Intended Audience:
•	Client Stakeholders: Business owners, operations managers, and academic coordinators for scope validation and feature verification
•	Development Team: Product managers, software architects, backend/frontend/mobile engineers, and QA engineers as the primary implementation reference
•	Operations Team: Deployment, DevOps, and technical support teams for system behavior understanding and deployment guidance
Scope Boundaries:
This SRS is strictly derived from the contractual agreement between SchooliAt Technologies Pvt Ltd and NextinVision dated January 26, 2026. Only requirements explicitly stated or reasonably inferred from the contract are included. Features or modules not mentioned in the source document are explicitly excluded from this specification.
1.2 System Overview
System Name: SchooliAt School ERP / School Management Platform
System Description:
The System is a comprehensive, multi-tenant school management platform designed to digitize and streamline academic operations, administrative tasks, and stakeholder communication for K-12 educational institutions. It provides role-based interfaces for all stakeholders including administrators, teachers, staff, students, and parents.
Core Technical Deliverables:
•	Web Application: Multi-role administrative dashboard built with Next.js framework, providing comprehensive management capabilities for Super Admin, School Admin, Teachers, and Staff
•	Mobile Application: Cross-platform mobile app developed using React Native with Expo, primarily serving Students, Parents, Teachers, and Staff with on-the-go access
•	Backend Infrastructure: RESTful API server built with Node.js/NestJS framework, PostgreSQL relational database, and cloud-based deployment on AWS/GCP/Azure
•	Document Generation: Automated PDF generation for report cards, fee receipts, ID cards, and various administrative documents with customizable templates
•	Data Export: Multi-format export capabilities (PDF, Excel, CSV) for reports, analytics, and data portability
•	AI Integration: Intelligent chatbot assistant for FAQs, student/parent queries, and administrative support
•	Professional Services: Production deployment, administrator training, and 45-day post-launch support period
Functional Coverage:
The System encompasses the following major functional areas:
•	Academic Management: Attendance, Timetables, Homework & Assignments, Examinations & Results
•	Financial Management: Fee Structures, Payment Recording, Receipt Generation, Financial Reports
•	Student Information: Comprehensive profiles, APAAR ID, Parent linkages, Academic history
•	Communication: Multi-channel messaging, Notifications, Announcements, Chat system
•	Resource Management: Library, Transport, Inventory (optional)
•	Administrative Tools: Leave Management, Payroll, ID Cards, Circulars, Master Data
•	Analytics & Reporting: Attendance analytics, Fee collection reports, Academic performance, Custom exports
1.3 Scope Definition
This section defines the boundaries of the System, explicitly stating what is included and what is excluded from the current implementation scope.
1.3.1 In-Scope Features
The following features are included in this project based on the contractual agreement:
Core System Features:
•	User & Role Management with six distinct roles: Super Admin, School Admin, Teacher, Staff, Student, Parent
•	Authentication & Authorization with OTP verification, password recovery, role-based access control (RBAC), and session management
•	Role-specific Dashboards with personalized views and key metrics for each user type
•	Comprehensive Student Profile Management including demographics, academics, parent info, ID cards, and APAAR ID
Critical Academic Modules (Phase 1 Priority):
•	Attendance Management: Daily/bulk marking, period-wise tracking, late arrivals, absence reasons, automated reports (daily/monthly/yearly), parent email alerts
•	Timetable Management: Class-wise, teacher-wise, subject-wise schedules with multiple timetable support and change notifications
•	Homework & Assignments: Assignment creation with attachments, submission tracking, feedback mechanism, and MCQ auto-evaluation with instant results
•	Examinations & Results: Multiple exam types, marks entry, grade/percentage/CGPA calculation, pass/fail logic, result publication, customizable report card PDFs
•	Fee & Payment Management: Configurable fee structures (monthly/quarterly/yearly), installments, late fees, scholarships, manual payment recording, automated receipt generation
•	Leave Management: Leave requests for students/teachers/staff, approval workflows, balance tracking, history maintenance







Supporting Modules:
•	Teacher & Staff Module: Profile management, salary information, teaching assignments
•	Parent Portal: Multi-child account support, comprehensive child data access
•	Communication & Notifications: Chat system, push notifications, email alerts, bulk announcements
•	Library Management: Book cataloging, issue/return, fines, reservations, history
•	Notes & Syllabus: Subject notes upload, syllabus management, chapter organization, versioning
•	Gallery & Events: Photo albums, event galleries, certificate uploads
•	Transport Management: Vehicle records, route management, driver/conductor assignment, transport fee mapping
•	Inventory Management (Optional): Stock management, vendor management, purchase orders
Advanced Features:
•	AI Integration: Intelligent chatbot for FAQs, student/parent assistance, admin queries
•	Reports & Analytics: Attendance reports, fee analytics, academic performance tracking, salary/expense reports, multi-format exports
•	Super Admin Panel: Multi-school management, licensing, global statistics, employee management, vendor management, grievance handling, template management
•	School Admin Panel: School-specific administration, admissions, TC management, payroll, calendar, ID card generation, circulars, emergency contacts
Security & Compliance:
•	Data encryption (in transit and at rest)
•	Comprehensive audit logging
•	Password policies and complexity requirements
•	IP whitelisting for administrative access
•	Optional two-factor authentication (2FA)
•	GDPR-aligned data protection practices
•	Email OTP verification for critical deletion operations
1.3.2 Out-of-Scope Features
The following features are explicitly excluded from the current project scope:
•	Online Payment Gateway Integration: No integration with UPI, credit/debit cards, net banking, or other online payment methods in this phase. All payments are recorded manually by authorized staff.
•	Extended ERP Modules: Hostel management, canteen/cafeteria management, alumni management, and other modules not explicitly mentioned in the contract
•	Advanced Learning Management: Full-featured LMS capabilities beyond notes/homework/exams (e.g., video lectures, interactive content, gamification)
•	Third-party Integrations: Integration with external educational platforms, government portals, or third-party services unless specifically mentioned
•	Long-term Hosting SLAs: Extended service level agreements for managed hosting beyond the described 45-day support period
•	Custom Hardware Integration: Biometric attendance devices, RFID card readers, or other specialized hardware integrations
•	Multi-language Support: Internationalization (i18n) or localization beyond English language interface



1.4 Definitions, Acronyms, and Abbreviations
Term/Acronym	Definition
ERP	Enterprise Resource Planning - integrated management of main business processes
RBAC	Role-Based Access Control - access permissions based on user roles
Super Admin	Global administrator managing multiple schools, licenses, and system-wide configurations
School Admin	Administrator responsible for a specific school or campus
Teacher	Academic staff member responsible for teaching and student assessment
Staff	Non-teaching employees including finance, library, transport, and office personnel
Student	End learner enrolled in the educational institution
Parent	Guardian with access to one or more children's academic and administrative data
APAAR ID	Automated Permanent Academic Account Registry - unique academic identity for students
MCQ	Multiple Choice Question - assessment format with predefined answer options
UAT	User Acceptance Testing - validation by end users before system go-live
2FA	Two-Factor Authentication - security method requiring two forms of verification
OTP	One-Time Password - temporary code sent via email or phone for verification
PDF	Portable Document Format - standard document format for reports and receipts
CSV	Comma-Separated Values - text file format for data export
SMTP	Simple Mail Transfer Protocol - standard for email transmission
API	Application Programming Interface - set of protocols for building software
REST	Representational State Transfer - architectural style for web services
HTTPS	Hypertext Transfer Protocol Secure - encrypted web communication protocol
TLS	Transport Layer Security - cryptographic protocol for secure communications
JWT	JSON Web Token - compact method for securely transmitting information
GDPR	General Data Protection Regulation - EU data privacy framework
SLA	Service Level Agreement - commitment between service provider and client
TC	Transfer Certificate - document issued when student leaves the school

1.5 References
Contractual References:
•	Primary Source Document: Project Contract – School ERP / School Management Platform, Effective Date: January 26, 2026
Technical References:
•	Next.js Framework: https://nextjs.org/ - Web application framework
•	React Native: https://reactnative.dev/ - Mobile application framework
•	Expo: https://expo.dev/ - React Native development platform
•	NestJS: https://nestjs.com/ - Backend application framework
•	PostgreSQL: https://www.postgresql.org/ - Relational database system
Standards and Best Practices:
•	IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
•	GDPR: General Data Protection Regulation - Data privacy and protection framework
•	OWASP: Open Web Application Security Project - Security best practices
1.6 Document Overview
This Software Requirements Specification is organized into the following major sections:
Section 1: Introduction
Provides the purpose, scope, definitions, and context for the document. Establishes the foundation for understanding the System requirements.
Section 2: Overall Description
Describes the product perspective, user characteristics, operating environment, design constraints, and assumptions. Provides the context in which the System will operate.
Section 3: System Features and Functional Requirements
Details all functional requirements organized by module. Each module section includes a description and numbered functional requirements (FR-XXX-NN format).

Section 4: Non-Functional Requirements
Specifies quality attributes including security, performance, availability, usability, maintainability, and support requirements (NFR-XXX-NN format).
Section 5: Project Constraints and Business Rules
Documents project-specific constraints including timeline, payment terms, change management, intellectual property, confidentiality, acceptance criteria, and termination conditions (BR-XXX-NN format).
2. Overall Description
2.1 Product Perspective
System Classification:
The SchooliAt School ERP is a standalone, multi-tenant software platform designed specifically for K-12 educational institutions. It is a new system developed from the ground up, not a modification of an existing product.
System Architecture:
•	Multi-tenant Architecture: The System supports multiple schools under a centralized Super Admin, with each school operating independently with its own admin, faculty, staff, and students while sharing the same underlying infrastructure.
•	Three-tier Architecture: Presentation layer (web and mobile clients), application layer (RESTful API backend), and data layer (PostgreSQL database).
•	Unified API Layer: Both web and mobile front-ends consume the same centralized API layer, ensuring consistency in business logic and data access across platforms.
•	Role-based UI Adaptation: The same API serves different UI experiences tailored to each user role's specific needs and workflows.
System Context:
The System operates as an integrated platform that replaces or consolidates multiple disparate systems typically used in schools, such as separate attendance systems, fee management software, communication tools, and academic record systems. It provides a single source of truth for all school-related data and operations.
External Interfaces:
•	Email System: Interfaces with SMTP servers for sending notifications, OTPs, and communications
•	Cloud Infrastructure: Deployed on AWS, GCP, or Azure platforms for hosting, storage, and compute resources
•	SMS/WhatsApp (Optional): Potential integration for phone-based OTP delivery if configured


2.2 User Classes and Characteristics
The System serves six primary user classes, each with distinct responsibilities, technical proficiency levels, and access patterns:
2.2.1 Super Admin
Primary Responsibilities: Global administration across multiple schools, license management, master data configuration, system monitoring, template management, vendor and employee oversight, grievance resolution, and multi-school analytics.
Technical Proficiency: High - Expected to have advanced technical literacy and understanding of system administration concepts.
Primary Interface: Web dashboard with comprehensive administrative controls.
Key Characteristics: Typically IT administrators or central management staff who require full system visibility and control. Users in this role need to understand complex configurations and have authorization for critical system-level operations.
Usage Frequency: Daily to weekly, depending on number of schools managed and operational requirements.
2.2.2 School Admin
Primary Responsibilities: School-specific administration including class management, teacher and student management, admissions and transfer certificates, payroll processing, academic calendar, timetable coordination, transport and inventory oversight, result approval, ID card generation, circular distribution, and emergency contact maintenance.
Technical Proficiency: Moderate - Comfortable with software applications but may require training for advanced features.
Primary Interface: Web dashboard
Key Characteristics: School principals, vice principals, or administrative officers responsible for day-to-day school operations. Require comprehensive access to school-level data but not global system settings.
Usage Frequency: Daily, throughout the academic day.
2.2.3 Teacher
Primary Responsibilities: Marking attendance, creating and grading homework, entering exam marks, uploading notes and syllabus, maintaining gallery content, communicating with students and parents, and viewing/managing timetables.
Technical Proficiency: Low to Moderate - May have varying levels of technical comfort; interface must be intuitive.
Primary Interface: mobile application
Key Characteristics: Academic staff focused on teaching and student assessment. Need quick access to class-specific information and efficient workflows for routine tasks. May use mobile app for attendance and on-the-go access.
Usage Frequency: Daily, with multiple sessions per day during class periods.
2.2.4 Staff
Primary Responsibilities: Varies by department - finance staff handle fees, librarians manage library, transport staff oversee vehicles and routes, office staff handle general administration. Includes non-teaching personnel across various school functions.
Technical Proficiency: Low to Moderate - Varies widely based on role and individual background.
Primary Interface: Primarily web dashboard, (e.g., transport coordinators).
Key Characteristics: Non-teaching employees with specialized administrative or operational responsibilities. Access is typically limited to their specific functional area (e.g., librarian only sees library module).
Usage Frequency: Daily for most staff roles, with frequency dependent on specific responsibilities.
2.2.5 Student
Primary Responsibilities: Viewing attendance, accessing and submitting homework, checking timetable, viewing exam results, monitoring fee status, communicating with teachers, receiving notifications, and interacting with AI assistant for queries.
Technical Proficiency: Low to Moderate - K-12 students with varying ages and technical abilities; interface must be age-appropriate and simple.
Primary Interface: Primarily mobile application
Key Characteristics: End learners ranging from primary to secondary school age. Require read-only access to most information with submission capabilities for homework. Interface must be engaging and easy to navigate for younger users.
Usage Frequency: Daily, primarily during school hours and homework completion times.
2.2.6 Parent (Same in the student portal)
Primary Responsibilities: Monitoring attendance for multiple children, tracking homework completion, viewing exam results and timetables, checking fee status and payment history, communicating with teachers and school administration, and receiving notifications about their children.
Technical Proficiency: Low to Moderate - Wide range of technical abilities; must accommodate less tech-savvy users.
Primary Interface: Primarily mobile application 
Key Characteristics: Guardians with responsibility for one or more students. Need comprehensive visibility into their children's academic performance and school activities. Single account may be linked to multiple student profiles for families with multiple children in the school.
Usage Frequency: Daily to weekly, with increased usage during exam periods and when notifications are received.
2.3 Operating Environment
This section describes the technical environment in which the System will operate, including client-side requirements, server infrastructure, and network considerations.
2.3.1 Client Environment
Web Application Requirements:
•	Supported Browsers: Google Chrome (version 90+), Microsoft Edge (version 90+), Mozilla Firefox (version 88+), Safari (version 14+)
•	Device Type: Desktop computers, laptops, and tablets with minimum 1024x768 screen resolution
•	Network Requirements: Stable internet connection with minimum 2 Mbps bandwidth recommended
•	JavaScript: Must be enabled; modern ECMAScript 2015+ support required
•	Cookies: Must be enabled for session management and authentication
Mobile Application Requirements:
•	Android Platform: Android 6.0 (Marshmallow, API level 23) or higher
•	iOS Platform: iOS 12.0 or higher; compatible with iPhone, iPad, and iPod touch
•	Storage: Minimum 100 MB free space for app installation and local cache
•	Network: WiFi or mobile data connection; offline mode not supported in initial phase
•	Permissions: Camera (for photo uploads), storage (for file downloads), notifications (for push alerts)
2.3.2 Server Environment
Backend Application:
•	Runtime: Node.js (version 18.x or 20.x LTS)
•	Framework: NestJS (latest stable version)
•	Architecture: RESTful API with JSON request/response format
Database:
•	Database System: PostgreSQL 14.x or higher
•	Connection Pooling: Configured for optimal concurrent connection handling
•	Backup Strategy: Daily automated backups with point-in-time recovery capability
Cloud Infrastructure:
•	Hosting Platform: Amazon Web Services (AWS), Google Cloud Platform (GCP), or Microsoft Azure (to be determined during deployment planning)
•	Compute: Node.js application on server (e.g. PM2) with PostgreSQL, Redis, and reverse proxy (e.g. Nginx)
•	Storage: Cloud object storage for uploaded files (documents, images, PDFs)
•	CDN: Content Delivery Network for static assets and improved global performance


Email Service:
•	Protocol: SMTP-based transactional email server
•	Provider: To be configured based on client preference (e.g., SendGrid, Amazon SES, custom SMTP server)
•	Authentication: Secure SMTP credentials with TLS encryption
2.4 Design and Implementation Constraints
This section identifies constraints that limit the design and implementation options available for the System.
2.4.1 Timeline Constraints
•	Total Development Duration: 21 calendar days from project kickoff to final delivery
•	Phase 1 Timeline (Days 1-12): Must deliver authentication system, all dashboards, attendance management, timetable management, homework & assignments, examinations & results, fee management, communication & notifications, and core reporting capabilities
•	Phase 2 Timeline (Days 13-21): Must deliver library management, transport management, inventory management, AI integration, advanced analytics, and Super Admin extensions
•	Milestone Dependencies: Phase 2 development cannot commence until Phase 1 payment milestone is achieved
2.4.2 Technology Constraints
The following technology stack is contractually mandated and cannot be substituted:
•	Web Frontend: Next.js framework (React-based)
•	Mobile Application: React Native with Expo managed workflow
•	Backend API: Node.js with NestJS framework
•	Database: PostgreSQL relational database
•	Email Delivery: SMTP protocol (provider flexible)
•	Cloud Platform: Must be AWS, GCP, or Azure (specific choice determined during deployment planning)
2.4.3 Security Constraints
The following security measures are mandatory requirements:
•	Data Encryption: All data must be encrypted in transit using TLS 1.2+ and at rest using industry-standard encryption algorithms
•	Audit Logging: Comprehensive audit trails must be maintained for all critical operations
•	Password Management: Enforced password policies including complexity requirements and secure hashing
•	Access Control: IP whitelisting capability for administrative access must be implemented
•	Two-Factor Authentication: Optional 2FA support must be available for configuration
•	Data Privacy: GDPR-like data protection practices must be followed, including data minimization, purpose limitation, and user consent
•	Critical Operations: Email OTP verification required for deletion operations




2.4.4 Business Constraints
•	Payment-Driven Development: Work on subsequent phases will halt if milestone payments are delayed beyond 3 days of due date
•	Scope Rigidity: Any features beyond the documented scope must be formally requested, approved, and will be treated as billable Change Requests
•	Payment Gateway Exclusion: Online payment integration is explicitly excluded from this phase; all payment recording is manual
•	Support Window: Post-deployment support is limited to 45 days with a maximum of 80 hours of effort
2.5 Assumptions and Dependencies
Successful system implementation relies on the following assumptions and has dependencies on external factors:
2.5.1 Assumptions
•	Master Data Availability: Schools will provide accurate and complete master data including class structures, sections, subjects, fee schedules, academic calendars, and initial user lists in a timely manner suitable for system configuration.
•	Internet Connectivity: All end-users (students, parents, teachers, staff, administrators) have access to devices with adequate internet connectivity to access the web application or mobile app.
•	User Training Participation: School administrators will participate in the provided training sessions and cascade training to their staff members.
•	Data Migration: If migrating from existing systems, schools will provide data in structured formats (Excel, CSV, or database exports) suitable for migration.
•	Infrastructure Readiness: Cloud infrastructure accounts and credentials will be set up and provided before deployment phase.
•	Regulatory Compliance: Schools are responsible for ensuring their use of the System complies with local educational regulations and data protection laws.
2.5.2 Dependencies
•	SMTP Server Configuration: Email functionality depends on SMTP server credentials and configuration being provided by the client or vendor setting up a dedicated email service.
•	Cloud Platform Access: Deployment depends on timely provisioning of cloud infrastructure access (AWS/GCP/Azure) with appropriate permissions for compute, storage, and networking resources.
•	Domain and SSL Certificates: Production deployment requires domain name configuration and SSL/TLS certificates for secure HTTPS access.
•	AI Model Availability: AI chatbot functionality depends on access to appropriate AI/ML models or services, which are assumed to be available and configured within the project capacity.
•	Mobile App Store Accounts: Publishing the mobile application depends on access to Google Play Store and Apple App Store developer accounts owned by the client or set up by the vendor.
•	Third-party Services: Optional SMS/WhatsApp integration for OTP delivery depends on integration with third-party service providers if this functionality is requested.
•	Payment Processing: Payment milestone completion depends on timely processing by the client as per the agreed schedule.
•	Client Availability: Requirements clarification, UAT participation, and sign-offs depend on client stakeholder availability during the 21-day development period.



3. System Features and Functional Requirements
This section provides detailed functional requirements for each module of the SchooliAt School ERP system. Requirements are identified using the format FR-[MODULE]-[NN] where MODULE represents the functional area and NN is a sequential number.
Priority Classification:
•	CRITICAL: Must be delivered in Phase 1 (Days 1-12) - core academic and administrative functions
•	HIGH: Essential for complete system functionality but can be delivered in Phase 2 (Days 13-21)
•	MEDIUM: Important for enhanced user experience and operational efficiency
Note: All functional requirements are derived from the contractual agreement and represent mandatory system capabilities unless explicitly marked as optional.
3.1 User Roles & Access Control
Module Description:
This module implements a comprehensive Role-Based Access Control (RBAC) system that governs all user interactions with the System. It ensures that each user type (Super Admin, School Admin, Teacher, Staff, Student, Parent) has appropriate access rights and can only view or modify data within their authorized scope. The module also implements security measures for critical operations, including email OTP verification for deletions.
3.1.1 Functional Requirements
FR-RBAC-01
Role Definition and Support [Priority: CRITICAL]
The System SHALL support six distinct user roles with defined responsibilities and access levels: Super Admin, School Admin, Teacher, Staff, Student, and Parent.
Implementation Considerations:
•	User account creation
•	Role assignment during registration
•	Role-specific menu and feature visibility




FR-RBAC-02
Multi-Role Assignment [Priority: MEDIUM]
The System SHALL allow a single user to be associated with multiple roles where applicable by business rules (e.g., a user can be both a Teacher and a Parent).
Implementation Considerations:
•	Role combination validation
•	Combined role permissions
•	Role-switching interface
FR-RBAC-03
Role-Based Data Access [Priority: CRITICAL]
The System SHALL enforce that each role can only access and operate on data authorized for that role, specifically: Super Admin (global multi-school data), School Admin (school-specific data), Teacher (assigned classes and students), Staff (department-specific data), Student (own data), Parent (linked children's data).
Implementation Considerations:
•	API endpoint authorization
•	Database-level access control
•	UI element visibility control
FR-RBAC-04
Parent-Child Relationship Management [Priority: CRITICAL]
The System SHALL maintain parent-child relationships allowing one Parent user account to be linked to multiple Student profiles across different classes and sections.
Implementation Considerations:
•	Multi-child account linking
•	Child selector interface
•	Consolidated parent view of all children
FR-RBAC-05
API-Level Permission Enforcement [Priority: CRITICAL]
The System SHALL validate role-based permissions at the API layer for all endpoints before processing any data retrieval or modification request.
Implementation Considerations:
•	JWT token validation
•	Role extraction from authentication token
•	Permission check before business logic execution
•	Appropriate error responses for unauthorized access
FR-RBAC-06
Email OTP for Critical Deletions [Priority: HIGH]
The System SHALL require email OTP verification for all deletion operations initiated by Super Admin or School Admin users.
Implementation Considerations:
•	OTP generation and email delivery
•	OTP validation interface
•	Time-limited OTP validity (configurable, default 10 minutes)
•	Failed attempt tracking
FR-RBAC-07
Deletion OTP Initiation [Priority: HIGH]
Upon user initiating a deletion operation, the System SHALL generate a unique OTP and send it to the admin user's registered email address with clear instructions.
Implementation Considerations:
•	Secure random OTP generation
•	Email template with OTP and expiry time
•	Deletion context in email (what is being deleted)





FR-RBAC-08
Deletion OTP Validation [Priority: HIGH]
The System SHALL provide an interface for entering the OTP and SHALL complete the deletion only upon successful validation within the time window; otherwise the operation SHALL be cancelled.
Implementation Considerations:
•	OTP input form
•	Real-time validation
•	Clear success/failure messages
•	Cancellation of operation on timeout or invalid OTP
FR-RBAC-09
Comprehensive Audit Logging [Priority: CRITICAL]
The System SHALL log all create, update, and delete operations with user ID, timestamp, IP address, entity type, entity ID, and operation result in immutable audit logs.
Implementation Considerations:
•	Structured log format
•	Tamper-proof log storage
•	Log retention policy
•	Admin interface for audit log viewing
3.2 Authentication & Onboarding
Module Description:
This module handles all aspects of user authentication, registration, and onboarding. It provides secure login mechanisms, OTP-based verification, password recovery, role-specific redirections, and session management tailored to different user types and platforms (web vs. mobile).
3.2.1 Functional Requirements
FR-AUTH-01
User Registration and Onboarding [Priority: CRITICAL]
The System SHALL provide user registration/onboarding workflows for all user roles based on school-approved processes, including data capture for profile completion.
Implementation Considerations:
•	Registration forms for each role
•	Email/phone verification during registration
•	Profile completion wizard
•	Admin approval workflow where required
FR-AUTH-02
Secure Login [Priority: CRITICAL]
The System SHALL support secure login using username/email/phone (as configured) and password with protection against brute force attacks.
Implementation Considerations:
•	Multi-identifier login support
•	Secure password transmission (HTTPS)
•	Account lockout after failed attempts
•	CAPTCHA after multiple failures
FR-AUTH-03
OTP Verification [Priority: CRITICAL]
The System SHALL support One-Time Password (OTP) verification during registration or sign-in through email-based OTP and optionally phone-based OTP (SMS or WhatsApp).
Implementation Considerations:
•	OTP generation with configurable length
•	Email OTP delivery via SMTP
•	Optional SMS/WhatsApp integration
•	Resend OTP functionality with rate limiting
FR-AUTH-04
Password Recovery [Priority: CRITICAL]
The System SHALL provide a forgot password workflow allowing users to reset their password via OTP or secure link sent to their registered email/phone.
Implementation Considerations:
•	Forgot password link on login page
•	Identity verification via OTP
•	Secure password reset interface
•	Password strength validation
•	Confirmation of password change
FR-AUTH-05
Role-Based Redirection [Priority: CRITICAL]
After successful login, the System SHALL automatically redirect users to their role-specific landing page/dashboard appropriate to their assigned role(s).
Implementation Considerations:
•	Super Admin dashboard
•	School Admin dashboard
•	Teacher dashboard
•	Staff dashboard
•	Student dashboard
•	Parent dashboard
•	Role selection interface for multi-role users
FR-AUTH-06
Mobile Session Persistence [Priority: HIGH]
For mobile application users (Students, Parents, Teachers, Staff), the System SHALL NOT automatically log out users unless token expiration, manual logout, or security policy change requires it.
Implementation Considerations:
•	Long-lived JWT tokens for mobile
•	Secure token storage
•	Token refresh mechanism
•	Graceful session expiry handling
FR-AUTH-07
Web Session Timeout [Priority: HIGH]
For web dashboard users, the System SHALL implement a session timeout of 10 hours of inactivity, after which users SHALL be logged out and must re-authenticate.
Implementation Considerations:
•	Activity tracking
•	Idle time monitoring
•	Session expiry warning
•	Auto-logout on timeout
•	Session extension option








FR-AUTH-08
Optional Two-Factor Authentication [Priority: MEDIUM]
The System SHALL support optional two-factor authentication (2FA) that can be enabled per user or globally per security configuration.
Implementation Considerations:
•	2FA enablement interface
•	TOTP-based authenticator app support
•	Backup codes generation
•	2FA recovery mechanism
FR-AUTH-09
Password Policy Enforcement [Priority: CRITICAL]
The System SHALL enforce configurable password policies during registration and password changes, including minimum length, complexity requirements, and password history.
Implementation Considerations:
•	Minimum 8 characters (configurable)
•	Mix of uppercase, lowercase, numbers, special characters
•	Password strength indicator
•	Prohibition of previously used passwords
•	Password expiry reminders (optional)
3.3 Dashboards (All Roles)
Detailed requirements for role-specific dashboards with personalized views, key metrics, and quick access to frequently used features. Each dashboard SHALL present relevant information and actionable items based on the user's role and responsibilities.
Key Requirements Summary:
•	FR-DASH-01 through FR-DASH-06: Role-specific dashboard implementations
•	Student/Parent dashboards: Attendance summary, homework status, notifications, fees, timetable, exam schedule
•	Teacher dashboard: Class schedule, attendance tracking, homework evaluation, marks entry tasks
•	School Admin dashboard: School-wide metrics, fee collection, upcoming events, analytics widgets
•	Super Admin dashboard: Multi-school statistics, license management, system alerts
3.4 Student Profile Management
Key Requirements:
•	Comprehensive demographic data capture and management
•	Academic information including admission number, roll number, class assignments
•	Parent/guardian details with multiple contact support
•	ID card information and APAAR ID integration
•	Profile editing with appropriate role-based permissions
•	Integration with ID card generation module



3.5 Attendance Management (CRITICAL)
Key Requirements:
•	Daily attendance marking per class/section with bulk entry support
•	Optional period-wise attendance tracking
•	Late arrival and absence reason capture
•	Comprehensive reporting (daily, monthly, yearly)
•	Multi-format export (PDF, Excel)
•	Automated parent email alerts for absences
•	Integration with analytics and dashboard modules
•	Teacher, admin, and parent views with appropriate access levels
3.6 Timetable Management (CRITICAL)
Key Requirements:
•	Class-wise, teacher-wise, and subject-wise timetable creation
•	Multiple timetable support per school
•	Effective date ranges for timetable versions
•	Change notification system to affected users
•	Conflict detection for teacher and room scheduling
•	Mobile and web view optimization
•	Print-friendly format generation
3.7 Homework & Assignments (CRITICAL)
Key Requirements:
•	Homework creation with rich text and file attachments
•	Assignment to multiple classes/sections
•	Student submission interface with file upload support
•	Teacher review and feedback system
•	MCQ assessment module with auto-evaluation
•	Instant result display for MCQ submissions
•	Due date tracking and reminder notifications
•	Submission status tracking and overdue alerts
3.8 Exams, Marks & Results (CRITICAL)
Key Requirements:
•	Support for multiple exam types (Unit Test, Mid-term, Final, Practical)
•	Flexible exam structure configuration per subject
•	Marks entry interface with validation
•	Automatic calculation of percentage, CGPA, and grades
•	Configurable pass/fail logic
•	Result publication workflow with approval
•	Customizable report card PDF generation
•	School-specific header and footer templates
•	Student and parent access to results and report cards
•	Integration with analytics for performance tracking


3.9 Fees & Payment Management (CRITICAL)
Key Requirements:
•	Configurable fee structures (monthly, quarterly, yearly)
•	Multiple fee type support (tuition, transport, admission, exam, library)
•	Installment-based payment plans
•	Late fee calculation with grace periods
•	Scholarship and discount management
•	Manual payment recording (cash, bank transfer, cheque)
•	Automated receipt PDF generation with school branding
•	Fee status dashboard for students and parents
•	Outstanding dues tracking and defaulter reports
•	Fee collection analytics and financial reporting
•	Note: Online payment gateway integration explicitly excluded
3.10 Leave Management (CRITICAL)
Key Requirements:
•	Leave request submission for students, teachers, and staff
•	Multi-level approval workflows
•	Leave balance tracking for employees
•	Leave type configuration (casual, sick, earned, etc.)
•	Leave history and calendar view
•	Notification system for requests, approvals, and rejections
•	Integration with attendance system
3.11 Teacher & Staff Module
Key Requirements:
•	Comprehensive profile management
•	Attendance marking capabilities
•	Salary information management
•	Teaching assignment tracking
•	Homework creation and evaluation
•	Marks entry for assigned classes
•	Syllabus and notes upload
•	Gallery management
•	Internal communication system
3.12 Parent Portal
Key Requirements:
•	Multi-child account linkage and management
•	Child-wise data views (attendance, homework, results, fees)
•	Consolidated dashboard across all children
•	Fee payment tracking per child
•	Communication with teachers and administration
•	Notification preferences management
•	AI assistant access for queries
•	Available on both web and mobile platforms

3.13 Communication & Notifications
Key Requirements:
•	Multi-channel chat/messaging system
•	Push notifications for mobile users
•	Email notifications via SMTP
•	Bulk announcement capabilities
•	Event-triggered notifications (attendance, homework, fees, results, leaves, circulars)
•	Notification history and read/unread tracking
•	Role-based message routing
•	Attachment support in messages
3.14 Library Management
Key Requirements:
•	Book catalog with detailed metadata
•	Issue and return processing
•	Automated fine calculation for overdue books
•	Book reservation system
•	Student and staff library history
•	Book search and availability checking
•	Librarian dashboard with pending returns
•	Integration with student profiles
3.15 Notes & Syllabus
Key Requirements:
•	Subject-wise notes upload and management
•	Syllabus document organization by academic year
•	Chapter-wise content structuring
•	PDF document support
•	Version control for updated content
•	Student and parent access interface
•	Download capability for offline access
•	Teacher upload interface with approval workflow
3.16 Gallery & Events
Key Requirements:
•	Photo album creation and management
•	Event gallery organization
•	Certificate upload and display
•	Image upload with compression
•	Album privacy settings
•	Viewing interface for students and parents
•	Caption and description support
•	Date-based organization


3.17 Transport Management
Key Requirements:
•	Vehicle record management
•	Route definition with stops and timings
•	Driver and conductor assignment
•	Transport fee mapping to students
•	Route-wise student lists
•	Vehicle maintenance tracking
•	Integration with fee management
•	Parent visibility of transport details
3.18 Inventory Management (Optional)
Key Requirements:
•	Stock item catalog with categories
•	Quantity tracking and reorder levels
•	Vendor management
•	Purchase order creation and tracking
•	Stock movement history
•	Low stock alerts
•	Inventory reports and analytics
3.19 AI Integration
Key Requirements:
•	AI chatbot accessible from web and mobile
•	FAQ knowledge base configuration
•	Student/parent query assistance
•	Context-aware responses based on user role
•	Quick data retrieval (attendance, homework, exam dates, fees)
•	Admin query support with system statistics
•	Natural language processing for intent recognition
•	Conversation history and context maintenance
3.20 Reports & Analytics
Key Requirements:
•	Attendance reports and trend analysis
•	Fee collection analytics and projections
•	Academic performance reports
•	Salary and expense reports
•	Custom report generation
•	Export to PDF, Excel, and CSV
•	Scheduled report generation
•	Visual dashboards with charts and graphs
•	Comparative analytics across classes and time periods


3.21 Super Admin Panel
Key Requirements:
•	Multi-school management interface
•	License administration and tracking
•	Global statistics across all schools
•	Central employee management
•	Vendor management
•	Payment tracking for subscriptions
•	System health monitoring
•	Grievance management system
•	Document template management (letterheads, receipts)
•	Master data configuration
•	Sub-roles: Admin, Manager, Member with different permission levels
3.22 School Admin Panel
Key Requirements:
•	School-specific administration
•	Class and section management
•	Teacher and student management
•	Admission processing and TC issuance
•	Payroll management
•	Academic calendar configuration
•	Timetable administration
•	Transport and inventory oversight
•	Result approval and publication
•	ID card generation for students and staff
•	Circular creation and distribution
•	Emergency contact management
•	School-level master data configuration







4. Non-Functional Requirements
Non-functional requirements define the quality attributes, performance characteristics, and constraints of the System. These requirements are identified using the format NFR-[CATEGORY]-[NN].
4.1 Security & Compliance
NFR-SEC-01
Data Encryption in Transit
All data transmitted between clients and servers SHALL be encrypted using HTTPS with TLS 1.2 or higher.
NFR-SEC-02
Data Encryption at Rest
Sensitive data at rest (passwords, tokens, personal information) SHALL be stored using industry-standard encryption algorithms and secure hashing (e.g., bcrypt, Argon2 for passwords).
NFR-SEC-03
Comprehensive Audit Logging
The System SHALL maintain immutable audit logs of all critical operations including user logins, data modifications, configuration changes, with timestamp and user identification.
NFR-SEC-04
Password Policy
The System SHALL enforce configurable password policies including minimum length (default 8 characters), complexity requirements, and password history (prevention of reuse).

NFR-SEC-05
IP Whitelisting
The System SHALL support IP whitelisting for administrative access, allowing restriction of Super Admin and School Admin logins to specified IP addresses or ranges.
NFR-SEC-06
Optional Two-Factor Authentication
The System SHALL provide optional 2FA support that can be enabled per user or globally, supporting TOTP-based authenticator applications.
NFR-SEC-07
GDPR-like Data Protection
The System SHALL follow GDPR-aligned data protection practices including data minimization, purpose limitation, secure storage, restricted access, and user consent management.
NFR-SEC-08
API Authorization
All API endpoints SHALL implement token-based authorization (JWT) with appropriate expiration policies and refresh token mechanisms.
4.2 Performance Requirements
NFR-PERF-01
Response Time
Under normal load conditions, the System SHALL respond to API requests within 2 seconds for 95% of requests and within 5 seconds for 99% of requests.
NFR-PERF-02
Concurrent Users
The System SHALL support the expected number of concurrent users as defined during deployment sizing (typical school scale: 500-2000 concurrent users).
NFR-PERF-03
Page Load Time
Dashboard pages SHALL load within 3 seconds on broadband connections (2 Mbps+) for 90% of page loads.
NFR-PERF-04
Database Query Optimization
Database queries SHALL be optimized with appropriate indexing and query planning to ensure efficient data retrieval.
NFR-PERF-05
Pagination and Data Limits
List views and data tables SHALL implement pagination with configurable page sizes to prevent excessive memory usage and improve load times.
NFR-PERF-06
Asynchronous Processing
Resource-intensive operations (bulk imports, report generation, bulk messaging) SHALL be processed asynchronously with progress indicators and completion notifications.




4.3 Availability & Reliability
NFR-AVAIL-01
System Availability
The System SHALL be designed for high availability with appropriate redundancy in the chosen cloud infrastructure, targeting 99% uptime during business hours.
NFR-AVAIL-02
Backup Strategy
Database backups SHALL be performed daily with automated backup verification and retention for at least 30 days.
NFR-AVAIL-03
Disaster Recovery
A disaster recovery plan SHALL be documented with defined Recovery Time Objective (RTO) and Recovery Point Objective (RPO) based on client requirements.
NFR-AVAIL-04
Error Handling
The System SHALL implement graceful error handling with user-friendly error messages and automatic error logging for administrator review.
4.4 Usability Requirements
NFR-USE-01
Intuitive Interface
User interfaces SHALL be designed with intuitive navigation, consistent layouts, and clear visual hierarchies suitable for users with varying technical proficiency.
NFR-USE-02
Mobile Responsiveness
The web application SHALL be fully responsive and functional on devices with screen sizes from 320px to 2560px wide.
NFR-USE-03
Accessibility
The System SHALL implement basic accessibility features including keyboard navigation, legible fonts (minimum 11pt), sufficient color contrast (WCAG AA compliance), and screen reader compatibility where feasible.
NFR-USE-04
Contextual Help
The System SHALL provide contextual help through tooltips, inline hints, and access to the AI assistant for user guidance.
NFR-USE-05
Consistent User Experience
UI components SHALL maintain consistent styling, behavior, and terminology across all modules and platforms (web and mobile).




4.5 Maintainability & Extensibility
NFR-MAINT-01
Modular Architecture
The System SHALL be architected with modular, loosely-coupled components to facilitate future enhancements and modifications.
NFR-MAINT-02
Code Documentation
Source code SHALL include inline comments and documentation for complex logic, API endpoints, and database schemas.
NFR-MAINT-03
Version Control
All code SHALL be maintained in a version control system (Git) with meaningful commit messages and branch management.
NFR-MAINT-04
API Versioning
The API SHALL implement versioning to allow for future updates without breaking existing integrations.
NFR-MAINT-05
Configuration Management
System configurations SHALL be externalized (environment variables, configuration files) to support different deployment environments.


4.6 Support & Monitoring
NFR-SUP-01
Post-Deployment Support
The vendor SHALL provide 45 days of post-deployment support with a maximum of 80 hours effort for bug fixes and performance optimization.
NFR-SUP-02
System Monitoring
If monitoring services are subscribed, the System SHALL be monitored 24/7 for uptime, performance metrics, error rates, and resource utilization.
NFR-SUP-03
Log Management
Application logs SHALL be centrally collected, structured, and retained for troubleshooting and audit purposes (minimum 90 days retention).
NFR-SUP-04
Alert System
Critical system events (downtime, errors, security incidents) SHALL trigger automated alerts to designated administrators.





5. Project Constraints and Business Rules
This section documents project-specific constraints, business rules, and contractual requirements that govern the development, delivery, and acceptance of the System. These are identified using the format BR-[CATEGORY]-[NN].
5.1 Timeline & Phased Delivery
BR-TIME-01
Total Project Duration
The complete development, testing, and deployment SHALL be completed within 21 calendar days from the project start date.
BR-TIME-02
Phase 1 Deliverables
Phase 1 (Days 1-12) SHALL deliver: Authentication & Authorization, All Dashboards, Attendance Management, Timetable Management, Homework & Assignments, Examinations & Results, Fee & Payment Management, Leave Management, Communication & Notifications, and Core Reporting.
BR-TIME-03
Phase 2 Deliverables
Phase 2 (Days 13-21) SHALL deliver: Library Management, Transport Management, Inventory Management (optional), AI Integration, Advanced Analytics, Super Admin Panel extensions, and School Admin Panel extensions.


BR-TIME-04
Milestone Dependencies
Phase 2 development SHALL NOT commence until Phase 1 payment milestone is received and Phase 1 deliverables are accepted by the client.
5.3 Change Management
BR-CR-01
Scope Change Procedure
Any changes to the documented scope after contract signing MUST be submitted in writing and formally approved by both parties before implementation.
BR-CR-02
Impact Assessment
All approved Change Requests SHALL be assessed for impact on timeline and cost, with formal agreement before proceeding.
BR-CR-03
Separate Billing
Features or modifications beyond the original Statement of Work SHALL be billed separately as additional project phases or Change Requests.

BR-CR-04
Documentation Update
Approved changes SHALL result in updates to this SRS document and any affected technical documentation.
5.4 Intellectual Property Rights
BR-IP-01
Source Code Ownership
Upon receipt of final payment, complete ownership of source code, assets, and project-specific documentation SHALL transfer to the client (SchooliAt Technologies Pvt Ltd).
BR-IP-02
Vendor-Retained Rights
The vendor (NextinVision) retains ownership of generic libraries, frameworks, reusable components, and intellectual property not specifically developed for this project.
BR-IP-03
License to Client
The client receives a perpetual, irrevocable license to use, modify, and distribute the delivered System for their business purposes.
BR-IP-04
Third-Party Components
The System MAY include third-party open-source libraries under their respective licenses, which shall be documented and disclosed to the client.

5.5 Confidentiality & Data Protection
BR-NDA-01
Confidential Information
Both parties SHALL maintain confidentiality of: student and parent data, source code, system credentials, business documents, and design materials.
BR-NDA-02
Data Handling
The vendor SHALL NOT retain copies of production data after project completion unless required for support purposes with explicit client approval.
BR-NDA-03
Access Control
Development team access to client systems and data SHALL be restricted to personnel directly involved in the project and revoked upon project completion.
BR-NDA-04
Breach Notification
Any suspected or actual breach of confidentiality or data security SHALL be reported to the client within 24 hours of discovery.
5.6 Acceptance Criteria & Testing
BR-ACC-01
Feature Completeness
All modules and features documented in this SRS SHALL be implemented and demonstrated to be functional before final acceptance.
BR-ACC-02
User Acceptance Testing
The client SHALL conduct User Acceptance Testing (UAT) on a staging or production-ready environment to validate system functionality against requirements.
BR-ACC-03
Defect Resolution
Critical and high-priority defects identified during UAT SHALL be resolved before final acceptance and go-live approval.
BR-ACC-04
Performance Validation
System performance SHALL meet the defined non-functional requirements under expected load conditions during UAT.
BR-ACC-05
Acceptance Sign-off
Formal written acceptance SHALL be obtained from the client's authorized representative before triggering the final payment milestone.
BR-ACC-06
Known Limitations
Any known limitations or deferred features SHALL be documented and acknowledged by both parties before acceptance.



5.7 Training & Knowledge Transfer
BR-TRAIN-01
Administrator Training
The vendor SHALL provide training to school administrators on system configuration, user management, and key administrative functions.
BR-TRAIN-02
Training Format
Training MAY be conducted remotely via video conferencing or in-person as agreed, with training materials provided in written or video format.
BR-TRAIN-03
Documentation Delivery
User manuals, administrator guides, and technical documentation SHALL be delivered as part of the final handover package.
5.8 Support & Maintenance Period
BR-SUPP-01
Support Duration
Post-deployment support SHALL be provided for 45 calendar days from the go-live date.
BR-SUPP-02
Support Scope
Support includes bug fixes, performance optimization, and clarification of system functionality, limited to a maximum of 80 hours of effort.
BR-SUPP-03
Support Exclusions
Support does NOT include new feature development, training of additional users, or issues caused by client modifications to code or infrastructure.
BR-SUPP-04
Extended Support
Support beyond 45 days or 80 hours SHALL be negotiated separately under a maintenance agreement with defined terms and pricing.
5.9 Termination Conditions
BR-TERM-01
Termination Notice
Either party MAY terminate the agreement with 30 calendar days written notice to the other party.
BR-TERM-02
Payment for Completed Work
Upon termination, the client SHALL pay for all work completed and accepted up to the termination date.
BR-TERM-03
Deliverable Handover
Upon termination, the vendor SHALL deliver all completed work, source code, and documentation in their current state to the client.


BR-TERM-04
Termination for Breach
Either party MAY terminate immediately for material breach by the other party if the breach is not cured within 15 days of written notice.
Appendix A: Requirement Traceability Matrix
The Requirement Traceability Matrix (RTM) maps each functional requirement to its source in the contract document and its implementation status. This matrix will be maintained throughout the project lifecycle to ensure complete coverage of contractual obligations.
Note: The detailed RTM will be developed during project planning and maintained as a living document throughout development.
Appendix B: Glossary of Terms
Additional domain-specific terms and technical terminology used throughout the System are defined in the main document Section 1.4. This appendix is reserved for any extended definitions required during implementation.
Appendix C: Open Issues and Assumptions
This section will be populated during requirements review sessions to capture any open questions, assumptions requiring validation, or decisions pending from the client.
Current Status: All requirements are derived from the signed contract dated January 26, 2026. No open issues are identified at the time of this SRS creation.

Document Approval and Sign-off
By signing below, the parties acknowledge that this Software Requirements Specification accurately represents the requirements for the SchooliAt School ERP / School Management Platform project and will serve as the baseline for development, testing, and acceptance.
Role	Name & Signature	Date
Client Project Manager		
Client Technical Lead		
Vendor Project Manager		
Vendor Technical Architect		

Version Control:
This document version: 1.0
Date: January 27, 2026


