package com.schoolerp.core.dto;

import lombok.Data;
import java.util.List;

@Data
public class LabGroupDto {
    private String id;
    private String name;
    private List<String> roomIds; // To pass associated room IDs easily
}
