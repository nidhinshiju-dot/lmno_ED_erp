package com.schoolerp.core.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubstitutionDto {
    private String id;
    private String date;
    private String classId;
    private String className;
    private String blockId;
    private String blockName;
    private String subjectId;
    private String subjectName;
    private String originalTeacherId;
    private String originalTeacherName;
    private String substituteTeacherId;
    private String substituteTeacherName;
    private String status;
    private String reason;
}
