-- ════════════════════════════════════════════════════════════════════════════
-- School ERP — UAT Seed Data
-- Runs automatically when Postgres container starts (init-db mounted)
-- ════════════════════════════════════════════════════════════════════════════


-- ── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Create Tenant Schema ──────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS sunrise;
SET search_path TO sunrise, public;

-- ════════════════════════════════════════════════════════════════════════════
-- 1. SCHOOL (Tenant: Sunrise Public School)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    address VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    website VARCHAR,
    tenant_id VARCHAR UNIQUE NOT NULL
);

INSERT INTO schools (id, name, address, phone, email, website, tenant_id) VALUES
('sch-001', 'Sunrise Public School', '42, MG Road, Bengaluru, Karnataka 560001',
 '+91-80-4567-8900', 'admin@sunriseschool.in', 'www.sunriseschool.in', 'sunrise');

-- ════════════════════════════════════════════════════════════════════════════
-- 2. ACADEMIC YEARS
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS academic_years (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO academic_years (id, name, start_date, end_date, is_current, is_active) VALUES
('ay-2024', '2024-2025', '2024-06-01', '2025-03-31', false, true),
('ay-2025', '2025-2026', '2025-06-01', '2026-03-31', true,  true);

-- ════════════════════════════════════════════════════════════════════════════
-- 3. SCHOOL SETTINGS
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS school_settings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_id VARCHAR UNIQUE NOT NULL,
    school_name VARCHAR,
    timezone VARCHAR DEFAULT 'Asia/Kolkata',
    language VARCHAR DEFAULT 'en',
    currency VARCHAR DEFAULT 'INR',
    date_format VARCHAR DEFAULT 'DD/MM/YYYY',
    grading_scale VARCHAR DEFAULT 'A+=90,A=80,B+=70,B=60,C=50,F=0',
    working_days VARCHAR DEFAULT 'MON,TUE,WED,THU,FRI,SAT'
);

INSERT INTO school_settings (id, tenant_id, school_name, timezone, language, currency, date_format)
VALUES ('ss-001', 'sunrise', 'Sunrise Public School', 'Asia/Kolkata', 'en', 'INR', 'DD/MM/YYYY');

-- ════════════════════════════════════════════════════════════════════════════
-- 4. CAMPUSES
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS campuses (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    address VARCHAR,
    tenant_id VARCHAR
);

INSERT INTO campuses (id, name, address, tenant_id) VALUES
('camp-001', 'Main Campus',   '42, MG Road, Bengaluru', 'sunrise'),
('camp-002', 'North Branch',  '15, Hebbal, Bengaluru',  'sunrise');

-- ════════════════════════════════════════════════════════════════════════════
-- 5. CLASSES
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS school_classes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    grade_level INTEGER,
    tenant_id VARCHAR
);

INSERT INTO school_classes (id, name, grade_level, tenant_id) VALUES
('cls-08', 'Class 8',  8,  'sunrise'),
('cls-09', 'Class 9',  9,  'sunrise'),
('cls-10', 'Class 10', 10, 'sunrise'),
('cls-11', 'Class 11', 11, 'sunrise'),
('cls-12', 'Class 12', 12, 'sunrise');

-- ════════════════════════════════════════════════════════════════════════════
-- 6. SECTIONS
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    class_id VARCHAR,
    teacher_id VARCHAR,
    max_students INTEGER DEFAULT 40
);

INSERT INTO sections (id, name, class_id, teacher_id, max_students) VALUES
('sec-10a', 'A', 'cls-10', 'stf-001', 40),
('sec-10b', 'B', 'cls-10', 'stf-002', 40),
('sec-11a', 'A', 'cls-11', 'stf-003', 35),
('sec-12a', 'A', 'cls-12', 'stf-004', 35);

-- ════════════════════════════════════════════════════════════════════════════
-- 7. STAFF (Super Admin + Teachers + Accountant)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    department VARCHAR NOT NULL,
    designation VARCHAR NOT NULL,
    role VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    status VARCHAR DEFAULT 'ACTIVE'
);

