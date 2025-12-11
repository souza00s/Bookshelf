package com.bookshelf.api.dtos;

import com.bookshelf.api.models.Conversation;
import com.bookshelf.api.models.Message;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class ConversationResponseDTO {
    private Long id;
    private BookResponseDTO book;
    private List<UserResponseDTO> participants;
    private List<MessageResponseDTO> messages;
    private LocalDateTime createdAt;

    public ConversationResponseDTO(Conversation conversation) {
        this.id = conversation.getId();
        this.book = new BookResponseDTO(conversation.getBook());
        this.createdAt = conversation.getCreatedAt();

        if (conversation.getParticipants() != null) {
            this.participants = conversation.getParticipants().stream().map(participant -> {
                UserResponseDTO dto = new UserResponseDTO();
                dto.setId(participant.getId());
                dto.setName(participant.getName());
                dto.setAvatarUrl(participant.getAvatarUrl());
                return dto;
            }).collect(Collectors.toList());
        }

        if (conversation.getMessages() != null) {
            this.messages = conversation.getMessages().stream()
                .sorted(Comparator.comparing(Message::getTimestamp)) // Garante a ordem
                .map(MessageResponseDTO::new)
                .collect(Collectors.toList());
        }
    }
}