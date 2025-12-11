package com.bookshelf.api.services;

import com.bookshelf.api.models.PasswordResetToken;
import com.bookshelf.api.models.User;
import com.bookshelf.api.repositories.PasswordResetTokenRepository;
import com.bookshelf.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${password.reset.expirationMinutes:30}")
    private int expirationMinutes;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                EmailService emailService,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void requestReset(String email) {
        Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) {
            throw new IllegalArgumentException("E-mail não cadastrado. Solicitação não permitida.");
        }
        User user = optUser.get();

        // gerar token e código
        String token = UUID.randomUUID().toString();
        String code = String.format("%06d", (int)(Math.random() * 1_000_000));

        PasswordResetToken prt = new PasswordResetToken();
        prt.setUser(user);
        prt.setToken(token);
        prt.setCode(code);
        prt.setExpiresAt(LocalDateTime.now().plusMinutes(expirationMinutes));
        prt.setUsed(false);
        tokenRepository.save(prt);

        // enviar e-mail
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), code);
    }

    @Transactional(readOnly = true)
    public boolean verify(String email, String code) {
        Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) return false;
        User user = optUser.get();
        Optional<PasswordResetToken> opt = tokenRepository.findByCodeAndUserAndUsedFalse(code, user);
        if (opt.isEmpty()) return false;
        PasswordResetToken t = opt.get();
        return t.getExpiresAt().isAfter(LocalDateTime.now());
    }

    @Transactional
    public boolean reset(String email, String code, String newPassword) {
        Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) return false;
        User user = optUser.get();
        Optional<PasswordResetToken> opt = tokenRepository.findByCodeAndUserAndUsedFalse(code, user);
        if (opt.isEmpty()) return false;
        PasswordResetToken t = opt.get();
        if (t.getExpiresAt().isBefore(LocalDateTime.now())) return false;

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        t.setUsed(true);
        tokenRepository.save(t);
        return true;
    }
}