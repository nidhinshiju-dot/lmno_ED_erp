package com.schoolerp.core.repository;

import com.schoolerp.core.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampusRepository extends JpaRepository<Campus, String> {
    List<Campus> findByActiveTrue();
}
