import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import sample from "../../assets/images/sample.jpg";
import Navbar from "./Navbar";
import { loadCart, updateCartItemQuantity, removeFromCart } from "../../utils/cart";

const Cart = () => {
    const navigate = useNavigate();

    const [basketItems, setBasketItems] = useState([]);

    useEffect(() => {
        // Load cart from local storage on component mount
        setBasketItems(loadCart());
    }, []);

    const updateQuantity = (id, newQty) => {
        const qty = parseInt(newQty) || 1;
        if (qty < 1) return;

        // Use the utility to update quantity
        const updatedCart = updateCartItemQuantity(id, qty);
        setBasketItems(updatedCart);
    };

    const removeItem = (id) => {
        if (!window.confirm("Remove this item from the cart?")) return;
        const updatedCart = removeFromCart(id);
        setBasketItems(updatedCart);
    };

    // Note: item.amount in local storage should represent the total amount for that item (unitPrice * trips)
    const subtotal = basketItems.reduce((sum, item) => {
        const unit = item.amountPerTrip ?? item.price ?? 0;
        const qty = item.trips || item.quantity || 1;
        return sum + unit * qty;
    }, 0);

    const grandTotal = subtotal;

    const handleCheckout = () => {
        if (basketItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // FIX: Ensure 'trips' field is consistently extracted, checking for 'quantity' (legacy field) fallback
        navigate("/checkout", {
            state: {
                products: basketItems.map(item => {
                    // Ensure we get the trip count, falling back to 'quantity' (legacy) or 1
                    const trips = item.trips || item.quantity || 1;

                    return ({
                        materialId: item.materialId,
                        supplierId: item.supplierId,
                        name: item.name,
                        supplier: item.supplier,
                        amountPerTrip: item.amountPerTrip,
                        trips: trips, // Pass the corrected, derived trips count
                        amount: item.amount,
                        image: item.image,
                        delivery: item.delivery,
                    })
                }),
            },
        });
    };


    return (
        <>
            <Navbar />
            <main className="cart-page">
                {/* Updated heading with unique item count */}
                <h1 className="cart-heading">
                    Your Shopping Cart
                    {basketItems.length > 0 && (
                        <span style={{ fontSize: '0.8em', fontWeight: 'normal', color: 'var(--muted)', marginLeft: '12px' }}>
                            ({basketItems.length} item{basketItems.length !== 1 ? 's' : ''})
                        </span>
                    )}
                </h1>

                <section className="cart-layout">
                    {/* LEFT SECTION - ITEMS */}
                    <div className="cart-list">
                        {basketItems.length > 0 ? (
                            basketItems.map((item) => (
                                <article key={item.materialId} className="cart-card">
                                    <div className="cart-img-box">
                                        <img src={item.image || sample} alt={item.name} className="cart-img" />
                                    </div>

                                    <div className="cart-details">
                                        {/* Display item quantity (trips) next to the name */}
                                        <h3>{item.name} ({item.trips || item.quantity || 1} Trips)</h3>
                                        <p className="cart-desc">{item.product_info}</p>

                                        <p className="cart-supplier">
                                            Sold by <strong>{item.supplier}</strong>{" "}
                                            <span className="cart-stock">In Stock</span>
                                        </p>

                                        <p className="cart-delivery">{item.delivery}</p>

                                        <p className="cart-price">
                                            Unit Price: <strong>₹{(item.amountPerTrip ?? item.price ?? 0).toFixed(2)}
                                            </strong>
                                        </p>
                                        <p className="cart-price">
                                            Subtotal: <strong>₹{(item.amount ?? (item.amountPerTrip ?? item.price ?? 0) * (item.trips || item.quantity || 1)).toFixed(2)}
                                            </strong>
                                        </p>

                                        <div className="cart-actions">
                                            <label>Qty (Trips):</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.trips || item.quantity || 1} // Ensure input value works for both 'trips' and legacy 'quantity'
                                                onChange={(e) =>
                                                    updateQuantity(item.materialId, e.target.value)
                                                }
                                            />
                                            <button
                                                className="cart-remove-btn"
                                                onClick={() => removeItem(item.materialId)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p className="cart-empty">Your cart is empty. <button onClick={() => navigate("/home")} className="btn-primary" style={{ marginTop: '10px' }}>Go Shopping</button></p>
                        )}
                    </div>

                    {/* RIGHT SUMMARY */}
                    <aside className="cart-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Items ({basketItems.length})</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>
                        <p className="cart-note">Taxes and delivery calculated at checkout</p>

                        <button
                            className="checkout-btn"
                            onClick={handleCheckout}
                            disabled={basketItems.length === 0}
                        >
                            Proceed to Checkout ({basketItems.length} items)
                        </button>
                    </aside>
                </section>

                {/* Suggested Items - Hardcoded, as original */}
                <section className="cart-suggested">
                    <h2>You may also like</h2>
                    <div className="suggested-grid">
                        <div className="suggested-card">
                            <img src={sample} alt="10mm Aggregate" />
                            <p>10mm Aggregate</p>
                            <span>₹900 / Trip</span>
                        </div>
                        <div className="suggested-card">
                            <img src={sample} alt="Plaster Sand" />
                            <p>Plaster Sand</p>
                            <span>₹750 / Trip</span>
                        </div>
                        <div className="suggested-card">
                            <img src={sample} alt="6mm Aggregate" />
                            <p>6mm Aggregate</p>
                            <span>₹1250 / Trip</span>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Cart;