import api from "./axios";

/* =========================
   DESIGNER SIGNUP
========================= */
export const designerSignup = async (payload) => {
  const res = await api.post("/designer/signup", payload);
  return res.data;
};

/* =========================
   DESIGNER LOGIN
========================= */
export const designerLogin = async (payload) => {
  const res = await api.post("/designer/login", payload);
  return res.data;
};


/* =========================
   DESIGNER PROFILE SETUP
========================= */
export const saveDesignerProfile = async (formData) => {
  const res = await api.post("/designer/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/* =========================
   SAVE DESIGNER PORTFOLIO
========================= */
export const saveDesignerPortfolio = async (formData) => {
  const res = await api.post("/designer/portfolio", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/* =========================
   GET DESIGNER BASIC INFO
========================= */
export const getDesignerBasic = async (designerId) => {
  const res = await api.get(`/designer/${designerId}/basic`);
  return res.data;
};

/* =========================
   UPDATE DESIGNER AVAILABILITY
========================= */
export const updateDesignerAvailability = async (designerId, availability) => {
  const res = await api.patch(`/designer/${designerId}/availability`, {
    availability,
  });
  return res.data;
};

/* =========================
   GET DESIGNER PORTFOLIO
========================= */
export const getDesignerPortfolio = async (designerId) => {
  const res = await api.get(`/designer/${designerId}/portfolio`);
  return res.data;
};

/* =========================
   ADD DESIGNER WORK
========================= */
export const addDesignerWork = async (designerId, payload) => {
  const res = await api.post(
    `/designer/${designerId}/work`,
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};

/* =========================
   UPDATE DESIGNER WORK
========================= */
export const updateDesignerWork = async (workId, payload) => {
  const res = await api.put(
    `/designer/work/${workId}`,
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};

/* =========================
   DELETE DESIGNER WORK
========================= */
export const deleteDesignerWork = async (workId) => {
  const res = await api.delete(`/designer/work/${workId}`);
  return res.data;
};

/* =========================
   GET EDIT PROFILE
========================= */
export const getDesignerEditProfile = async (designerId) => {
  const res = await api.get(`/designer/${designerId}/edit-profile`);
  return res.data;
};

/* =========================
   UPDATE EDIT PROFILE
========================= */
export const updateDesignerEditProfile = async (designerId, formData) => {
  const res = await api.put(
    `/designer/${designerId}/edit-profile`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

/* =========================
   FETCH DESIGNERS
========================= */
export const fetchDesigners = async () => {
  const res = await api.get("/designers");
  return res.data;
};

/* =========================
   GET DESIGNER DETAILS
========================= */
export const fetchDesignerById = async (id) => {
  const res = await api.get(`/designer/${id}`);
  return res.data;
};

/* =========================
   GET DESIGNER INFO
========================= */
export const getDesignerInfo = async (id) => {
  const res = await api.get(`/designer/${id}/info`);
  return res.data;
};

/* =========================
   HIRE DESIGNER
========================= */
export const hireDesigner = async (designerId, payload) => {
  const res = await api.post(`/designer/${designerId}/hire`, payload);
  return res.data;
};

/* =========================
   GET CLIENT HIRED DESIGNERS
========================= */
export const getClientHiredDesigners = ({ userId }) => {
  return api.get("/client/hired-designers", {
    params: { userId },
  });
};

/* =========================
   RATE DESIGNER
========================= */
export const rateDesigner = async (designerId, payload) => {
  const res = await api.post(`/designer/${designerId}/rate`, payload);
  return res.data;
};

/* ============================
   GET DESIGNER WORK REQUESTS
============================ */
export const getDesignerWorkRequests = async (designerId) => {
  const res = await api.get(`/designer/${designerId}/work-requests`);
  return res.data;
};

/* ============================
   DESIGNER → RATE CLIENT
============================ */
export const rateUser = async (designerId, payload) => {
  // payload = { hireRequestId, stars, review }
  const res = await api.post(`/designer/${designerId}/rate-user`, payload);
  return res.data;
};

/* ============================
   GET ALL RATINGS FOR A CLIENT
============================ */
export const getClientRatings = async (email) => {
  const res = await api.get(`/client/${encodeURIComponent(email)}/ratings`);
  return res.data;
};
