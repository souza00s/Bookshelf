package com.bookshelf.api.dtos;

import com.bookshelf.api.models.Notification;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationDTO {
    private Long id;
    private String type;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
    private Long bookId;
    private String bookTitle;
    private Double amount;
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;
    private Boolean reserved;

    public static NotificationDTO from(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.id = n.getId();
        dto.type = n.getType();
        dto.message = n.getMessage();
        dto.read = n.isReadFlag();
        dto.createdAt = n.getCreatedAt();
        dto.bookId = n.getBookId();
        dto.bookTitle = n.getBookTitle();
        dto.amount = n.getAmount();
        dto.buyerId = n.getBuyerId();
        dto.buyerName = n.getBuyerName();
        dto.sellerId = n.getSellerId();
        dto.sellerName = n.getSellerName();
    dto.reserved = n.getReserved();
        return dto;
    }
}
