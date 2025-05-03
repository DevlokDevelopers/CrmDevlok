import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./MatchingDataList.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";

const AdminMatchingDatas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const databankId = location.state?.databankId || null;
  const accessToken = localStorage.getItem("access_token");

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!databankId) {
      setErrorMessage("Invalid request: No databank ID provided.");
      setLoading(false);
      return;
    }

    axios
      .get(`https://devlokcrm-production.up.railway.app/databank/match_property/${databankId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        if (response.data.total_matches > 0) {
          setMatches(response.data.matches);
        } else {
          setErrorMessage("No data available for this.");
        }
      })
      .catch(() => setErrorMessage("Failed to fetch matching data."))
      .finally(() => setLoading(false));
  }, [databankId, accessToken]);

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.header}>Matching Data</h1>

        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : errorMessage ? (
          <p className={styles.error}>{errorMessage}</p>
        ) : (
          <div className={styles.cardGrid}>
            {matches.map((match) => (
              <div key={match.data.id} className={styles.card}>
                <h2>{match.data.name}</h2>
                <p><strong>Email: {match.data.email}</strong></p>
              <p><strong>Phone: {match.data.phonenumber}</strong></p>
              <p><strong>District: {match.data.district}</strong></p>
              <p><strong>Place: {match.data.place}</strong></p>
              <p><strong>Address: {match.data.address}</strong></p>
              <p><strong>Purpose: {match.data.purpose}</strong></p>
              <p><strong>Property Type: {match.data.mode_of_property}</strong></p>
              <p><strong>Demand Price: ₹{match.data.demand_price}</strong></p>
              <p><strong>Area: {match.data.area_in_sqft} sqft</strong></p>
              <p><strong>Building Roof: {match.data.building_roof}</strong></p>
              <p><strong>Floors: {match.data.number_of_floors}</strong></p>
              <p><strong>BHK: {match.data.building_bhk}</strong></p>
              <p><strong>Lead Category: {match.data.lead_category}</strong></p>
              <p><strong>Additional Notes: {match.data.additional_note || "N/A"}</strong></p>
              <p><strong>Score: {match.score}</strong></p>
              <p><strong>Follower: {match.data.follower_name}</strong></p>


              </div>
            ))}
          </div>
        )}

        <div className={styles.backButtonWrapper}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMatchingDatas;
