package com.bookshelf.api.services;

import com.bookshelf.api.dtos.MessageDTO;
import com.bookshelf.api.dtos.MessageResponseDTO;
import com.bookshelf.api.mappers.MessageMapper;
import com.bookshelf.api.models.Conversation;
import com.bookshelf.api.models.Message;
import com.bookshelf.api.models.User;
import com.bookshelf.api.repositories.ConversationRepository;
import com.bookshelf.api.repositories.MessageRepository;
import com.bookshelf.api.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;

    public MessageService(MessageRepository messageRepository, ConversationRepository conversationRepository, UserRepository userRepository, MessageMapper messageMapper) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.messageMapper = messageMapper;
    }

    @Transactional
    public MessageResponseDTO processAndSaveMessage(MessageDTO messageDto) {
        // 1. Busca as entidades principais do banco de dados
        Conversation conversation = conversationRepository.findById(messageDto.getConversationId())
            .orElseThrow(() -> new RuntimeException("ERRO CRÍTICO: Conversa não encontrada com id: " + messageDto.getConversationId()));
        User sender = userRepository.findById(messageDto.getSenderId())
            .orElseThrow(() -> new RuntimeException("ERRO CRÍTICO: Remetente não encontrado com id: " + messageDto.getSenderId()));

        // 2. Cria a nova entidade de mensagem
        Message newMessage = new Message();
        newMessage.setSender(sender);
        newMessage.setContent(messageDto.getContent());
        
        // 3. Gerencia a relação bidirecional (a parte mais importante)
        newMessage.setConversation(conversation);
        conversation.getMessages().add(newMessage);

        // 4. Salva a nova mensagem diretamente no repositório de mensagens
        Message savedMessage = messageRepository.save(newMessage);

        // 5. Retorna o DTO da mensagem que foi efetivamente salva
        return messageMapper.toDto(savedMessage);
    }
}