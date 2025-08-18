package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByOwnerId(Long ownerId);
    Store findByName(String name);
}
