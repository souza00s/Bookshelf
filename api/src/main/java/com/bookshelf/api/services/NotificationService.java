package com.bookshelf.api.services;

import com.bookshelf.api.dtos.NotificationDTO;
import com.bookshelf.api.dtos.NotificationScrollDTO;
import com.bookshelf.api.models.Notification;
import com.bookshelf.api.models.User;
import com.bookshelf.api.repositories.NotificationRepository;
import com.bookshelf.api.repositories.UserRepository;
import org.springframework.stereotype.Service;
import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SocketIOServer socketServer;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository, SocketIOServer socketServer) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.socketServer = socketServer;
    }

    @Transactional(readOnly = true)
    public NotificationScrollDTO scroll(Long userId, Long cursor, int limit) {
        if (limit <= 0 || limit > 100) limit = 20;
        userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        var list = notificationRepository.scroll(userId, cursor, limit + 1); // pega um a mais para saber se tem mais
        boolean hasMore = list.size() > limit;
        if (hasMore) list = list.subList(0, limit);
        var dtos = list.stream().map(NotificationDTO::from).toList();
        NotificationScrollDTO scrollDto = new NotificationScrollDTO();
        scrollDto.setItems(dtos);
        Long nextCursor = dtos.isEmpty() ? null : dtos.get(dtos.size()-1).getId();
        scrollDto.setNextCursor(nextCursor);
        scrollDto.setHasMore(hasMore);
        return scrollDto;
    }

    @Transactional
    public NotificationDTO createForUser(Long userId, String type, String message, Notification partial) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setMessage(message);
        n.setBookId(partial.getBookId());
        n.setBookTitle(partial.getBookTitle());
        n.setAmount(partial.getAmount());
        n.setBuyerId(partial.getBuyerId());
        n.setBuyerName(partial.getBuyerName());
        n.setSellerId(partial.getSellerId());
        n.setSellerName(partial.getSellerName());
    n.setReserved(partial.getReserved());
        Notification saved = notificationRepository.save(n);
    NotificationDTO dto = NotificationDTO.from(saved);
    // Converter LocalDateTime para String ISO para transporte socket (evita falha Jackson no netty-socketio)
    var transport = new java.util.HashMap<String, Object>();
    transport.put("id", dto.getId());
    transport.put("type", dto.getType());
    transport.put("message", dto.getMessage());
    transport.put("read", dto.isRead());
    transport.put("createdAt", saved.getCreatedAt().toString());
    transport.put("bookId", dto.getBookId());
    transport.put("bookTitle", dto.getBookTitle());
    transport.put("amount", dto.getAmount());
    transport.put("buyerId", dto.getBuyerId());
    transport.put("buyerName", dto.getBuyerName());
    transport.put("sellerId", dto.getSellerId());
    transport.put("sellerName", dto.getSellerName());
    transport.put("reserved", dto.getReserved());
    try { socketServer.getBroadcastOperations().sendEvent("notification:" + userId, transport); } catch (Exception ignored) {}
        return dto;
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> listForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream().map(NotificationDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public void markAllRead(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepository.findByUserOrderByCreatedAtDesc(user).forEach(n -> { n.setReadFlag(true); });
    }

    @Transactional
    public void delete(Long userId, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElseThrow(() -> new RuntimeException("Not found"));
        if (!n.getUser().getId().equals(userId)) throw new RuntimeException("Forbidden");
        notificationRepository.delete(n);
    }
}
