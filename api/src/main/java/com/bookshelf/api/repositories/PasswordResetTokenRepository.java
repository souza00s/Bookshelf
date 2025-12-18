package com.bookshelf.api.repositories;

import com.bookshelf.api.models.PasswordResetToken;
import com.bookshelf.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByUserAndUsedFalseOrderByExpiresAtDesc(User user);
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    Optional<PasswordResetToken> findByCodeAndUserAndUsedFalse(String code, User user);
    long deleteByExpiresAtBefore(LocalDateTime instant);
    void deleteByUser(User user);
}