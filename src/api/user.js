import api from "./axios";

/* =========================
   GET USER BY EMAIL
========================= */
export const getUserByEmail = (email) => {
  return api.get(`/user/${encodeURIComponent(email)}`);
};

/* =========================
   UPDATE USER PROFILE
========================= */
export const updateUserProfile = (email, payload) => {
  return api.put(`/user/${encodeURIComponent(email)}`, payload);
};
