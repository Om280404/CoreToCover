import api from "./axios";

/* =========================
   PLACE ORDER (CHECKOUT)
========================= */
export const placeOrder = async (orderData) => {
  try {
    const res = await api.post("/order/place", orderData);
    return res.data;
  } catch (err) {
    console.error("Error placing order:", err.response?.data || err);
    alert(err.response?.data?.message || "Error placing order");
    throw err;
  }
};
