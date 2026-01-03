import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Checkout.css";
import { clearCart } from "../../utils/cart";
import sample from "../../assets/images/sample.jpg";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const products = location.state?.products || [];

  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "";

  /* ============================
     FETCH USER DETAILS
  ============================ */
  useEffect(() => {
    if (!userEmail) {
      alert("Please log in to continue");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/user/${encodeURIComponent(userEmail)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setName(data.name || "");
        setAddress(data.address || "");
      } catch (err) {
        console.error("User fetch failed", err);
      }
    };

    fetchUser();
  }, [userEmail, navigate]);

  /* ============================
     CALCULATE TOTALS
  ============================ */
  const {
    subtotal,
    casaCharge,
    deliveryCharge,
    grandTotal,
    calculatedOrders,
  } = useMemo(() => {
    let subtotal = 0;

    const calculatedOrders = products.map((p) => {
      const unit = Number(p.amountPerTrip) || 0;
      const qty = Number(p.trips) || 1;
      const itemTotal = unit * qty;

      subtotal += itemTotal;

      return {
        materialId: p.materialId,
        supplierId: p.supplierId,
        materialName: p.name,
        supplierName: p.supplier,
        trips: qty,
        amountPerTrip: unit,
        totalAmount: itemTotal,
      };
    });

    const casaCharge = +(subtotal * 0.05).toFixed(2); // 5%
    const deliveryCharge = subtotal >= 5000 ? 0 : 150;
    const grandTotal = subtotal + casaCharge + deliveryCharge;

    return {
      subtotal,
      casaCharge,
      deliveryCharge,
      grandTotal,
      calculatedOrders,
    };
  }, [products]);

  /* ============================
     EMPTY STATE
  ============================ */
  if (products.length === 0) {
    return (
      <>
        <Navbar />
        <main className="checkout-page">
          <div className="checkout-empty">
            <h2>No items selected for checkout 🚫</h2>
          </div>
        </main>
      </>
    );
  }

  /* ============================
     PLACE ORDER
  ============================ */
  const handlePlaceOrder = async () => {
    if (!name.trim() || !address.trim() || isSubmitting) {
      alert("Please fill name & address");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customerEmail: userEmail,
      checkoutDetails: {
        name,
        address,
        paymentMethod,
      },
      orders: calculatedOrders,
      summary: {
        subtotal,
        casaCharge,
        deliveryCharge,
        grandTotal,
      },
    };

    try {
      const res = await fetch("http://localhost:3001/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Order failed");

      alert("Order placed successfully ✅");
      clearCart();
      navigate("/home");
    } catch (err) {
      console.error("Order error:", err);
      alert("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================
     UI
  ============================ */
  return (
    <>
      <Navbar />

      <main className="checkout-page">
        {/* LEFT */}
        <div className="checkout-left">
          <h2 className="section-title">Customer Details</h2>

          <div className="checkout-card">
            <h3>Customer Name</h3>
            <input
              className="checkout-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="checkout-card">
            <h3>Delivery Address</h3>
            <textarea
              className="checkout-textarea"
              rows="3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* ✅ PAYMENT METHOD (RESTORED) */}
          <div className="checkout-card">
            <h3>Payment Method</h3>
            <div className="payment-options">
              {[
                {
                  id: "gpay",
                  name: "Google Pay",
                  img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png",
                },
                {
                  id: "phonepe",
                  name: "PhonePe",
                  img: "https://img.icons8.com/color/1200/phone-pe.jpg",
                },
                {
                  id: "paytm",
                  name: "Paytm",
                  img: "https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png",
                },
                {
                  id: "cod",
                  name: "Cash on Delivery",
                  img: "https://cdn-icons-png.flaticon.com/512/3856/3856330.png",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`payment-option ${paymentMethod === opt.id ? "selected" : ""
                    }`}
                >
                  <input
                    type="radio"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <img src={opt.img} alt={opt.name} />
                  <span>{opt.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="checkout-right">
          <h2>Order Summary</h2>

          <div className="summary-item-list">
            {products.map((p, i) => (
              <div key={i} className="summary-list-item">
                <img src={p.image || sample} alt={p.name} />
                <div>
                  <p className="item-name">
                    {p.name}
                  </p>
                  <span className="item-price">
                    ₹{(p.amountPerTrip * p.trips).toFixed(2)}
                  </span>

                </div>
              </div>
            ))}
          </div>

          <div className="summary-pricing">
            <div>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>Casa Charges</span>
              <span>₹{casaCharge.toFixed(2)}</span>
            </div>
            <div>
              <span>Delivery</span>
              <span>{deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}</span>
            </div>
            <div className="summary-total">
              <span>Total Payable</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="place-btn"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </main>
    </>
  );
};

export default Checkout;
