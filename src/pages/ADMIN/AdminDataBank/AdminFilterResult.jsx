import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AdminFilterResult.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
const AdminFilteredResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://devlokcrm-production.up.railway.app/databank/filter/", {
          params: Object.fromEntries(queryParams.entries()),
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching filtered results:", error);
        setError("Failed to fetch filtered results.");
      }
    };

    fetchData();
  }, [location.search]);

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h2 className={styles.title}>🔍 Filtered Results</h2>
        <button className={styles.backButton} onClick={() => navigate(-1)}>Back</button>

        {error ? (
          <p className={styles.error}>{error}</p>
        ) : data.length === 0 ? (
          <p className={styles.noData}>No matching results found.</p>
        ) : (
          <div className={styles.resultsContainer}>
            {data.map((item) => (
              <div key={item.id} className={styles.resultCard}>
                <h3>{item.name}</h3>
                <p><strong>Follower: {item.follower_name}</strong></p>
              <p><strong>Email: {item.email}</strong></p>
              <p><strong>Phone: {item.phonenumber}</strong></p>
              <p><strong>District: {item.district}</strong></p>
              <p><strong>Place: {item.place}</strong></p>
              <p><strong>Address: {item.address}</strong></p>
              <p><strong>Purpose: {item.purpose}</strong></p>
              <p><strong>Property Type: {item.mode_of_property}</strong></p>
              <p><strong>Demand Price: ₹{item.demand_price}</strong></p>
              <p><strong>Proposed Location: {item.location_proposal_district}, {item.location_proposal_place}</strong></p>
              <p><strong>Area: {item.area_in_sqft} sqft</strong></p>
              <p><strong>Roof Type: {item.building_roof}</strong></p>
              <p><strong>Floors: {item.number_of_floors}</strong></p>
              <p><strong>BHK: {item.building_bhk}</strong></p>
              <p><strong>Additional Note: {item.additional_note}</strong></p>
              <p><strong>Lead Category: {item.lead_category}</strong></p>

                {item.location_link && (
                                  <div className={styles.imageWrapper}>
                                    <div className={styles.mapBox}>
                                      <iframe
                                        title="Google Map"
                                        width="100%"
                                        height="300"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://www.google.com/maps?q=${encodeURIComponent(item.location_link)}&output=embed`}
                                        allowFullScreen
                                      />
                                    </div>
                                  </div>
                                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFilteredResults;