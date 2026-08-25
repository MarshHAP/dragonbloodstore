/* Dragonblood® storefront interactions.
   Runs in two modes: on Shopify (window.DBTHEME.shopifyCart) it uses the
   AJAX cart API; as a static demo it falls back to a localStorage cart. */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var SHOPIFY = !!(window.DBTHEME && window.DBTHEME.shopifyCart);

  /* ---------- countdown (resets at local midnight) ---------- */
  var tHrs = $("#tHrs"), tMins = $("#tMins"), tSecs = $("#tSecs");
  function pad(n) { return String(n).padStart(2, "0"); }
  function tickCountdown() {
    if (!tHrs) return;
    var now = new Date();
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    var diff = Math.max(0, Math.floor((end - now) / 1000));
    tHrs.textContent = pad(Math.floor(diff / 3600));
    tMins.textContent = pad(Math.floor((diff % 3600) / 60));
    tSecs.textContent = pad(diff % 60);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- menu drawer ---------- */
  var navToggle = $("#navToggle"), menuDrawer = $("#menuDrawer");
  if (navToggle && menuDrawer) {
    navToggle.addEventListener("click", function () {
      var open = menuDrawer.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- smooth scroll CTAs ---------- */
  $$(".js-scroll").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href") || "";
      var hash = href.indexOf("#") === 0 ? href : null;
      if (!hash) return;
      var target = $(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        menuDrawer && menuDrawer.classList.remove("is-open");
      }
    });
  });

  /* ---------- benefits accordion ---------- */
  $$("#benefitsList .benefit-row").forEach(function (row) {
    row.addEventListener("click", function () {
      $$("#benefitsList .benefit-row").forEach(function (r) { r.classList.remove("is-active"); });
      row.classList.add("is-active");
    });
  });

  /* ---------- product gallery ---------- */
  var galleryMain = $("#galleryMain");
  $$("#galleryThumbs .thumb").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      $$("#galleryThumbs .thumb").forEach(function (t) { t.classList.remove("is-active"); });
      thumb.classList.add("is-active");
      if (galleryMain) galleryMain.src = thumb.getAttribute("data-src");
    });
  });

  /* ---------- arrival date (order today → arrives in ~5 days) ---------- */
  var arrival = $("#arrivalDate");
  if (arrival) {
    var d = new Date();
    d.setDate(d.getDate() + 5);
    arrival.textContent = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }

  /* ---------- bundle + purchase-type selection ---------- */
  var atcPrice = $("#atcPrice"), atcCompare = $("#atcCompare"), stickyPrice = $("#stickyPrice");
  var SUBSCRIBE_DISCOUNT = 0.25;

  function isSubscribe() {
    var input = $("#purchaseToggle input[name=ptype]:checked");
    return input && input.value === "subscribe";
  }
  function selectedBundle() {
    var input = $("#bundles input:checked");
    if (!input) return null;
    var base = parseFloat(input.getAttribute("data-price"));
    var price = isSubscribe() ? base * (1 - SUBSCRIBE_DISCOUNT) : base;
    return {
      id: input.value + (isSubscribe() ? "-sub" : ""),
      title: input.getAttribute("data-title") + (isSubscribe() ? " (Subscription)" : ""),
      price: Math.round(price * 100) / 100,
      compare: parseFloat(input.getAttribute("data-compare")),
      qty: parseInt(input.getAttribute("data-qty"), 10)
    };
  }
  function refreshOfferPrice() {
    var b = selectedBundle();
    if (!b) return;
    var label = "$" + b.price.toFixed(2);
    if (atcPrice) atcPrice.textContent = label;
    if (atcCompare) atcCompare.textContent = "$" + b.compare.toFixed(2);
    if (stickyPrice) stickyPrice.textContent = label;
  }
  $$("#bundles input, #purchaseToggle input").forEach(function (input) {
    input.addEventListener("change", refreshOfferPrice);
  });
  refreshOfferPrice();

  /* ---------- cart drawer chrome ---------- */
  var cartDrawer = $("#cartDrawer"), cartOverlay = $("#cartOverlay");
  var cartItemsEl = $("#cartItems"), cartEmptyEl = $("#cartEmpty");
  var cartFoot = $("#cartFoot"), cartTotalEl = $("#cartTotal"), cartCountEl = $("#cartCount");

  function openCart() {
    if (!cartDrawer) return;
    cartOverlay.hidden = false;
    requestAnimationFrame(function () {
      cartOverlay.classList.add("is-open");
      cartDrawer.classList.add("is-open");
    });
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartOverlay.classList.remove("is-open");
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () { cartOverlay.hidden = true; }, 280);
  }
  $("#cartOpen") && $("#cartOpen").addEventListener("click", function () {
    if (SHOPIFY) refreshShopifyCart();
    openCart();
  });
  $("#cartClose") && $("#cartClose").addEventListener("click", closeCart);
  $("#continueShopping") && $("#continueShopping").addEventListener("click", closeCart);
  cartOverlay && cartOverlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCart(); });

  function money(n) { return "$" + n.toFixed(2); }

  /* ================= SHOPIFY CART MODE ================= */
  function renderShopifyCart(cart) {
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = "";
    cart.items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML =
        (item.image ? '<img src="' + item.image + (item.image.indexOf("?") >= 0 ? "&" : "?") + 'width=120" alt="">' : "") +
        '<div class="cart-item__info">' +
          "<b></b>" +
          "<span>" + money(item.final_line_price / 100) + "</span>" +
          '<div class="cart-item__qty">' +
            '<button data-key="' + item.key + '" data-q="' + (item.quantity - 1) + '" aria-label="Decrease quantity">−</button>' +
            "<span>" + item.quantity + "</span>" +
            '<button data-key="' + item.key + '" data-q="' + (item.quantity + 1) + '" aria-label="Increase quantity">+</button>' +
          "</div>" +
        "</div>" +
        '<button class="cart-item__remove" data-key="' + item.key + '" data-q="0">Remove</button>';
      li.querySelector("b").textContent = item.product_title;
      cartItemsEl.appendChild(li);
    });
    if (cartEmptyEl) cartEmptyEl.style.display = cart.item_count ? "none" : "";
    if (cartFoot) cartFoot.hidden = !cart.item_count;
    if (cartTotalEl) cartTotalEl.textContent = money(cart.total_price / 100);
    if (cartCountEl) cartCountEl.textContent = cart.item_count;
  }
  function refreshShopifyCart() {
    fetch("/cart.js").then(function (r) { return r.json(); }).then(renderShopifyCart);
  }
  function shopifyAdd(variantId, qty) {
    return fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: variantId, quantity: qty })
    }).then(function (r) {
      if (!r.ok) throw new Error("add failed");
      return refreshShopifyCart();
    });
  }
  function shopifyChange(key, qty) {
    return fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: key, quantity: qty })
    }).then(function (r) { return r.json(); }).then(renderShopifyCart);
  }

  /* ================= DEMO CART MODE ================= */
  var CART_KEY = "dragonblood_cart";
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ }
  }
  function renderDemoCart() {
    var cart = loadCart();
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = "";
    var total = 0, count = 0;
    cart.forEach(function (item, i) {
      total += item.price * item.qty;
      count += item.qty;
      var li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML =
        '<img src="assets/serum-front.jpg" alt="">' +
        '<div class="cart-item__info">' +
          "<b></b>" +
          "<span>" + money(item.price * item.qty) + "</span>" +
          '<div class="cart-item__qty">' +
            '<button data-i="' + i + '" data-d="-1" aria-label="Decrease quantity">−</button>' +
            "<span>" + item.qty + "</span>" +
            '<button data-i="' + i + '" data-d="1" aria-label="Increase quantity">+</button>' +
          "</div>" +
        "</div>" +
        '<button class="cart-item__remove" data-remove="' + i + '">Remove</button>';
      li.querySelector("b").textContent = item.title;
      cartItemsEl.appendChild(li);
    });
    if (cartEmptyEl) cartEmptyEl.style.display = cart.length ? "none" : "";
    if (cartFoot) cartFoot.hidden = !cart.length;
    if (cartTotalEl) cartTotalEl.textContent = money(total);
    if (cartCountEl) cartCountEl.textContent = count;
  }

  /* ---------- cart item clicks (both modes) ---------- */
  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      if (SHOPIFY) {
        if (btn.hasAttribute("data-key")) {
          shopifyChange(btn.getAttribute("data-key"), Math.max(0, parseInt(btn.getAttribute("data-q"), 10)));
        }
        return;
      }
      var cart = loadCart();
      if (btn.hasAttribute("data-remove")) {
        cart.splice(parseInt(btn.getAttribute("data-remove"), 10), 1);
      } else if (btn.hasAttribute("data-i")) {
        var i = parseInt(btn.getAttribute("data-i"), 10);
        var d = parseInt(btn.getAttribute("data-d"), 10);
        cart[i].qty = Math.max(1, cart[i].qty + d);
      }
      saveCart(cart);
      renderDemoCart();
    });
  }

  /* ---------- add to cart ---------- */
  var addToCartBtn = $("#addToCart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      var b = selectedBundle();
      if (!b) return;
      if (SHOPIFY) {
        var bundlesEl = $("#bundles");
        var variantId = bundlesEl && bundlesEl.getAttribute("data-variant-id");
        if (variantId) {
          shopifyAdd(parseInt(variantId, 10), b.qty).then(openCart).catch(function () {
            addToCartBtn.textContent = "Could not add to cart";
          });
        } else {
          addToCartBtn.textContent = "Select a product in the theme editor";
          setTimeout(function () {
            addToCartBtn.innerHTML = 'Add To Cart — <span id="atcPrice"></span> <s id="atcCompare"></s>';
            atcPrice = $("#atcPrice"); atcCompare = $("#atcCompare");
            refreshOfferPrice();
          }, 2500);
        }
        return;
      }
      var cart = loadCart();
      var existing = cart.find(function (item) { return item.id === b.id; });
      if (existing) existing.qty += 1;
      else cart.push({ id: b.id, title: b.title, price: b.price, qty: 1 });
      saveCart(cart);
      renderDemoCart();
      openCart();
    });
  }

  /* ---------- checkout ---------- */
  var checkoutBtn = $("#checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (SHOPIFY) { window.location.href = "/checkout"; return; }
      checkoutBtn.textContent = "Connect a checkout to go live";
      setTimeout(function () { checkoutBtn.textContent = "Checkout"; }, 2200);
    });
  }

  if (SHOPIFY) refreshShopifyCart();
  else renderDemoCart();

  /* ---------- sticky mobile ATC ---------- */
  var stickyAtc = $("#stickyAtc"), offer = $("#offer");
  if (stickyAtc && offer && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var pastOffer = entry.boundingClientRect.top < 0 && !entry.isIntersecting;
        stickyAtc.classList.toggle("is-visible", pastOffer);
        stickyAtc.setAttribute("aria-hidden", pastOffer ? "false" : "true");
      });
    }, { threshold: 0 });
    observer.observe(offer);
  }

  /* ---------- newsletter (static demo only; Shopify uses a real form) ---------- */
  var newsletterForm = $("#newsletterForm");
  if (newsletterForm && !SHOPIFY) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      newsletterForm.classList.add("is-hidden");
      var thanks = $("#newsletterThanks");
      thanks && thanks.classList.remove("is-hidden");
    });
  }
})();
