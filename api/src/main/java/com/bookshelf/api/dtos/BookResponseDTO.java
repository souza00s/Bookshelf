package com.bookshelf.api.dtos;

import com.bookshelf.api.models.Book;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookResponseDTO {
    private Long id;
    private String title;
    private String author;
    private String coverUrl;
    private String description;
    private String genre;
    private String condition;
    private boolean deliveryLocalPickup;
    private boolean deliveryShipping;

    private boolean available; // legacy
    private String status;

    private UserResponseDTO owner;

    public BookResponseDTO(Book book) {
        this.id = book.getId();
        this.title = book.getTitle();
        this.author = book.getAuthor();
        this.coverUrl = book.getCoverUrl();
        this.description = book.getDescription();
        this.genre = book.getGenre();
        this.condition = book.getCondition();
        this.deliveryLocalPickup = book.isDeliveryLocalPickup();
        this.deliveryShipping = book.isDeliveryShipping();

    this.available = book.isAvailable();
    if (book.getStatus() != null) this.status = book.getStatus().name();

        if (book.getOwner() != null) {
            UserResponseDTO ownerDTO = new UserResponseDTO();
            ownerDTO.setId(book.getOwner().getId());
            ownerDTO.setName(book.getOwner().getName());
            ownerDTO.setAvatarUrl(book.getOwner().getAvatarUrl());
            ownerDTO.setPixKey(book.getOwner().getPixKey());
            this.owner = ownerDTO;
        }
    }
}