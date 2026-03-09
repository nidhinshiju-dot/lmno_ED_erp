package com.schoolerp.core.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClassSubjectTeacherDto {
    private String id;
    private String classId;
    private String className;
    private String subjectId;
    private String subjectName;
    private String subjectCode;
    private String teacherId;
    private String teacherName;
    private Integer periodsPerWeek;
    private Integer priority;
}
