package com.bookshelf.api.repositories;

import com.bookshelf.api.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    void deleteBySender_Id(Long senderId);
}