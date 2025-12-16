import api from "./axios";

/* =========================
   PLACE ORDER
========================= */
export const placeOrder = (payload) => {
  return api.post("/order/place", payload);
};
