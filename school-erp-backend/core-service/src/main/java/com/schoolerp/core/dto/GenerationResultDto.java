package com.schoolerp.core.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GenerationResultDto {
    private boolean success;
    private int slotsScheduled;
    private int slotsRequired;
    private List<String> conflicts; // human-readable conflict messages
    private String message;
}
