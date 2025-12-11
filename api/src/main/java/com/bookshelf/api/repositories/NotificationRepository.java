package com.bookshelf.api.repositories;

import com.bookshelf.api.models.Notification;
import com.bookshelf.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    @Query(value = "SELECT * FROM notifications n WHERE n.user_id = :userId " +
        "AND (:cursor IS NULL OR n.id < :cursor) ORDER BY n.id DESC LIMIT :limit", nativeQuery = true)
    List<Notification> scroll(@Param("userId") Long userId, @Param("cursor") Long cursor, @Param("limit") int limit);
}
