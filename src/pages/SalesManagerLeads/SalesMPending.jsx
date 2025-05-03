import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import axios from "axios";
import styles from "./SalesMNewLeads.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout"; 
import { NotebookPen } from "lucide-react";

const PendingLeads = () => {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("New");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false); // ✅ State for modal visibility
  const [selectedMessage, setSelectedMessage] = useState(""); // ✅ Store selected message
  const leadsPerPage = 8;
  const navigate = useNavigate();
  const location = useLocation();

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
      return;
    }

    try {
      const response = await axios.get(
        "https://devlokcrm-production.up.railway.app/leads/pending_leads_salesmanager/",
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
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    const path = tabPaths[tabName] || "/salesmanger_pending_leads";
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

  // ✅ Handle View Notes
  const handleViewNotes = (message) => {
    setSelectedMessage(message || "No notes available."); // ✅ Default if no message
    setShowModal(true);
  };

  // ✅ Close Modal
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
        {/* ✅ Header with Add Button */}
        <div className={styles.header}>
          <h2 className={styles.title}>Pending Leads ({leads.length})</h2>
          <button className={styles.addLeadBtn} onClick={handleAddLead}>
            + Add Lead
          </button>
        </div>

        {/* ✅ Tab Section with Navigation */}
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

        {/* ✅ Error or No Data Message */}
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : leads.length === 0 ? (
          <p className={styles.noData}>No leads available.</p>
        ) : (
          <>
            {/* ✅ Leads with Pagination */}
            <div className={styles.leadContainer}>
              {currentLeads.map((lead) => (
                <div key={lead.id} className={styles.leadCard}>
                  <div className={styles.leadInfo}>
                    {/* ✅ Name */}
                    <div className={styles.infoBlock}>
                      <p>
                        <strong>{lead.name}</strong>
                      </p>
                      <p><strong>{lead.phonenumber}</strong></p>
                      <p className={styles.multiLineText}><strong>{lead.email}</strong></p>
                    </div>

                    {/* ✅ Place & Address */}
                    <div className={styles.infoBlock}>
                      <p><strong>
                        {lead.place}, {lead.district}</strong>
                      </p>
                      <p className={styles.multiLineText}><strong>{lead.address}</strong></p>
                    </div>

                    {/* ✅ Purpose */}
                    <div className={styles.infoBlock}>
                      <p><strong>
                        Purpose: {lead.purpose}</strong>
                      </p>
                      <p><strong>
                        Property Type: {lead.mode_of_purpose}</strong>
                      </p>
                      {lead.lead_category?.length > 0 &&
                          <p><strong>Category:</strong> {
                            lead.lead_category.map((cat) => cat.category).join(", ")
                          }</p>
                      }
                      <p><strong>Stage : {lead.stage}</strong></p>
                      <p><strong>{formatDate(lead.timestamp)}</strong> {lead.message && (
                                                                              
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

            {/* ✅ Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`${styles.paginationBtn} ${
                      currentPage === index + 1 ? styles.activePage : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Message Modal */}
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

export default PendingLeads;
