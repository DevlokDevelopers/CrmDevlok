import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./AdminDataDisplay.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";

const AdminDataDisplay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const databankId = location.state?.databankId || null;
  const accessToken = localStorage.getItem("access_token");

  const [data, setData] = useState(null);
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [addProjectError, setAddProjectError] = useState("");
  const [addingProjectId, setAddingProjectId] = useState(null); // for per-button loading

  useEffect(() => {
    if (!databankId) {
      setErrorMessage("Invalid request: No databank ID provided.");
      return;
    }

    axios
      .get(`https://devlokcrm-production.up.railway.app/databank/admin_single_databank/${databankId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setData(response.data[0]);
        } else {
          setErrorMessage("No data found.");
        }
      })
      .catch(() => setErrorMessage("Failed to load data."));

    fetchImages();
  }, [databankId, accessToken]);

  const fetchImages = () => {
    axios
      .get(`https://devlokcrm-production.up.railway.app/databank/admin_view_images/${databankId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => setImages(response.data))
      .catch(() => setImages([]));
  };

  const openProjectModal = () => {
    setShowProjectModal(true);
    setAddProjectError("");

    axios
      .get("https://devlokcrm-production.up.railway.app/project/list_projects/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        const projects = res.data?.projects || [];
        setProjectList(projects);
      })
      .catch(() => setAddProjectError("Failed to load projects."));
  };

  const addToProject = (projectId) => {
    setAddingProjectId(projectId);
    setAddProjectError("");

    axios
      .post(
        `https://devlokcrm-production.up.railway.app/project/add_data_into_project/${projectId}/`,
        { data_bank_ids: [databankId] },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then(() => {
        setShowProjectModal(false);
        navigate("/admin_projects"); // ✅ redirect after successful add
      })
      .catch(() => {
        setAddProjectError("Failed to add to project.");
      })
      .finally(() => {
        setAddingProjectId(null);
      });
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.header}>Databank Details</h1>

        {errorMessage ? (
          <p className={styles.error}>{errorMessage}</p>
        ) : data ? (
          <div className={styles.card}>
            <p className={styles.ptag}>Name:<strong> {data.name}</strong></p>
            <p>Email:<strong> {data.email}</strong></p>
            <p>Phone:<strong> {data.phonenumber}</strong></p>
            <p>District:<strong> {data.district}</strong></p>
            <p>Place: <strong>{data.place}</strong></p>
            <p>Address: <strong>{data.address}</strong></p>
            <p>Purpose:<strong> {data.purpose}</strong></p>
            <p>Property Type: <strong>{data.mode_of_property}</strong></p>
            <p>Demand Price:<strong> ₹{data.demand_price}</strong></p>
            <p>Area: <strong>{data.area_in_sqft} </strong>sqft</p>
            <p>Building Roof:<strong> {data.building_roof}</strong></p>
            <p>Floors:<strong>{data.number_of_floors}</strong> </p>
            <p>BHK: <strong>{data.building_bhk}</strong></p>
            <p>Additional Notes: <strong>{data.additional_note || "N/A"}</strong></p>
            <p>Follower: <strong>{data.follower_name}</strong></p>
            <p>
              <strong>Project:</strong>{" "}
              {data.is_in_project ? (
                <span className={styles.projectName}>{data.project_name}</span>
              ) : (
                <button className={styles.addProjectBtn} onClick={openProjectModal}>
                  + Add to Project
                </button>
              )}
            </p>

            <h3 className={styles.imageHeading}>Property Images</h3>
            {images.length > 0 ? (
              <div className={styles.imageGrid}>
                {images.map((img) => (
                  <div key={img.id} className={styles.imageWrapper}>
                    <img
                      src={`https://devlokcrm-production.up.railway.app${img.image}`}
                      alt="Property"
                      className={styles.image}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noImage}>No Images Available</p>
            )}
          </div>
        ) : (
          <p className={styles.loading}>Loading data...</p>
        )}

        <div className={styles.backButtonWrapper}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>← Back</button>
        </div>

        {/* Modal */}
        {showProjectModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Select a Project</h3>
              {addProjectError && <p className={styles.error}>{addProjectError}</p>}
              <ul className={styles.projectList}>
                {projectList.length === 0 ? (
                  <p>No projects available.</p>
                ) : (
                  projectList.map((proj) => (
                    <li key={proj.id} className={styles.projectItem}>
                      <div>
                        <strong>{proj.project_name}</strong><br />
                        <small>{proj.description}</small><br />
                        <small><strong>Start:</strong> {proj.start_date}</small><br />
                        <small><strong>Deadline:</strong> {proj.deadline}</small>
                      </div>
                      <button
                        className={styles.selectBtn}
                        onClick={() => addToProject(proj.id)}
                        disabled={addingProjectId !== null}
                      >
                        {addingProjectId === proj.id ? "Adding..." : "Add"}
                      </button>
                    </li>
                  ))
                )}
              </ul>
              <button className={styles.closeBtn} onClick={() => setShowProjectModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDataDisplay;
