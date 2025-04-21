import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Search.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";

const AdminSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { results, query, source } = location.state || {};

  if (!results) {
    return <div className={styles.noData}>No data available.</div>;
  }

  const handleCardClick = (item) => {
    if (source === "databank") {
      // Navigate directly to /admin_data_display with databank id
      navigate("/admin_data_display", { state: { databankId: item.id } });
    } else if (source === "projects") {
      navigate(`/projects/details/${item.id}`);
    }
    // If leads, no need to navigate — show full data below
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h2 className={styles.heading}>
          Search Results for: <span>{query}</span>
        </h2>
        <p className={styles.subHeading}>Source: {source?.toUpperCase()}</p>

        <div className={styles.grid}>
          {results.map((item, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() => handleCardClick(item)}
            >
              <h3 className={styles.title}>
                {item.name || item.project_name}
              </h3>
              <p><strong>Email: {item.email || "N/A"}</strong></p>
              <p><strong>Phone: {item.phonenumber || "N/A"}</strong></p>
              <p><strong>District:{item.district || "N/A"}</strong> </p>
              <p><strong>Place: {item.place || "N/A"}</strong></p>

              {source === "databank" && (
                <>
                  <p><strong>Address: {item.address || "N/A"}</strong></p>
                  <p><strong>Purpose: {item.purpose || "N/A"}</strong></p>
                  <p><strong>Mode of Property: {item.mode_of_property || "N/A"}</strong></p>
                  <p><strong>Price:{item.demand_price || "N/A"}</strong> </p>
                  <p><strong>Location Proposal: {item.location_proposal_district}, {item.location_proposal_place}</strong></p>
                  <p><strong>Area (sqft): {item.area_in_sqft || "N/A"}</strong></p>
                  <p><strong>Building Type: {item.building_roof || "N/A"}</strong></p>
                  <p><strong>Floors: {item.number_of_floors || "N/A"}</strong></p>
                  <p><strong>BHK: {item.building_bhk || "N/A"}</strong></p>
                  <p><strong>Additional Notes: {item.additional_note || "N/A"}</strong></p>
                </>
              )}

              {source === "projects" && (
                <p><strong>Project Name:</strong> {item.project_name || "N/A"}</p>
              )}

              <p className={styles.linkText}>
                {source === "leads" ? "Full Details Listed ↑" : "View Details →"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSearchResults;
