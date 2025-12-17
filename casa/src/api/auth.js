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

export const sendSellerOtp = (phone) =>
  api.post("/seller/send-otp", { phone });

export const verifySellerOtp = (phone, otp) =>
  api.post("/seller/verify-otp", { phone, otp });


/* =========================
   CUSTOMER LOGIN
========================= */
export const customerLogin = (payload) => {
  return api.post("/login", payload);
};