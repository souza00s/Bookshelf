package com.bookshelf.api.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageDTO {
    // --- CAMPO ADICIONADO AQUI ---
    private Long conversationId; // ID da conversa à qual a mensagem pertence
    private Long senderId;
    private String content;
    private String timestamp; // Este campo pode até ser removido, pois geramos o timestamp no backend
}