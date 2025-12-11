package com.bookshelf.api.dtos;

import com.bookshelf.api.models.User;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class UserDetailDTO {
    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private String description;
    private String pixKey; // legacy single
    private List<String> pixKeys; // new list
    private List<String> favoriteGenres;
    private List<BookResponseDTO> books; 
    private List<AddressDTO> addresses;

    public UserDetailDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.avatarUrl = user.getAvatarUrl();
        this.description = user.getDescription();
    this.pixKey = user.getPixKey();
        if (user.getPixKeys() != null) {
            this.pixKeys = user.getPixKeys().stream().map(pk -> pk.getValue()).collect(Collectors.toList());
        }
        this.favoriteGenres = user.getFavoriteGenres();
        
        if (user.getBooks() != null) {
            this.books = user.getBooks().stream()
                             .map(BookResponseDTO::new)
                             .collect(Collectors.toList());
        }
        if (user.getAddresses() != null) {
            this.addresses = user.getAddresses().stream().map(AddressDTO::new).collect(Collectors.toList());
        }
    }
}

@Getter
@Setter
class AddressDTO {
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

    public AddressDTO(com.bookshelf.api.models.Address a) {
        this.id = a.getId();
        this.label = a.getLabel();
        this.cep = a.getCep();
        this.street = a.getStreet();
        this.number = a.getNumber();
        this.complement = a.getComplement();
        this.neighborhood = a.getNeighborhood();
        this.city = a.getCity();
        this.state = a.getState();
        this.country = a.getCountry();
    }
}