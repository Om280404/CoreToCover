const CART_KEY = "customerCart";

export const loadCart = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    // ✅ REMOVE INVALID ITEMS
    return raw.filter(
      item =>
        item.materialId !== undefined &&
        item.supplierId !== undefined
    );
  } catch {
    return [];
  }
};


export const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addToCart = (product) => {
  const cart = loadCart();

  const index = cart.findIndex(
    (item) =>
      item.materialId === product.materialId &&
      item.supplierId === product.supplierId
  );

  if (index > -1) {
    cart[index].trips += product.trips;
    cart[index].amount =
      cart[index].amountPerTrip * cart[index].trips;
  } else {
    cart.push(product);
  }

  saveCart(cart);
  return cart;
};

export const updateCartItemQuantity = (materialId, qty) => {
  const cart = loadCart();

  const index = cart.findIndex(
    (item) => item.materialId === materialId
  );

  if (index > -1) {
    cart[index].trips = qty;
    cart[index].amount =
      cart[index].amountPerTrip * qty;
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (materialId) => {
  const cart = loadCart().filter(
    (item) => item.materialId !== materialId
  );

  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};
