import React, { useState } from "react";

/*
  PUBLIC_INTERFACE
  PricingDonation
  Neon hacker themed live Stripe checkout donation/subscription page.
  STRIPE_PUBLISHABLE_KEY: pk_test_51RZulyBMV7WVYuXn7rvta3rLkD1FGWGFYXMrCq8dJNUvmWTFAn3m62F7atLjoJpzGaG7dudFyeRnEcD9jrPtH4bj00XB58H682

  NOTE: Stripe Checkout requires a backend to generate a session for optimal security.
  This implementation uses the Stripe Checkout redirect for demonstration with preset mode.
*/

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RZulyBMV7WVYuXn7rvta3rLkD1FGWGFYXMrCq8dJNUvmWTFAn3m62F7atLjoJpzGaG7dudFyeRnEcD9jrPtH4bj00XB58H682';

// Replace with your Stripe Product price IDs below (for true LIVE payments -- backend needed for real apps)
const DONATION_PRICE_ID = "price_1RZzzRBMV7WVYuXnhackerdonate"; // Placeholder, must be set via Stripe
const SUBSCRIPTION_PRICE_ID = "price_1RZzzSBMV7WVYuXnsubmonthly"; // Placeholder, must be set via Stripe
// For demo: fallback to custom amount via Checkout session

