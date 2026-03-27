# LMNO ERP Architecture Reference

## 1. Services
*   **auth-service**: Identity, JWT issuance, RBAC.
*   **core-service**: Monolith-lite for primary domains (Students, Staff, Timetable, Attendance, Exams).
*   **fee-service**: Financial tracking (Invoices, Payments).
*   **lms-service**: Learning management (Courses, Assignments, Student Marks, AI).
*   **api-gateway**: Layer 7 reverse proxy, CORS enforcement, centralized routing.

## 2. Roles & Permissions
*   **SUPER_ADMIN**: Platform level. School onboarding, global AI analytics.
*   **ADMIN**: Tenant level. Manages specific school operations, staff, fees, and students.
*   **TEACHER**: Instructional access. Course management, lesson plans, attendance grading.
*   **STUDENT**: Consumer access. Timetable viewing, assignment submission.
*   **PARENT**: Guardian access. Attendance monitoring, fee payment.

## 3. Database Tables mapped to Dependencies
*   **auth-service**: `User`
*   **core-service**: `School`, `SchoolClass`, `Student`, `Staff`, `Parent`, `Attendance`, `Timetable`, `PeriodBlock`, `Subject`, `Room`, `Substitution`, `Exam`, `MessageLog`, `Notification`
    *   *Dependencies*: Strongly coupled internal foreign keys linking students to classes, teachers to timetables, and attendees to dates.
*   **fee-service**: `FeeStructure`, `Invoice`, `Payment`
    *   *Dependencies*: Soft UUID references to `student_id` and `school_id` from core-service to maintain microservice boundaries.
*   **lms-service**: `Course`, `LessonPlan`, `Assignment`, `Syllabus`, `QuestionPaper`, `StudentMark`

## 4. Frontend & Gateway Mapping
*   **Gateway Execution**: `api-gateway` operates independently at `:8080`.
*   **auth-service** (`/api/v1/auth/**`)
*   **core-service** (`/api/v1/students/**`, `/api/v1/schools/**`, `/api/v1/staff/**`, `/api/v1/classes/**`, `/api/v1/attendance/**`, `/api/v1/timetable/**`, `/api/v1/exams/**`)
*   **fee-service** (`/api/v1/fees/**`, `/api/v1/invoices/**`, `/api/v1/payments/**`)
*   **lms-service** (`/api/v1/courses/**`, `/api/v1/assignments/**`, `/api/v1/ai/**`)

**admin-portal (Front-end: localhost:3000)**
*   Routes: `/students`, `/classes`, `/fees`, `/attendance`, `/timetable`, `/exams`, `/teacher-ai`
*   Target APIs: `core-service`, `fee-service`, `lms-service`.

**super-admin-portal (Front-end: localhost:3001)**
*   Routes: `/schools`, `/subscriptions`, `/ai-insights`
*   Target APIs: `core-service` (School Onboarding), `lms-service` (AI Analytics).

## 5. Architecture Flows
*   **Login Flow**: `UI -> Gateway -> auth-service -> Users DB -> Returns JWT Token`
*   **School Creation Flow**: `Super Admin UI -> Gateway -> core-service -> Schools DB`
*   **Fee Payment Flow**: `Parent/Admin UI -> Gateway -> fee-service -> Invoices DB`
*   **AI Chat Flow**: `UI -> Gateway -> lms-service (AiAssistantService) -> External LLM API -> Streams Response`
*   **Class Timetable Flow**: `UI -> Gateway -> core-service -> Joins Timetable + Room + Staff + Subject DB -> Response`

## 6. Local Docker Flow
*   **Traffic**: React (`:3000`) -> Gateway (`localhost:8080`)
*   *Gateway resolves backend via Docker internal networking using injected Environment Variables:*
    *   `/api/v1/auth` -> `http://auth-service:8081`
    *   `/api/v1/students` -> `http://core-service:8083`
*   **Database**: Services connect to `jdbc:postgresql://postgres:5432/school_erp` hosted in `erp-local-postgres`.
*   **Config**: `application-dev.yml` uses `${SERVICE_URL}` provided dynamically by `docker-compose.yml` to override localhost manual defaults.

## 7. Cloud Flow (GCP)
*   **Traffic**: React UI -> GCP Global Load Balancer / API Gateway layer.
*   *Gateway resolves backend via Internal Serverless VPC routing.*
*   **Services**: Cloud Run serverless containers (`api-gateway-xxx.run.app`, `core-service-xxx.run.app`).
*   **Database**: Services seamlessly connect to Managed Cloud SQL via GCP Auth Proxy / Socket Factory built into the pom.xml.
*   **Config**: Defined via `application-prod.yml` mapping Cloud SQL instances and strict CORS arrays.
