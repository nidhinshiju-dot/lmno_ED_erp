package com.schoolerp.core.repository;

import com.schoolerp.core.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolRepository extends JpaRepository<School, String> {
}
