package com.bookshelf.api.repositories;

import com.bookshelf.api.models.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
	List<Book> findByOwner_Id(Long ownerId);
}