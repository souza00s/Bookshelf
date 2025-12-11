package com.bookshelf.api.models;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "books")
@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String author;

    @Column(columnDefinition = "MEDIUMTEXT")
    @JsonAlias({"coverImage"})
    private String coverUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String genre;

    @Column(name = "`condition`")
    private String condition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties("books")
    private User owner;

    private boolean deliveryLocalPickup;
    private boolean deliveryShipping;

    // status substitui available
    @Enumerated(EnumType.STRING)
    private BookStatus status = BookStatus.AVAILABLE;

    // campo legacy para compatibilidade temporária
    private boolean available = true;
}