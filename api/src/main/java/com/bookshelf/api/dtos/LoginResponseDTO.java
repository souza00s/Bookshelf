package com.bookshelf.api.dtos;

import com.bookshelf.api.models.User;

public class LoginResponseDTO {
    private String token;
    private UserDetailDTO user;

    public LoginResponseDTO(String token, User user) {
        this.token = token;
        this.user = new UserDetailDTO(user);
    }

    public String getToken() { return token; }
    public UserDetailDTO getUser() { return user; }
}
