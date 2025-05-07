import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./AdminLeads.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { NotebookPen } from "lucide-react";
import FancySpinner from "../../../components/Loader/Loader";

const AdminFollowedLeads = () => {
  const [leads, setLeads] = useState([]);
  const [salesManagers, setSalesManagers] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedSM, setSelectedSM] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 8;
  const [selectedMessage, setSelectedMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths = {
    "Analytics":"/admin_lead_analytics",
    "New": "/admin_new_leads",
    "Followed": "/admin_followed_leads",
    "Unrecorded": "/admin_unrecorded_leads",
    "Data Saved": "/admin_datasaved_leads",
    "Closed": "/admin_closed_leads",
    "Unsuccessfully": "/admin_unsuccess_lead",
    "Pending": "/admin_pending_leads",
    "Category":"/adminleadcategorygraph"
  };

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const matchedTab = Object.keys(tabPaths).find((tab) => tabPaths[tab] === currentPath);
    return matchedTab || "Followed";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    fetchLeads();
    fetchSalesManagers();
  }, []);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabChange = (tabName) => {
    const path = tabPaths[tabName];
    setActiveTab(tabName);
    if (path !== "#") navigate(path);
  };

  const fetchLeads = async () => {
    const token = localStorage.getItem("access_token");
    setLoading(true);  // Set loading to true before fetching
    try {
      const res = await axios.get("https://devlokcrmbackend.up.railway.app/leads/admin_followed_lead_list/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch followed leads.");
    } finally {
      setLoading(false);  // Set loading to false after fetching
    }
  };

  const fetchSalesManagers = async () => {
    const token = localStorage.getItem("access_token");
    setLoading(true);  // Set loading to true before fetching
    try {
      const res = await axios.get("https://devlokcrmbackend.up.railway.app/auth/list_of_salesmangers/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesManagers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch sales managers.");
    } finally {
      setLoading(false);  // Set loading to false after fetching
    }
  };

  const openAssignModal = (leadId) => {
    setSelectedLeadId(leadId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLeadId(null);
    setSelectedSM("");
    setLoading(false);
  };
  const handleViewNotes = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };
  
  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage("");
  };
  

  const assignFollower = async () => {
    if (!selectedSM) return;
    const confirmAssign = window.confirm("Are you sure you want to change the Sales Manager?");
    if (!confirmAssign) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      await axios.patch(
        `https://devlokcrmbackend.up.railway.app/leads/add_follower/${selectedLeadId}/`,
        { sales_manager_id: parseInt(selectedSM) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeModal();
      fetchLeads();
    } catch (err) {
      console.error("Assignment failed:", err);
      setError("Failed to change follower.");
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const indexOfLast = currentPage * leadsPerPage;
  const indexOfFirst = indexOfLast - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Followed Leads ({leads.length})</h2>
          <button
                      className={styles.addEventBtn}
                      onClick={() => navigate("/admin_manually_enter_lead")}
                    >
                    + Add Lead
                    </button>
        </div>

        {/* ✅ Tabs */}
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
       

        {error && <p className={styles.error}>{error}</p>}
        {loading ? (
          <div className={styles.loaderWrapper}>
            <FancySpinner />
          </div>
        ) : leads.length === 0 ? (
          <div className={styles.noLeadsMessage}>
            <p>No leads available now.</p>
          </div>
        ) : (

        <div className={styles.leadContainer}>
          {currentLeads.map((lead) => (
            <div key={lead.id} className={styles.leadCard}>
              <div className={styles.leadInfo}>
                <div className={styles.infoBlock}>
                  <p><strong>{lead.name}</strong></p>
                  <p><strong>{lead.phonenumber}</strong></p>
                  <p className={styles.multiLineText}><strong>{lead.email}</strong></p>
                </div>
                <div className={styles.infoBlock}>
                  <p><strong>{lead.place}, {lead.district}</strong></p>
                  <p className={styles.multiLineText}><strong>{lead.address}</strong></p>
                </div>
                <div className={styles.infoBlock}>
                  <p><strong>Purpose: {lead.purpose}</strong></p>
                  <p><strong>Property Type: {lead.mode_of_purpose}</strong></p>
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
                
                
                <div className={styles.infoBlock}>
                  <p><strong>Follower: {lead.follower || "Not Assigned"}</strong></p>
                  <button
                    className={styles.followUpBtn}
                    onClick={() => openAssignModal(lead.id)}
                  >
                    Change Follower
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`${styles.paginationBtn} ${currentPage === i + 1 ? styles.activePage : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={closeModal}>X</button>
            <h3>Change Sales Manager</h3>
            <select
              value={selectedSM}
              onChange={(e) => setSelectedSM(e.target.value)}
              className={styles.dropdown}
            >
              <option value="">Select Sales Manager</option>
              {salesManagers.map((sm) => (
                <option key={sm.id} value={sm.id}>
                  {sm.username}
                </option>
              ))}
            </select>
            <button
              className={styles.followUpBtn}
              disabled={!selectedSM || loading}
              onClick={assignFollower}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
      {showMessageModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={closeMessageModal}>
              X
            </button>
            <h3>Lead Notes</h3>
            <p>{selectedMessage}</p>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminFollowedLeads;
