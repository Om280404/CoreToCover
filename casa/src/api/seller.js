import api from "./axios";


/* =========================
   GET SELLER PROFILE
========================= */
export const getSellerProfile = (sellerId) => {
  return api.get(`/seller/profile/${sellerId}`);
};

/* =========================
   UPDATE SELLER PROFILE
========================= */
export const updateSellerProfile = (sellerId, payload) => {
  return api.put(`/seller/profile/${sellerId}`, payload);
};

/* =========================
   CREATE SELLER BUSINESS DETAILS
========================= */
export const createSellerBusinessDetails = (payload) => {
  return api.post("/seller/business-details", payload);
};

/* =========================
   GET SELLER BANK DETAILS
========================= */
export const getSellerBankDetails = (sellerId) => {
  return api.get(`/seller/${sellerId}/bank-details`);
};

/* =========================
   VERIFY SELLER PASSWORD
========================= */
export const verifySellerPassword = (sellerId, password) => {
  return api.post("/seller/verify-password", {
    sellerId,
    password,
  });
};

/* =========================
   SAVE / UPDATE SELLER BANK DETAILS
========================= */
export const saveSellerBankDetails = (payload) => {
  return api.post("/seller/bank-details", payload);
};

/* =========================
   GET SELLER ORDERS
========================= */
export const getSellerOrders = (sellerId) => {
  return api.get(`/seller/${sellerId}/orders`);
};

/* =========================
   UPDATE ORDER ITEM STATUS
========================= */
export const updateSellerOrderStatus = (orderItemId, status) => {
  return api.patch(`/seller/order/${orderItemId}/status`, {
    status,
  });
};

/* =========================
   ADD SELLER PRODUCT
========================= */
export const addSellerProduct = (formData) => {
  return api.post("/seller/product", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* =========================
   SELLER PRODUCTS
========================= */

export const getSellerProducts = (sellerId) =>
  api.get(`/seller/${sellerId}/products`);

export const updateSellerProduct = (productId, formData) =>
  api.put(`/seller/product/${productId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteSellerProduct = (productId) =>
  api.delete(`/seller/product/${productId}`);

/* =========================
   PRODUCT RATINGS
========================= */

export const getProductRatings = (productId) =>
  api.get(`/product/${productId}/ratings`);

/* =========================
   SAVE / UPDATE SELLER DELIVERY DETAILS
========================= */
export const saveSellerDeliveryDetails = (payload) => {
  return api.post("/seller/delivery-details", payload);
};

/* =========================
   GET SELLER DELIVERY DETAILS (optional, for edit later)
========================= */
export const getSellerDeliveryDetails = (sellerId) => {
  return api.get(`/seller/${sellerId}/delivery-details`);
};


export const getSellerDashboard = (sellerId) =>
  api.get(`/seller/${sellerId}/dashboard`);
