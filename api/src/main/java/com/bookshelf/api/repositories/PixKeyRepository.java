package com.bookshelf.api.repositories;

import com.bookshelf.api.models.PixKey;
import com.bookshelf.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PixKeyRepository extends JpaRepository<PixKey, Long> {
    List<PixKey> findByUser(User user);
    void deleteByUser(User user);
    long countByUser(User user);
}
