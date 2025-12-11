package com.bookshelf.api.dtos;

import com.bookshelf.api.models.Message;
import com.bookshelf.api.models.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MessageResponseDTO {

    private Long id;
    private String content;
    // Enviar como String (ISO-8601) para evitar necessidade de JavaTimeModule no Socket.IO
    private String timestamp;
    private Long conversationId;
    private SenderDTO sender;

    // DTO aninhado para o remetente, para evitar enviar dados sensíveis
    @Getter
    @Setter
    public static class SenderDTO {
        private Long id;
        private String name;
        private String avatarUrl;

        public SenderDTO(User user) {
            this.id = user.getId();
            this.name = user.getName();
            this.avatarUrl = user.getAvatarUrl();
        }
    }

    // Construtor que converte a Entidade Message para este DTO
    public MessageResponseDTO(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
    // Converte LocalDateTime para String ISO (ex.: 2025-10-01T13:10:30.457)
    LocalDateTime ts = message.getTimestamp();
    this.timestamp = ts != null ? ts.toString() : null;
        this.conversationId = message.getConversation().getId();
        this.sender = new SenderDTO(message.getSender());
    }
}