import api from "./axios";

const sellerHeaders = {
  "x-seller-email": localStorage.getItem("sellerEmail"),
};

export const getSellerReturns = () =>
  api.get("/api/returns/seller", { headers: sellerHeaders });

export const approveReturn = (id) =>
  api.post(`/api/returns/${id}/approve`, null, {
    headers: sellerHeaders,
  });

export const rejectReturn = (id, decisionNote) =>
  api.post(
    `/api/returns/${id}/reject`,
    { decisionNote },
    { headers: sellerHeaders }
  );
