package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.Store;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.service.StoreService;
import com.example.E_commerceStore.WebApp.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.util.Optional;

@RestController
@RequestMapping("/api/stores")

public class StoreController {
    @Autowired
    private StoreService storeService;

    @Autowired
    private UserService userService;


    @PostMapping
    public ResponseEntity<Store> createStore(@RequestBody Store store, @AuthenticationPrincipal OAuth2User principal) {
        // ดึง user ปัจจุบันจาก principal (OAuth2User)
        String email = principal.getAttribute("email");
        com.example.E_commerceStore.WebApp.model.User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        store.setOwner(user);
        Store created = storeService.createStore(store);
        return ResponseEntity.ok(created);
    }
    // ดึงร้านค้าทั้งหมดของ user ปัจจุบัน
    @GetMapping("/my")
    public ResponseEntity<List<Store>> getMyStores(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        com.example.E_commerceStore.WebApp.model.User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<Store> stores = storeService.getStoresByOwnerId(user.getId());
        return ResponseEntity.ok(stores);
    }

    @GetMapping
    public ResponseEntity<List<Store>> getAllStores() {
        return ResponseEntity.ok(storeService.getAllStores());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Store> getStoreById(@PathVariable Long id) {
        Optional<Store> store = storeService.getStoreById(id);
        return store.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Store> updateStore(@PathVariable Long id, @RequestBody Store store) {
        Optional<Store> existingOpt = storeService.getStoreById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        Store existing = existingOpt.get();
        // Only update fields that are present in the request
        existing.setName(store.getName() != null ? store.getName() : existing.getName());
        existing.setDescription(store.getDescription() != null ? store.getDescription() : existing.getDescription());
        existing.setLogoUrl(store.getLogoUrl() != null ? store.getLogoUrl() : existing.getLogoUrl());
        existing.setAddress(store.getAddress() != null ? store.getAddress() : existing.getAddress());
        existing.setPhone(store.getPhone() != null ? store.getPhone() : existing.getPhone());
        existing.setEmail(store.getEmail() != null ? store.getEmail() : existing.getEmail());
        existing.setStatus(store.getStatus() != null ? store.getStatus() : existing.getStatus());
        Store updated = storeService.updateStore(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id) {
        storeService.deleteStore(id);
        return ResponseEntity.noContent().build();
    }
}
