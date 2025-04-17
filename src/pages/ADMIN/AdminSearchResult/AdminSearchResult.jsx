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
              <p><strong>Email:</strong> {item.email || "N/A"}</p>
              <p><strong>Phone:</strong> {item.phonenumber || "N/A"}</p>
              <p><strong>District:</strong> {item.district || "N/A"}</p>
              <p><strong>Place:</strong> {item.place || "N/A"}</p>

              {source === "databank" && (
                <>
                  <p><strong>Address:</strong> {item.address || "N/A"}</p>
                  <p><strong>Purpose:</strong> {item.purpose || "N/A"}</p>
                  <p><strong>Mode of Property:</strong> {item.mode_of_property || "N/A"}</p>
                  <p><strong>Price:</strong> {item.demand_price || "N/A"}</p>
                  <p><strong>Location Proposal:</strong> {item.location_proposal_district}, {item.location_proposal_place}</p>
                  <p><strong>Area (sqft):</strong> {item.area_in_sqft || "N/A"}</p>
                  <p><strong>Building Type:</strong> {item.building_roof || "N/A"}</p>
                  <p><strong>Floors:</strong> {item.number_of_floors || "N/A"}</p>
                  <p><strong>BHK:</strong> {item.building_bhk || "N/A"}</p>
                  <p><strong>Additional Notes:</strong> {item.additional_note || "N/A"}</p>
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