INSERT INTO staff (id, user_id, name, department, designation, role, email, phone, status) VALUES
-- School Admin
('stf-000', 'usr-admin',  'Priya Sharma',       'Administration', 'School Principal',   'ADMIN',      'admin@sunriseschool.in',   '+91-9876543200', 'ACTIVE'),
-- Teachers
('stf-001', 'usr-t001',   'Rajesh Kumar',       'Science',        'Senior Teacher',     'TEACHER',    'rajesh@sunriseschool.in',  '+91-9876543201', 'ACTIVE'),
('stf-002', 'usr-t002',   'Anitha Nair',        'Mathematics',    'Teacher',            'TEACHER',    'anitha@sunriseschool.in',  '+91-9876543202', 'ACTIVE'),
('stf-003', 'usr-t003',   'Mohammed Farhan',    'English',        'Teacher',            'TEACHER',    'farhan@sunriseschool.in',  '+91-9876543203', 'ACTIVE'),
('stf-004', 'usr-t004',   'Deepa Venkatesh',    'Social Science', 'Teacher',            'TEACHER',    'deepa@sunriseschool.in',   '+91-9876543204', 'ACTIVE'),
('stf-005', 'usr-t005',   'Suresh Pillai',      'Computer Sci',   'Teacher',            'TEACHER',    'suresh@sunriseschool.in',  '+91-9876543205', 'ACTIVE'),
-- Accountant
('stf-006', 'usr-acc',    'Kavitha Reddy',      'Finance',        'Accountant',         'ACCOUNTANT', 'accounts@sunriseschool.in','+91-9876543206', 'ACTIVE');

-- ════════════════════════════════════════════════════════════════════════════
-- 8. SUBJECTS
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    code VARCHAR UNIQUE NOT NULL,
    description VARCHAR,
    class_id VARCHAR,
    teacher_id VARCHAR,
    status VARCHAR DEFAULT 'ACTIVE',
    syllabus_url VARCHAR,
    syllabus_name VARCHAR
);

INSERT INTO subjects (id, name, code, description, class_id, teacher_id, status) VALUES
('sub-phy',  'Physics',       'PHY10',  'Study of matter and energy',           'cls-10', 'stf-001', 'ACTIVE'),
('sub-chem', 'Chemistry',     'CHEM10', 'Study of chemical reactions',          'cls-10', 'stf-001', 'ACTIVE'),
('sub-math', 'Mathematics',   'MATH10', 'Algebra, Geometry, Statistics',        'cls-10', 'stf-002', 'ACTIVE'),
('sub-eng',  'English',       'ENG10',  'Language, Literature, Writing',        'cls-10', 'stf-003', 'ACTIVE'),
('sub-ssc',  'Social Science','SSC10',  'History, Civics, Geography',           'cls-10', 'stf-004', 'ACTIVE'),
('sub-cs',   'Computer Sci',  'CS10',   'Programming, Digital Literacy',        'cls-10', 'stf-005', 'ACTIVE'),
('sub-bio',  'Biology',       'BIO11',  'Study of living organisms',            'cls-11', 'stf-001', 'ACTIVE'),
('sub-eco',  'Economics',     'ECO12',  'Micro and Macro Economics',            'cls-12', 'stf-004', 'ACTIVE');

-- ════════════════════════════════════════════════════════════════════════════
-- 9. STUDENTS
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    admission_number VARCHAR UNIQUE,
    date_of_birth DATE,
    gender VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    address VARCHAR,
    class_id VARCHAR,
    section_id VARCHAR,
    status VARCHAR DEFAULT 'ACTIVE',
    roll_number INTEGER
);

