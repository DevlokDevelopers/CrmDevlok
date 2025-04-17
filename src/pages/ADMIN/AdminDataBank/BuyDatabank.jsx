import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./DataBank.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import UploadImageModal from "../../../components/Modals/AddImageModal";
import FilterModal from "../../../components/Modals/FilterModal";
import filterIcon from "../../../assets/setting-4.svg";

const AdminBuyList = () => {
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
    Analytics: "/admin_data_graph",
    Buy: "/admin_buy_data",
    Sell: "/admin_sell_databank",
    "For Rent": "/admin_forrent_databank",
    "Rental Seeker": "/admin_rentseeker_databank",
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
      navigate("/login");
      return;
    }
    try {
      const response = await axios.get("https://devlokcrm-production.up.railway.app/databank/databank_buy/", {
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
    navigate(tabPaths[tabName] || "/admin_buy_list");
  };

  const handleDetails = (databankId) => {
    navigate("/admin_data_display", { state: { databankId } });
  };

  const handleMatchData = (databankId) => {
    navigate("/admin_matching_data", { state: { databankId } });
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
    <AdminLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>Buy Listings ({data.length})</h2>
          <button className={styles.filterBtn} onClick={() => setFilterModalOpen(true)}>
            <img src={filterIcon} alt="Filter Icon" className={styles.icon} />
          </button>
        </div>

        {/* Tabs */}
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

        {/* Content */}
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

        {/* Image Upload Modal */}
        {modalOpen && (
          <UploadImageModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            databankId={selectedDatabankId}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBuyList;
