package com.bookshelf.api.controllers;

import com.bookshelf.api.dtos.NotificationDTO;
import com.bookshelf.api.dtos.NotificationScrollDTO;
import com.bookshelf.api.models.Notification;
import com.bookshelf.api.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{userId}")
    public List<NotificationDTO> list(@PathVariable long userId) {
        return notificationService.listForUser(userId);
    }

    @GetMapping("/{userId}/scroll")
    public NotificationScrollDTO scroll(@PathVariable long userId,
                                        @RequestParam(required = false) Long cursor,
                                        @RequestParam(defaultValue = "20") int limit) {
        return notificationService.scroll(userId, cursor, limit);
    }

    @PostMapping("/{userId}")
    public NotificationDTO create(@PathVariable long userId, @RequestBody NotificationDTO dto) {
        Notification partial = new Notification();
        partial.setBookId(dto.getBookId());
        partial.setBookTitle(dto.getBookTitle());
        partial.setAmount(dto.getAmount());
        partial.setBuyerId(dto.getBuyerId());
        partial.setBuyerName(dto.getBuyerName());
        partial.setSellerId(dto.getSellerId());
        partial.setSellerName(dto.getSellerName());
    partial.setReserved(dto.getReserved());
        return notificationService.createForUser(userId, dto.getType(), dto.getMessage(), partial);
    }

    @PostMapping("/{userId}/read-all")
    public ResponseEntity<Void> markAllRead(@PathVariable long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/{id}")
    public ResponseEntity<Void> delete(@PathVariable long userId, @PathVariable long id) {
        notificationService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
