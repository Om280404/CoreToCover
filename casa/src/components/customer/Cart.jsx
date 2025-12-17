import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Cart.css";
import sample from "../../assets/images/sample.jpg";
import {
  loadCart,
  updateCartItemQuantity,
  removeFromCart,
} from "../../utils/cart";

const Cart = () => {
  const navigate = useNavigate();
  const [basketItems, setBasketItems] = useState([]);

  useEffect(() => {
    setBasketItems(loadCart());
  }, []);

  const handleQuantityChange = (id, value) => {
    if (value === "") {
      setBasketItems(prev =>
        prev.map(item =>
          item.materialId === id ? { ...item, trips: "" } : item
        )
      );
      return;
    }

    const qty = Number(value);
    if (isNaN(qty) || qty < 1) return;

    setBasketItems(updateCartItemQuantity(id, qty));
  };

  const handleQuantityBlur = (id, value) => {
    const qty = Number(value);
    setBasketItems(updateCartItemQuantity(id, qty >= 1 ? qty : 1));
  };

  const subtotal = basketItems.reduce(
    (sum, item) =>
      sum + (Number(item.amountPerTrip) || 0) * (Number(item.trips) || 1),
    0
  );

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <h1 className="cart-heading">Your Shopping Cart</h1>

        <section className="cart-layout">
          <div className="cart-list">
            {basketItems.length === 0 ? (
              <p className="cart-empty">Your cart is empty.</p>
            ) : (
              basketItems.map(item => (
                <article key={item.materialId} className="cart-card">
                  {/* IMAGE */}
                  <div className="cart-img-box">
                    <img
                      src={item.image || sample}
                      className="cart-img"
                      alt={item.name}
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="cart-details">
                    <h3>{item.name}</h3>

                    <p className="cart-price">
                      ₹{item.amountPerTrip * (item.trips || 1)}
                    </p>

                    <div className="cart-actions">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.trips}
                        onChange={e =>
                          handleQuantityChange(
                            item.materialId,
                            e.target.value
                          )
                        }
                        onBlur={e =>
                          handleQuantityBlur(
                            item.materialId,
                            e.target.value
                          )
                        }
                      />

                      <button
                        className="cart-remove-btn"
                        onClick={() =>
                          setBasketItems(
                            removeFromCart(item.materialId)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* ✅ SUMMARY NOW VISIBLE */}
          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{subtotal}</span>
            </div>

            <button
              className="checkout-btn"
              disabled={!basketItems.length}
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </aside>
        </section>
      </main>
    </>
  );
};

export default Cart;
