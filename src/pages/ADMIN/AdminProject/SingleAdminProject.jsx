import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import styles from "./SingleAdminProject.module.css";

const AdminProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [loadingViewDataId, setLoadingViewDataId] = useState(null);


  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    project_name: "",
    importance: "",
    deadline: "",
    description: "",
  });

  useEffect(() => {
    fetchProject();
  }, [id]);

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
        `https://devlokcrmbackend.up.railway.app/project/retrive_project/${id}/`,
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

  const openEditModal = () => {
    setEditForm({
      project_name: project.project_name,
      importance: project.importance,
      deadline: project.deadline,
      description: project.description,
    });
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectUpdate = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Missing access token");

    try {
      await axios.put(
        `https://devlokcrmbackend.up.railway.app/project/edit_project/${id}/`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Project updated successfully.");
      setEditModal(false);
      fetchProject();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update project.");
    }
  };

  const handleViewData = (lead) => {
    const token = localStorage.getItem("access_token");
    setLoadingViewDataId(lead.id);
  
    axios
      .get(`https://devlokcrmbackend.up.railway.app/databank/lead_into_db_admin/${lead.lead}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const databankId = res.data[0].id;
          navigate("/admin_data_display", { state: { databankId } });
        } else {
          alert("No databank data found for this lead.");
        }
      })
      .catch((err) => {
        console.error("Error fetching databank from lead:", err);
        alert("Failed to fetch databank details.");
      })
      .finally(() => {
        setLoadingViewDataId(null);
      });
  };
  
  const handleViewNotes = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleRemoveDatabank = async (dataBankId) => {
    const confirmed = window.confirm("Are you sure you want to remove this databank from the project?");
    if (!confirmed) return;

    const token = localStorage.getItem("access_token");

    try {
      await axios.delete(
        `https://devlokcrmbackend.up.railway.app/project/remove_data_banks/${id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { data_bank_ids: [dataBankId] },
        }
      );

      alert("Databank removed successfully.");
      window.location.reload();
    } catch (err) {
      console.error("Failed to remove databank:", err);
      alert("Failed to remove databank from project.");
    }
  };

  const handleRemoveProject = async () => {
    alert("This will also delete the project progress.");

    const confirmed = window.confirm("Are you sure you want to delete this entire project?");
    if (!confirmed) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.delete(`https://devlokcrmbackend.up.railway.app/project/remove_project/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Project deleted successfully.");
      navigate("/admin_projects");
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete the project.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  if (loading) return <p className={styles.loading}>Loading project details...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!project) return <p className={styles.error}>Project not found</p>;

  return (
    <AdminLayout>
      <div className={styles.headerRow}>
        <h2>Project Details</h2>
        <button
          className={styles.addDataButton}
          onClick={() => navigate(`/data_for_project/${id}`)}
        >
          + Add Data
        </button>
      </div>

      <div className={styles.projectContainer}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <h2 className={styles.projectTitle}>{project.project_name}</h2>
          <p className={styles.description}>{project.description}</p>
          <p><strong>Priority:</strong> {project.importance}</p>
          <p><strong>Start Date:</strong> {formatDate(project.start_date)}</p>
          <p><strong>Deadline:</strong> {formatDate(project.deadline)}</p>
          <p><strong>Total Data Collection:</strong> {project.total_databank_count}</p>
          <p><strong>Closed:</strong> {project.closed_leads_count}</p>
          <p><strong>Progress:</strong> {project.progress_percentage}%</p>

          <button className={styles.editBtn} onClick={openEditModal}>
            ✏️ Edit Project
          </button>

          <button className={styles.removeProjectBtn} onClick={handleRemoveProject}>
            ❌ Remove Entire Project
          </button>
        </div>

        {/* Right Panel */}
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
                      <p>Property Type: <strong>{lead.mode_of_property}</strong></p>
                    </div>
                    <div className={styles.infoBlock}>
                      <p>{lead.email}</p>
                      <p>{new Date(lead.timestamp).toLocaleString()}</p>
                    </div>
                    <div className={styles.actionButtons}>
                    <button
  className={styles.viewDataBtn}
  onClick={() => handleViewData(lead)}
  disabled={loadingViewDataId === lead.id}
>
  {loadingViewDataId === lead.id ? (
    <>
      Loading<span className={styles.spinner} />
    </>
  ) : (
    "View Data"
  )}
</button>

                      {lead.message && (
                        <button className={styles.viewNotesBtn} onClick={() => handleViewNotes(lead.message)}>
                          View Notes
                        </button>
                      )}
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveDatabank(lead.id)}
                      >
                        Remove from Project
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
              <h3>Lead Notes</h3>
              <p>{selectedMessage}</p>
            </div>
          </div>
        )}

      {editModal && (
        <div className={styles.editModalOverlay}>
          <div className={styles.editModalContent}>
            <button className={styles.editCloseButton} onClick={() => setEditModal(false)}>×</button>
            <h3>Edit Project</h3>

            <label>Project Name</label>
            <input
              type="text"
              name="project_name"
              value={editForm.project_name}
              onChange={handleEditChange}
            />

            <label>Importance</label>
            <select
              name="importance"
              value={editForm.importance}
              onChange={handleEditChange}
            >
              <option value="">-- Select Importance --</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={editForm.deadline}
              onChange={handleEditChange}
            />

            <label>Description</label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
            />

            <button onClick={handleProjectUpdate}>Update Project</button>
          </div>
        </div>
      )}

      </div>
    </AdminLayout>
  );
};

export default AdminProjectDetails;
