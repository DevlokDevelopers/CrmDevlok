import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./DataBank.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import UploadImageModal from "../../../components/Modals/AddImageModal";
import FilterModal from "../../../components/Modals/FilterModal";
import filterIcon from "../../../assets/setting-4.svg";
import FancySpinner from "../../../components/Loader/Loader";

const AdminDatabank = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedDatabankId, setSelectedDatabankId] = useState(null);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Buy");

  const navigate = useNavigate(); // For navigation

  const purposeMap = {
    Buy: "For Buying a Property",
    Sell: "For Selling a Property",
    "For Rent": "For Rental or Lease",
    "Rental Seeker": "Looking to Rent or Lease Property",
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const actualPurpose = purposeMap[activeTab];
    filterDataByPurpose(actualPurpose);
  }, [data, activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.get(
        "https://devlokcrmbackend.up.railway.app/databank/databank_list/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterDataByPurpose = (purpose) => {
    const filtered = data.filter((item) => item.purpose === purpose);
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleDetails = (databankId) => {
    navigate("/admin_data_display", { state: { databankId } });
  };

  const handleMatchData = (databankId) => {
    navigate("/admin_matching_data", { state: { databankId } });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>
            {activeTab} Listings ({filteredData.length})
          </h2>
          <button
            className={styles.filterBtn}
            onClick={() => setFilterModalOpen(true)}
          >
            <img src={filterIcon} alt="Filter Icon" className={styles.icon} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabContainer}>
          {["Buy", "Sell", "For Rent", "Rental Seeker"].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${
                activeTab === tab ? styles.activeTab : ""
              }`}
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
            onApply={(queryString) => {
              setFilterModalOpen(false);
              // Handle filter logic if needed
            }}
          />
        )}

        {/* Content */}
        {loading ? (
          <div className={styles.loaderWrapper}>
            <FancySpinner />
          </div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : filteredData.length === 0 ? (
          <p className={styles.noData}>No data available.</p>
        ) : (
          <div className={styles.leadContainer}>
            {currentItems.map((item) => (
              <div key={item.id} className={styles.leadCard}>
                <div className={styles.leadInfo}>
                  <div className={styles.infoBlock}>
                    <p>
                      <strong>{item.name}</strong>
                    </p>
                    <p>
                      <strong>{item.phonenumber}</strong>
                    </p>
                    {item.is_in_project && (
                      <div className={styles.infoBlock}>
                        <p className={styles.inProjectTag}>
                          Involved in Project:{" "}
                          <strong>{item.project_name}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className={styles.infoBlock}>
                    <p>
                      <strong>
                        {item.district}, {item.place}
                      </strong>
                    </p>
                    <p>
                      <strong>{item.address}</strong>
                    </p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p>
                      <strong>Purpose: {item.purpose}</strong>
                    </p>
                    <p>
                      <strong>Property Type: {item.mode_of_property}</strong>
                    </p>
                    <p>
                      <strong>Lead Category: {item.lead_category}</strong>
                    </p>
                  </div>
                  <div className={styles.buttonContainer}>
                    <button
                      className={styles.detailsBtn}
                      onClick={() => handleDetails(item.id)}
                    >
                      Details
                    </button>
                    <button
                      className={styles.addimageBtn}
                      onClick={() => handleMatchData(item.id)}
                    >
                      Check Match
                    </button>
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
                className={`${styles.paginationBtn} ${
                  currentPage === index + 1 ? styles.activePage : ""
                }`}
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

export default AdminDatabank;
