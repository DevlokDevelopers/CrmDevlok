import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./AdminLeads.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { NotebookPen } from "lucide-react";

const AdminNewLeads = () => {
  const [leads, setLeads] = useState([]);
  const [salesManagers, setSalesManagers] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedSM, setSelectedSM] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);

  const leadsPerPage = 8;

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
  };

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const matchedTab = Object.keys(tabPaths).find((tab) => tabPaths[tab] === currentPath);
    return matchedTab || "New";
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
    try {
      const res = await axios.get("https://devlokcrm-production.up.railway.app/leads/get_new_leads/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch leads.");
    }
  };

  const fetchSalesManagers = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await axios.get("https://devlokcrm-production.up.railway.app/auth/list_of_salesmangers/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesManagers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch sales managers.");
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
  
  const handleDeleteLead = async (leadId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this lead?");
    if (!confirmDelete) return;
  
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`https://devlokcrm-production.up.railway.app/leads/delete_lead/${leadId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads(); // refresh list after deletion
    } catch (err) {
      console.error("Failed to delete lead:", err);
      alert("Failed to delete the lead.");
    }
  };
  
  const assignFollower = async () => {
    if (!selectedSM) return;
    const confirmAssign = window.confirm("Are you sure you want to assign this Sales Manager?");
    if (!confirmAssign) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      await axios.patch(
        `https://devlokcrm-production.up.railway.app/leads/add_follower/${selectedLeadId}/`,
        { sales_manager_id: parseInt(selectedSM) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeModal();
      fetchLeads();
    } catch (err) {
      console.error("Assignment failed:", err);
      setError("Failed to assign follower.");
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
          <h2 className={styles.title}>New Leads ({leads.length})</h2>
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

        <div className={styles.leadContainer}>
          {currentLeads.map((lead) => (
            <div key={lead.id} className={styles.leadCard}>
              <div className={styles.leadInfo}>
                <div className={styles.infoBlock}>
                  <p><strong>{lead.name}</strong></p>
                  <p>{lead.phonenumber}</p>
                  <p className={styles.multiLineText}>{lead.email}</p>
                 
                </div>
                <div className={styles.infoBlock}>
                  <p>{lead.place}, {lead.district}</p>
                  <p className={styles.multiLineText}>{lead.address}</p>
                </div>
                <div className={styles.infoBlock}>
                  <p>Purpose: <strong>{lead.purpose}</strong></p>
                  <p>Property Type: <strong>{lead.mode_of_purpose}</strong></p>
                  <p>{formatDate(lead.timestamp)} {lead.message && (
                                    
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
                  <button
                    className={styles.followUpBtn}
                    onClick={() => openAssignModal(lead.id)}
                  >
                    Assign Follower
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteLead(lead.id)}
                  >
                  Delete
                  </button>
                </div>
                
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`${styles.paginationBtn} ${
                  currentPage === i + 1 ? styles.activePage : ""
                }`}
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
            <h3>Assign Sales Manager</h3>
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

export default AdminNewLeads;
