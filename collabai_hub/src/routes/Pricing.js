import React, { useState } from "react";

/*
  PUBLIC_INTERFACE
  Pricing component for CollabAI Hub:
  - Pitch-black background with neon green accents
  - Two plans: Free (with disabled CTA), Custom (pay/donate enabled)
  - Motivational quote section
  - Stripe Checkout/Elements integration for payment on 'Custom' tier
  - Fully accessible and visually appealing
  - No secrets or backend keys included (only Stripe public test key)
*/

const STRIPE_PUBLISHABLE_KEY = "pk_test_51RZulyBMV7WVYuXn7rvta3rLkD1FGWGFYXMrCq8dJNUvmWTFAn3m62F7atLjoJpzGaG7dudFyeRnEcD9jrPtH4bj00XB58H682";

// Stripe.js loader (vanilla, since backend flow is absent)
function loadStripeScript(cb) {
  if (window.Stripe) {
    cb();
    return;
  }
  const script = document.createElement('script');
  script.src = "https://js.stripe.com/v3/";
  script.async = true;
  script.onload = cb;
  document.body.appendChild(script);
}

const plans = [
  {
    name: "Free",
    price: "Free",
    features: [
      "Unlimited public projects",
      "Access to basic AI tools",
      "Team collaboration",
    ],
    cta: "Start for Free",
    disabled: true,
  },
  {
    name: "Custom",
    price: "Custom/Donate",
    features: [
      "Premium AI features",
      "Priority support",
      "Flexible quota & credits",
      "Invite-only private projects",
    ],
    cta: "Support & Get Started",
    disabled: false,
  }
];

