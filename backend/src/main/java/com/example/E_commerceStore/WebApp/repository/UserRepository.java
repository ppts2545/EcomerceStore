package com.example.E_commerceStore.WebApp.repository;

import com.example.E_commerceStore.WebApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find user by email
    Optional<User> findByEmail(String email);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find users by role
    java.util.List<User> findByRole(com.example.E_commerceStore.WebApp.model.UserRole role);
    
    // Password reset related queries (old names)
    Optional<User> findByResetToken(String resetToken);
    
    @Query("SELECT u FROM User u WHERE u.resetToken = :token AND u.resetTokenExpiry > :now")
    Optional<User> findByValidResetToken(@Param("token") String token, @Param("now") LocalDateTime now);
    
    // Password reset related queries (new names for UserService)
    Optional<User> findByPasswordResetToken(String passwordResetToken);
    
    @Query("SELECT u FROM User u WHERE u.passwordResetToken = :token AND u.passwordResetExpiry > :now")
    Optional<User> findByValidPasswordResetToken(@Param("token") String token, @Param("now") LocalDateTime now);
    
    // OAuth2 related queries (old names)
    Optional<User> findByProviderIdAndProviderUserId(String providerId, String providerUserId);
    
    // OAuth2 related queries (new names for UserService)
    Optional<User> findByOauth2ProviderAndOauth2ProviderId(String oauth2Provider, String oauth2ProviderId);
    
    // Check if phone number exists (for additional validation)
    boolean existsByPhoneNumber(String phoneNumber);
}
