package com.bookshelf.api.controllers;

import com.bookshelf.api.dtos.ConversationResponseDTO;
import com.bookshelf.api.dtos.InitiateConversationRequest;
import com.bookshelf.api.models.Book;
import com.bookshelf.api.models.Conversation;
import com.bookshelf.api.models.User;
import com.bookshelf.api.repositories.BookRepository;
import com.bookshelf.api.repositories.ConversationRepository;
import com.bookshelf.api.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ConversationRepository conversationRepository;

    public MessageController(UserRepository userRepository, BookRepository bookRepository, ConversationRepository conversationRepository) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.conversationRepository = conversationRepository;
    }

    // ... (seus métodos existentes de initiate e get)

    // --- NOVO MÉTODO ADICIONADO AQUI ---
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable long conversationId) {
        // Verifica se a conversa existe antes de tentar excluir
        if (!conversationRepository.existsById(conversationId)) {
            // Retorna 'Not Found' se a conversa não existir
            return ResponseEntity.notFound().build();
        }
        // Exclui a conversa do banco de dados
        conversationRepository.deleteById(conversationId);
        // Retorna uma resposta de sucesso sem conteúdo no corpo
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/conversations/initiate")
    public ResponseEntity<?> initiateConversation(@RequestBody InitiateConversationRequest request) {
        if (request == null || request.getRequesterId() == null || request.getBookOwnerId() == null || request.getBookId() == null) {
            return ResponseEntity.badRequest().body("Parâmetros obrigatórios ausentes.");
        }
        long requesterId = request.getRequesterId();
        long ownerId = request.getBookOwnerId();
        long bookId = request.getBookId();

        List<Long> participantIds = List.of(requesterId, ownerId);
        Optional<Conversation> existingConversation = conversationRepository
            .findByBookAndParticipants(bookId, participantIds, participantIds.size());
        if (existingConversation.isPresent()) {
            return ResponseEntity.ok(Map.of("conversationId", existingConversation.get().getId()));
        }
        User requester = userRepository.findById(requesterId).orElse(null);
        User owner = userRepository.findById(ownerId).orElse(null);
        Book book = bookRepository.findById(bookId).orElse(null);
        if (requester == null || owner == null || book == null) {
            return ResponseEntity.badRequest().body("Utilizador ou livro não encontrado.");
        }
        Conversation newConversation = new Conversation();
        newConversation.setBook(book);
        newConversation.getParticipants().add(requester);
        newConversation.getParticipants().add(owner);
        Conversation savedConversation = conversationRepository.save(newConversation);
        return ResponseEntity.ok(Map.of("conversationId", savedConversation.getId()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponseDTO>> getUserConversations(@RequestParam long userId) {
        List<Conversation> conversations = conversationRepository.findByParticipantId(userId);
        List<ConversationResponseDTO> responseDTOs = conversations.stream()
            .map(ConversationResponseDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }
}