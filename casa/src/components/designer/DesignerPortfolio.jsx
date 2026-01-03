import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DesignerPortfolio.css";

const DesignerPortfolio = () => {
  const navigate = useNavigate();

  const [works, setWorks] = useState([
    { image: null, preview: null, description: "" },
  ]);

  // explicit derived state so UI never lags behind
  const [isFormEmpty, setIsFormEmpty] = useState(true);

  useEffect(() => {
    const empty = works.every(
      (w) =>
        (w.image === null || w.image === undefined) &&
        (typeof w.description !== "string" || w.description.trim() === "")
    );
    setIsFormEmpty(empty);
  }, [works]);

  const addWork = () => {
    if (works.length >= 5) return;
    setWorks((s) => [...s, { image: null, preview: null, description: "" }]);
  };

  const handleImageChange = (index, file) => {
    if (!file) return;
    setWorks((prev) => {
      const updated = [...prev];
      // revoke old preview if present
      if (updated[index].preview) {
        try { URL.revokeObjectURL(updated[index].preview); } catch {}
      }
      updated[index] = {
        ...updated[index],
        image: file,
        preview: URL.createObjectURL(file),
      };
      return updated;
    });
  };

  const handleDescriptionChange = (index, value) => {
    setWorks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], description: value };
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormEmpty) return; // fail-safe
    // TODO: upload logic
    navigate("/designer-dashboard");
  };

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      works.forEach((w) => {
        if (w.preview) {
          try { URL.revokeObjectURL(w.preview); } catch {}
        }
      });
    };
  }, [works]);

  return (
    <div className="portfolio-page">
      <div className="portfolio-box reveal">
        <h1 className="portfolio-title">Show Your Best Work</h1>
        <p className="portfolio-sub">
          Add 4–5 examples of your previous designs. <strong>(Optional)</strong>
        </p>

        <form onSubmit={handleSubmit} className="portfolio-form">
          {works.map((item, index) => (
            <div key={index} className="work-block">
              <div className="image-upload">
                {item.preview ? (
                  <img
                    src={item.preview}
                    alt="Preview"
                    className="work-preview"
                  />
                ) : (
                  <label className="upload-placeholder">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageChange(index, e.target.files?.[0])
                      }
                    />
                    + Upload Image
                  </label>
                )}
              </div>

              <textarea
                className="work-desc"
                placeholder="Write something about this work..."
                value={item.description}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
              />
            </div>
          ))}

          {works.length < 5 && (
            <button
              type="button"
              className="add-more-btn"
              onClick={addWork}
            >
              + Add Another Work
            </button>
          )}

          <div className="actions-row">
            <button
              type="submit"
              className={`submit-portfolio-btn ${isFormEmpty ? "disabled" : ""}`}
              disabled={isFormEmpty}
              onClick={() => navigate("/designerdashboard")}
            >
              Save & Continue
            </button>

            <button
              type="button"
              className="skip-btn"
              onClick={() => navigate("/designerdashboard")}
            >
              Skip for Now →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesignerPortfolio;
