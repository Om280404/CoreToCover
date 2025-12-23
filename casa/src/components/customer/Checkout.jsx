import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  getCart,
  clearCart,
  getSingleCheckoutItem,
  clearSingleCheckoutItem,
} from "../../utils/cart";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import Navbar from "./Navbar";
import COD from "../../assets/images/COD.png";
import GooglePay from "../../assets/images/GooglePay.png";
import Paytm from "../../assets/images/Paytm.png";
import PhonePe from "../../assets/images/PhonePe.jpg";

export default function Checkout() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  /* ===============================
     LOAD CART / SINGLE CHECKOUT
  =============================== */
  useEffect(() => {
    const single = getSingleCheckoutItem();
    const rawItems = single ? [single] : getCart();

    // Normalize items -> ensure consistent shape and `quantity` field
    const normalized = (Array.isArray(rawItems) ? rawItems : []).map((it) => ({
      // keep original properties, but ensure a `quantity` field
      ...it,
      // prefer existing fields in order: explicit quantity, trips, fallback 1
      quantity:
        Number(it.quantity ?? it.trips ?? it.trips === 0 ? it.trips : 1) ||
        Number(it.trips || it.quantity) ||
        1,
    }));

    setItems(normalized);

    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      api
        .get(`/user/${encodeURIComponent(userEmail)}`)
        .then((res) => {
          setName(res.data.name || "");
          setAddress(res.data.address || "");
        })
        .catch(() => {});
    }
  }, []);

  /* ===============================
     QUANTITY HANDLERS
  =============================== */

  const updateQuantity = (index, newQty) => {
    // ensure integer >= 1
    let q = Number(newQty);
    if (Number.isNaN(q) || q < 1) q = 1;

    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: Math.floor(q) };
      return copy;
    });
  };

  const increment = (index) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: (Number(copy[index].quantity) || 0) + 1 };
      return copy;
    });
  };

  const decrement = (index) => {
    setItems((prev) => {
      const copy = [...prev];
      const current = Number(copy[index].quantity) || 1;
      copy[index] = { ...copy[index], quantity: current > 1 ? current - 1 : 1 };
      return copy;
    });
  };

  /* ===============================
     SUMMARY CALCULATION
  =============================== */
  const computeSummary = () => {
    let subtotal = 0;
    let deliveryCharge = 0;
    let installationTotal = 0;

    items.forEach((it) => {
      // Use quantity (normalized above)
      const qty = Number(it.quantity || 1);

      // price per unit / per trip
      const unitPrice = Number(it.amountPerTrip || it.pricePerTrip || it.price || 0);

      subtotal += unitPrice * qty;

      if (it.shippingChargeType !== "free" && Number(it.shippingCharge) > 0) {
        // assume shippingCharge is per item (or per order depending on your model)
        // here we sum per item instance; if shipping is per order, change logic accordingly
        deliveryCharge += Number(it.shippingCharge);
      }

      if (it.installationAvailable === "yes" && Number(it.installationCharge) > 0) {
        installationTotal += Number(it.installationCharge) * qty;
      }
    });

    const casaCharge = Math.round(subtotal * 0.02); // 2%
    const grandTotal = subtotal + deliveryCharge + installationTotal + casaCharge;

    return {
      subtotal,
      deliveryCharge,
      installationTotal,
      casaCharge,
      grandTotal,
    };
  };

  /* ===============================
     PLACE ORDER
  =============================== */
  const handlePlaceOrder = async () => {
    if (!email || !name || !address) {
      alert("Please provide name, email and address.");
      return;
    }

    if (items.length === 0) {
      alert("No items to place order.");
      return;
    }

    const summary = computeSummary();

    const ordersPayload = items.map((it) => ({
      supplierId: Number(it.supplierId),
      materialId: Number(it.materialId || it.productId || 0),
      materialName: it.name || it.materialName || it.productName || "",
      supplierName: it.supplier || it.supplierName || "",
      trips: Number(it.quantity || 1), // send chosen quantity
      amountPerTrip: Number(it.amountPerTrip || it.pricePerTrip || it.price || 0),
      // include delivery/shipping/installation fields if backend expects them per item
      deliveryTimeMin: it.deliveryTimeMin ?? null,
      deliveryTimeMax: it.deliveryTimeMax ?? null,
      shippingChargeType: it.shippingChargeType ?? "free",
      shippingCharge: it.shippingCharge ? Number(it.shippingCharge) : 0,
      installationAvailable: it.installationAvailable ?? "no",
      installationCharge: it.installationCharge ? Number(it.installationCharge) : 0,
    }));

    setLoading(true);
    try {
      const res = await api.post("/order/place", {
        customerEmail: email,
        checkoutDetails: {
          name,
          address,
          paymentMethod,
        },
        orders: ordersPayload,
        summary,
      });

      if (res?.data?.orderId) {
        alert("Order placed successfully!");
        clearSingleCheckoutItem();
        clearCart();
        navigate("/userprofile");
      } else {
        alert("Order placed but response was unexpected.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const summary = computeSummary();

  /* ===============================
     UI
  =============================== */
  return (
    <>
      <Navbar />

      <div className="checkout-page">
        <h2>Checkout</h2>

        <div className="checkout-grid">
          {/* LEFT */}
          <div className="checkout-left">
            {/* FORM */}
            <div className="checkout-form">
              <label>
                Your name
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>

              <label>
                Email
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>

              <label>
                Address
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
              </label>
            </div>

            {/* PAYMENT METHODS */}
            <div className="payment-section">
              <h3 className="payment-title">Payment Method</h3>

              <div className="payment-options">
                <div
                  className={`payment-option ${paymentMethod === "gpay" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("gpay")}
                >
                  <img src={GooglePay} alt="Google Pay" />
                  <span>Google Pay</span>
                </div>

                <div
                  className={`payment-option ${paymentMethod === "phonepe" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("phonepe")}
                >
                  <img src={PhonePe} alt="PhonePe" />
                  <span>PhonePe</span>
                </div>

                <div
                  className={`payment-option ${paymentMethod === "paytm" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("paytm")}
                >
                  <img src={Paytm} alt="Paytm" />
                  <span>Paytm</span>
                </div>

                <div
                  className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <img src={COD} alt="Cash on Delivery" />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* ITEMS */}
            <h3 style={{ marginTop: 20 }}>Items</h3>
            <div className="checkout-items">
              {items.length === 0 ? (
                <p>No items to checkout.</p>
              ) : (
                items.map((it, idx) => (
                  <div key={idx} className="checkout-item">
                    <img
                      src={
                        it.image
                          ? it.image.startsWith("http")
                            ? it.image
                            : `http://localhost:3001/${it.image}`
                          : "/assets/images/sample.jpg"
                      }
                      alt={it.name}
                    />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontWeight: 600 }}>{it.name}</div>
                        <div style={{ fontSize: 14, color: "#6b7280" }}>₹{Number(it.amountPerTrip || it.pricePerTrip || it.price || 0).toLocaleString()}</div>
                      </div>

                      <div style={{ marginTop: 6, fontSize: 13 }}>
                        <div>Seller: {it.supplier}</div>
                      </div>

                      {/* QUANTITY CONTROLS */}
                      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => decrement(idx)}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              border: "1px solid #ddd",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            −
                          </button>

                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => updateQuantity(idx, e.target.value)}
                            style={{
                              width: 64,
                              textAlign: "center",
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #eee",
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => increment(idx)}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              border: "1px solid #ddd",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            +
                          </button>
                        </div>

                        <div style={{ marginLeft: 12, color: "#6b7280", fontSize: 13 }}>
                          <div>Subtotal: ₹{(Number(it.amountPerTrip || it.pricePerTrip || it.price || 0) * Number(it.quantity || 1)).toLocaleString()}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 8, fontSize: 13 }}>
                        <div>
                          <strong>Estimated delivery:</strong>{" "}
                          {it.deliveryTimeMin || it.deliveryTimeMax
                            ? `${it.deliveryTimeMin ?? "—"} to ${it.deliveryTimeMax ?? "—"} days`
                            : "Not specified"}
                        </div>
                        <div>
                          <strong>Shipping:</strong>{" "}
                          {it.shippingChargeType === "free" ? "Free" : `₹${it.shippingCharge ?? 0}`}
                        </div>
                        <div>
                          <strong>Installation:</strong>{" "}
                          {it.installationAvailable === "yes"
                            ? it.installationCharge > 0
                              ? `Available (₹${it.installationCharge})`
                              : "Available (Free)"
                            : "Not available"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT – SUMMARY */}
          <aside className="checkout-right">
            <h3>Summary</h3>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Subtotal</span>
                <span>₹{summary.subtotal.toLocaleString()}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Delivery</span>
                <span>₹{summary.deliveryCharge.toLocaleString()}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Installation</span>
                <span>₹{summary.installationTotal.toLocaleString()}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span>Casa charges</span>
                <span>₹{summary.casaCharge.toLocaleString()}</span>
              </div>

              <div style={{ fontWeight: 700, display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span>Total</span>
                <span>₹{summary.grandTotal.toLocaleString()}</span>
              </div>

              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading || items.length === 0}
              >
                {loading ? "Placing order..." : "Place order"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
