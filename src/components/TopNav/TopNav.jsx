import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNotifications } from "../NotificationContext/Notification Context";// Import the useNotifications hook
import axios from "axios";
import styles from "./TopNav.module.css";

const TopNav = () => {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");

  // Use the notifications from context
  const { notifications, addNotification, clearNotifications } = useNotifications(); 

  useEffect(() => {
    // Notifications are handled by context now, so no need to add WebSockets or reminder fetching here
  }, [addNotification]); // This effect will run only once when the component is mounted

  const handleProfileClick = () => navigate("/admin_profile");

  const handleSearch = async (searchTerm = query) => {
    if (!searchTerm.trim()) return;

    try {
      const response = await axios.get(
        `https://devlokcrmbackend.up.railway.app/databank/search_in_databank/?q=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const { results, source } = response.data;
      if (!results || results.length === 0) return alert("No results found.");

      navigate("/admin_search_result", { state: { results, query: searchTerm, source } });
    } catch (error) {
      console.error("Search error:", error);
      alert(`Error occurred while searching: ${error.message || error}`);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const res = await axios.get(
        `https://devlokcrmbackend.up.railway.app/databank/auto_complete_search_admin/?q=${encodeURIComponent(value)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSuggestions(res.data.suggestions || []);
      setShowSuggestions(res.data.suggestions && res.data.suggestions.length > 0);
    } catch (err) {
      console.error("Suggestion fetch error:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <div className={styles.topnav}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={styles.searchBar}
            placeholder="Search..."
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />

          {showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestionDropdown}>
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setQuery(s);
                    setSuggestions([]);
                    setShowSuggestions(false);
                    handleSearch(s);
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.topnavIcons}>
          <div className={styles.bellbox} onClick={() => setShowModal(true)}>
            <FaBell className={styles.bellicon} />
            {notifications.length > 0 && (
              <span className={styles.badge}>{notifications.length}</span>
            )}
          </div>

          <div className={styles.userInfo} onClick={handleProfileClick}>
            <FaUserCircle className={styles.icon} />
            <span className={styles.username}>Admin</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.notificationModal}>
          <div className={styles.modalContent}>
            <h3>Notifications</h3>
            <button
              className={styles.closeButton}
              onClick={() => {
                setShowModal(false);
                clearNotifications(); // Clear notifications when modal is closed
              }}
            >
              Close
            </button>
            <ul className={styles.notificationList}>
              {notifications.length > 0 ? (
                notifications.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))
              ) : (
                <li>No new notifications</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNav;
