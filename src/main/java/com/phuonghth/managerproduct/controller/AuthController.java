package com.phuonghth.managerproduct.controller;

import com.phuonghth.managerproduct.core.util.JwtUtil;
import com.phuonghth.managerproduct.dto.request.LoginRequest;
import com.phuonghth.managerproduct.dto.request.RegisterRequest;
import com.phuonghth.managerproduct.dto.response.AuthResponse;
import com.phuonghth.managerproduct.entity.RoleEntity;
import com.phuonghth.managerproduct.entity.UserEntity;
import com.phuonghth.managerproduct.repository.RoleRepository;
import com.phuonghth.managerproduct.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest loginRequest) {
        final UserEntity userEntity = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!encoder.matches(loginRequest.getPassword(), userEntity.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
            );
        }

        final String token = jwtUtil.generateToken(userEntity.getEmail());
        final AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(token);
        authResponse.setType("Bearer");
        authResponse.setEmail(userEntity.getEmail());
        authResponse.setFullName(userEntity.getFullName());
        authResponse.setRole(userEntity.getRole().getName());
        authResponse.setUsername(userEntity.getUsername());
        authResponse.setTeacherCode(userEntity.getTeacherCode());
        authResponse.setFaculty(userEntity.getFaculty());

        return authResponse;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email đã được đăng ký");
        }

        String baseUsername =
                registerRequest.getEmail().substring(0, registerRequest.getEmail().indexOf("@"));

        String username = baseUsername;
        int count = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + count;
            count++;
        }

        final UserEntity userEntity = new UserEntity();
        userEntity.setEmail(registerRequest.getEmail());
        userEntity.setPassword(encoder.encode(registerRequest.getPassword()));
        // Set default role
        final RoleEntity roleEntity = roleRepository.findByName("ROLE_USER").orElseThrow(() -> new RuntimeException("Role not found"));
        userEntity.setRole(roleEntity);
        userEntity.setUsername(username);

        userRepository.save(userEntity);

        final String token = jwtUtil.generateToken(userEntity.getEmail());
        final AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(token);
        authResponse.setType("Bearer");
        authResponse.setEmail(userEntity.getEmail());
        authResponse.setFullName(userEntity.getFullName());
        authResponse.setRole(userEntity.getRole().getName());
        authResponse.setUsername(userEntity.getUsername());
        return authResponse;
    }
}
