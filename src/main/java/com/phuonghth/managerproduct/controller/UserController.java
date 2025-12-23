package com.phuonghth.managerproduct.controller;

import com.phuonghth.managerproduct.core.util.JwtUtil;
import com.phuonghth.managerproduct.dto.request.CreateUserRequest;
import com.phuonghth.managerproduct.dto.request.UpdateUserRequest;
import com.phuonghth.managerproduct.entity.UserEntity;
import com.phuonghth.managerproduct.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;


    public UserController(UserRepository userRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    @GetMapping()
    public ResponseEntity<List<UserEntity>> getTeacher() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<UserEntity> createTeacher(@RequestBody CreateUserRequest createUserRequest) {
        final UserEntity userEntity = new UserEntity();

        userEntity.setEmail(createUserRequest.getEmail());
        userEntity.setPassword(encoder.encode(createUserRequest.getPassword()));
        userEntity.setFullName(createUserRequest.getFullName());

        return ResponseEntity.ok(userRepository.save(userEntity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserEntity> updateTeacher(@PathVariable Long id, @RequestBody UpdateUserRequest updateUserRequest) {
        final UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Can find teacher with id: " + id));
        user.setFullName(updateUserRequest.getFullName());
        user.setTitle(updateUserRequest.getTitle());
        user.setFaculty(updateUserRequest.getFaculty());
        user.setEmail(updateUserRequest.getEmail());
        user.setTeacherCode(updateUserRequest.getTeacherCode());
        user.setUsername(updateUserRequest.getUsername());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Can find teacher with id: " + id));
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
