/* ============================
   CART UTILS — USER SCOPED
============================ */

/**
 * Returns the correct cart key based on login state
 * - Logged-in user  → customerCart_email
 * - Guest user      → guestCart
 */
const getCartKey = () => {
  const email = localStorage.getItem("userEmail");
  return email ? `customerCart_${email}` : "guestCart";
};

/* ============================
   LOAD CART
============================ */
export const loadCart = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(getCartKey())) || [];

    // Filter invalid items (safety)
    return raw.filter(
      (item) =>
        item &&
        item.materialId !== undefined &&
        item.supplierId !== undefined &&
        item.amountPerTrip !== undefined
    );
  } catch (err) {
    console.error("LOAD CART ERROR:", err);
    return [];
  }
};

/* ============================
   SAVE CART
============================ */
export const saveCart = (cart) => {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
};

/* ============================
   ADD TO CART
============================ */
export const addToCart = (product) => {
  if (
    !product ||
    product.materialId === undefined ||
    product.supplierId === undefined
  ) {
    return loadCart();
  }

  const cart = loadCart();

  const index = cart.findIndex(
    (item) =>
      item.materialId === product.materialId &&
      item.supplierId === product.supplierId
  );

  if (index > -1) {
    const currentQty = Number(cart[index].trips) || 1;
    const addQty = Number(product.trips) || 1;

    const newQty = currentQty + addQty;

    cart[index].trips = newQty;
    cart[index].amount = cart[index].amountPerTrip * newQty;
  } else {
    cart.push({
      ...product,
      trips: Number(product.trips) || 1,
      amount:
        Number(product.amountPerTrip) *
        (Number(product.trips) || 1),
    });
  }

  saveCart(cart);
  return cart;
};

/* ============================
   UPDATE CART ITEM QUANTITY
============================ */
export const updateCartItemQuantity = (materialId, qty) => {
  const quantity = Number(qty);

  if (!materialId || isNaN(quantity) || quantity < 1) {
    return loadCart();
  }

  const cart = loadCart();

  const index = cart.findIndex(
    (item) => item.materialId === materialId
  );

  if (index > -1) {
    cart[index].trips = quantity;
    cart[index].amount =
      cart[index].amountPerTrip * quantity;
  }

  saveCart(cart);
  return cart;
};

/* ============================
   REMOVE ITEM FROM CART
============================ */
export const removeFromCart = (materialId) => {
  const cart = loadCart().filter(
    (item) => item.materialId !== materialId
  );

  saveCart(cart);
  return cart;
};

/* ============================
   CLEAR CART (OPTIONAL USE)
============================ */
export const clearCart = () => {
  localStorage.removeItem(getCartKey());
};
