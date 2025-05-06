import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Import useLocation
import axios from "axios";
import styles from "./SalesMNewLeads.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout"; // Correct Layout Import
import { NotebookPen } from "lucide-react";

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 8; // ✅ 8 Cards Per Page
  const [selectedMessage, setSelectedMessage] = useState(""); // State for Selected Message
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const navigate = useNavigate(); // ✅ Initialize navigate hook
  const location = useLocation(); // ✅ Get current route info

  // ✅ Define Tab Paths for Navigation
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

  // ✅ Get Active Tab Based on Current Path
  const getActiveTab = () => {
    const currentPath = location.pathname;
    const matchedTab = Object.keys(tabPaths).find(
      (tab) => tabPaths[tab] === currentPath
    );
    return matchedTab || "New"; // Default to 'New' if no match
  };

  const [activeTab, setActiveTab] = useState(getActiveTab()); // ✅ Sync activeTab initially

  // ✅ Sync activeTab when route changes
  useEffect(() => {
    if (location.pathname !== tabPaths.New) { // Only update when not on 'New' page
      setActiveTab(getActiveTab()); // ✅ Update tab on route change
    } else {
      setActiveTab("New"); // Keep 'New' active in Leads List page
    }
  }, [location.pathname]);

  // ✅ Fetch Leads from Backend
  const fetchLeads = async () => {
    const token = localStorage.getItem("access_token"); // Get JWT Token
    if (!token) {
      setError("Authorization token is missing. Please login.");
      return;
    }

    try {
      const response = await axios.get(
        "https://devlokcrmbackend.up.railway.app/leads/get_new_leads/",
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Pass Token in Header
          },
        }
      );
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      if (error.response && error.response.status === 401) {
        setError("Unauthorized access. Please login again.");
      } else {
        setError("Failed to fetch leads. Try again later.");
      }
    }
  };

  // ✅ Fetch Leads on Component Mount
  useEffect(() => {
    fetchLeads(); // ✅ Initial Fetch
  }, []);

  // ✅ Poll API Every 10 Seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchLeads(); // ✅ Fetch Updated Leads Every 10s
    }, 60000);

    // ✅ Cleanup Interval When Component Unmounts
    return () => clearInterval(intervalId);
  }, []);

  // ✅ Handle Tab Change
  const handleTabChange = (tabName) => {
    const path = tabPaths[tabName] || "/salesmanager_newleads"; // Default to New
    navigate(path); // ✅ Navigate to respective path
  };

  // ✅ Handle Add Lead Button
  const handleAddLead = () => {
    navigate("/addlead_salesman"); // ✅ Redirect to Add Lead Page
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // ✅ Pagination Logic
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);

  const totalPages = Math.ceil(leads.length / leadsPerPage);

  // ✅ Handle Page Change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // ✅ Handle View Notes Button Click
  const handleViewNotes = (message) => {
    setSelectedMessage(message); // Set selected message
    setShowModal(true); // Show modal
  };

  // ✅ Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(""); // Clear the message after closing
  };
  const handleFollowUp = async (leadId) => {
    const confirm = window.confirm("Are you sure you want to follow this lead?");
    if (!confirm) return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Authorization token is missing.");
      return;
    }
  
    try {
      await axios.post(
        `https://devlokcrmbackend.up.railway.app/leads/takelead/${leadId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchLeads(); // 🔄 Refresh list after follow-up
    } catch (error) {
      console.error("Error taking follow-up lead:", error);
      setError("Failed to take lead. Please try again.");
    }
  };
  

  return (
    <StaffLayout>
      <div className={styles.container}>
        {/* ✅ Header with Add Button */}
        <div className={styles.header}>
          <h2 className={styles.title}>New Leads ({leads.length})</h2>
          <button className={styles.addLeadBtn} onClick={handleAddLead}>
            + Add Lead
          </button>
        </div>

        <div className={styles.tabContainer}>
          {Object.keys(tabPaths).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${
                activeTab === tab ? styles.activeTab : "" // ✅ Active Style Applied
              }`}
              onClick={() => handleTabChange(tab)}
              disabled={tab === "New" && location.pathname !== tabPaths.New} // Prevent clicking if not on 'New' tab page
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
                        Purpose:{lead.purpose} </strong>
                      </p>
                      <p><strong>
                        Property Type: {lead.mode_of_purpose}</strong>
                      </p>
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

                   

                    {/* ✅ Follow-Up Button */}
                    <div className={styles.infoBlock}>
                    <button
                      className={styles.followUpBtn}
                      onClick={() => handleFollowUp(lead.id)}
                    >
                      Follow Up
                    </button>

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

      {/* ✅ Modal for Displaying Message */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={closeModal}>
              X
            </button>
            <h3>Message</h3>
            <p>{selectedMessage}</p>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default LeadsList;
