package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.Store;
import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StoreService {
    @Autowired
    private StoreRepository storeRepository;

    public Store createStore(Store store) {
        return storeRepository.save(store);
    }

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    public Optional<Store> getStoreById(Long id) {
        return storeRepository.findById(id);
    }

    public List<Store> getStoresByOwnerId(Long ownerId) {
        return storeRepository.findByOwnerId(ownerId);
    }

    public Store updateStore(Store store) {
        return storeRepository.save(store);
    }

    public void deleteStore(Long id) {
        storeRepository.deleteById(id);
    }
}
