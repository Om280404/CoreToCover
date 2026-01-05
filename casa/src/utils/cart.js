// src/utils/cart.js

const CART_KEY = "casa_cart";
const SINGLE_CHECKOUT_KEY = "singleCheckoutItem";

/* =========================
   LOAD CART
========================= */
export const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/* =========================
   SAVE CART
========================= */
const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

/* =========================
   ADD TO CART
========================= */
export const addToCart = (item) => {
  const cart = loadCart();

  const index = cart.findIndex(
    (c) =>
      c.materialId === item.materialId &&
      c.supplierId === item.supplierId
  );

  if (index >= 0) {
    cart[index].trips += Number(item.trips || 1);
  } else {
    cart.push({
      ...item,
      trips: Number(item.trips || 1),
      amountPerTrip: Number(item.amountPerTrip || 0),
      shippingCharge: Number(item.shippingCharge || 0),
      installationCharge: Number(item.installationCharge || 0),
    });
  }

  saveCart(cart);
};

/* =========================
   UPDATE QUANTITY
========================= */
export const updateCartItemQuantity = (materialId, qty) => {
  const cart = loadCart().map((item) =>
    item.materialId === materialId
      ? { ...item, trips: qty }
      : item
  );

  saveCart(cart);
  return cart;
};

/* =========================
   REMOVE ITEM
========================= */
export const removeFromCart = (materialId) => {
  const cart = loadCart().filter(
    (item) => item.materialId !== materialId
  );

  saveCart(cart);
  return cart;
};

/* =========================
   CLEAR CART
========================= */
export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};

/* =========================
   SINGLE CHECKOUT
========================= */
export const setSingleCheckoutItem = (item) => {
  localStorage.setItem(
    SINGLE_CHECKOUT_KEY,
    JSON.stringify(item)
  );
};

export const getSingleCheckoutItem = () => {
  try {
    const raw = localStorage.getItem(SINGLE_CHECKOUT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearSingleCheckoutItem = () => {
  localStorage.removeItem(SINGLE_CHECKOUT_KEY);
};

export const getCart = loadCart;
