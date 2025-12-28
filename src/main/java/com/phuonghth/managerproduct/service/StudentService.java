package com.phuonghth.managerproduct.service;

import com.phuonghth.managerproduct.dto.request.StudentRequest;
import com.phuonghth.managerproduct.dto.response.StudentResponse;
import com.phuonghth.managerproduct.entity.StudentEntity;
import com.phuonghth.managerproduct.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public StudentResponse create(StudentRequest request) {
        if (studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new RuntimeException("Student code đã tồn tại");
        }

        StudentEntity entity = new StudentEntity();
        mapToEntity(request, entity);

        return mapToResponse(studentRepository.save(entity));
    }

    public StudentResponse update(Long id, StudentRequest request) {
        StudentEntity entity = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student không tồn tại"));

        if (!entity.getStudentCode().equals(request.getStudentCode())
                && studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new RuntimeException("Student code đã tồn tại");
        }

        mapToEntity(request, entity);
        return mapToResponse(studentRepository.save(entity));
    }

    public StudentResponse getById(Long id) {
        return studentRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Student không tồn tại"));
    }

    public Page<StudentResponse> search(String keyword, Pageable pageable) {
        Page<StudentEntity> page;
        if (keyword == null || keyword.trim().isEmpty()) {
            page = studentRepository.findAllNotDeleted(pageable);
        } else {
            page = studentRepository.search(keyword.trim(), pageable);
        }

        return page.map(this::mapToResponse);
    }

    public void delete(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student không tồn tại");
        }
        studentRepository.deleteById(id);
    }

    private void mapToEntity(StudentRequest request, StudentEntity entity) {
        entity.setStudentCode(request.getStudentCode());
        entity.setName(request.getName());
        entity.setStudentClass(request.getStudentClass());
        entity.setFaculty(request.getFaculty());
        entity.setStatus(request.getStatus());
        entity.setEmail(request.getEmail());
    }

    private StudentResponse mapToResponse(StudentEntity entity) {
        StudentResponse response = new StudentResponse();
        response.setId(entity.getId());
        response.setStudentCode(entity.getStudentCode());
        response.setName(entity.getName());
        response.setStudentClass(entity.getStudentClass());
        response.setFaculty(entity.getFaculty());
        response.setStatus(entity.getStatus());
        response.setEmail(entity.getEmail());
        return response;
    }
}
