import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./DataForProject.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";

const AdminDataForProject = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Buy");
  const [loadingAdd, setLoadingAdd] = useState(false); // ✅ new loading state

  const navigate = useNavigate();
  const { projectId } = useParams();

  const itemsPerPage = 8;

  const tabOptions = [
    { label: "Buy", value: "For Buying a Property" },
    { label: "Sell", value: "For Selling a Property" },
    { label: "For Rent", value: "For Rental or Lease" },
    { label: "Rental Seeker", value: "Looking to rent or Lease a Property" },
  ];

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Authorization token is missing. Please login.");
      return;
    }

    try {
      const response = await axios.get("https://devlokcrm-production.up.railway.app/databank/databank_project_list/", {
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
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDetails = (databankId) => {
    navigate("/admin_data_display", { state: { databankId } });
  };

  const handleAddToProject = async (databankId) => {
    if (!projectId) {
      alert("Project ID not found. Cannot add to project.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoadingAdd(true);

    try {
      await axios.post(
        `https://devlokcrm-production.up.railway.app/project/add_data_into_project/${projectId}/`,
        { data_bank_ids: [databankId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Databank added to project successfully!");
      navigate(`/single_admin_project/${projectId}`); // ✅ redirect after success
    } catch (error) {
      console.error("Error adding databank to project:", error);
      alert("Failed to add databank to project.");
    } finally {
      setLoadingAdd(false);
    }
  };

  const currentTabPurpose = tabOptions.find((tab) => tab.label === activeTab)?.value;

  const filteredData = data.filter(
    (item) => !item.is_in_project && item.purpose === currentTabPurpose
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = filteredData.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>{activeTab} Listings</h2>
        </div>

        <div className={styles.tabContainer}>
          {tabOptions.map((tab) => (
            <button
              key={tab.label}
              className={`${styles.tab} ${activeTab === tab.label ? styles.activeTab : ""}`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className={styles.error}>{error}</p>
        ) : currentItems.length === 0 ? (
          <p className={styles.noData}>No data available.</p>
        ) : (
          <div className={styles.leadContainer}>
            {currentItems.map((item) => (
              <div key={item.id} className={styles.leadCard}>
                <div className={styles.leadInfo}>
                  <div className={styles.infoBlock}>
                    <p><strong>{item.name}</strong></p>
                    <p>{item.phonenumber}</p>
                    
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
                    <button
                      className={styles.detailsBtn}
                      onClick={() => handleDetails(item.id)}
                      disabled={loadingAdd}
                    >
                      Details
                    </button>
                    <button
                      className={styles.addimageBtn}
                      onClick={() => handleAddToProject(item.id)}
                      disabled={loadingAdd}
                    >
                      {loadingAdd ? "Adding..." : "Add to Project"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>
    </AdminLayout>
  );
};

export default AdminDataForProject;
