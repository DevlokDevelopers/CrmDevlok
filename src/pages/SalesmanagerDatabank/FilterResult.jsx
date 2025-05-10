import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./FilterResult.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout";
import FancySpinner from "../../components/Loader/Loader";
const FilteredResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Authorization token is missing. Please login.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get("https://devlokcrmbackend.up.railway.app/databank/filter/", {
        params: Object.fromEntries(queryParams.entries()),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching filtered results:", error);
      setError("Failed to fetch filtered results.");
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, [location.search]);



  return (
    <StaffLayout>
      <div className={styles.container}>
        <h2 className={styles.title}>🔍 Filtered Results</h2>
        <button className={styles.backButton} onClick={() => navigate(-1)}>Back</button>

        {isLoading ? (
  <div className={styles.loaderWrapper}><FancySpinner /></div>
) : error ? (
  <p className={styles.error}>{error}</p>
) : data.length === 0 ? (
  <p className={styles.noData}>No matching results found.</p>
) : (
          <div className={styles.resultsContainer}>
            {data.map((item) => (
              <div key={item.id} className={styles.resultCard}>
                <h3>{item.name}</h3>
                <p><strong>Follower:</strong> {item.follower_name}</p>
                <p><strong>Email:</strong> {item.email}</p>
                <p><strong>Phone:</strong> {item.phonenumber}</p>
                <p><strong>District:</strong> {item.district}</p>
                <p><strong>Place:</strong> {item.place}</p>
                <p><strong>Address:</strong> {item.address}</p>
                <p><strong>Purpose:</strong> {item.purpose}</p>
                <p><strong>Property Type:</strong> {item.mode_of_property}</p>
                <p><strong>Demand Price:</strong> ₹{item.demand_price}</p>
                <p><strong>Proposed Location:</strong> {item.location_proposal_district}, {item.location_proposal_place}</p>
                <p><strong>Area:</strong> {item.area_in_sqft} sqft</p>
                <p><strong>Roof Type:</strong> {item.building_roof}</p>
                <p><strong>Floors:</strong> {item.number_of_floors}</p>
                <p><strong>BHK:</strong> {item.building_bhk}</p>
                <p><strong>Lead Category:</strong> {item.lead_category}</p>
                <p><strong>Additional Note:</strong> {item.additional_note}</p>
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
    </StaffLayout>
  );
};

export default FilteredResults;