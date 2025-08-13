import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import './index.css'
import Router from './Router'

const stripePromise = loadStripe('pk_test_51RvUSQABv04WEGHm16k0p2s8kktTTQgUkUrfJbcIQJp2Lj1YJwV5FLPJjnO5nT5iWJXgWa6pSrWUjH5mISlL3jxX00GN3awOxh');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <Router />
      </Elements>
    </BrowserRouter>
  </StrictMode>,
)
