package com.bookshelf.api.controllers;

import com.bookshelf.api.dtos.BookResponseDTO;
import com.bookshelf.api.models.Book;
import com.bookshelf.api.models.User;
import com.bookshelf.api.models.BookStatus;
import com.bookshelf.api.repositories.BookRepository;
import com.bookshelf.api.repositories.UserRepository;
import com.bookshelf.api.repositories.ConversationRepository;
import com.bookshelf.api.repositories.PixKeyRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.bookshelf.api.services.EmailService;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
@CrossOrigin
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private PixKeyRepository pixKeyRepository;

    @Autowired
    private EmailService emailService;

    @Getter
    @Setter
    public static class BookDTO {
        private String title;
        private String author;
        private String coverUrl;
        private String description;
        private String genre;
        private String condition;
        private boolean deliveryLocalPickup;
        private boolean deliveryShipping;
        private boolean available; // <-- NOME CORRIGIDO AQUI
        private Long ownerId;
    }

    // --- Payloads auxiliares ---
    @Getter @Setter
    public static class MarkPaidPayload {
        private Long buyerId;
        private String buyerName;
        private String amount; // texto formatado (ex: R$ 35,90)
    }

    @Getter @Setter
    public static class MarkShippedPayload {
    private String buyerEmail;
    private String buyerName;
    private String trackingCode;
    private Long buyerId; // opcional: servidor resolve email quando presente
    }

    @PostMapping
    public ResponseEntity<?> addBook(@RequestBody BookDTO bookDTO, @AuthenticationPrincipal User authUser) {
        Long effectiveOwnerId = (authUser != null) ? authUser.getId() : bookDTO.getOwnerId();
        if (effectiveOwnerId == null) {
            return ResponseEntity.badRequest().body("ownerId is required (or provide Bearer token)");
        }
        Optional<User> ownerOpt = userRepository.findById(effectiveOwnerId);
        if (ownerOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Owner not found with id: " + effectiveOwnerId);
        }
        User owner = ownerOpt.get();

        // Restrição 1: precisa ter ao menos 1 chave PIX (legacy pixKey não vazia ou coleção pixKeys > 0)
        // Considera: legacy pixKey pode conter múltiplas chaves concatenadas por "||" e a tabela relacional
        boolean hasAnyPix = false;
        if (owner.getPixKey() != null && !owner.getPixKey().isBlank()) {
            String[] tokens = owner.getPixKey().split("\\|\\|");
            for (String t : tokens) {
                if (t != null && !t.trim().isEmpty()) { hasAnyPix = true; break; }
            }
        }
        if (!hasAnyPix) {
            long cnt = pixKeyRepository.countByUser(owner);
            hasAnyPix = cnt > 0;
        }
        if (!hasAnyPix) {
            return ResponseEntity.badRequest().body("Usuário precisa cadastrar ao menos uma chave PIX antes de anunciar um livro.");
        }

        // Restrição 2: precisa ter ao menos 1 endereço com CEP
        boolean hasAddressWithCep = owner.getAddresses() != null && owner.getAddresses().stream()
            .anyMatch(a -> a.getCep() != null && !a.getCep().isBlank());
        if (!hasAddressWithCep) {
            return ResponseEntity.badRequest().body("Usuário precisa cadastrar ao menos um endereço com CEP antes de doar um livro.");
        }

        Book newBook = new Book();
        newBook.setTitle(bookDTO.getTitle());
        newBook.setAuthor(bookDTO.getAuthor());
        newBook.setCoverUrl(bookDTO.getCoverUrl());
        newBook.setDescription(bookDTO.getDescription());
        newBook.setGenre(bookDTO.getGenre());
        newBook.setCondition(bookDTO.getCondition());
        newBook.setDeliveryLocalPickup(bookDTO.isDeliveryLocalPickup());
        newBook.setDeliveryShipping(bookDTO.isDeliveryShipping());
        newBook.setAvailable(bookDTO.isAvailable()); // <-- NOME CORRIGIDO AQUI
    newBook.setOwner(owner);

        try {
            Book savedBook = bookRepository.save(newBook);
            BookResponseDTO responseDTO = new BookResponseDTO(savedBook);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to save book: " + e.getMessage());
        }
    }

    // --- NOVO: marcar pagamento confirmado (chamado pela página shipping-fee após escolher PIX e confirmar) ---
    @PostMapping("/{id}/mark-paid")
    @Transactional
    public ResponseEntity<?> markPaid(@PathVariable long id,
                                      @RequestBody MarkPaidPayload payload,
                                      @AuthenticationPrincipal User authUser) {
    if (payload == null) {
            return ResponseEntity.badRequest().body("Parâmetros inválidos");
        }
    Book book = bookRepository.findById(id).orElse(null);
        if (book == null) {
            return ResponseEntity.notFound().build();
        }
        // Apenas o comprador logado deve conseguir acionar; se não tiver auth, permite legado
    // Oculta o livro da listagem e marca como inativo
        book.setAvailable(false);
    // Também aplica status para compatibilidade com novo campo enum
    try { book.setStatus(BookStatus.RESERVED); } catch (Exception ignored) {}
        bookRepository.save(book);

        // Email para o vendedor
        User owner = book.getOwner();
        if (owner != null && owner.getEmail() != null && !owner.getEmail().isBlank()) {
            emailService.sendOrderPaidToSeller(owner.getEmail(), owner.getName(), book.getTitle(), payload.getAmount(), payload.getBuyerName());
        }
        return ResponseEntity.ok().build();
    }

    // --- NOVO: confirmar envio (chamado na aba notifications pelo vendedor) ---
    @PostMapping("/{id}/mark-shipped")
    public ResponseEntity<?> markShipped(@PathVariable long id,
                                         @RequestBody MarkShippedPayload payload,
                                         @AuthenticationPrincipal User authUser) {
    if (payload == null) {
            return ResponseEntity.badRequest().body("Parâmetros inválidos");
        }
    Book book = bookRepository.findById(id).orElse(null);
        if (book == null) {
            return ResponseEntity.notFound().build();
        }
        // Email para o comprador: se não veio e-mail, resolve pelo buyerId
        String toEmail = payload.getBuyerEmail();
        String buyerName = payload.getBuyerName();
        if ((toEmail == null || toEmail.isBlank()) && payload.getBuyerId() != null) {
            Long buyerId = payload.getBuyerId();
            var buyerOpt = userRepository.findById(buyerId.longValue());
            if (buyerOpt.isPresent()) {
                var buyer = buyerOpt.get();
                toEmail = (buyer.getEmail() != null && !buyer.getEmail().isBlank()) ? buyer.getEmail() : toEmail;
                if (buyerName == null || buyerName.isBlank()) buyerName = buyer.getName();
            }
        }
        if (toEmail != null && !toEmail.isBlank()) {
            emailService.sendOrderShippedToBuyer(toEmail, buyerName, book.getTitle(), payload.getTrackingCode());
        }
        return ResponseEntity.ok().build();
    }

    // --- NOVO: reanunciar (reativa o anúncio, remove estado de comprado) ---
    @PostMapping("/{id}/reanunciar")
    @Transactional
    public ResponseEntity<?> reannounce(@PathVariable long id, @AuthenticationPrincipal User authUser) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) {
            return ResponseEntity.notFound().build();
        }
    book.setAvailable(true);
    try { book.setStatus(BookStatus.AVAILABLE); } catch (Exception ignored) {}
        bookRepository.save(book);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<BookResponseDTO>> getAllBooks() {
        List<Book> books = bookRepository.findAll();
        List<BookResponseDTO> bookDTOs = books.stream()
                .map(BookResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookDTOs);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<BookResponseDTO>> getMyBooks(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        List<Book> books = bookRepository.findByOwner_Id(user.getId());
        List<BookResponseDTO> bookDTOs = books.stream()
                .map(BookResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> getBookById(@PathVariable long id) {
        return bookRepository.findById(id)
                .map(book -> ResponseEntity.ok(new BookResponseDTO(book)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponseDTO> updateBook(@PathVariable long id, @RequestBody Book bookDetails, @AuthenticationPrincipal User authUser) {
        return bookRepository.findById(id)
                .map(existingBook -> {
                    if (authUser == null || existingBook.getOwner() == null || !existingBook.getOwner().getId().equals(authUser.getId())) {
                        return ResponseEntity.status(403).<BookResponseDTO>build();
                    }
                    existingBook.setTitle(bookDetails.getTitle());
                    existingBook.setAuthor(bookDetails.getAuthor());
                    existingBook.setCoverUrl(bookDetails.getCoverUrl());
                    existingBook.setCondition(bookDetails.getCondition());
                    existingBook.setGenre(bookDetails.getGenre());
                    existingBook.setDescription(bookDetails.getDescription());
                    existingBook.setDeliveryLocalPickup(bookDetails.isDeliveryLocalPickup());
                    existingBook.setDeliveryShipping(bookDetails.isDeliveryShipping());
                    existingBook.setAvailable(bookDetails.isAvailable());
                    if (bookDetails.getStatus() != null) {
                        existingBook.setStatus(bookDetails.getStatus());
                        // manter compatibilidade com boolean
                        existingBook.setAvailable(bookDetails.getStatus() == com.bookshelf.api.models.BookStatus.AVAILABLE);
                    }
                    Book updatedBook = bookRepository.save(existingBook);
                    return ResponseEntity.ok(new BookResponseDTO(updatedBook));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookResponseDTO> patchStatus(@PathVariable long id, @RequestParam("status") String status, @AuthenticationPrincipal User authUser) {
        var opt = bookRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        var book = opt.get();
        if (authUser == null || book.getOwner() == null || !book.getOwner().getId().equals(authUser.getId())) {
            return ResponseEntity.status(403).<BookResponseDTO>build();
        }
        try {
            var newStatus = com.bookshelf.api.models.BookStatus.valueOf(status);
            book.setStatus(newStatus);
            book.setAvailable(newStatus == com.bookshelf.api.models.BookStatus.AVAILABLE);
            bookRepository.save(book);
            return ResponseEntity.ok(new BookResponseDTO(book));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteBook(@PathVariable long id, @AuthenticationPrincipal User authUser) {
        return bookRepository.findById(id)
            .map(book -> {
                if (authUser == null || book.getOwner() == null || !book.getOwner().getId().equals(authUser.getId())) {
                    return ResponseEntity.status(403).build();
                }
                var convs = conversationRepository.findByBook_Id(book.getId());
                if (!convs.isEmpty()) {
                    conversationRepository.deleteAll(convs); // Messages are orphanRemoval in Conversation
                }
                bookRepository.delete(book);
                return ResponseEntity.noContent().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}