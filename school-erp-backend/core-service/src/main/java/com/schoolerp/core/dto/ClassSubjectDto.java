package com.schoolerp.core.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSubjectDto {
    private String id;
    private String classId;
    private String subjectId;
    private String subjectName;
    private String subjectCode;
    private String subjectType;
    private String teacherId;
    private String teacherName;
    private Integer periodsPerWeek;
}
