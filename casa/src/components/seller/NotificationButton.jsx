import React from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./NotificationButton.css";

const NotificationButton = ({
  notificationCount = 0,
  ariaLabel = "Notifications",
  compact = false,
}) => {
  const navigate = useNavigate();

  const displayCount =
    notificationCount > 99 ? "99+" : notificationCount;

  return (
    <div className="nb-floating">
      <button
        type="button"
        className={`nb-btn ${compact ? "nb-compact" : ""}`}
        onClick={() => navigate("/sellernotifications")}
        aria-label={ariaLabel}
        title="Notifications"
      >
        <FiBell className="nb-icon" />

        {notificationCount > 0 && (
          <span className="nb-badge">
            {displayCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationButton;
