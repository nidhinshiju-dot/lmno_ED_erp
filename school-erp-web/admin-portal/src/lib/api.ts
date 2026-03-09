const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("erp_token");

    const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (response.status === 401) {
        // Session expired
        localStorage.removeItem("erp_token");
        localStorage.removeItem("erp_user");
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    // 204 No Content (DELETE) — no body to parse
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Service Wrappers
export const StudentService = {
    getAll: () => fetchWithAuth("/students"),
    getById: (id: string) => fetchWithAuth(`/students/${id}`),
};

export const StaffService = {
    getAll: () => fetchWithAuth("/staff"),
    create: (staffData: Record<string, unknown>) => fetchWithAuth("/staff", { method: "POST", body: JSON.stringify(staffData) }),
};

export const ClassService = {
    getAll: () => fetchWithAuth("/classes"),
    create: (classData: Record<string, unknown>) => fetchWithAuth("/classes", { method: "POST", body: JSON.stringify(classData) }),
    assignTeacher: (classId: string, staffId: string) => fetchWithAuth(`/classes/${classId}/assign-teacher?staffId=${staffId}`, { method: "PATCH" }),
    delete: (classId: string) => fetchWithAuth(`/classes/${classId}`, { method: "DELETE" }),
};

export const AssistantService = {
    chat: (message: string) => fetchWithAuth("/assistant/chat", { method: "POST", body: JSON.stringify({ message }) }),
};

export const CourseService = {
    getAll: () => fetchWithAuth("/courses"),
    getByTeacherId: (teacherId: string) => fetchWithAuth(`/courses/teacher/${teacherId}`),
    create: (courseData: Record<string, unknown>) => fetchWithAuth("/courses", { method: "POST", body: JSON.stringify(courseData) }),
    getLessons: (courseId: string) => fetchWithAuth(`/lessons/course/${courseId}`),
};

export const AuthService = {
    login: async (credentials: Record<string, unknown>) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        });
        if (!res.ok) throw new Error("Invalid credentials");
        return res.json();
    }
};

export const FeeService = {
    getAll: () => fetchWithAuth("/fees"),
    getById: (id: string) => fetchWithAuth(`/fees/${id}`),
    create: (feeData: Record<string, unknown>) => fetchWithAuth("/fees", { method: "POST", body: JSON.stringify(feeData) }),
};

export const InvoiceService = {
    getAll: () => fetchWithAuth("/invoices"),
    getById: (id: string) => fetchWithAuth(`/invoices/${id}`),
    create: (invoiceData: Record<string, unknown>) => fetchWithAuth("/invoices", { method: "POST", body: JSON.stringify(invoiceData) }),
    recordPayment: (invoiceId: string, paymentData: Record<string, unknown>) => fetchWithAuth(`/invoices/${invoiceId}/pay`, { method: "POST", body: JSON.stringify(paymentData) }),
};

export const TimetableService = {
    getAll: () => fetchWithAuth("/timetable"),
    getByClass: (classId: string) => fetchWithAuth(`/timetable/class/${classId}`),
    create: (data: Record<string, unknown>) => fetchWithAuth("/timetable", { method: "POST", body: JSON.stringify(data) }),
};

export const TeacherService = {
    getProfile: (userId: string) => fetchWithAuth(`/teacher/profile/${userId}`),
    getMyClasses: (staffId: string) => fetchWithAuth(`/teacher/${staffId}/classes`),
    getMyStudents: (staffId: string) => fetchWithAuth(`/teacher/${staffId}/students`),
};

export const ParentService = {
    getChildren: (parentId: string) => fetchWithAuth(`/students/parent/${parentId}`),
};

