package com.phuonghth.managerproduct.repository;

import com.phuonghth.managerproduct.entity.StudentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<StudentEntity, Long> {

    boolean existsByStudentCode(String studentCode);

    Optional<StudentEntity> findByStudentCode(String studentCode);
}