INSERT INTO students (id, user_id, first_name, last_name, admission_number, date_of_birth, gender, phone, email, class_id, section_id, status, roll_number) VALUES
-- Class 10A
('stu-001', 'usr-s001', 'Arjun',    'Mehta',       'SRS/2025/001', '2010-03-15', 'MALE',   '+91-8765430001', 'arjun@student.in',    'cls-10', 'sec-10a', 'ACTIVE', 1),
('stu-002', 'usr-s002', 'Priya',    'Nair',        'SRS/2025/002', '2010-07-22', 'FEMALE', '+91-8765430002', 'priya@student.in',    'cls-10', 'sec-10a', 'ACTIVE', 2),
('stu-003', 'usr-s003', 'Ravi',     'Shankar',     'SRS/2025/003', '2010-01-10', 'MALE',   '+91-8765430003', 'ravi@student.in',     'cls-10', 'sec-10a', 'ACTIVE', 3),
('stu-004', 'usr-s004', 'Sneha',    'Patel',       'SRS/2025/004', '2010-09-05', 'FEMALE', '+91-8765430004', 'sneha@student.in',    'cls-10', 'sec-10a', 'ACTIVE', 4),
('stu-005', 'usr-s005', 'Karthik',  'Rajan',       'SRS/2025/005', '2010-11-30', 'MALE',   '+91-8765430005', 'karthik@student.in',  'cls-10', 'sec-10a', 'ACTIVE', 5),
('stu-006', 'usr-s006', 'Divya',    'Krishnamurthy','SRS/2025/006','2010-05-18', 'FEMALE', '+91-8765430006', 'divya@student.in',    'cls-10', 'sec-10a', 'ACTIVE', 6),
('stu-007', 'usr-s007', 'Rahul',    'Verma',       'SRS/2025/007', '2010-08-25', 'MALE',   '+91-8765430007', 'rahul@student.in',    'cls-10', 'sec-10a', 'ACTIVE', 7),
('stu-008', 'usr-s008', 'Ananya',   'Singh',       'SRS/2025/008', '2010-04-12', 'FEMALE', '+91-8765430008', 'ananya@student.in',   'cls-10', 'sec-10a', 'ACTIVE', 8),
-- Class 10B
('stu-009', 'usr-s009', 'Vikram',   'Bose',        'SRS/2025/009', '2010-06-03', 'MALE',   '+91-8765430009', 'vikram@student.in',   'cls-10', 'sec-10b', 'ACTIVE', 1),
('stu-010', 'usr-s010', 'Kavitha',  'Subramaniam', 'SRS/2025/010', '2010-12-20', 'FEMALE', '+91-8765430010', 'kavitha@student.in',  'cls-10', 'sec-10b', 'ACTIVE', 2),
-- Class 11A
('stu-011', 'usr-s011', 'Aman',     'Gupta',       'SRS/2025/011', '2009-02-14', 'MALE',   '+91-8765430011', 'aman@student.in',     'cls-11', 'sec-11a', 'ACTIVE', 1),
('stu-012', 'usr-s012', 'Pooja',    'Iyer',        'SRS/2025/012', '2009-08-08', 'FEMALE', '+91-8765430012', 'pooja@student.in',    'cls-11', 'sec-11a', 'ACTIVE', 2),
-- Class 12A
('stu-013', 'usr-s013', 'Nikhil',   'Saxena',      'SRS/2025/013', '2008-03-25', 'MALE',   '+91-8765430013', 'nikhil@student.in',   'cls-12', 'sec-12a', 'ACTIVE', 1),
('stu-014', 'usr-s014', 'Shreya',   'Mishra',      'SRS/2025/014', '2008-11-11', 'FEMALE', '+91-8765430014', 'shreya@student.in',   'cls-12', 'sec-12a', 'ACTIVE', 2);

-- ════════════════════════════════════════════════════════════════════════════
-- 10. EXAMS
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    class_id VARCHAR,
    exam_date DATE,
    total_marks INTEGER DEFAULT 100,
    status VARCHAR DEFAULT 'SCHEDULED'
);

INSERT INTO exams (id, name, class_id, exam_date, total_marks, status) VALUES
('exam-001', 'Unit Test 1 — Term 1',    'cls-10', '2025-08-10', 50,  'PUBLISHED'),
('exam-002', 'Mid-Term Examination',    'cls-10', '2025-09-20', 100, 'PUBLISHED'),
('exam-003', 'Unit Test 2 — Term 2',    'cls-10', '2025-11-05', 50,  'SCHEDULED'),
('exam-004', 'Annual Examination',      'cls-10', '2026-01-15', 100, 'SCHEDULED');

-- ════════════════════════════════════════════════════════════════════════════
-- 11. EXAM RESULTS (for published exams)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS exam_results (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    exam_id VARCHAR,
    student_id VARCHAR,
    marks_obtained INTEGER,
    grade VARCHAR,
    remarks VARCHAR,
    class_rank INTEGER,
    total_students INTEGER
);

INSERT INTO exam_results (id, exam_id, student_id, marks_obtained, grade, class_rank, total_students) VALUES
-- Mid-Term Exam — Class 10A results
('er-001', 'exam-002', 'stu-001', 88, 'A+', 1, 8),
('er-002', 'exam-002', 'stu-002', 85, 'A',  2, 8),
('er-003', 'exam-002', 'stu-003', 76, 'B+', 4, 8),
('er-004', 'exam-002', 'stu-004', 91, 'A+', 1, 8),
('er-005', 'exam-002', 'stu-005', 63, 'B',  6, 8),
('er-006', 'exam-002', 'stu-006', 79, 'B+', 3, 8),
('er-007', 'exam-002', 'stu-007', 55, 'C',  7, 8),
('er-008', 'exam-002', 'stu-008', 72, 'B',  5, 8);

-- ════════════════════════════════════════════════════════════════════════════
-- 12. ATTENDANCE (last 2 weeks)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id VARCHAR,
    section_id VARCHAR,
    date DATE,
    status VARCHAR,
    remarks VARCHAR
);

