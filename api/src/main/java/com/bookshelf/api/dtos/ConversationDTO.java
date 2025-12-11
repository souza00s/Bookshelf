package com.bookshelf.api.dtos;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ConversationDTO {
    private String id; // O ID da conversa no Firestore (ex: "user1_user2_book101")
    private BookResponseDTO book;
    private UserResponseDTO otherUser;
    private List<MessageDTO> messages;
}