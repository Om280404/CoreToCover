import api from "./axios";

/* =========================
   PLACE ORDER
========================= */
export const placeOrder = (payload) => {
  return api.post("/order/place", payload);
};

/* =========================
   CANCEL ORDER
========================= */
export const cancelOrder = (orderId) => {
  return api.patch(`/order/${orderId}/cancel`);
};
