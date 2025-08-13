package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.dto.PaymentIntentRequest.ProductItem;
import com.example.E_commerceStore.WebApp.dto.CheckoutSessionRequest.CheckoutProductItem;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Account;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.net.RequestOptions;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.publishable.key}")
    private String publishableKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${stripe.mode:test}")
    private String stripeMode; // 'test' or 'live'

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        if (stripeApiKey != null && stripeApiKey.length() > 12) {
            String masked = stripeApiKey.substring(0, 12) + "..." + stripeApiKey.substring(stripeApiKey.length() - 4);
            System.out.println("[StripeService] Initialized with secret key=" + masked);
        } else {
            System.out.println("[StripeService] Stripe secret key not configured or too short");
        }
        if (publishableKey != null && publishableKey.length() > 12) {
            String maskedPub = publishableKey.substring(0, 12) + "..." + publishableKey.substring(publishableKey.length() - 4);
            System.out.println("[StripeService] Publishable key loaded=" + maskedPub);
        }
    System.out.println("[StripeService] Mode detected=" + (isLiveMode() ? "LIVE" : "TEST"));
    }

    /**
     * Create a PaymentIntent for direct payments
     */
    public PaymentIntent createPaymentIntent(Long amount, String currency, List<ProductItem> products) throws Exception {
        if (Stripe.apiKey != null && Stripe.apiKey.length() > 18) {
            String masked = Stripe.apiKey.substring(0, 18) + "..." + Stripe.apiKey.substring(Stripe.apiKey.length() - 4);
            System.out.println("[StripeService] Creating PaymentIntent using secret=" + masked + ", amount=" + amount + ", currency=" + currency);
        }
    // Create metadata from products
    PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
        .setAmount(amount)
        .setCurrency(currency)
        .setAutomaticPaymentMethods(
            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                .setEnabled(true)
                .build()
        );

        // Add product information to metadata
        for (int i = 0; i < products.size() && i < 20; i++) { // Stripe metadata has limits
            ProductItem product = products.get(i);
            paramsBuilder.putMetadata("product_" + i + "_id", product.getId());
            paramsBuilder.putMetadata("product_" + i + "_name", product.getName());
            paramsBuilder.putMetadata("product_" + i + "_quantity", String.valueOf(product.getQuantity()));
            paramsBuilder.putMetadata("product_" + i + "_price", String.valueOf(product.getPrice()));
        }

        PaymentIntentCreateParams params = paramsBuilder.build();

        // Generate deterministic idempotency key (amount + product ids) to avoid duplicate charges if retried quickly
        StringBuilder keyBuilder = new StringBuilder("pi:").append(amount).append(":");
        for (int i = 0; i < Math.min(products.size(), 5); i++) {
            keyBuilder.append(products.get(i).getId()).append('-');
        }
        String idempotencyKey = keyBuilder.toString();
        RequestOptions requestOptions = RequestOptions.builder().setIdempotencyKey(idempotencyKey).build();
        System.out.println("[StripeService] Creating PaymentIntent idempotencyKey=" + idempotencyKey);
        return PaymentIntent.create(params, requestOptions);
    }

    /**
     * Create a Checkout Session for hosted checkout page
     */
    public Session createCheckoutSession(List<CheckoutProductItem> products, String successUrl, String cancelUrl) throws Exception {
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl);

        // Convert products to line items
        List<SessionCreateParams.LineItem> lineItems = products.stream()
                .map(product -> SessionCreateParams.LineItem.builder()
                        .setPriceData(
                                SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency("thb")
                                        .setProductData(
                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                        .setName(product.getName())
                                                        .setDescription(product.getDescription())
                                                        .build()
                                        )
                                        .setUnitAmount(product.getPrice())
                                        .build()
                        )
                        .setQuantity(product.getQuantity().longValue())
                        .build()
                )
                .collect(Collectors.toList());

        paramsBuilder.addAllLineItem(lineItems);

        SessionCreateParams params = paramsBuilder.build();
        return Session.create(params);
    }

    /**
     * Retrieve a PaymentIntent by ID
     */
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws Exception {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    /**
     * Handle Stripe webhook events
     */
    public void handleWebhook(String payload, String sigHeader) throws Exception {
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "payment_intent.payment_failed":
                handlePaymentIntentFailed(event);
                break;
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(event);
                break;
            default:
                System.out.println("Unhandled event type: " + event.getType());
                break;
        }
    }

    private void handlePaymentIntentSucceeded(Event event) {
        // Handle successful payment
        System.out.println("Payment succeeded: " + event.getId());
        // TODO: Update order status, send confirmation email, etc.
    }

    private void handlePaymentIntentFailed(Event event) {
        // Handle failed payment
        System.out.println("Payment failed: " + event.getId());
        // TODO: Update order status, notify customer, etc.
    }

    private void handleCheckoutSessionCompleted(Event event) {
        // Handle completed checkout session
        System.out.println("Checkout session completed: " + event.getId());
        // TODO: Fulfill order, update inventory, etc.
    }

    /**
     * Get publishable key for frontend
     */
    public String getPublishableKey() {
        return publishableKey;
    }

    /**
     * Determine if running in live mode.
     */
    public boolean isLiveMode() {
        if (stripeMode != null) {
            return stripeMode.equalsIgnoreCase("live");
        }
        return stripeApiKey != null && stripeApiKey.startsWith("sk_live_");
    }

    /**
     * Retrieve basic account info to verify keys / mode (never expose sensitive data)
     */
    public Account getAccount() throws Exception {
        return Account.retrieve();
    }
}
