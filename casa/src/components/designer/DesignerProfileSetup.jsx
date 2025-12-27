import React, { useState } from "react";
import "./DesignerProfileSetup.css";
import { useNavigate } from "react-router-dom";

const DesignerProfileSetup = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        experience: "",
        location: "",
        portfolio: "",
        designerType: "",
        bio: "",
    });

    // Handle profile image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({
                ...form,
                profileImage: file,
                profilePreview: URL.createObjectURL(file),
            });
        }
    };

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Designer Details:", form);
    };

    return (
        <div className="designer-setup-page">
            <div className="designer-setup-card">

                <h1 className="setup-title">Designer Profile Setup</h1>
                <p className="setup-subtitle">
                    Tell us more about your design expertise to help customers find you.
                </p>

                <form className="designer-form" onSubmit={handleSubmit}>

                    {/* Profile Image */}
                    <div className="field full">
                        <label>Profile Image</label>

                        <div className="profile-upload-box">
                            {form.profilePreview ? (
                                <img src={form.profilePreview} alt="Preview" className="profile-preview" />
                            ) : (
                                <div className="profile-placeholder">
                                    Upload Image
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="profile-input"
                            />
                        </div>
                    </div>


                    <label className="input-label">Experience (in years)</label>
                    <input
                        type="number"
                        name="experience"
                        className="input-field"
                        placeholder="2"
                        onChange={handleChange}
                        required
                    />


                    <label className="input-label">Portfolio Link (Optional)</label>
                    <input
                        type="text"
                        name="portfolio"
                        className="input-field"
                        placeholder="https://yourportfolio.com"
                        onChange={handleChange}
                    />

                    <label className="input-label ">Designer Type</label>
                    <select
                        className="input-field designer-type"
                        name="designerType"
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select type</option>
                        <option value="Interior Designer">Interior Designer</option>
                        <option value="Product Designer">Product Designer</option>
                        <option value="Furniture Designer">Furniture Designer</option>
                        <option value="Lighting Designer">Lighting Designer</option>
                        <option value="3D Visualizer / CAD Designer">3D Visualizer / CAD Designer</option>
                    </select>

                    <label className="input-label">Short Bio</label>
                    <textarea
                        name="bio"
                        className="input-field textarea"
                        placeholder="Describe your design philosophy..."
                        onChange={handleChange}
                        required
                    ></textarea>

                    <button className="setup-btn" type="submit" onClick={() => navigate("/designerportfolio")}>
                        Next
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DesignerProfileSetup;
