package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;       // ✅ ขาดอันนี้
import java.util.Optional;

@Repository                 // ✅ จะใส่หรือไม่ใส่ก็ได้ แต่นี่ใส่ให้ตรงกับ import
public interface StoreRepository extends JpaRepository<Store, Long> {

    // ใช้ได้ก็ต่อเมื่อใน Store มีฟิลด์:
    // @ManyToOne User owner;  แล้วเข้าถึง owner.getId()
    List<Store> findByOwner_Id(Long ownerId);

    Optional<Store> findByName(String name);
}