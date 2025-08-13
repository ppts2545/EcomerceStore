package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.dto.PaymentIntentRequest;
import com.example.E_commerceStore.WebApp.dto.CheckoutSessionRequest;
import com.example.E_commerceStore.WebApp.service.StripeService;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"}, allowCredentials = "true")
public class PaymentController {

    @Autowired
    private StripeService stripeService;

    /**
     * Create Payment Intent for direct card payments
     */
    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
        try {
            PaymentIntent paymentIntent = stripeService.createPaymentIntent(
                request.getAmount(),
                request.getCurrency(),
                request.getProducts()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("id", paymentIntent.getId());
            response.put("client_secret", paymentIntent.getClientSecret());
            response.put("amount", paymentIntent.getAmount());
            response.put("currency", paymentIntent.getCurrency());
            response.put("status", paymentIntent.getStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Create Checkout Session for hosted checkout page
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, Object>> createCheckoutSession(@RequestBody CheckoutSessionRequest request) {
        try {
            Session session = stripeService.createCheckoutSession(
                request.getProducts(),
                request.getSuccessUrl(),
                request.getCancelUrl()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("id", session.getId());
            response.put("url", session.getUrl());
            response.put("payment_intent", session.getPaymentIntent());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Retrieve Payment Intent status
     */
    @GetMapping("/payment-intent/{id}")
    public ResponseEntity<Map<String, Object>> retrievePaymentIntent(@PathVariable String id) {
        try {
            PaymentIntent paymentIntent = stripeService.retrievePaymentIntent(id);

            Map<String, Object> response = new HashMap<>();
            response.put("id", paymentIntent.getId());
            response.put("status", paymentIntent.getStatus());
            response.put("amount", paymentIntent.getAmount());
            response.put("currency", paymentIntent.getCurrency());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Webhook endpoint for Stripe events
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            stripeService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook processing failed: " + e.getMessage());
        }
    }

    /**
     * Get Stripe configuration (public key only)
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getStripeConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("publishable_key", stripeService.getPublishableKey());
    config.put("mode", stripeService.isLiveMode() ? "live" : "test");
        return ResponseEntity.ok(config);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStripeStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("mode", stripeService.isLiveMode() ? "live" : "test");
        try {
            var acct = stripeService.getAccount();
            status.put("account_id", acct.getId());
            status.put("charges_enabled", acct.getChargesEnabled());
            status.put("payouts_enabled", acct.getPayoutsEnabled());
            status.put("details_submitted", acct.getDetailsSubmitted());
        } catch (Exception e) {
            status.put("error", e.getMessage());
        }
        return ResponseEntity.ok(status);
    }
}
