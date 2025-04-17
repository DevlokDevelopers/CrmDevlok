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
                <p><strong>Email:</strong> {match.data.email}</p>
                <p><strong>Phone:</strong> {match.data.phonenumber}</p>
                <p><strong>District:</strong> {match.data.district}</p>
                <p><strong>Place:</strong> {match.data.place}</p>
                <p><strong>Address:</strong> {match.data.address}</p>
                <p><strong>Purpose:</strong> {match.data.purpose}</p>
                <p><strong>Property Type:</strong> {match.data.mode_of_property}</p>
                <p><strong>Demand Price:</strong> ₹{match.data.demand_price}</p>
                <p><strong>Area:</strong> {match.data.area_in_sqft} sqft</p>
                <p><strong>Building Roof:</strong> {match.data.building_roof}</p>
                <p><strong>Floors:</strong> {match.data.number_of_floors}</p>
                <p><strong>BHK:</strong> {match.data.building_bhk}</p>
                <p><strong>Additional Notes:</strong> {match.data.additional_note || "N/A"}</p>
                <p><strong>Score:</strong> {match.score}</p>
                <p><strong>Follower:</strong> {match.data.follower_name}</p>

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
