package com.schoolerp.core.repository;

import com.schoolerp.core.entity.WorkingDay;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkingDayRepository extends JpaRepository<WorkingDay, String> {
    List<WorkingDay> findAllByOrderByDayOrderAsc();

    List<WorkingDay> findByIsActiveTrueOrderByDayOrderAsc();
}
