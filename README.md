# Dragonblood® Store

A single-product storefront for the Dragonblood Anti-Ageing Serum, built as a
**Shopify Online Store 2.0 theme** (plus a standalone static demo), modelled on
the structure and conversion flow of a modern one-product funnel (countdown
sale bar → hero → social proof → benefits + bundle buy box → daily ritual →
review wall → FAQ → guarantee → footer).

## Shopify theme

The repo root is a valid Shopify theme — connect this branch via
**Online Store → Themes → Add theme → Connect from GitHub**.

- `layout/theme.liquid` — base layout with cart drawer
- `sections/` — all homepage sections (hero, testimonials, benefits, buy box
  with bundle blocks, ritual, review wall, FAQ, final CTA) plus standard
  product/collection/cart/page/blog/search/404 sections. Every text, image,
  review and bundle is editable in the theme editor.
- `templates/` — OS 2.0 JSON templates pre-configured with the full landing page
- `config/`, `locales/`, `assets/` — settings, translations, CSS/JS/images

After connecting:
1. In the theme editor, open the **Buy box** section and pick your product —
   bundles add its first variant (×1 / ×3 / ×5) to the real Shopify cart.
2. Create automatic discounts to match the displayed bundle prices.
3. Assign your Main menu / Footer menu and add your store policies in Settings.

Validated with `shopify theme check` (0 errors).

## Static demo

The same design also works as a plain static site (demo cart in localStorage):

- `index.html` — main landing page with product gallery, bundle offers
  (Buy 1 / Buy 2 Get 1 FREE / Buy 3 Get 2 FREE), cart drawer, FAQ and reviews
- `contact.html` — contact form + order tracking info
- `policies.html` — refund, shipping, privacy, terms and cancellation policies

Shopify ignores these root HTML files when the branch is connected as a theme.

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
