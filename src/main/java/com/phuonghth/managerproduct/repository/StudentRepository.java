package com.phuonghth.managerproduct.repository;

import com.phuonghth.managerproduct.entity.StudentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<StudentEntity, Long> {

    boolean existsByStudentCode(String studentCode);

    Optional<StudentEntity> findByStudentCode(String studentCode);

    @Query("""
        SELECT s FROM StudentEntity s
        WHERE s.isDeleted = false
    """)
    Page<StudentEntity> findAllNotDeleted(Pageable pageable);


    @Query("""
        SELECT s FROM StudentEntity s
        WHERE s.isDeleted = false
        AND (
            LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(s.studentCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(s.studentClass) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
    """)
    Page<StudentEntity> search(@Param("keyword") String keyword, Pageable pageable);
}
