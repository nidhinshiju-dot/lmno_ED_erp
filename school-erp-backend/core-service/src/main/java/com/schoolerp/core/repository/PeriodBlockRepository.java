package com.schoolerp.core.repository;

import com.schoolerp.core.entity.PeriodBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PeriodBlockRepository extends JpaRepository<PeriodBlock, String> {
    List<PeriodBlock> findAllByOrderByOrderIndexAsc();

    List<PeriodBlock> findByBlockTypeOrderByOrderIndexAsc(String blockType);
}
