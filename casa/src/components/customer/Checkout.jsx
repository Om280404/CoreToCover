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
import COD from "../../assets/images/COD.png"
import GooglePay from "../../assets/images/GooglePay.png"
import Paytm from "../../assets/images/Paytm.png"
import PhonePe from "../../assets/images/PhonePe.jpg"

export default function Checkout() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  /* ===============================
     LOAD CART / SINGLE CHECKOUT
  =============================== */
  useEffect(() => {
    const single = getSingleCheckoutItem();
    if (single) {
      setItems([single]);
    } else {
      setItems(getCart());
    }

    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      api
        .get(`/user/${encodeURIComponent(userEmail)}`)
        .then((res) => {
          setName(res.data.name || "");
          setAddress(res.data.address || "");
        })
        .catch(() => { });
    }
  }, []);

  /* ===============================
     SUMMARY CALCULATION
  =============================== */
  const computeSummary = () => {
    let subtotal = 0;
    let deliveryCharge = 0;
    let installationTotal = 0;

    items.forEach((it) => {
      subtotal +=
        Number(it.amountPerTrip || it.pricePerTrip || 0) *
        Number(it.trips || 1);

      if (it.shippingChargeType !== "free" && it.shippingCharge > 0) {
        deliveryCharge += Number(it.shippingCharge);
      }

      if (
        it.installationAvailable === "yes" &&
        it.installationCharge > 0
      ) {
        installationTotal += Number(it.installationCharge);
      }
    });

    const casaCharge = Math.round(subtotal * 0.02); // 2%
    const grandTotal =
      subtotal + deliveryCharge + installationTotal + casaCharge;

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

    const summary = computeSummary();

    const ordersPayload = items.map((it) => ({
      supplierId: Number(it.supplierId),
      materialId: Number(it.materialId),
      materialName:
        it.name || it.materialName || it.productName || "",
      supplierName: it.supplier || it.supplierName || "",
      trips: Number(it.trips || 1),
      amountPerTrip: Number(
        it.amountPerTrip || it.pricePerTrip || 0
      ),
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
        navigate("/myorders");
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
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                Email
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label>
                Address
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
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
                      <div style={{ fontWeight: 600 }}>{it.name}</div>
                      <div>Seller: {it.supplier}</div>
                      <div>Qty: {it.trips}</div>
                      <div>
                        Price: ₹
                        {Number(it.amountPerTrip || 0).toLocaleString()}
                      </div>


                      <div style={{ marginTop: 8, fontSize: 13 }}>
                        <div>
                          <strong>Estimated delivery:</strong>{" "}
                          {it.deliveryTimeMin || it.deliveryTimeMax
                            ? `${it.deliveryTimeMin ?? "—"} to ${it.deliveryTimeMax ?? "—"
                            } days`
                            : "Not specified"}
                        </div>
                        <div>
                          <strong>Shipping:</strong>{" "}
                          {it.shippingChargeType === "free"
                            ? "Free"
                            : `₹${it.shippingCharge ?? 0}`}
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
              <div>
                <span>Subtotal</span>
                <span>
                  ₹{summary.subtotal.toLocaleString()}
                </span>
              </div>

              <div>
                <span>Delivery</span>
                <span>
                  ₹{summary.deliveryCharge.toLocaleString()}
                </span>
              </div>

              <div>
                <span>Installation</span>
                <span>
                  ₹{summary.installationTotal.toLocaleString()}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Casa charges</span>
                <span>₹{summary.casaCharge.toLocaleString()}</span>
              </div>


              <div style={{ fontWeight: 700 }}>
                <span>Total</span>
                <span>
                  ₹{summary.grandTotal.toLocaleString()}
                </span>
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