export const SubjectService = {
    getAll: () => fetchWithAuth("/subjects"),
    getByClass: (classId: string) => fetchWithAuth(`/subjects/class/${classId}`),
    create: (data: Record<string, unknown>) => fetchWithAuth("/subjects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) => fetchWithAuth(`/subjects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchWithAuth(`/subjects/${id}`, { method: "DELETE" }),
};

export const AttendanceService = {
    getByClass: (classId: string, date: string) => fetchWithAuth(`/attendance/class/${classId}?date=${date}`),
    getByStudent: (studentId: string) => fetchWithAuth(`/attendance/student/${studentId}`),
    markAttendance: (records: Record<string, unknown>[]) => fetchWithAuth("/attendance", { method: "POST", body: JSON.stringify(records) }),
};

export const ExamService = {
    getAll: () => fetchWithAuth("/exams"),
    getByClass: (classId: string) => fetchWithAuth(`/exams/class/${classId}`),
    create: (data: Record<string, unknown>) => fetchWithAuth("/exams", { method: "POST", body: JSON.stringify(data) }),
    getResults: (examId: string) => fetchWithAuth(`/exams/${examId}/results`),
    saveResults: (examId: string, results: Record<string, unknown>[]) => fetchWithAuth(`/exams/${examId}/results`, { method: "POST", body: JSON.stringify(results) }),
    publishResults: (examId: string) => fetchWithAuth(`/exams/${examId}/publish`, { method: "POST" }),
    getSchedules: (examId: string) => fetchWithAuth(`/exams/${examId}/schedules`),
};

export const ExamTemplateService = {
    getAll: () => fetchWithAuth("/exam-templates"),
    create: (data: Record<string, unknown>) => fetchWithAuth("/exam-templates", { method: "POST", body: JSON.stringify(data) }),
    getSubjects: (templateId: string) => fetchWithAuth(`/exam-templates/${templateId}/subjects`),
    addSubject: (templateId: string, data: Record<string, unknown>) => fetchWithAuth(`/exam-templates/${templateId}/subjects`, { method: "POST", body: JSON.stringify(data) }),
    generateExam: (templateId: string, payload: Record<string, unknown>) => fetchWithAuth(`/exam-templates/${templateId}/generate`, { method: "POST", body: JSON.stringify(payload) }),
};

export const AnnouncementService = {
    getAll: () => fetchWithAuth("/announcements"),
    getByScope: (scope: string) => fetchWithAuth(`/announcements/scope/${scope}`),
    create: (data: Record<string, unknown>) => fetchWithAuth("/announcements", { method: "POST", body: JSON.stringify(data) }),
    deactivate: (id: string) => fetchWithAuth(`/announcements/${id}`, { method: "DELETE" }),
};

export const NotificationService = {
    getByUser: (userId: string) => fetchWithAuth(`/notifications/user/${userId}`),
    getUnread: (userId: string) => fetchWithAuth(`/notifications/user/${userId}/unread`),
    getUnreadCount: (userId: string) => fetchWithAuth(`/notifications/user/${userId}/count`),
    markAsRead: (id: string) => fetchWithAuth(`/notifications/${id}/read`, { method: "PATCH" }),
    broadcast: (payload: Record<string, unknown>) => fetchWithAuth(`/notifications/broadcast`, { method: "POST", body: JSON.stringify(payload) }),
};

export const FileService = {
    getAll: () => fetchWithAuth("/files"),
    getByCategory: (category: string) => fetchWithAuth(`/files/category/${category}`),
    create: (data: Record<string, unknown>) => fetchWithAuth("/files", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => fetchWithAuth(`/files/${id}`, { method: "DELETE" }),
};

export const ReportService = {
    attendance: (classId: string, from: string, to: string) => fetchWithAuth(`/reports/attendance?classId=${classId}&from=${from}&to=${to}`),
    exam: (examId: string) => fetchWithAuth(`/reports/exam/${examId}`),
    student: (studentId: string) => fetchWithAuth(`/reports/student/${studentId}`),
};

export const StudentManagementService = {
    updateStatus: (id: string, status: string) => fetchWithAuth(`/students/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    transfer: (id: string, classId: string) => fetchWithAuth(`/students/${id}/transfer`, { method: "POST", body: JSON.stringify({ classId }) }),
    promote: (fromClassId: string, toClassId: string) => fetchWithAuth(`/students/promote`, { method: "POST", body: JSON.stringify({ fromClassId, toClassId }) }),
    getByStatus: (status: string) => fetchWithAuth(`/students/status/${status}`),
    getByClass: (classId: string) => fetchWithAuth(`/students/class/${classId}`),
};

export const SchoolManagementService = {
    getCampuses: () => fetchWithAuth(`/school-management/campuses`),
    createCampus: (data: Record<string, unknown>) => fetchWithAuth(`/school-management/campuses`, { method: "POST", body: JSON.stringify(data) }),
    getCalendar: () => fetchWithAuth(`/school-management/calendar`),
    createEvent: (data: Record<string, unknown>) => fetchWithAuth(`/school-management/calendar`, { method: "POST", body: JSON.stringify(data) }),
    deleteEvent: (id: string) => fetchWithAuth(`/school-management/calendar/${id}`, { method: "DELETE" }),
};

export const ClassSubjectService = {
    getByClass: (classId: string) => fetchWithAuth(`/class-subjects/class/${classId}`),
    assignSubject: (data: Record<string, unknown>) => fetchWithAuth(`/class-subjects`, { method: "POST", body: JSON.stringify(data) }),
    updateAssignment: (id: string, data: Record<string, unknown>) => fetchWithAuth(`/class-subjects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    unassignSubject: (id: string) => fetchWithAuth(`/class-subjects/${id}`, { method: "DELETE" }),
    removeSubjectFromClass: (classId: string, subjectId: string) => fetchWithAuth(`/class-subjects/class/${classId}/subject/${subjectId}`, { method: "DELETE" }),
};

