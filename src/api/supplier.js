import api from "./axios";

// ✅ Create or Register Supplier

export const createSupplier = async ({ email, password, name, phone, address, supplierid }) => {
  try {
    const res = await api.post("/supplier/signup", {
      email,
      password,
      name,
      phone,
      address,
      supplierid,
    });
    // console.log(res.data)
    return res.data;
  } catch (err) {
    console.error("Error creating supplier:", err);
    alert(err.response?.data?.message || "Error creating supplier");
    throw err;
  }
};
// ✅ Supplier Login
export const supplierLogin = async ({ email, password }) => {
  try {
    const res = await api.post("/supplier/login", { email, password });
    return res.data;
  } catch (err) {
    console.error("Error logging in supplier:", err);
    alert(err.response?.data?.message || "Error logging in supplier");
    throw err;
  }
};


// ✅ Get Supplier Profile (by ID)
export const getSupplierProfile = async (email) => {
  try {
    const res = await api.get(`/supplier/${email}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching supplier profile:", err);
    throw err;
  }
};

// ✅ Add Material (supplier adds new material)
export const addMaterial = async (form) => {
  try {
    const res = await api.post("/supplier/materials", form, {
      timeout: 120000, // same timeout you used
    });
    return res;
  } catch (err) {
    console.error("Add Material API Error:", err.response?.data || err);
    throw err;
  }
};

// ✅ Get all materials by supplier ID
export const getSupplierMaterials = async (supplierId) => {
  try {
    const res = await api.get(`/supplier/${supplierId}/materials`);
    return res.data;
  } catch (err) {
    console.error("Error fetching materials:", err);
    throw err;
  }
};

// ✅ Get all materials for customer home page view
export const getAllMaterialsForCustomer = async () => {
  try {
    const res = await api.get("/materials/all");
    return res.data;
  } catch (err) {
    console.error("Error fetching all materials for customer:", err);
    throw err;
  }
};

// ✅ Get materials based on search query for customer view
export const searchMaterialsForCustomer = async (query) => {
  try {
    // Pass query as a URL search parameter
    const res = await api.get(`/materials/search?query=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    console.error("Error searching materials for customer:", err);
    throw err;
  }
};

// Place an Order (Customer)
export const placeOrder = async (orderData) => {
  try {
    const res = await api.post("/api/placeorder", orderData);
    return res.data;
  } catch (err) {
    console.error("Error placing order:", err.response?.data || err);
    alert(err.response?.data?.message || "Error placing order");
    throw err;
  }
};

// Get all orders for a specific customer email
export const getCustomerOrders = async (email) => {
  try {
    const res = await api.get(`/api/orders/${encodeURIComponent(email)}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching customer orders:", err.response?.data || err);
    // Do not throw a hard error; return an empty array or re-throw if critical
    throw err; 
  }
};