import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import './index.css'
import Router from './Router'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <Router />
      </Elements>
    </BrowserRouter>
  </StrictMode>,
)
