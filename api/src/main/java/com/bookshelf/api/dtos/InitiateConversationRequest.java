package com.bookshelf.api.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InitiateConversationRequest {
    private Long bookId;
    private Long requesterId; // O ID do utilizador que está a solicitar o livro
    private Long bookOwnerId; // O ID do dono do livro
}