INSERT INTO attendance (id, student_id, section_id, date, status) VALUES
-- 2026-03-02 (Mon)
('att-0301', 'stu-001', 'sec-10a', '2026-03-02', 'PRESENT'),
('att-0302', 'stu-002', 'sec-10a', '2026-03-02', 'PRESENT'),
('att-0303', 'stu-003', 'sec-10a', '2026-03-02', 'ABSENT'),
('att-0304', 'stu-004', 'sec-10a', '2026-03-02', 'PRESENT'),
('att-0305', 'stu-005', 'sec-10a', '2026-03-02', 'LATE'),
-- 2026-03-03 (Tue)
('att-0311', 'stu-001', 'sec-10a', '2026-03-03', 'PRESENT'),
('att-0312', 'stu-002', 'sec-10a', '2026-03-03', 'ABSENT'),
('att-0313', 'stu-003', 'sec-10a', '2026-03-03', 'PRESENT'),
('att-0314', 'stu-004', 'sec-10a', '2026-03-03', 'PRESENT'),
('att-0315', 'stu-005', 'sec-10a', '2026-03-03', 'PRESENT'),
-- 2026-03-04 (Wed)
('att-0321', 'stu-001', 'sec-10a', '2026-03-04', 'PRESENT'),
('att-0322', 'stu-002', 'sec-10a', '2026-03-04', 'PRESENT'),
('att-0323', 'stu-003', 'sec-10a', '2026-03-04', 'PRESENT'),
('att-0324', 'stu-004', 'sec-10a', '2026-03-04', 'ABSENT'),
('att-0325', 'stu-005', 'sec-10a', '2026-03-04', 'PRESENT'),
-- 2026-03-05 (Thu)
('att-0331', 'stu-001', 'sec-10a', '2026-03-05', 'PRESENT'),
('att-0332', 'stu-002', 'sec-10a', '2026-03-05', 'PRESENT'),
('att-0333', 'stu-003', 'sec-10a', '2026-03-05', 'LATE'),
('att-0334', 'stu-004', 'sec-10a', '2026-03-05', 'PRESENT'),
('att-0335', 'stu-005', 'sec-10a', '2026-03-05', 'PRESENT'),
-- 2026-03-06 (Fri)
('att-0341', 'stu-001', 'sec-10a', '2026-03-06', 'PRESENT'),
('att-0342', 'stu-002', 'sec-10a', '2026-03-06', 'PRESENT'),
('att-0343', 'stu-003', 'sec-10a', '2026-03-06', 'PRESENT'),
('att-0344', 'stu-004', 'sec-10a', '2026-03-06', 'PRESENT'),
('att-0345', 'stu-005', 'sec-10a', '2026-03-06', 'ABSENT');

-- ════════════════════════════════════════════════════════════════════════════
-- 13. ANNOUNCEMENTS
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR NOT NULL,
    content TEXT,
    scope VARCHAR DEFAULT 'SCHOOL',
    target_id VARCHAR,
    created_by VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    priority VARCHAR DEFAULT 'NORMAL',
    active BOOLEAN DEFAULT true,
    publish_status VARCHAR DEFAULT 'PUBLISHED',
    publish_at TIMESTAMP
);

INSERT INTO announcements (id, title, content, scope, created_by, priority, publish_status) VALUES
('ann-001', 'Annual Sports Day — March 20, 2026',
 'All students are requested to participate in the Annual Sports Day on March 20, 2026. Events include 100m, 200m, relay, long jump, and team sports. Registration forms available from the PE department.',
 'SCHOOL', 'stf-000', 'HIGH', 'PUBLISHED'),
('ann-002', 'Parent-Teacher Meeting — March 14, 2026',
 'Parent-Teacher meeting is scheduled for March 14, 2026 (Saturday) from 10:00 AM to 1:00 PM. All parents are requested to attend and discuss their ward''s performance.',
 'SCHOOL', 'stf-000', 'HIGH', 'PUBLISHED'),
('ann-003', 'Mid-Term Results Published',
 'Mid-Term examination results for all classes have been published. Students and parents can view results from the app or web portal.',
 'SCHOOL', 'stf-000', 'NORMAL', 'PUBLISHED'),
('ann-004', 'Class 10A — Supplementary Science Class',
 'Extra science classes for Class 10A will be held every Saturday from 9:00 AM to 11:00 AM starting March 15.',
 'CLASS', 'stf-001', 'NORMAL', 'PUBLISHED'),
('ann-005', 'School Fee Reminder — Q4 Fees Due',
 'This is a reminder that Q4 fees are due by March 31, 2026. Pay via the school portal or visit the accounts office.',
 'SCHOOL', 'stf-006', 'HIGH', 'PUBLISHED');

