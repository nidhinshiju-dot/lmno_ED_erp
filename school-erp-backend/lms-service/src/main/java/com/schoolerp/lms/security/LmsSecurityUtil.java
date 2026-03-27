package com.schoolerp.lms.security;

import com.schoolerp.lms.context.RequestContext;
import com.schoolerp.lms.entity.Course;
import com.schoolerp.lms.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class LmsSecurityUtil {

    @Autowired
    private CourseRepository courseRepository;

    public void requireTenant() {
        RequestContext context = RequestContext.getContext();
        if (context == null || context.getTenantId() == null || context.getTenantId().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenant context is required");
        }
    }

    public void requireAdmin() {
        RequestContext context = RequestContext.getContext();
        if (context == null || !"ADMIN".equalsIgnoreCase(context.getUserRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Requires ADMIN role");
        }
    }

    public void requireStudentSelf(String studentId) {
        RequestContext context = RequestContext.getContext();
        if (context == null || !"STUDENT".equalsIgnoreCase(context.getUserRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Requires STUDENT role");
        }
        if (studentId == null || !studentId.equals(context.getStudentId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot access data of another student");
        }
    }

    public void requireTeacherForCourse(String courseId) {
        requireTenant();
        RequestContext context = RequestContext.getContext();
        if (context == null || !"TEACHER".equalsIgnoreCase(context.getUserRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Requires TEACHER role");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!context.getStaffId().equals(course.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this course");
        }
    }
}
