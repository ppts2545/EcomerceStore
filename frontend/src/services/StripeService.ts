import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Types
export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string;
}

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_intent: string;
}

class StripeService {
  private stripe: Promise<Stripe | null>;
  private apiUrl: string;

  constructor() {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key not found in environment variables');
    }
    this.stripe = loadStripe(publishableKey);
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';
    // Fetch config to log mode (non-blocking)
    fetch(`${this.apiUrl}/payments/config`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(cfg => {
        if (cfg?.mode === 'test') {
          console.warn('[Stripe] Running in TEST mode – real charges will NOT occur.');
        } else if (cfg?.mode === 'live') {
          console.info('[Stripe] Live mode active. Real payments enabled.');
        }
      }).catch(()=>{});
  }

  /**
   * Get Stripe instance
   */
  async getStripe(): Promise<Stripe | null> {
    return await this.stripe;
  }

  /**
   * Create Payment Intent for direct card payments
   */
  async createPaymentIntent(products: StripeProduct[]): Promise<StripePaymentIntent> {
    try {
      const totalAmount = products.reduce((sum, product) => 
        sum + (product.price * product.quantity), 0
      );

      const response = await fetch(`${this.apiUrl}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to smallest currency unit (satang)
          currency: products[0]?.currency || 'thb',
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            price: Math.round(p.price * 100) // Backend DTO expects cents
          }))
        }),
      });

      if (!response.ok) {
        let backendMessage = '';
        try {
          const errorBody = await response.text();
          // Attempt to parse JSON error
          const parsed = JSON.parse(errorBody);
          backendMessage = parsed.error || parsed.message || errorBody;
        } catch {
          // ignore parse error
        }
        throw new Error(`สร้าง PaymentIntent ล้มเหลว (HTTP ${response.status}) ${backendMessage ? '→ ' + backendMessage : ''}`.trim());
      }

      const json = await response.json();
      if (!json.client_secret) {
        throw new Error('ไม่ได้รับ client_secret จากเซิร์ฟเวอร์');
      }
      return json;
    } catch (error) {
      console.error('Error creating payment intent (frontend wrapper):', error);
      if (error instanceof Error) throw error; // preserve original detailed message
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Create Checkout Session for hosted checkout
   */
  async createCheckoutSession(products: StripeProduct[]): Promise<StripeCheckoutSession> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: Math.round(p.price * 100), // Convert to cents
            quantity: p.quantity,
            image: p.image
          })),
          success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/payment/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.getStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Confirm payment with client secret
   */
  async confirmPayment(clientSecret: string, paymentMethodId: string): Promise<unknown> {
    const stripe = await this.getStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    return await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        payment_method: paymentMethodId,
        return_url: `${window.location.origin}/payment/success`
      }
    });
  }

  /**
   * Retrieve payment intent status
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<unknown> {
    const stripe = await this.getStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    return await stripe.retrievePaymentIntent(paymentIntentId);
  }

  /**
   * Format price for display
   */
  formatPrice(amount: number, currency: string = 'THB'): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  /**
   * Validate Stripe configuration
   */
  validateConfiguration(): boolean {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    return !!publishableKey;
  }
}

export default new StripeService();
