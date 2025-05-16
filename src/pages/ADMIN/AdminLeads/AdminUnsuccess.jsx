import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./AdminLeads.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { NotebookPen } from "lucide-react";
import FancySpinner from "../../../components/Loader/Loader";
const AdminUnsuccessLeads = () => {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 8;

  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMessage, setSelectedMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [loading, setLoading] = useState(true);



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
    return matchedTab || "Closed";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    fetchLeads();
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
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true); // show loader
      const res = await axios.get("https://devlokcrmbackend.up.railway.app/leads/get_unsuccessful_leads/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch leads.");
    } finally {
      setLoading(false); // hide loader
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleViewNotes = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };
  
  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage("");
  };
  


  const indexOfLast = currentPage * leadsPerPage;
  const indexOfFirst = indexOfLast - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>UnSuccess Closed Leads ({leads.length})</h2>
          <button
                      className={styles.addEventBtn}
                      onClick={() => navigate("/admin_manually_enter_lead")}
                    >
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

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.leadContainer}>
          {loading ? (
            <div className={styles.loaderWrapper}>
              <FancySpinner />
            </div>
          ) : leads.length === 0 ? (
            <p className={styles.noData}>No leads available.</p>
          ) : (
            currentLeads.map((lead) => (
              <div key={lead.id} className={styles.leadCard}>
                <div className={styles.leadInfo}>
                  <div className={styles.infoBlock}>
                    <p><strong>{lead.name}</strong></p>
                    <p><strong>{lead.phonenumber}</strong></p>
                    <p className={styles.multiLineText}><strong>{lead.email}</strong></p>
                    {lead.care_of && lead.care_of !== "Nil" && (
                      <p className={styles.multiLineText}><strong>Care Of : {lead.care_of}</strong></p>
                    )}
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>{lead.place}, {lead.district}</strong></p>
                    <p className={styles.multiLineText}><strong>{lead.address}</strong></p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>Purpose: {lead.purpose}</strong></p>
                    <p><strong>Property Type: {lead.mode_of_purpose}</strong></p>
                    <p><strong>Lead received: {formatDate(lead.timestamp)}</strong></p>
                    <p><strong>Lead Closed: {formatDate(lead.closed_date)}</strong></p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>Follower: {lead.follower || "Not Assigned"}</strong></p>
                    <p><strong>Type of Close: {lead.stage}</strong></p>
                    {lead.lead_category?.length > 0 && (
                      <p><strong>Category:</strong> {
                        lead.lead_category.map((cat) => cat.category).join(", ")
                      }</p>
                    )}
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
                </div>
              </div>
            ))
          )}
        </div>


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

export default AdminUnsuccessLeads;
