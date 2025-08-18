# Stripe Live Environment Setup

## 1. Obtain Live Keys (Stripe Dashboard)
Go to Developers > API keys:
- Publishable key: `pk_live_...`
- Secret key: `sk_live_...`
- (If using webhooks) Signing secret: `whsec_...` from Developers > Webhooks > Add endpoint

## 2. Backend Environment Variables
Set securely (shell, systemd, Docker, etc):
```
export STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
export STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
export STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxx
export stripe.mode=live
```
Optional:
```
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=jdbc:postgresql://host:5432/ecommerce_prod
export DATABASE_USERNAME=prod_user
export DATABASE_PASSWORD=****
```

## 3. Frontend Environment (.env.production or deployment platform)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_API_URL=https://yourdomain.com/api
```

## 4. HTTPS Requirement
Live Stripe.js requires HTTPS (except localhost). Use a real domain + TLS (NGINX, Cloudflare, etc.).

## 5. Webhook (Optional but Recommended)
Endpoint: `https://yourdomain.com/api/payments/webhook`
Events typically: `payment_intent.succeeded`, `payment_intent.payment_failed`
Test locally with:
```
stripe listen --forward-to localhost:8082/api/payments/webhook
```

## 6. Verify Operational Status
After deploying with live keys, call:
```
GET https://yourdomain.com/api/payments/status
```
You should see:
```
{
  "mode":"live",
  "account_id":"acct_xxxx",
  "charges_enabled":true,
  "payouts_enabled":true,
  "details_submitted":true
}
```
If `charges_enabled` or `payouts_enabled` is false, finish onboarding (Business settings in Stripe).

## 7. Idempotency & Safety
We generate idempotency key for PaymentIntent (amount + product IDs) to avoid accidental duplicate charges.

## 8. Test → Live Switch Checklist
- Replace test keys in env with live keys
- Clear build caches / restart services
- Confirm /status endpoint returns live + charges_enabled true
- Place a small real transaction (e.g. 20 THB) to verify

## 9. Production Logging
Remove verbose debug logs or restrict via logging level if needed.

## 10. Adding More Payment Methods
Enable them in Stripe Dashboard (Settings > Payment Methods). Automatic Payment Methods already enabled.

## 11. Security Notes
- Never commit live keys
- Rotate keys periodically
- Restrict webhook IP at reverse proxy if possible

## 12. PromptPay / Additional Methods
If you enable local methods (e.g., PromptPay), ensure currency THB and automatic methods stays enabled.

---
This project now supports seamless switching between test and live modes.
