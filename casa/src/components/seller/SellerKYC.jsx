import React, { useState } from "react";
import "./SellerKYC.css";
import { useNavigate } from "react-router-dom";


const SellerKYC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        aadhaar: "",
        pan: "",
        aadhaarFile: null,
        panFile: null,
        declaration: false,
    });

    const [errors, setErrors] = useState({});
    const [panStatus, setPanStatus] = useState("idle");
    // idle | verifying | verified | failed

    /* =========================
       INPUT HANDLERS
    ========================= */

    const handleAadhaarChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        setForm({ ...form, aadhaar: value });
    };

    const handlePanChange = (e) => {
        const value = e.target.value
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase();
        setForm({ ...form, pan: value });
        setPanStatus("idle"); // reset if edited
    };

    const handleCheckbox = (e) => {
        setForm({ ...form, declaration: e.target.checked });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setForm({ ...form, [name]: files[0] });
    };

    /* =========================
       PAN VERIFICATION (MOCK)
       Replace API later
    ========================= */

    const verifyPan = async () => {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) {
            setErrors({ ...errors, pan: "Invalid PAN format" });
            return;
        }

        setPanStatus("verifying");

        // 🔁 simulate API call
        setTimeout(() => {
            if (form.pan.endsWith("F")) {
                setPanStatus("verified");
            } else {
                setPanStatus("failed");
            }
        }, 1500);
    };

    /* =========================
       VALIDATION
    ========================= */

    const validate = () => {
        const err = {};

        if (!/^\d{12}$/.test(form.aadhaar))
            err.aadhaar = "Aadhaar must be 12 digits";

        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan))
            err.pan = "Invalid PAN format";

        if (panStatus !== "verified")
            err.panVerify = "PAN must be verified";

        if (!form.aadhaarFile)
            err.aadhaarFile = "Aadhaar card required";

        if (!form.panFile)
            err.panFile = "PAN card required";

        if (!form.declaration)
            err.declaration = "Please confirm declaration";

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    /* =========================
       SUBMIT
    ========================= */

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = new FormData();
        Object.entries(form).forEach(([k, v]) => payload.append(k, v));

        console.log("KYC Submitted");
        navigate("/deliverydetails");

        // 🔐 send to backend
    };

    return (
        <div className="casa-kyc-page">
            <form className="casa-kyc-card" onSubmit={handleSubmit}>
                <h1>Seller Verification</h1>
                <p className="subtitle">
                    Verify your identity to maintain trust on Casa
                </p>

                {/* Aadhaar */}
                <div className="field">
                    <label>Aadhaar Number</label>
                    <input
                        type="text"
                        maxLength="12"
                        value={form.aadhaar}
                        onChange={handleAadhaarChange}
                        placeholder="123456789012"
                    />
                    {errors.aadhaar && <span>{errors.aadhaar}</span>}
                </div>

                {/* PAN */}
                <div className="field pan-row">
                    <div>
                        <label>PAN Number</label>
                        <input
                            type="text"
                            maxLength="10"
                            value={form.pan}
                            onChange={handlePanChange}
                            placeholder="ABCDE1234F"
                        />
                    </div>

                    <button
                        type="button"
                        className={`verify-btn ${panStatus}`}
                        onClick={verifyPan}
                        disabled={panStatus === "verifying" || !form.pan}
                    >
                        {panStatus === "verifying" && "Verifying..."}
                        {panStatus === "verified" && "Verified ✓"}
                        {panStatus === "failed" && "Failed"}
                        {panStatus === "idle" && "Verify"}
                    </button>
                </div>

                {(errors.pan || errors.panVerify) && (
                    <span>{errors.pan || errors.panVerify}</span>
                )}

                {/* Files */}
                <div className="file-field">
                    <label>Aadhaar Card</label>
                    <input type="file" name="aadhaarFile" onChange={handleFileChange} />
                    {errors.aadhaarFile && <span>{errors.aadhaarFile}</span>}
                </div>

                <div className="file-field">
                    <label>PAN Card</label>
                    <input type="file" name="panFile" onChange={handleFileChange} />
                    {errors.panFile && <span>{errors.panFile}</span>}
                </div>

                {/* Declaration */}
                <div className="checkbox">
                    <input
                        type="checkbox"
                        checked={form.declaration}
                        onChange={handleCheckbox}
                    />
                    <label>
                        I confirm the above details are accurate and belong to me
                    </label>
                </div>
                {errors.declaration && <span>{errors.declaration}</span>}

                <button className="submit-btn">Submit</button>
            </form>
        </div>
    );
};

export default SellerKYC;
