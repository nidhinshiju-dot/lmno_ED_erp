package com.schoolerp.lms.controller;

import com.schoolerp.lms.entity.Course;
import com.schoolerp.lms.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Course> getCoursesByTeacherId(@PathVariable("teacherId") String teacherId) {
        return courseService.getCoursesByTeacherId(teacherId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable("id") String id) {
        Optional<Course> course = courseService.getCourseById(id);
        return course.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable String id, @RequestBody Course body) {
        return courseService.getCourseById(id).map(course -> {
            course.setTitle(body.getTitle());
            course.setDescription(body.getDescription());
            course.setStatus(body.getStatus());
            course.setClassId(body.getClassId());
            course.setTeacherId(body.getTeacherId());
            return ResponseEntity.ok(courseService.createCourse(course));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        if (courseService.getCourseById(id).isEmpty()) return ResponseEntity.notFound().build();
        courseService.getCourseById(id).ifPresent(course -> {
            course.setStatus("ARCHIVED");
            courseService.createCourse(course);
        });
        return ResponseEntity.noContent().build();
    }
}

