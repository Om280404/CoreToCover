import api from "./axios";

/* =========================
   SELLER LOGIN
========================= */
export const sellerLogin = (payload) => {
  return api.post("/seller/login", payload);
};

/* =========================
   SELLER SIGNUP
========================= */
export const sellerSignup = (payload) => {
  return api.post("/seller/signup", payload);
};