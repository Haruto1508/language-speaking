package com.linguatalk.service;

import com.linguatalk.domain.ProficiencyLevel;
import com.linguatalk.domain.Role;
import com.linguatalk.domain.User;
import com.linguatalk.dto.AuthDto;
import com.linguatalk.exception.BadRequestException;
import com.linguatalk.repository.UserRepository;
import com.linguatalk.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .targetLanguage(request.getTargetLanguage() != null ? request.getTargetLanguage() : "KO")
                .targetLevel(request.getTargetLevel() != null ?
                        ProficiencyLevel.valueOf(request.getTargetLevel().toUpperCase()) :
                        ProficiencyLevel.BEGINNER)
                .streakCount(1)
                .dailyGoalMinutes(15)
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenForEmail(user.getEmail());

        return AuthDto.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return AuthDto.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            // Return or create default demo user if unauthenticated in dev
            return userRepository.findByEmail("learner@linguatalk.com")
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    public AuthDto.UserDto getCurrentUserDto() {
        User user = getCurrentUser();
        return user != null ? mapToUserDto(user) : null;
    }

    public AuthDto.UserDto mapToUserDto(User user) {
        return AuthDto.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .targetLanguage(user.getTargetLanguage())
                .targetLevel(user.getTargetLevel() != null ? user.getTargetLevel().name() : "BEGINNER")
                .streakCount(user.getStreakCount())
                .dailyGoalMinutes(user.getDailyGoalMinutes())
                .build();
    }
}
