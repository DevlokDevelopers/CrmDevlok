import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./SalesMNewLeads.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout"; 
import { NotebookPen } from "lucide-react";

const FollowedLeads = () => {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("New");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");
  const leadsPerPage = 8;
  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths = {
    Analytics: "/salesmanager_lead_analytics",
    New: "/salesmanager_newleads",
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
      return;
    }

    try {
      const response = await axios.get(
        "https://devlokcrmbackend.up.railway.app/leads/get_followed_leads/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLeads(response.data);
      setError(""); 
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError("Failed to fetch leads. Try again later.");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    navigate(tabPaths[tabName] || "/salesmanager_followed_leads");
  };

  const handleAddLead = () => {
    navigate("/addlead_salesman");
  };

  

  const handleViewNotes = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

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

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  return (
    <StaffLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Followed Leads ({leads.length})</h2>
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

        {error ? (
          <p className={styles.error}>{error}</p>
        ) : leads.length === 0 ? (
          <p className={styles.noData}>No leads available.</p>
        ) : (
          <div className={styles.leadContainer}>
            {currentLeads.map((lead) => (
              <div key={lead.id} className={styles.leadCard}>
                <div className={styles.leadInfo}>
                  <div className={styles.infoBlock}>
                    <p><strong>{lead.name}</strong></p>
                    <p><strong>{lead.phonenumber}</strong></p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>{lead.place}, {lead.district}</strong></p>
                    <p className={styles.multiLineText}><strong>{lead.address}</strong></p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>Purpose: {lead.purpose}</strong></p>
                    <p><strong>Property Type: {lead.mode_of_purpose}</strong></p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p className={styles.multiLineText}><strong>{lead.email}</strong></p>
                    <p><strong>{formatDate(lead.timestamp)} </strong>{lead.message && (
                                                        
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

      {/* ✅ Message Modal (Restored) */}
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

export default FollowedLeads;
