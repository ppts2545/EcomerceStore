package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.Store;
import com.example.E_commerceStore.WebApp.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    // === ที่ StoreController เรียกอยู่ ===
    public Store createStore(Store store) {
        // ถ้ามีการ validate owner หรือ fields อื่น ๆ ใส่เพิ่มได้
        return storeRepository.save(store);
    }

    public List<Store> getStoresByOwnerId(Long ownerId) {
        return storeRepository.findByOwner_Id(ownerId);
    }

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    public Optional<Store> getStoreById(Long id) {
        return storeRepository.findById(id);
    }

    public Store updateStore(Store store) {
        if (store.getId() == null) {
            throw new IllegalArgumentException("Store id is required for update");
        }
        Store existing = storeRepository.findById(store.getId())
                .orElseThrow(() -> new RuntimeException("Store not found"));

        // คัดลอกฟิลด์ที่อนุญาตให้อัปเดต (ปรับให้ตรงกับ entity ของคุณ)
        existing.setName(store.getName());
        existing.setDescription(store.getDescription());
        existing.setLogoUrl(store.getLogoUrl());
        existing.setPhone(store.getPhone());
        existing.setEmail(store.getEmail());
        existing.setOwner(store.getOwner()); // ถ้าอนุญาตให้เปลี่ยน owner

        return storeRepository.save(existing);
    }

    public void deleteStore(Long id) {
        storeRepository.deleteById(id);
    }
}