-- ════════════════════════════════════════════════════════════════════════════
-- 14. NOTIFICATIONS
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR,
    title VARCHAR,
    message TEXT,
    type VARCHAR,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
('notif-001', 'usr-s001', 'Attendance Alert',    'You were marked LATE on March 5, 2026.',                    'ATTENDANCE',    false),
('notif-002', 'usr-s003', 'Attendance Alert',    'You were marked ABSENT on March 2, 2026.',                  'ATTENDANCE',    false),
('notif-003', 'usr-s001', 'Result Published',    'Your Mid-Term result is now available. Score: 88/100.',     'EXAM',          false),
('notif-004', 'usr-admin', 'New Student Joined', 'Nikhil Saxena (SRS/2025/013) has been enrolled in 12A.',   'SYSTEM',        true);

-- ════════════════════════════════════════════════════════════════════════════
-- 15. USERS (Shared Authentication Table in Public Schema)
-- ════════════════════════════════════════════════════════════════════════════
SET search_path TO public;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,  -- BCrypt hashed
    role VARCHAR NOT NULL,
    tenant_id VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR
);

-- Passwords are BCrypt hash of literal shown in comment
-- Super Admin password: SuperAdmin@2026
-- Admin password:       Admin@2026
-- Teacher passwords:    Teacher@2026
-- Student passwords:    Student@2026
INSERT INTO users (id, email, password, role, tenant_id, first_name, last_name) VALUES
-- Platform Super Admin (no tenant)
('usr-super', 'superadmin@schoolerp.app',
 '$2a$12$RKNdGSHQrxh.pZjJY1SHiu7RAWxp2MbCMQxY9mvg5NWgxJJk.o63e', 'SUPER_ADMIN', NULL, 'Super', 'Admin'),
-- School Admin
('usr-admin', 'admin@sunriseschool.in',
 '$2a$12$OFV7M0W0RbkR6o2p1MiMOOLYstfS7.AXG1B1nTHhN4Gq4N.pJCJWa', 'ADMIN', 'sunrise', 'Priya', 'Sharma'),
-- Teachers
('usr-t001', 'rajesh@sunriseschool.in',
 '$2a$12$Dn7f5VJsIwYkzRJ9hMv0OOqIL.b/nSu3TKqQxLUyMhZPpbpNYGxkO', 'TEACHER', 'sunrise', 'Rajesh', 'Kumar'),
('usr-t002', 'anitha@sunriseschool.in',
 '$2a$12$Dn7f5VJsIwYkzRJ9hMv0OOqIL.b/nSu3TKqQxLUyMhZPpbpNYGxkO', 'TEACHER', 'sunrise', 'Anitha', 'Nair'),
('usr-t003', 'farhan@sunriseschool.in',
 '$2a$12$Dn7f5VJsIwYkzRJ9hMv0OOqIL.b/nSu3TKqQxLUyMhZPpbpNYGxkO', 'TEACHER', 'sunrise', 'Mohammed', 'Farhan'),
('usr-t004', 'deepa@sunriseschool.in',
 '$2a$12$Dn7f5VJsIwYkzRJ9hMv0OOqIL.b/nSu3TKqQxLUyMhZPpbpNYGxkO', 'TEACHER', 'sunrise', 'Deepa', 'Venkatesh'),
('usr-t005', 'suresh@sunriseschool.in',
 '$2a$12$Dn7f5VJsIwYkzRJ9hMv0OOqIL.b/nSu3TKqQxLUyMhZPpbpNYGxkO', 'TEACHER', 'sunrise', 'Suresh', 'Pillai'),
-- Students
('usr-s001', 'arjun@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Arjun', 'Mehta'),
('usr-s002', 'priya@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Priya', 'Nair'),
('usr-s003', 'ravi@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Ravi', 'Shankar'),
('usr-s004', 'sneha@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Sneha', 'Patel'),
('usr-s005', 'karthik@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Karthik', 'Rajan'),
('usr-s006', 'divya@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Divya', 'Krishnamurthy'),
('usr-s007', 'rahul@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Rahul', 'Verma'),
('usr-s008', 'ananya@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Ananya', 'Singh'),
('usr-s011', 'aman@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Aman', 'Gupta'),
('usr-s013', 'nikhil@student.in',
 '$2a$12$TfxY8/kc6FHMsjAL7N3oBuH1Hbp5D8g2e.sZaVFNfQIAfDi7LBKbq', 'STUDENT', 'sunrise', 'Nikhil', 'Saxena');

-- ════════════════════════════════════════════════════════════════════════════
-- Done ✅
-- ════════════════════════════════════════════════════════════════════════════
SELECT 'Seed data inserted successfully!' AS status;
