package com.bookshelf.api.mappers;

import com.bookshelf.api.dtos.MessageResponseDTO;
import com.bookshelf.api.models.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public MessageResponseDTO toDto(Message message) {
        if (message == null) {
            return null;
        }
        return new MessageResponseDTO(message);
    }
}