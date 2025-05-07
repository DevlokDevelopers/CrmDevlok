import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNotifications } from "../NotificationContext/Notification Context";  // Import Notification Context
import axios from "axios";
import styles from "./StaffTopNav.module.css";

const StaffTopNav = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const { notifications, addNotification } = useNotifications();  // Use context

  const handleProfileClick = () => {
    navigate("/salesmanagerProfile");
  };

  const handleSearch = async (searchTerm) => {
    const finalQuery = searchTerm || query;
    if (!finalQuery.trim()) return;

    const token = localStorage.getItem("access_token");

    try {
      const response = await axios.get(
        `https://devlokcrmbackend.up.railway.app/databank/search_by_salesmanager/?q=${encodeURIComponent(finalQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { source, results } = response.data;
      if (!results || results.length === 0) {
        alert("No results found.");
        return;
      }

      navigate("/salesmsearch_result", {
        state: { type: source, results, query: finalQuery },
      });
    } catch (error) {
      console.error("Search error:", error);
      alert("Error occurred while searching.");
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

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await axios.get(
        `https://devlokcrmbackend.up.railway.app/databank/salesMSearchAutoComplete/?q=${encodeURIComponent(value)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSuggestions(res.data.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Suggestion fetch error:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
                    setQuery(s); // Set query to the selected suggestion
                    setSuggestions([]); // Clear suggestions
                    setShowSuggestions(false); // Hide suggestion dropdown
                    handleSearch(s); // Perform search with selected suggestion
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
            <span className={styles.username}>Profile</span>
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
                addNotification([]);  // Clear notifications in context
              }}
            >
              Close
            </button>
            <ul className={styles.notificationList}>
              {notifications.length > 0 ? (
                notifications.map((msg, index) => (
                  <li key={index}>
                    {typeof msg === "string" ? msg : JSON.stringify(msg)}
                  </li>
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

export default StaffTopNav;
