-- ==========================================
-- SCHOOL ERP TEST DATA SEED SCRIPT
-- ==========================================
-- Note: This script is intended to be run against the `school_erp` database.

-- 1. AUTH SERVICE (users, roles, user_roles)
INSERT INTO roles (id, name) VALUES ('role-admin', 'ROLE_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES ('role-teacher', 'ROLE_TEACHER') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES ('role-student', 'ROLE_STUDENT') ON CONFLICT DO NOTHING;

-- Passwords are set to 'password' (BCrypt hash)
INSERT INTO users (id, email, password, enabled, tenant_id) VALUES 
('user-admin-1', 'admin@school.app', '$2a$10$wY9gI8R9iK2vXz0FfO.E.ewL8n6OqzPfjC5M8G1C2UoP2WwFZZWqy', true, 'tenant-1'),
('user-teacher-1', 'teacher1@school.app', '$2a$10$wY9gI8R9iK2vXz0FfO.E.ewL8n6OqzPfjC5M8G1C2UoP2WwFZZWqy', true, 'tenant-1'),
('user-teacher-2', 'teacher2@school.app', '$2a$10$wY9gI8R9iK2vXz0FfO.E.ewL8n6OqzPfjC5M8G1C2UoP2WwFZZWqy', true, 'tenant-1'),
('user-student-1', 'student1@school.app', '$2a$10$wY9gI8R9iK2vXz0FfO.E.ewL8n6OqzPfjC5M8G1C2UoP2WwFZZWqy', true, 'tenant-1'),
('user-student-2', 'student2@school.app', '$2a$10$wY9gI8R9iK2vXz0FfO.E.ewL8n6OqzPfjC5M8G1C2UoP2WwFZZWqy', true, 'tenant-1') ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES 
('user-admin-1', 'role-admin'),
('user-teacher-1', 'role-teacher'),
('user-teacher-2', 'role-teacher'),
('user-student-1', 'role-student'),
('user-student-2', 'role-student') ON CONFLICT DO NOTHING;


-- 2. CORE SERVICE (school_classes, sections, students, staff)
INSERT INTO school_classes (id, name, grade_level) VALUES 
('class-10', 'Grade 10', 10),
('class-11', 'Grade 11', 11),
('class-12', 'Grade 12', 12) ON CONFLICT DO NOTHING;

INSERT INTO sections (id, name, capacity, class_id) VALUES 
('section-10a', '10-A', 30, 'class-10'),
('section-10b', '10-B', 30, 'class-10'),
('section-11a', '11-A', 25, 'class-11') ON CONFLICT DO NOTHING;

INSERT INTO students (id, admission_number, name, dob, parent_contact, user_id) VALUES 
('student-rec-1', 'ADM-2026-001', 'Alex Johnson', '2010-05-15', '+1-555-0101', 'user-student-1'),
('student-rec-2', 'ADM-2026-002', 'Samantha Smith', '2010-08-22', '+1-555-0102', 'user-student-2') ON CONFLICT DO NOTHING;

INSERT INTO staff (id, user_id, name, department, designation) VALUES 
('staff-rec-1', 'user-admin-1', 'Alice Admin', 'Administration', 'Principal'),
('staff-rec-2', 'user-teacher-1', 'Mr. Robert Physics', 'Science', 'Senior Teacher'),
('staff-rec-3', 'user-teacher-2', 'Mrs. Linda Math', 'Mathematics', 'Teacher') ON CONFLICT DO NOTHING;


-- 3. LMS SERVICE (courses, lessons, assignments)
INSERT INTO courses (id, title, description, code, teacher_id) VALUES 
('course-phys-10', 'Advanced Physics 10', 'Introduction to mechanics and thermodynamics.', 'PHY-101', 'staff-rec-2'),
('course-math-10', 'Algebra II', 'Advanced algebraic concepts and equations.', 'MAT-102', 'staff-rec-3'),
('course-phys-11', 'Quantum Physics Basics', 'Introductory quantum physics principles.', 'PHY-111', 'staff-rec-2') ON CONFLICT DO NOTHING;

INSERT INTO lessons (id, title, content, sequence_order, course_id) VALUES 
('lesson-1', 'Introduction to Vectors', 'Learn about magnitude and direction.', 1, 'course-phys-10'),
('lesson-2', 'Newton''s Laws', 'The three laws of motion.', 2, 'course-phys-10'),
('lesson-3', 'Solving Quadratic Equations', 'Using the quadratic formula.', 1, 'course-math-10') ON CONFLICT DO NOTHING;

INSERT INTO assignments (id, title, description, due_date, max_score, course_id) VALUES 
('assign-1', 'Vector Addition Worksheet', 'Complete problems 1-20.', '2026-10-15', 100, 'course-phys-10'),
('assign-2', 'Polynomial Factoring', 'Factor all 50 equations.', '2026-10-18', 100, 'course-math-10') ON CONFLICT DO NOTHING;


-- 4. FEE SERVICE (fee_structures, invoices, payments)
INSERT INTO fee_structures (id, name, description, amount, due_date, class_id, academic_year) VALUES 
('fee-10-q1', 'Grade 10 Q1 Tuition', 'First quarter tuition fees for Grade 10.', 15000.00, '2026-04-30', 'class-10', '2026-2027'),
('fee-11-q1', 'Grade 11 Q1 Tuition', 'First quarter tuition fees for Grade 11.', 18000.00, '2026-04-30', 'class-11', '2026-2027'),
('fee-lib-10', 'Library Fee', 'Annual library pass.', 500.00, '2026-05-15', 'class-10', '2026-2027') ON CONFLICT DO NOTHING;

INSERT INTO invoices (id, student_id, fee_structure_id, total_amount, status, issued_date, paid_date) VALUES 
('inv-001', 'student-rec-1', 'fee-10-q1', 15000.00, 'PAID', '2026-04-01', '2026-04-10'),
('inv-002', 'student-rec-2', 'fee-10-q1', 15000.00, 'PENDING', '2026-04-01', NULL),
('inv-003', 'student-rec-1', 'fee-lib-10', 500.00, 'OVERDUE', '2026-05-01', NULL) ON CONFLICT DO NOTHING;

INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, transaction_ref) VALUES 
('pay-001', 'inv-001', 15000.00, 'ONLINE', '2026-04-10', 'TXN-ABC-1234') ON CONFLICT DO NOTHING;

-- END SCRIPT
