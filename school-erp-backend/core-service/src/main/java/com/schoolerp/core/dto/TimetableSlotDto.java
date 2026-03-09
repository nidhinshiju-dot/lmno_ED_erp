package com.schoolerp.core.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimetableSlotDto {
    private String id;
    private String classId;
    private String className;
    private String dayId;
    private String dayName;
    private Integer dayOrder;
    private String blockId;
    private String blockName;
    private String startTime;
    private String endTime;
    private String classSubjectTeacherId;
    private String subjectId;
    private String subjectName;
    private String teacherId;
    private String teacherName;
    private String roomId;
    private String roomName;
    private Boolean isLocked;
}
