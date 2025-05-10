import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../SalesManager/SalesMData.module.css"; // Use same styles as BuyList
import StaffLayout from "../../components/Layouts/SalesMLayout";
import FancySpinner from "../../components/Loader/Loader";

const FilteredResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state?.filteredData || []);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(!location.state?.filteredData);

  useEffect(() => {
    const fetchData = async () => {
      if (data.length > 0) return; // Already loaded from state

      const queryParams = new URLSearchParams(location.search);
      setIsLoading(true);
      try {
        const response = await axios.get("https://devlokcrmbackend.up.railway.app/databank/filter/", {
          params: Object.fromEntries(queryParams.entries()),
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

  const handleDetails = (databankId) => {
    navigate("/data_list", { state: { databankId } });
  };

  const handleMatchData = (databankId) => {
    navigate("/matching_data", { state: { databankId } });
  };

  return (
    <StaffLayout>
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>🔍 Filtered Results ({data.length})</h2>
          <button className={styles.backButton} onClick={() => navigate(-1)}>Back</button>
        </div>

        {isLoading ? (
          <div className={styles.loaderWrapper}><FancySpinner /></div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : data.length === 0 ? (
          <p className={styles.noData}>No matching results found.</p>
        ) : (
          <div className={styles.leadContainer}>
            {data.map((item) => (
              <div key={item.id} className={styles.leadCard}>
                <div className={styles.leadInfo}>
                  <div className={styles.infoBlock}>
                    <p><strong>{item.name}</strong></p>
                    <p><strong>{item.phonenumber}</strong></p>
                    {item.is_in_project && (
                      <p className={styles.inProjectTag}>
                        <strong>Involved in Project: {item.project_name}</strong>
                      </p>
                    )}
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>{item.district}, {item.place}</strong></p>
                    <p><strong>{item.address}</strong></p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>Purpose:</strong> {item.purpose}</p>
                    <p><strong>Property Type:</strong> {item.mode_of_property}</p>
                    <p><strong>Lead Category:</strong> {item.lead_category}</p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>Demand Price:</strong> ₹{item.demand_price}</p>
                    <p><strong>Area:</strong> {item.area_in_sqft} sqft</p>
                    <p><strong>Floors:</strong> {item.number_of_floors}, <strong>BHK:</strong> {item.building_bhk}</p>
                  </div>
                  <div className={styles.buttonContainer}>
                    <button className={styles.detailsBtn} onClick={() => handleDetails(item.id)}>Details</button>
                    <button className={styles.addimageBtn} onClick={() => handleMatchData(item.id)}>Check Match</button>
                  </div>
                  {item.location_link && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default FilteredResults;
