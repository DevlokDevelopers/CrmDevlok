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
          `https://devlokcrm-production.up.railway.app/databank/lead_into_db_sales/${item.lead}/`,
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
              <p><strong>Email:</strong> {item.email || "N/A"}</p>
              <p><strong>Phone:</strong> {item.phonenumber || "N/A"}</p>
              <p><strong>District:</strong> {item.district || "N/A"}</p>
              <p><strong>Place:</strong> {item.place || "N/A"}</p>

              {type === "leads" && (
                <>
                  <p><strong>Address:</strong> {item.address || "N/A"}</p>
                  <p><strong>Purpose:</strong> {item.purpose || "N/A"}</p>
                  <p><strong>Mode of Purpose:</strong> {item.mode_of_purpose || "N/A"}</p>
                  <p><strong>Message:</strong> {item.message || "N/A"}</p>
                  <p><strong>Status:</strong> {item.status || "N/A"}</p>
                  <p><strong>Stage:</strong> {item.stage || "N/A"}</p>
                  <p><strong>Closed Date:</strong> {item.closed_date || "Not closed yet"}</p>
                  <p><strong>Follower:</strong> {item.follower || "N/A"}</p>
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
