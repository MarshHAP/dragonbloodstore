# Dragonblood® Store

A single-product e-commerce storefront for the Dragonblood Anti-Ageing Serum,
modelled on the structure and conversion flow of a modern one-product
Shopify landing page (countdown sale bar → hero → social proof → benefits +
bundle buy box → daily ritual → review wall → FAQ → guarantee → footer).

## Pages

- `index.html` — main landing page with product gallery, bundle offers
  (Buy 1 / Buy 2 Get 1 FREE / Buy 3 Get 2 FREE), cart drawer, FAQ and reviews
- `contact.html` — contact form + order tracking info
- `policies.html` — refund, shipping, privacy, terms and cancellation policies

## Features

- Countdown sale banner (resets daily at midnight)
- Product image gallery with thumbnail switching (5 PDP images + packshot)
- Bundle selector with dynamic add-to-cart pricing
- Slide-out cart drawer persisted in `localStorage`
- Sticky mobile add-to-cart bar
- Accordion product info & FAQ, "show more" review wall, newsletter signup
- Fully responsive, no build step, no dependencies

## Running locally

It's a static site — open `index.html` directly, or serve it:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Going live

The cart is a front-end demo. To take real orders, connect the checkout
button to your commerce backend (e.g. a Shopify Buy Button / Storefront API,
Stripe Checkout, or Snipcart) and replace the placeholder address/email in
the footer, contact and policies pages.
