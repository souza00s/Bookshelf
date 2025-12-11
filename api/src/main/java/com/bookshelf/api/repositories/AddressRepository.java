package com.bookshelf.api.repositories;

import com.bookshelf.api.models.Address;
import com.bookshelf.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
}
