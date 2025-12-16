import api from "./axios";

/* ============================
   CUSTOMER SIGNUP
============================ */
export const customerSignup = (payload) => {
  return api.post("/signup", payload);
};

/* ============================
   SELLER SIGNUP
============================ */
export const sellerSignup = (payload) => {
  return api.post("/seller/signup", payload);
};

/* =========================
   CUSTOMER LOGIN
========================= */
export const customerLogin = (payload) => {
  return api.post("/login", payload);
};