CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    address VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    website VARCHAR,
    tenant_id VARCHAR UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS academic_years (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

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

CREATE TABLE IF NOT EXISTS campuses (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    address VARCHAR,
    tenant_id VARCHAR
);

CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    academic_year VARCHAR NOT NULL,
    grade_level INTEGER,
    branch VARCHAR,
    tenant_id VARCHAR
);

CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    class_id VARCHAR,
    teacher_id VARCHAR,
    max_students INTEGER DEFAULT 40
);

CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    employee_id VARCHAR UNIQUE,
    name VARCHAR NOT NULL,
    department VARCHAR NOT NULL,
    designation VARCHAR NOT NULL,
    role VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    status VARCHAR DEFAULT 'ACTIVE'
);

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

CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    class_id VARCHAR,
    exam_date DATE,
    total_marks INTEGER DEFAULT 100,
    status VARCHAR DEFAULT 'SCHEDULED'
);

CREATE TABLE IF NOT EXISTS exam_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    description TEXT,
    tenant_id VARCHAR
);

CREATE TABLE IF NOT EXISTS exam_template_subjects (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    template_id VARCHAR NOT NULL,
    subject_code VARCHAR NOT NULL,
    day_offset INTEGER DEFAULT 0,
    total_marks INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS exam_schedules (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    exam_id VARCHAR NOT NULL,
    subject_id VARCHAR NOT NULL,
    exam_date DATE,
    start_time TIME,
    end_time TIME
);

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

CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id VARCHAR,
    section_id VARCHAR,
    date DATE,
    status VARCHAR,
    remarks VARCHAR
);

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

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR,
    title VARCHAR,
    message TEXT,
    type VARCHAR,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
