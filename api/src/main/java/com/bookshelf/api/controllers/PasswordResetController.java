package com.bookshelf.api.controllers;

import com.bookshelf.api.services.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/password")
public class PasswordResetController {

    private final PasswordResetService service;

    public PasswordResetController(PasswordResetService service) {
        this.service = service;
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgot(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        try {
            service.requestReset(email);
            return ResponseEntity.ok(Map.of("message", "Código enviado para o e-mail cadastrado."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String code = body.getOrDefault("code", "");
        boolean ok = service.verify(email, code);
        return ok ? ResponseEntity.ok(Map.of("valid", true)) : ResponseEntity.badRequest().body(Map.of("valid", false));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String code = body.getOrDefault("code", "");
        String newPassword = body.getOrDefault("newPassword", "");
        boolean ok = service.reset(email, code, newPassword);
        return ok ? ResponseEntity.ok(Map.of("message", "Senha redefinida")) : ResponseEntity.badRequest().body(Map.of("message", "Código inválido ou expirado"));
    }
}