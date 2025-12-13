// my-supplier/src/utils/cart.js

const CART_KEY = "customerCart";

// Load cart items from local storage
export const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Save cart items to local storage
export const saveCart = (cartItems) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  } catch (e) {
    console.error("Could not save cart to local storage:", e);
  }
};

// Add/Update item in cart
export const addToCart = (product) => {
  const cart = loadCart();
  // Use materialId and supplierId to find existing item
  const existingIndex = cart.findIndex(
    item => item.materialId === product.materialId && item.supplierId === product.supplierId
  );

  if (existingIndex > -1) {
    // Update quantity (trips)
    cart[existingIndex].trips += product.trips;
    cart[existingIndex].amount = cart[existingIndex].amountPerTrip * cart[existingIndex].trips;
  } else {
    // Add new item
    cart.push(product);
  }
  saveCart(cart);
  return cart;
};

// Remove item from cart
export const removeFromCart = (materialId) => {
  const cart = loadCart();
  const newCart = cart.filter(item => item.materialId !== materialId);
  saveCart(newCart);
  return newCart;
};

// Update quantity for an existing item
export const updateCartItemQuantity = (materialId, newTrips) => {
  const cart = loadCart();
  const itemIndex = cart.findIndex(item => item.materialId === materialId);
  
  if (itemIndex > -1) {
    const unitPrice = cart[itemIndex].amountPerTrip; // Use the base amount per trip
    cart[itemIndex].trips = newTrips;
    cart[itemIndex].amount = unitPrice * newTrips;
    saveCart(cart);
  }
  return cart;
};

// Clear the cart entirely
export const clearCart = () => {
    localStorage.removeItem(CART_KEY);
}