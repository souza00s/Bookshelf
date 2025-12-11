package com.bookshelf.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user; // destinatário

    @Column(nullable = false)
    private String type; // PAYMENT_CONFIRMED, SHIPPING_CONFIRMED, INFO

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private boolean readFlag = false;

    private Long bookId;
    private String bookTitle;
    private Double amount; // valor do frete
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;
    private Boolean reserved; // indica se o livro foi reservado no momento do pagamento

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
