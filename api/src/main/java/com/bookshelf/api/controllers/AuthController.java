package com.bookshelf.api.controllers;

import com.bookshelf.api.dtos.LoginResponseDTO;
import com.bookshelf.api.dtos.UserDetailDTO;
import com.bookshelf.api.models.User;
import com.bookshelf.api.repositories.UserRepository;
import com.bookshelf.api.security.JwtService;
import com.bookshelf.api.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().trim().toLowerCase());
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Erro: O email já está em uso!");
        }
        // hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User registeredUser = authService.register(user);
        return ResponseEntity.ok(new UserDetailDTO(registeredUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginDetails) {
        String providedEmail = loginDetails.getEmail();
        if (providedEmail == null) {
            return ResponseEntity.status(401).body("Utilizador ou senha inválidos.");
        }
        String normalized = providedEmail.trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByEmail(normalized);
        if (userOptional.isEmpty() && !normalized.equals(providedEmail)) {
            // fallback para bases antigas com email salvo sem normalizar
            userOptional = userRepository.findByEmail(providedEmail);
        }
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body("Utilizador ou senha inválidos.");
        }
        User user = userOptional.get();
        boolean matches = passwordEncoder.matches(loginDetails.getPassword(), user.getPassword());
        // Fallback para contas antigas com senha armazenada em texto puro: reencoda no primeiro login
        if (!matches && !looksLikeBCrypt(user.getPassword()) && loginDetails.getPassword() != null
                && loginDetails.getPassword().equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
            matches = true;
        }
        if (!matches) {
            return ResponseEntity.status(401).body("Utilizador ou senha inválidos.");
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("name", user.getName());
        String token = jwtService.generateToken(String.valueOf(user.getId()), claims);
        return ResponseEntity.ok(new LoginResponseDTO(token, user));
    }

    private boolean looksLikeBCrypt(String value) {
        if (value == null) return false;
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }
}