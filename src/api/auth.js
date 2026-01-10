import api from "./axios";

/* ============================
   CUSTOMER SIGNUP
============================ */
export const customerSignup = (payload) => {
  return api.post("/signup", payload);
};

/* ============================
   CUSTOMER OTP
============================ */
export const sendCustomerOtp = (email) =>
  api.post("/customer/send-otp", { email });

export const verifyCustomerOtp = (email, otp) =>
  api.post("/customer/verify-otp", { email, otp });


/* ============================
   SELLER SIGNUP
============================ */
export const sellerSignup = (payload) => {
  return api.post("/seller/signup", payload);
};

/* ============================
   SELLER EMAIL OTP
============================ */
export const sendSellerOtp = (email) => {
  return api.post("/seller/send-otp", { email });
};

export const verifySellerOtp = (email, otp) => {
  return api.post("/seller/verify-otp", { email, otp });
};

/* ============================
   CUSTOMER LOGIN
============================ */
export const customerLogin = (payload) => {
  return api.post("/login", payload);
};
