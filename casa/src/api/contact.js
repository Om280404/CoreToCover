import api from "./axios";

export const sendContactMessage = (payload) => {
  return api.post("/api/contact", payload);
};
