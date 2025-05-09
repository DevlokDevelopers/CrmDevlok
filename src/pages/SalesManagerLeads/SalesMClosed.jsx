import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import axios from "axios";
import styles from "./SalesMNewLeads.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout"; 
import { NotebookPen } from "lucide-react";
import FancySpinner from "../../components/Loader/Loader";
const ClosedLeads = () => {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("New");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [selectedMessage, setSelectedMessage] = useState(""); // Store selected message
  const leadsPerPage = 8;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true); // New state

  const tabPaths = {
    Analytics: "/salesmanager_lead_analytics", // Disabled Tabs
    New: "/salesmanager_newleads", // Active in this page
    Followed: "/salesmanager_followed_leads",
    Unrecorded:"/salesmanager_unrecordedLeads",
    "Data Saved": "/Salesmanager_Datasaved",
    Closed: "/Salesmanager_closed_leads",
    "Unsuccessfully": "/Salesmanager_unsuccess_leads",
    Pending: "/salesmanger_pending_leads",
  };
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedTab = Object.keys(tabPaths).find(
      (tab) => tabPaths[tab] === currentPath
    );
    setActiveTab(matchedTab || "New");
  }, [location.pathname]);

  const fetchLeads = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Authorization token is missing. Please login.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://devlokcrmbackend.up.railway.app/leads/closed_successfully_leads/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLeads(response.data);
      setError(""); 
    } catch (error) {
      console.error("Error fetching leads:", error);
      if (error.response && error.response.status === 401) {
        setError("Unauthorized access. Please login again.");
      } else {
        setError("Failed to fetch leads. Try again later.");
      }
    }
    finally {
    setLoading(false); // always stop spinner
  }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    const path = tabPaths[tabName] || "/Salesmanager_closed_leads";
    navigate(path);
  };

  const handleAddLead = () => {
    navigate("/addlead_salesman");
  };

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle View Notes
  const handleViewNotes = (message) => {
    setSelectedMessage(message); // Set selected message
    setShowModal(true); // Show the modal
  };

  // Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <StaffLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Closed Leads ({leads.length})</h2>
          <button className={styles.addLeadBtn} onClick={handleAddLead}>
            + Add Lead
          </button>
        </div>

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

        {loading ? (
  <div className={styles.loaderWrapper}><FancySpinner /></div>
) : error ? (
  <p className={styles.error}>{error}</p>
) : leads.length === 0 ? (
  <p className={styles.noData}>No leads available.</p>
) : (
          <>
            <div className={styles.leadContainer}>
              {currentLeads.map((lead) => (
                <div key={lead.id} className={styles.leadCard}>
                  <div className={styles.leadInfo}>
                    <div className={styles.infoBlock}>
                      <p>
                        <strong>{lead.name}</strong>
                      </p>
                      <p><strong>{lead.phonenumber}</strong></p>
                      <p className={styles.multiLineText}><strong>{lead.email}</strong></p>
                    </div>
                    <div className={styles.infoBlock}>
                      <p><strong>
                        {lead.place}, {lead.district}</strong>
                      </p>
                      <p className={styles.multiLineText}><strong>{lead.address}</strong></p>
                    </div>
                    <div className={styles.infoBlock}>
                      <p><strong>
                        Purpose: {lead.purpose}</strong>
                      </p>
                      <p><strong>
                        Property Type: {lead.mode_of_purpose}</strong>
                      </p>
                      <p>{lead.message && (
                                                                                                      
                                                                                                      <span
                                                                                                          className={styles.messageLink}
                                                                                                          onClick={() => handleViewNotes(lead.message)}
                                                                                                          role="button"
                                                                                                          tabIndex={0}
                                                                                                        >
                                                                                                          <NotebookPen size={18} /> Notes
                                                                                                        </span>
                                                                                    
                                                                                                    
                                                                                                  )}</p>
                      
                    </div>
                   
                    <div className={styles.infoBlock}>
                      <p><strong>Lead Received: {formatDate(lead.timestamp)}</strong></p>
                      <p><strong>Closed Date: {formatDate(lead.closed_date)}</strong></p>
                    </div>

                    
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`${styles.paginationBtn} ${currentPage === index + 1 ? styles.activePage : ""}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Modal */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={handleCloseModal}>
              ×
            </button>
            <h3>Lead Notes</h3>
            <p>{selectedMessage}</p>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default ClosedLeads;
