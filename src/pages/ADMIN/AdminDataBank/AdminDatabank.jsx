import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./DataBank.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import UploadImageModal from "../../../components/Modals/AddImageModal";
import FilterModal from "../../../components/Modals/FilterModal";
import filterIcon from "../../../assets/setting-4.svg";
import FancySpinner from "../../../components/Loader/Loader";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AdminDatabank = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedDatabankId, setSelectedDatabankId] = useState(null);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(true); // Initial loading state set to true
  const [activeTab, setActiveTab] = useState("Analytics");

  const navigate = useNavigate();

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
    if (activeTab !== "Analytics") {
      const actualPurpose = purposeMap[activeTab];
      filterDataByPurpose(actualPurpose);
    }
  }, [data, activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setLoading(true); // Set loading state to true before making API call
    try {
      const response = await axios.get(
        "https://devlokcrmbackend.up.railway.app/databank/databank_list/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const databank = response.data.databank;
      const analytics = response.data.analytics;

      setData(databank);
      setAnalyticsData([
        { name: "Buy", value: analytics.buy },
        { name: "Sell", value: analytics.sell },
        { name: "Rent", value: analytics.for_rental },
        { name: "Seeker", value: analytics.rental_seeker },
      ]);

      setTotalDataCount(analytics.total_collections);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Try again later.");
    } finally {
      setLoading(false); // Set loading state to false once data is fetched
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
  const handleApplyFilters = (queryString) => {
    setFilterModalOpen(false);
    navigate(`/filter_result?${queryString}`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const chartData = {
    labels: analyticsData.map((item) => item.name),
    datasets: [
      {
        label: "Leads",
        data: analyticsData.map((item) => item.value),
        backgroundColor: ["#FF6F61", "#6B8E23", "#4E79A7", "#F28E2B"], // New vibrant colors
        borderColor: "#ffffff", // White border for each bar
        borderWidth: 2, // Border width for each bar
        hoverBackgroundColor: "#FF1493", // Hover color
        hoverBorderColor: "#FF6347", // Border color on hover
        barThickness: 60, // Increase the thickness of the bars
        borderRadius: 12, // Rounded corners for bars
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            family: "Arial, sans-serif", // Custom font
            size: 14, // Font size
            weight: "bold", // Font weight
          },
          color: "#444", // Legend text color
        },
      },
      tooltip: {
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#eee",
        borderColor: "#444",
        borderWidth: 2,
        padding: 10,
        caretSize: 8, // Small arrow at the tooltip
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#333", // Darker tick color for better contrast
          font: {
            family: "Arial, sans-serif",
            size: 14,
            weight: "bold",
          },
        },
        grid: {
          color: "#eaeaea", // Light grid lines
          lineWidth: 1, // Thinner grid lines
        },
      },
      y: {
        ticks: {
          color: "#333",
          font: {
            family: "Arial, sans-serif",
            size: 14,
            weight: "bold",
          },
        },
        grid: {
          color: "#eaeaea",
          lineWidth: 1,
        },
      },
    },
    animation: {
      duration: 1500, // Smooth animation duration
      easing: "easeOutBounce", // Bounce effect when rendering
    },
  };
  

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>
            {activeTab === "Analytics"
              ? "Data Overview"
              : `${activeTab} Listings (${filteredData.length})`}
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
          {["Analytics", "Buy", "Sell", "For Rent", "Rental Seeker"].map(
            (tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${
                  activeTab === tab ? styles.activeTab : ""
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Filter Modal */}
        {filterModalOpen && (
          <FilterModal
            isOpen={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            onApply={(queryString) => {
              setFilterModalOpen(false);
              onApply={handleApplyFilters}
              // Optionally filter via backend here
            }}
          />
        )}

        {/* Chart only when "Analytics" tab is selected */}
        {/* Chart only when "Analytics" tab is selected */}
{activeTab === "Analytics" && (
  <div className={styles.analyticsWrapper}>
    <p className="total-data">Total Collections: {totalDataCount}</p>
    <div className={styles.graphContainer}>
      {loading ? (
        <div className={styles.loaderWrapper}>
          <FancySpinner />
        </div>
      ) : analyticsData.length === 0 ? (
        <p>No data available</p>
      ) : (
        <Bar data={chartData} options={chartOptions} />
      )}
    </div>
  </div>
)}

{/* Listings / Data */}
{activeTab !== "Analytics" ? (
  <div className={styles.leadContainer}>
    {currentItems.length === 0 ? (
      <p>No data available</p>
    ) : (
      currentItems.map((item) => (
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
                <strong>
                  Property Type: {item.mode_of_property}
                </strong>
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
      ))
    )}
  </div>
) : null}


        {/* Pagination */}
        {activeTab !== "Analytics" && totalPages > 1 && (
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
