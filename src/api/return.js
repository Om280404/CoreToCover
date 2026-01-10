// File: src/api/return.js
import axios from "./axios";

const userHeaders = () => ({
  "x-user-email": localStorage.getItem("userEmail"),
});

const sellerHeaders = () => ({
  "x-seller-email": localStorage.getItem("sellerEmail"),
});

// USER APIS
export const requestReturn = (formData) =>
  axios.post("/api/returns", formData, {
    headers: {
      ...userHeaders(),
      // Important for multipart/form-data — axios sets Content-Type automatically for FormData
    },
  });

export const getUserReturns = () =>
  axios.get("/api/returns/user", { headers: userHeaders() });

export const getUserCredit = () =>
  axios.get("/api/returns/credit", { headers: userHeaders() });

export const cancelReturn = (id) =>
  axios.patch(`/api/returns/${id}/cancel`, null, { headers: userHeaders() });

// SELLER APIS (if you use same file for seller, keep them here)
export const getSellerReturns = () =>
  axios.get("/api/returns/seller", { headers: sellerHeaders() });

export const approveReturn = (id, refundMethod) =>
  axios.post(`/api/returns/${id}/approve`, { refundMethod }, { headers: sellerHeaders() });


export const rejectReturn = (id, decisionNote) =>
  axios.post(`/api/returns/${id}/reject`, { decisionNote }, { headers: sellerHeaders() });
