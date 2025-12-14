import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Checkout.css";
import { loadCart, clearCart } from "../../utils/cart";
import sample from "../../assets/images/sample.jpg";

const Checkout = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isSingleBuy, setIsSingleBuy] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "";

  /* ============================
     LOAD PRODUCTS (BUY NOW / CART)
  ============================ */
  useEffect(() => {
    const single = JSON.parse(localStorage.getItem("singleCheckoutItem"));

    if (single && single.materialId) {
      setProducts([single]);     // ✅ wrap object in array
      setIsSingleBuy(true);
      return;
    }

    setProducts(loadCart() || []);
    setIsSingleBuy(false);
  }, []);

  /* ============================
     FETCH USER DETAILS
  ============================ */
  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:3001/user/${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        setName(data.name || "");
        setAddress(data.address || "");
      })
      .catch(() => {});
  }, [userEmail, navigate]);

  /* ============================
     CALCULATIONS
  ============================ */
  const {
    subtotal,
    casaCharge,
    deliveryCharge,
    grandTotal,
    calculatedOrders,
  } = useMemo(() => {
    let subtotal = 0;

    const orders = products.map(p => {
      const unit = Number(p.amountPerTrip) || 0;
      const qty = Number(p.trips) || 1;
      const total = unit * qty;

      subtotal += total;

      return {
        materialId: p.materialId,
        supplierId: p.supplierId,
        materialName: p.name,
        supplierName: p.supplier,
        trips: qty,
        amountPerTrip: unit,
        totalAmount: total,
      };
    });

    const casaCharge = +(subtotal * 0.05).toFixed(2);
    const deliveryCharge = subtotal >= 5000 ? 0 : 150;

    return {
      subtotal,
      casaCharge,
      deliveryCharge,
      grandTotal: subtotal + casaCharge + deliveryCharge,
      calculatedOrders: orders,
    };
  }, [products]);

  /* ============================
     PLACE ORDER
  ============================ */
  const handlePlaceOrder = async () => {
    if (!name.trim() || !address.trim()) {
      alert("Please fill name & address");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3001/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: userEmail,
          checkoutDetails: { name, address, paymentMethod },
          orders: calculatedOrders,
          summary: { subtotal, casaCharge, deliveryCharge, grandTotal },
        }),
      });

      if (!res.ok) throw new Error();

      alert("Order placed successfully ✅");

      if (isSingleBuy) {
        localStorage.removeItem("singleCheckoutItem");
      } else {
        clearCart();
      }

      navigate("/home");
    } catch {
      alert("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================
     EMPTY STATE
  ============================ */
  if (!products.length) {
    return (
      <>
        <Navbar />
        <h2 style={{ textAlign: "center", padding: 40 }}>
          No items selected for checkout
        </h2>
      </>
    );
  }

  /* ============================
     UI
  ============================ */
  return (
    <>
      <Navbar />

      <main className="checkout-page">
        {/* LEFT */}
        <div className="checkout-left">
          <div className="checkout-card">
            <h3>Customer Name</h3>
            <input
              className="checkout-input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="checkout-card">
            <h3>Delivery Address</h3>
            <textarea
              className="checkout-textarea"
              rows="3"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div className="checkout-card">
            <h3>Payment Method</h3>
            <div className="payment-options">
              {[
                ["gpay", "Google Pay", "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg"],
                ["phonepe", "PhonePe", "https://upload.wikimedia.org/wikipedia/commons/0/09/PhonePe_Logo.svg"],
                ["paytm", "Paytm", "https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png"],
                ["cod", "Cash on Delivery", "https://cdn-icons-png.flaticon.com/512/3856/3856330.png"],
              ].map(([id, label, img]) => (
                <label
                  key={id}
                  className={`payment-option ${paymentMethod === id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                  />
                  <img src={img} alt={label} />
                  <span>{label}</span>
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
                  <p className="item-name">{p.name}</p>
                  <span className="item-price">
                    ₹{(p.amountPerTrip * p.trips).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-pricing">
            <div><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div><span>Casa Charges</span><span>₹{casaCharge.toFixed(2)}</span></div>
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
            disabled={isSubmitting}
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </main>
    </>
  );
};

export default Checkout;
