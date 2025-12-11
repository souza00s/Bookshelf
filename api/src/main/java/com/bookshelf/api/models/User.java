package com.bookshelf.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String avatarUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    // Legacy single pixKey deprecated; now use pixKeys collection (remove column later via migration)
    @Column(name = "pix_key")
    private String pixKey; // manter por compatibilidade temporária

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PixKey> pixKeys = new ArrayList<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Book> books;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_favorite_genres", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "genre")
    private List<String> favoriteGenres = new ArrayList<>();
}