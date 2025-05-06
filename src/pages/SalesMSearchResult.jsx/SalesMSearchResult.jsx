import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./SalesMSearchResult.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout";

const SalesMSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { results, query, type } = location.state || {};

  if (!results) {
    return <div className={styles.noData}>No data available.</div>;
  }

  const handleCardClick = async (item) => {
    if (type === "databank") {
      const accessToken = localStorage.getItem("access_token");

      try {
        const response = await axios.get(
          `https://devlokcrmbackend.up.railway.app/databank/lead_into_db_sales/${item.lead}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
          const databankId = response.data[0].id;
          navigate("/data_list", { state: { databankId } });
        } else {
          alert("No databank data found for this lead.");
        }
      } catch (error) {
        console.error("Error fetching databank from lead:", error);
        alert("Failed to fetch databank details.");
      }
    } else if (type === "projects") {
      navigate(`/projects/details/${item.id}`);
    }
    // If leads, don't navigate — show full data below
  };

  return (
    <StaffLayout>
      <div className={styles.container}>
        <h2 className={styles.heading}>
          Search Results for: <span>{query}</span>
        </h2>
        <p className={styles.subHeading}>Source: {type?.toUpperCase()}</p>

        <div className={styles.grid}>
          {results.map((item, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() => type !== "leads" && handleCardClick(item)}
            >
              <h3 className={styles.title}>
                {item.name || item.project_name}
              </h3>
              <p><strong>Email: {item.email || "N/A"}</strong></p>
              <p><strong>Phone: {item.phonenumber || "N/A"}</strong></p>
              <p><strong>District: {item.district || "N/A"}</strong></p>
              <p><strong>Place: {item.place || "N/A"}</strong></p>

              {type === "leads" && (
                <>
                  <p><strong>Address: {item.address || "N/A"}</strong></p>
                  <p><strong>Purpose: {item.purpose || "N/A"}</strong></p>
                  <p><strong>Mode of Purpose: {item.mode_of_purpose || "N/A"}</strong></p>
                  <p><strong>Message: {item.message || "N/A"}</strong></p>
                  <p><strong>Status: {item.status || "N/A"}</strong></p>
                  <p><strong>Stage: {item.stage || "N/A"}</strong></p>
                  <p><strong>Closed Date: {item.closed_date || "Not closed yet"}</strong></p>
                  <p><strong>Follower: {item.follower || "N/A"}</strong></p>

                </>
              )}

              <p className={styles.linkText}>
                {type === "leads" ? "Full Details Listed ↑" : "View Details →"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
};

export default SalesMSearchResults;
