package com.bookshelf.api.controllers;

import com.bookshelf.api.dtos.UserDetailDTO;
import com.bookshelf.api.models.User;
import com.bookshelf.api.repositories.UserRepository;
import com.bookshelf.api.models.PixKey;
import com.bookshelf.api.models.Address;
import com.bookshelf.api.repositories.MessageRepository;
import com.bookshelf.api.repositories.ConversationRepository;
import com.bookshelf.api.repositories.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

     @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    // PixKeyRepository não é mais necessário; a sincronização acontece via coleção user.pixKeys


    @GetMapping
    public ResponseEntity<List<UserDetailDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDetailDTO> userDTOs = users.stream()
                                            .map(UserDetailDTO::new)
                                            .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDetailDTO> getUserById(@PathVariable long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(new UserDetailDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<UserDetailDTO> updateUser(@PathVariable long id, @RequestBody UpdateUserDTO dto) {
        return userRepository.findById(id)
            .map(user -> {
                if (dto.getName() != null) user.setName(dto.getName());
                user.setDescription(dto.getDescription());
                if (dto.getFavoriteGenres() != null) user.setFavoriteGenres(dto.getFavoriteGenres());
                user.setAvatarUrl(dto.getAvatarUrl());

                // Estratégia de chaves PIX: se pixKeys for enviado (mesmo vazio), substitui totalmente.
                // Caso pixKeys não seja enviado, usa pixKey único (string serializada) se fornecido.
                if (dto.getPixKeys() != null) {
                    List<String> filtered = dto.getPixKeys().stream()
                        .map(s -> s == null ? "" : s.trim())
                        .filter(s -> !s.isEmpty())
                        .toList();
                    // Atualiza string serializada e coleção relacional
                    user.setPixKey(String.join("||", filtered));
                    if (user.getPixKeys() != null) {
                        user.getPixKeys().clear();
                    }
                    for (String v : filtered) {
                        PixKey k = new PixKey();
                        k.setUser(user);
                        k.setValue(v);
                        user.getPixKeys().add(k);
                    }
                } else if (dto.getPixKey() != null) {
                    String concatenated = dto.getPixKey();
                    user.setPixKey(concatenated);
                    List<String> filtered = new java.util.ArrayList<>();
                    for (String raw : concatenated.split("\\|\\|")) {
                        String v = raw == null ? "" : raw.trim();
                        if (!v.isEmpty()) filtered.add(v);
                    }
                    if (user.getPixKeys() != null) {
                        user.getPixKeys().clear();
                    }
                    for (String v : filtered) {
                        PixKey k = new PixKey();
                        k.setUser(user);
                        k.setValue(v);
                        user.getPixKeys().add(k);
                    }
                }

                // Endereços: sincroniza lista completa recebida
                if (dto.getAddresses() != null) {
                    // remove todos os existentes e recria (simplificação)
                    if (user.getAddresses() != null) {
                        user.getAddresses().clear();
                    }
                    for (UpdateUserDTO.AddressPayload ap : dto.getAddresses()) {
                        if (ap == null) continue;
                        Address a = new Address();
                        a.setUser(user);
                        a.setLabel(ap.getLabel());
                        a.setCep(ap.getCep());
                        a.setStreet(ap.getStreet());
                        a.setNumber(ap.getNumber());
                        a.setComplement(ap.getComplement());
                        a.setNeighborhood(ap.getNeighborhood());
                        a.setCity(ap.getCity());
                        a.setState(ap.getState());
                        a.setCountry(ap.getCountry());
                        user.getAddresses().add(a);
                    }
                }

                User saved = userRepository.save(user);
                return ResponseEntity.ok(new UserDetailDTO(saved));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // DTO interno para atualização segura (evita desserializar PixKey diretamente)
    public static class UpdateUserDTO {
        private String name;
        private String description;
        private List<String> favoriteGenres;
        private String avatarUrl;
        private String pixKey;      // formato concatenado opcional
        private List<String> pixKeys; // lista opcional
    private List<AddressPayload> addresses; // novos endereços

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getFavoriteGenres() { return favoriteGenres; }
        public void setFavoriteGenres(List<String> favoriteGenres) { this.favoriteGenres = favoriteGenres; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public String getPixKey() { return pixKey; }
        public void setPixKey(String pixKey) { this.pixKey = pixKey; }
        public List<String> getPixKeys() { return pixKeys; }
        public void setPixKeys(List<String> pixKeys) { this.pixKeys = pixKeys; }
        public List<AddressPayload> getAddresses() { return addresses; }
        public void setAddresses(List<AddressPayload> addresses) { this.addresses = addresses; }

        public static class AddressPayload {
            private Long id;
            private String label;
            private String cep;
            private String street;
            private String number;
            private String complement;
            private String neighborhood;
            private String city;
            private String state;
            private String country;

            public Long getId() { return id; }
            public void setId(Long id) { this.id = id; }
            public String getLabel() { return label; }
            public void setLabel(String label) { this.label = label; }
            public String getCep() { return cep; }
            public void setCep(String cep) { this.cep = cep; }
            public String getStreet() { return street; }
            public void setStreet(String street) { this.street = street; }
            public String getNumber() { return number; }
            public void setNumber(String number) { this.number = number; }
            public String getComplement() { return complement; }
            public void setComplement(String complement) { this.complement = complement; }
            public String getNeighborhood() { return neighborhood; }
            public void setNeighborhood(String neighborhood) { this.neighborhood = neighborhood; }
            public String getCity() { return city; }
            public void setCity(String city) { this.city = city; }
            public String getState() { return state; }
            public void setState(String state) { this.state = state; }
            public String getCountry() { return country; }
            public void setCountry(String country) { this.country = country; }
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable long id) {
        return userRepository.findById(id)
            .map(user -> {
                // 0) Apagar tokens de reset de senha do usuário
                passwordResetTokenRepository.deleteByUser(user);
                
                // 1) Apagar mensagens que o usuário enviou (evita FK em messages.sender_id)
                messageRepository.deleteBySender_Id(id);

                // 2) Remover usuário das conversas (tabela de junção conversation_participants)
                var conversations = conversationRepository.findAllByParticipant(id);
                if (conversations == null) conversations = java.util.Collections.emptyList();
                for (var conv : conversations) {
                    conv.getParticipants().removeIf(u -> u.getId().equals(id));
                }
                if (!conversations.isEmpty()) {
                    conversationRepository.saveAll(conversations);
                }

                // 3) Apagar conversas que ficaram sem participantes (opcional)
                var empty = conversations.stream().filter(c -> c.getParticipants().isEmpty()).toList();
                if (!empty.isEmpty()) {
                    conversationRepository.deleteAll(empty);
                }

                // 4) Livros do usuário já são removidos por cascade em User.books
                //    Apenas garantir estado sincronizado

                // 5) Finalmente, remover o usuário
                if (user != null) {
                    userRepository.delete(user);
                }
                return ResponseEntity.noContent().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}