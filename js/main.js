/* Dragonblood® storefront interactions */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

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

  /* ---------- mobile nav ---------- */
  var navToggle = $("#navToggle"), siteNav = $("#siteNav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
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
        siteNav && siteNav.classList.remove("is-open");
      }
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

  /* ---------- bundle selection ---------- */
  var atcPrice = $("#atcPrice"), stickyPrice = $("#stickyPrice");
  function selectedBundle() {
    var input = $("#bundles input:checked");
    if (!input) return null;
    return {
      id: input.value,
      title: input.getAttribute("data-title"),
      price: parseFloat(input.getAttribute("data-price")),
      qty: parseInt(input.getAttribute("data-qty"), 10)
    };
  }
  function refreshOfferPrice() {
    var b = selectedBundle();
    if (!b) return;
    var label = "$" + b.price.toFixed(2);
    if (atcPrice) atcPrice.textContent = label;
    if (stickyPrice) stickyPrice.textContent = label;
  }
  $$("#bundles input").forEach(function (input) {
    input.addEventListener("change", refreshOfferPrice);
  });
  refreshOfferPrice();

  /* ---------- cart (localStorage demo cart) ---------- */
  var CART_KEY = "dragonblood_cart";
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ }
  }

  var cartDrawer = $("#cartDrawer"), cartOverlay = $("#cartOverlay");
  var cartItemsEl = $("#cartItems"), cartEmptyEl = $("#cartEmpty");
  var cartFoot = $("#cartFoot"), cartTotalEl = $("#cartTotal"), cartCountEl = $("#cartCount");

  function renderCart() {
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
        '<img src="assets/img/serum-front.jpg" alt="">' +
        '<div class="cart-item__info">' +
          "<b>" + item.title + "</b>" +
          "<span>$" + (item.price * item.qty).toFixed(2) + "</span>" +
          '<div class="cart-item__qty">' +
            '<button data-i="' + i + '" data-d="-1" aria-label="Decrease quantity">−</button>' +
            "<span>" + item.qty + "</span>" +
            '<button data-i="' + i + '" data-d="1" aria-label="Increase quantity">+</button>' +
          "</div>" +
        "</div>" +
        '<button class="cart-item__remove" data-remove="' + i + '">Remove</button>';
      cartItemsEl.appendChild(li);
    });
    if (cartEmptyEl) cartEmptyEl.style.display = cart.length ? "none" : "";
    if (cartFoot) cartFoot.hidden = !cart.length;
    if (cartTotalEl) cartTotalEl.textContent = "$" + total.toFixed(2);
    if (cartCountEl) cartCountEl.textContent = count;
  }

  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var cart = loadCart();
      if (btn.hasAttribute("data-remove")) {
        cart.splice(parseInt(btn.getAttribute("data-remove"), 10), 1);
      } else if (btn.hasAttribute("data-i")) {
        var i = parseInt(btn.getAttribute("data-i"), 10);
        var d = parseInt(btn.getAttribute("data-d"), 10);
        cart[i].qty = Math.max(1, cart[i].qty + d);
      }
      saveCart(cart);
      renderCart();
    });
  }

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
  var cartOpenBtn = $("#cartOpen");
  cartOpenBtn && cartOpenBtn.addEventListener("click", openCart);
  $("#cartClose") && $("#cartClose").addEventListener("click", closeCart);
  $("#continueShopping") && $("#continueShopping").addEventListener("click", closeCart);
  cartOverlay && cartOverlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCart(); });

  var addToCartBtn = $("#addToCart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      var b = selectedBundle();
      if (!b) return;
      var cart = loadCart();
      var existing = cart.find(function (item) { return item.id === b.id; });
      if (existing) existing.qty += 1;
      else cart.push({ id: b.id, title: b.title, price: b.price, qty: 1 });
      saveCart(cart);
      renderCart();
      openCart();
    });
  }

  var checkoutBtn = $("#checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      checkoutBtn.textContent = "Connect a checkout to go live";
      setTimeout(function () { checkoutBtn.textContent = "Checkout"; }, 2200);
    });
  }

  renderCart();

  /* ---------- show more reviews ---------- */
  var showMore = $("#showMoreReviews");
  if (showMore) {
    showMore.addEventListener("click", function () {
      $$("#reviewWall .review-card.is-hidden").forEach(function (card) {
        card.classList.remove("is-hidden");
      });
      showMore.style.display = "none";
    });
  }

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

  /* ---------- newsletter ---------- */
  var newsletterForm = $("#newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      newsletterForm.classList.add("is-hidden");
      var thanks = $("#newsletterThanks");
      thanks && thanks.classList.remove("is-hidden");
    });
  }
})();
