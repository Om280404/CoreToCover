import React, { useEffect, useState } from "react";
import "./SellerReturns.css";
import {
    getSellerReturns,
    approveReturn,
    rejectReturn,
} from "../../api/sellerReturn";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";

export default function SellerReturns() {
    const [returns, setReturns] = useState([]);
    const [loadingId, setLoadingId] = useState(null);

    /* 🔹 Reject modal state */
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [selectedReturnId, setSelectedReturnId] = useState(null);

    useEffect(() => {
        getSellerReturns()
            .then((res) => setReturns(res.data.returns || []))
            .catch(() => setReturns([]));
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this return and credit the user?")) return;

        setLoadingId(id);
        try {
            await approveReturn(id);
            setReturns((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, status: "APPROVED" } : r
                )
            );
            alert("Return approved and credit issued");
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to approve");
        } finally {
            setLoadingId(null);
        }
    };

    /* ===============================
       REJECT FLOW
    =============================== */
    const openRejectModal = (id) => {
        setSelectedReturnId(id);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }

        setLoadingId(selectedReturnId);
        try {
            await rejectReturn(selectedReturnId, rejectReason);

            setReturns((prev) =>
                prev.map((r) =>
                    r.id === selectedReturnId
                        ? { ...r, status: "REJECTED" }
                        : r
                )
            );

            setRejectModalOpen(false);
            alert("Return rejected");
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to reject");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="ms-root">
            <Sidebar />
            <NotificationButton />

            <div className="seller-returns-page">
                <h2 className="page-title">Return Requests</h2>

                {returns.length === 0 && (
                    <p className="empty-text">No return requests</p>
                )}

                <div className="returns-grid">
                    {returns.map((r) => (
                        <div key={r.id} className="return-card">
                            <div className="card-header">
                                <h3>{r.productName}</h3>
                                <span className={`status-pill ${r.status.toLowerCase()}`}>
                                    {r.status}
                                </span>
                            </div>

                            <div className="card-body">
                                <p><strong>Customer:</strong> {r.user.name}</p>
                                <p><strong>Email:</strong> {r.user.email}</p>
                                <p><strong>Reason:</strong> {r.reason}</p>
                                {r.images && r.images.length > 0 && (
                                    <div className="return-images">
                                        {r.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={`http://localhost:3001${img}`}
                                                alt="Return proof"
                                                className="return-thumb"
                                            />
                                        ))}
                                    </div>
                                )}

                                <p><strong>Refund Amount:</strong> ₹{r.refundAmount}</p>
                                <p className="date">
                                    Requested on{" "}
                                    {new Date(r.requestedAt).toLocaleDateString()}
                                </p>
                            </div>

                            {r.status === "REQUESTED" && (
                                <div className="card-actions dual">
                                    <button
                                        className="approve-btn"
                                        disabled={loadingId === r.id}
                                        onClick={() => handleApprove(r.id)}
                                    >
                                        {loadingId === r.id ? "Processing..." : "Approve"}
                                    </button>

                                    <button
                                        className="reject-btn"
                                        onClick={() => openRejectModal(r.id)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ===============================
         REJECT MODAL
      =============================== */}
            {rejectModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>Reject Return</h3>
                        <p>Please provide a reason for rejecting this return.</p>

                        <textarea
                            placeholder="Enter rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setRejectModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-reject-btn"
                                onClick={handleReject}
                            >
                                Reject Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
