package com.bookshelf.api.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponseDTO {
    private Long id;
    private String name;
    private String avatarUrl;
    private String pixKey;
}