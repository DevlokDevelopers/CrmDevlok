import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import StaffLayout from "../../components/Layouts/SalesMLayout"; // Added Layout
import styles from "./SingleProject.module.css"; 

const SalesmanagerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Authorization token is missing. Please login.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://devlokcrmbackend.up.railway.app/project/salesmanger_single_project/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProject(response.data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to fetch project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <p className={styles.loading}>Loading project details...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!project) return <p className={styles.error}>Project not found</p>;

  // Handle View Data
  // Handle View Data
const handleViewData = (lead) => {
  // Use the lead.id directly as databankId
  const databankId = lead.id;
  navigate("/data_list", { state: { databankId } });
};

  // Handle View Notes
  const handleViewNotes = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <StaffLayout>
      <div className={styles.projectContainer}>
        {/* Left Panel: Project Details */}
        <div className={styles.leftPanel}>
          <h2 className={styles.projectTitle}>{project.project_name}</h2>
          <p className={styles.description}>{project.description}</p>
          <p><strong>Priority:</strong> {project.importance}</p>
          <p><strong>Start Date:</strong> {project.start_date}</p>
          <p><strong>Deadline:</strong> {project.deadline}</p>
          <p><strong>Total Data Collection:</strong> {project.total_databank_count}</p>
          <p><strong>Closed:</strong> {project.closed_leads_count}</p>
          
          <p><strong>Progress:</strong> {project.progress_percentage}%</p>
        </div>

        {/* Right Panel: Databank Collection */}
        <div className={styles.rightPanel}>
          <h3>Data Collection</h3>
          <div className={styles.leadContainer}>
            {project.data_bank.length === 0 ? (
              <p className={styles.noData}>No data available.</p>
            ) : (
              project.data_bank.map((lead) => (
                <div key={lead.id} className={styles.leadCard}>
                  <div className={styles.leadInfo}>
                    <div className={styles.infoBlock}>
                      <p><strong>{lead.name}</strong></p>
                      <p>{lead.phonenumber}</p>
                    </div>
                    <div className={styles.infoBlock}>
                      <p>{lead.place}, {lead.district}</p>
                      <p>{lead.address}</p>
                    </div>
                    <div className={styles.infoBlock}>
                      <p>Purpose: <strong>{lead.purpose}</strong></p>
                      <p>Property Type: <strong>{lead.mode_of_purpose}</strong></p>
                    </div>
                    <div className={styles.infoBlock}>
                      <p>{lead.email}</p>
                      <p>{new Date(lead.timestamp).toLocaleString()}</p>
                    </div>
                    <div className={styles.actionButtons}>
                      <button className={styles.viewDataBtn} onClick={() => handleViewData(lead)}>
                        View Data
                      </button>
                      {lead.message && (
                        <button className={styles.viewNotesBtn} onClick={() => handleViewNotes(lead.message)}>
                          View Notes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                ×
              </button>
              <h3>Lead Notes</h3>
              <p>{selectedMessage}</p>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default SalesmanagerProjectDetails;