function loadStripe(publishableKey) {
  // Dynamically load Stripe.js if not loaded
  if (window.Stripe) return Promise.resolve(window.Stripe(publishableKey));
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => resolve(window.Stripe(publishableKey));
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

const MOTIVATIONAL_QUOTES = [
  "“Be the anomaly. Fund the revolution.”",
  "“Small donations, big impact—write code for good.”",
  "“Those who are crazy enough to think they can change the world are the ones who do.”",
  "“Support open innovation. Spark the next breakthrough.”"
];

function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

const NEON_COLORS = {
  green: "#39FF14",
  red: "#FF073A",
  blue: "#00F0FF",
  shadow: "0 0 10px #00fff0, 0 0 40px #00ffea, 0 0 80px #0088ff",
};

export default function PricingDonation() {
  const [amount, setAmount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("donation"); // 'donation' or 'subscription'
  const [quote] = useState(getRandomQuote);

  // PUBLIC_INTERFACE
  async function handleDonate(e) {
    e.preventDefault();
    setIsLoading(true);

    const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);

    if (mode === "subscription") {
      // Subscription via price id (set up on Stripe dashboard)
      await stripe.redirectToCheckout({
        mode: "subscription",
        lineItems: [
          {
            price: SUBSCRIPTION_PRICE_ID,
            quantity: 1,
          }
        ],
        successUrl: window.location.origin + "/pricing?success=1",
        cancelUrl: window.location.origin + "/pricing?canceled=1",
      });
      setIsLoading(false);
      return;
    }

    // One-time donation (amount in cents), must pre-create a product/price or use backend!
    // If you have a backend, call it to produce a Checkout Session.
    // For demo, use static test preset price if available.
    // Here we use amount as metadata & donate product

    // Fallback for client-only: using test Stripe Price by amount
    await stripe.redirectToCheckout({
      mode: "payment",
      // If you have preset donation products, put their price IDs here. This is demo logic.
      lineItems: [
        {
          price: DONATION_PRICE_ID,
          quantity: 1,
          // OR to enable variable amounts via the backend.
          // (Cannot do variable from frontend-only with Stripe Checkout; would need backend-generated session.)
        }
      ],
      successUrl: window.location.origin + "/pricing?success=1",
      cancelUrl: window.location.origin + "/pricing?canceled=1",
      // Optionally pass customerEmail/currency etc if desired.
    });
    setIsLoading(false);
  }

  // --- Neon UI Style
  // Neon underline/bar used in the header/quote
  const neonBar = (
    <div
      style={{
        width: 120,
        height: 8,
        margin: "18px auto 8px",
        borderRadius: 8,
        boxShadow: `0 0 25px 8px ${NEON_COLORS.green}`,
        background: `linear-gradient(90deg, ${NEON_COLORS.green} 20%, ${NEON_COLORS.blue} 80%)`,
      }}
    />
  );

  // Disabled if no Stripe price IDs are set
  const isLiveEnabled = DONATION_PRICE_ID.startsWith("price_1RZz") && SUBSCRIPTION_PRICE_ID.startsWith("price_1RZz")
    ? false // Set to true when you create your Stripe Price IDs for real app
    : true;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 100px)",
        fontFamily: "Fira Mono, 'JetBrains Mono', monospace",
        background: "#000",
        color: "#e0e0e0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 60
      }}
    >
      <h1
        style={{
          color: NEON_COLORS.green,
          textShadow: "0 0 10px #39ff42, 0 0 20px #00ffb0",
          fontSize: "2.7rem",
          fontWeight: 900,
          letterSpacing: "1px",
          margin: "8px 0 0 0"
        }}
      >
        Support CollabAI Hub
      </h1>
      {neonBar}
      <div
        style={{
          fontSize: "1.28rem",
          color: NEON_COLORS.blue,
          fontStyle: "italic",
          textShadow: "0 0 8px #00f0ff, 0 0 22px #4888ff",
          marginBottom: 24,
        }}
      >
        {quote}
      </div>

      <form
        style={{
          background: "#0a0a0a",
          borderRadius: 17,
          boxShadow: `0 0 15px 2px ${NEON_COLORS.red}40`,
          padding: "38px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 340,
          margin: "0 0 20px 0",
        }}
        onSubmit={handleDonate}
      >
        <div style={{ display: "flex", gap: 35, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setMode("donation")}
            style={{
              background: mode === "donation"
                ? `linear-gradient(90deg, #101 60%, ${NEON_COLORS.green} 120%)`
                : "#000",
              color: mode === "donation" ? NEON_COLORS.green : "#e0e0e0",
              border: `2.2px solid ${NEON_COLORS.green}`,
              borderRadius: 12,
              fontWeight: 700,
              boxShadow: mode === "donation"
                ? `0 0 8px 3px ${NEON_COLORS.green}60`
                : "none",
              padding: "0.49em 1.9em",
              textShadow: `0 0 5px ${NEON_COLORS.green}`,
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            One-Time Donation
          </button>
          <button
            type="button"
            onClick={() => setMode("subscription")}
            style={{
              background: mode === "subscription"
                ? `linear-gradient(90deg, #111 45%, ${NEON_COLORS.blue} 120%)`
                : "#000",
              color: mode === "subscription" ? NEON_COLORS.blue : "#e0e0e0",
              border: `2.2px solid ${NEON_COLORS.blue}`,
              borderRadius: 12,
              fontWeight: 700,
              boxShadow: mode === "subscription"
                ? `0 0 8px 3px ${NEON_COLORS.blue}80`
                : "none",
              padding: "0.49em 1.9em",
              textShadow: `0 0 6px ${NEON_COLORS.blue}`,
              cursor: "pointer",
              fontSize: "1.2rem"
            }}
          >
            Monthly Subscription
          </button>
        </div>

        {mode === "donation" && (
          <div style={{ width: "100%", textAlign: "center", marginBottom: 22 }}>
            <label style={{
              color: NEON_COLORS.green,
              textShadow: `0 0 7px ${NEON_COLORS.green}99`,
              fontWeight: 700,
              fontSize: "1.09rem",
              marginBottom: 10
            }}>
              Select donation amount
              <input
                type="number"
                min="1"
                max="300"
                step="1"
                value={amount}
                onChange={e => setAmount(Number(e.target.value) || 1)}
                style={{
                  marginLeft: 12,
                  width: 70,
                  borderRadius: 8,
                  outline: "none",
                  border: `1.5px solid ${NEON_COLORS.green}`,
                  fontSize: "1.1rem",
                  background: "#000",
                  color: NEON_COLORS.green,
                  boxShadow: `0 0 8px ${NEON_COLORS.green}`,
                  textAlign: "center",
                  padding: "3.5px 4px",
                  fontFamily: "inherit"
                }}
              />
              <span style={{
                color: "#07f382",
                textShadow: "0 0 5px #07f382",
                fontWeight: 800,
                marginLeft: 3,
              }}>USD</span>
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isLiveEnabled}
          style={{
            marginTop: 12,
            background: isLoading
              ? "#444"
              : `linear-gradient(90deg, ${NEON_COLORS.green}, ${NEON_COLORS.red} 60%, ${NEON_COLORS.blue} 100%)`,
            color: "#fff",
            fontWeight: 800,
            border: "none",
            borderRadius: "12px",
            padding: "16px 32px",
            boxShadow: `0 0 24px 4px ${NEON_COLORS.green}, 0 0 48px 12px ${NEON_COLORS.blue}44`,
            fontSize: "1.22rem",
            letterSpacing: "2px",
            textShadow: "0 0 7px #fff, 0 0 29px #39FF14",
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading || isLiveEnabled ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}
        >
          {isLoading
            ? "Redirecting..."
            : mode === "donation"
              ? "Donate Now"
              : "Subscribe"}
        </button>
        <div style={{
          color: NEON_COLORS.red,
          marginTop: 24,
          fontSize: "1.08rem",
          fontFamily: "monospace",
          display: isLiveEnabled ? "block" : "none"
        }}>
          <span style={{ textShadow: `0 0 5px ${NEON_COLORS.red}` }}>
            [!] Stripe price IDs not set.<br />Please update <b>DONATION_PRICE_ID</b> and <b>SUBSCRIPTION_PRICE_ID</b> with valid values from your Stripe dashboard for live payments.
          </span>
        </div>
        <div style={{
          marginTop: 26,
          color: "#3fefef",
          fontSize: "0.95rem",
          opacity: 0.80,
          textAlign: "center",
          fontFamily: "Fira Mono, monospace",
        }}>
          Powered by{" "}
          <a
            href="https://stripe.com"
            style={{
              color: NEON_COLORS.blue,
              textShadow: "0 0 10px #00f0ff",
              fontWeight: 700,
              textDecoration: "underline"
            }}
            rel="noopener noreferrer"
            target="_blank"
          >Stripe</a>
        </div>
      </form>

      <div style={{
        marginTop: 28,
        color: "#fff",
        fontSize: "1.02rem",
        opacity: 0.60,
        textAlign: "center",
        letterSpacing: ".13em"
      }}>
        100% of proceeds support<br />
        <span style={{ color: NEON_COLORS.green, textShadow: `0 0 5px #39ff14` }}>Open Source, AI, and Hacker Collaboration</span>
      </div>
    </div>
  );
}