// PUBLIC_INTERFACE
export default function Pricing() {
  const [donation, setDonation] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Stripe Checkout handler (client-only)
  const handleDonate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Stripe.js required, fallback to error if fails
    loadStripeScript(async () => {
      if (!window.Stripe) {
        setLoading(false);
        setError("Stripe.js failed to load.");
        return;
      }

      // Only supports test payment via Stripe checkout session for demo;
      // In production, sessionId must be securely generated on the server!
      // Here, for the frontend-demo, we redirect to Stripe's test mode checkout with a fixed price link.
      // REPLACE the below URL with a real Checkout Session or Payment Link from your Stripe dashboard for actual use.
      const exampleTestPaymentLink = "https://buy.stripe.com/test_cN2g1rdEz1vP3sQfYZ";
      if (donation && parseFloat(donation) > 0) {
        window.open(
          exampleTestPaymentLink,
          "_blank"
        );
      }
      setLoading(false);
    });
  };

  // Styles (inline-Tailwind hybrid for shadcn-style/minimal extra classes)
  const rootStyle = {
    minHeight: "100vh",
    background: "#000",
    color: "#e0ffe0",
    padding: 0,
    margin: 0,
    fontFamily: "Inter,Segoe UI,sans-serif"
  };
  const accent = "#00FF00";
  const neonShadow = "0 0 12px #00FF00, 0 0 30px #00FF0044";
  const containerStyle = {
    maxWidth: 900,
    margin: "0 auto",
    padding: "48px 0 0 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 32
  };
  const headingStyle = {
    fontSize: "2.4rem",
    fontWeight: 700,
    color: accent,
    textShadow: neonShadow,
    marginBottom: 8
  };
  const subheadingStyle = {
    fontSize: "1.18rem",
    color: "#baffba",
    letterSpacing: '0.04em',
    marginBottom: 16
  };
  const plansRow = {
    display: "flex",
    gap: 40,
    justifyContent: "center",
    margin: "36px 0",
    flexWrap: "wrap"
  };
  const cardStyle = {
    background: "#101010",
    border: `2.2px solid ${accent}`,
    borderRadius: 16,
    boxShadow: neonShadow,
    padding: "40px 28px 32px 28px",
    minWidth: 285,
    maxWidth: 330,
    flex: "1 1 300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    transition: "box-shadow .15s"
  };
  const planHeader = {
    fontSize: "1.23rem", fontWeight: 600, color: "#0f0", marginBottom: 8, letterSpacing: 1.1
  };
  const priceStyle = {
    fontSize: "2rem", fontWeight: 800, color: accent, letterSpacing: 1.2, textShadow: neonShadow, marginBottom: 18
  };
  const featureListStyle = {
    listStyle: "none",
    padding: 0, marginBottom: 20, marginTop: 0, color: "#ccffe0",
    fontSize: "1.04rem", textAlign: "left"
  };
  const ctaBtnBase = {
    width: "100%",
    padding: "13px 0",
    borderRadius: 10,
    border: "none",
    fontWeight: 700,
    fontSize: "1.08rem",
    cursor: "pointer",
    background: accent,
    color: "#000",
    boxShadow: neonShadow,
    marginTop: 16,
    transition: "filter .18s, box-shadow .18s"
  };
  const ctaBtnDisabled = {
    ...ctaBtnBase,
    background: "#444",
    color: "#999",
    cursor: "not-allowed",
    opacity: 0.6
  };
  const donateFormStyle = {
    display: "flex", flexDirection: "column", gap: 12, marginTop: -8, marginBottom: 12, width: "100%"
  };
  const donationInputStyle = {
    background: "#111", border: `1.2px solid ${accent}`, borderRadius: 7,
    padding: "9px 14px", color: accent, fontWeight: 600, fontSize: "1.12rem", marginBottom: 0
  };

  return (
    <div style={rootStyle}>
      <div style={containerStyle}>
        <h1 style={headingStyle}>
          Pricing & Support
        </h1>
        <div style={subheadingStyle}>
          Unlock the power of CollabAI Hub. Choose your path to productivity—or empower the project directly!
        </div>
        <div style={plansRow}>
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              style={{
                ...cardStyle,
                borderColor:
                  plan.name === "Custom"
                    ? "#0f0"
                    : "#0f0c",
                boxShadow:
                  plan.name === "Custom"
                    ? "0 0 14px #00FF00, 0 0 40px #00ff0033"
                    : "0 0 8px #00FF0031"
              }}
            >
              <div style={planHeader}>
                {plan.name}
              </div>
              <div style={priceStyle}>
                {plan.price}
              </div>
              <ul style={featureListStyle}>
                {plan.features.map((f, i) => (
                  <li key={f} style={{marginBottom: i < plan.features.length - 1 ? 8 : 0, display: "flex", alignItems: "center"}}>
                    <span style={{
                      display: "inline-block",
                      width: 17, height: 17,
                      borderRadius: "42%",
                      background: plan.name==="Custom" ? accent : "#1c1",
                      boxShadow: plan.name==="Custom" ? "0 0 6px #0f0" : "0 0 4px #0f08",
                      marginRight: 8,
                      textAlign: "center"
                    }}>
                      <span style={{color: "#000", fontWeight:700, fontSize:"1.08rem"}}>✓</span>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.name === "Free" ? (
                <button
                  style={ctaBtnDisabled}
                  disabled
                  aria-disabled="true"
                >
                  {plan.cta}
                </button>
              ) : (
                <form style={donateFormStyle} onSubmit={handleDonate} aria-label="Donate or Custom Payment">
                  <label htmlFor="donation-amt" style={{color: accent, textShadow: neonShadow, marginBottom: 2}}>
                    Choose amount ($)
                    <input
                      id="donation-amt"
                      name="donation"
                      type="number"
                      min={1}
                      max={1000}
                      step={1}
                      value={donation}
                      onChange={e => setDonation(e.target.value.replace(/[^\d]/g,""))}
                      style={donationInputStyle}
                      autoComplete="off"
                      aria-label="Donation amount"
                      required
                    />
                  </label>
                  <button
                    style={{
                      ...ctaBtnBase,
                      filter: loading ? "brightness(1.3) blur(1px)" : undefined,
                      pointerEvents: loading ? "none" : undefined
                    }}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Redirecting..." : "Donate / Pay Now"}
                  </button>
                  <div style={{fontSize: ".96rem", marginTop: 2, color:"#b3ffb3"}}>
                    You’ll be redirected to Stripe test checkout. Proof-of-concept only.
                  </div>
                  {error && <div style={{color:"#fa5252", marginTop: 2}}>{error}</div>}
                </form>
              )}
            </div>
          ))}
        </div>

        {/* Quote Section */}
        <section role="region" aria-label="Motivational Quote" style={{
          background: "#050505",
          padding: "32px",
          borderRadius: 18,
          border: `1.6px solid ${accent}`,
          marginTop: "40px",
          boxShadow: neonShadow,
          textAlign: "center",
          width: "90%"
        }}>
          <blockquote
            style={{
              color: accent,
              fontSize: "1.45rem",
              fontWeight: 600,
              letterSpacing: 1,
              textShadow: "0 0 6px #00ff00, 0 0 16px #00ff0030",
              margin: 0
            }}
          >
            <span aria-label="empowering-collaboration-quote">
              Empowering Collaboration –
            </span>
            <br />
            <span style={{ color: "#fff", textShadow: "0 0 7px #0f0", fontWeight:400 }}>
              Your contribution drives innovation!
            </span>
          </blockquote>
          <div style={{ marginTop: 12, color: "#caffcb", letterSpacing: 0.07, fontSize: "1.08rem" }}>
            Every donation supports open, accessible AI-powered teamwork. Thank you!
          </div>
        </section>
      </div>
    </div>
  );
}

/*
  Note:
  - Stripe public (test) key is used for demonstration only.
  - Real payment flows require server-side session generation & secret key handling.
  - To enable a real donation/checkout, implement a POST endpoint returning a CheckoutSession ID, then use:
      const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      stripe.redirectToCheckout({ sessionId });
    (Replace 'Buy Now' link with such handler when backend present.)

  Accessibility considered: button labels, ARIA props, color contrast.
  UI style: pitch-black bg, neon-green borders/shadows, easy-to-read text.
*/
