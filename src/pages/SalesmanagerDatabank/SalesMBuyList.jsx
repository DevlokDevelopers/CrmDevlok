import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./SalesMData.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout";
import UploadImageModal from "../../components/Modals/AddImageModal"; 
import FilterModal from "../../components/Modals/FilterModal"; // Import Filter Modal
import filterIcon from "../../assets/setting-4.svg"

const BuyList = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedDatabankId, setSelectedDatabankId] = useState(null);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths = {
    Analytics: "/data_graph_salesmanager",
    Buy: "/sales_buy_list",
    Sell: "/salesmanager_sell_list",
    "For Rent": "/salesmanger_forrent",
    "Rental Seeker": "/salesmanager_rentseeker",
  };

  const getActiveTab = () => {
    const currentPath = location.pathname;
    return Object.keys(tabPaths).find((tab) => tabPaths[tab] === currentPath) || "Buy";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Authorization token is missing. Please login.");
      return;
    }

    try {
      const response = await axios.get("https://devlokcrm-production.up.railway.app/databank/salesmanager_buy_data/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Try again later.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleTabChange = (tabName) => {
    navigate(tabPaths[tabName] || "/salesmanager_buy");
  };

  const handleDetails = (databankId) => {
    navigate("/data_list", { state: { databankId } });
  };

  const handleMatchData = (databankId) => {
    navigate("/matching_data", { state: { databankId } });
  };

  const handleApplyFilters = (queryString) => {
    setFilterModalOpen(false);
    navigate(`/filter_result?${queryString}`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <StaffLayout>
      <div className={styles.container}>
        
        {/* Title and Filter Button Container */}
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>Buy Listings ({data.length})</h2>
          <button className={styles.filterBtn} onClick={() => setFilterModalOpen(true)}>
          <img src={filterIcon} alt="Filter Icon" className={styles.icon} />
          </button>
        </div>

        {/* Tabs Section */}
        <div className={styles.tabContainer}>
          {Object.keys(tabPaths).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Modal */}
        {filterModalOpen && (
          <FilterModal
            isOpen={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            onApply={handleApplyFilters}
          />
        )}

        {error ? (
          <p className={styles.error}>{error}</p>
        ) : data.length === 0 ? (
          <p className={styles.noData}>No data available.</p>
        ) : (
          <div className={styles.leadContainer}>
            {currentItems.map((item) => (
              <div key={item.id} className={styles.leadCard}>
                <div className={styles.leadInfo}>
                  <div className={styles.infoBlock}>
                    <p><strong>{item.name}</strong></p>
                    <p>{item.phonenumber}</p>
                    {item.is_in_project && (
                                        <div className={styles.infoBlock}>
                                          <p className={styles.inProjectTag}>
                                            Involved in Project: <strong>{item.project_name}</strong>
                                          </p>
                                        </div>
                                      )}
                  </div>
                  <div className={styles.infoBlock}>
                    <p>{item.district}, {item.place}</p>
                    <p>{item.address}</p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p>Purpose: <strong>{item.purpose}</strong></p>
                    <p>Property Type: <strong>{item.mode_of_property}</strong></p>
                  </div>
                  <div className={styles.buttonContainer}>
                    <button className={styles.detailsBtn} onClick={() => handleDetails(item.id)}>Details</button>
                    <button className={styles.addimageBtn} onClick={() => handleMatchData(item.id)}>Check Match</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`${styles.paginationBtn} ${currentPage === index + 1 ? styles.activePage : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Upload Image Modal */}
        {modalOpen && (
          <UploadImageModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            databankId={selectedDatabankId}
          />
        )}
      </div>
    </StaffLayout>
  );
};

export default BuyList;
