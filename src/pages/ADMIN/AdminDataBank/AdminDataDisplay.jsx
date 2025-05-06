import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./AdminDataDisplay.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { MdLocationOn } from "react-icons/md";

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
      .get(`https://devlokcrmbackend.up.railway.app/databank/admin_single_databank/${databankId}/`, {
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
      .get(`https://devlokcrmbackend.up.railway.app/databank/admin_view_images/${databankId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => setImages(response.data))
      .catch(() => setImages([]));
  };

  const openProjectModal = () => {
    setShowProjectModal(true);
    setAddProjectError("");

    axios
      .get("https://devlokcrmbackend.up.railway.app/project/list_projects/", {
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
        `https://devlokcrmbackend.up.railway.app/project/add_data_into_project/${projectId}/`,
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
            <p><strong>Name: {data.name}</strong></p>
            <p><strong>Email: {data.email}</strong></p>
            <p><strong>Phone: {data.phonenumber}</strong></p>
            <p><strong>District: {data.district}</strong></p>
            <p><strong>Place: {data.place}</strong></p>
            <p><strong>Address: {data.address}</strong></p>
            <p><strong>Purpose: {data.purpose}</strong></p>
            <p><strong>Property Type: {data.mode_of_property}</strong></p>
            <p><strong>Demand Price: ₹{data.demand_price}</strong></p>
            <p><strong>Area: {data.area_in_sqft} sqft</strong></p>
            <p><strong>Building Roof: {data.building_roof}</strong></p>
            <p><strong>Floors: {data.number_of_floors}</strong></p>
            <p><strong>BHK: {data.building_bhk}</strong></p>
            <p><strong>Lead Category: {data.lead_category}</strong></p>
            <p><strong>Additional Notes: {data.additional_note || "N/A"}</strong></p>
            <p><strong>Follower: {data.follower_name}</strong></p>
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

            {data.location_link && (
              <div className={styles.imageWrapper}>
                <div className={styles.mapBox}>
                  <iframe
                    title="Google Map"
                    width="100%"
                    height="300"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${data.location_link}&output=embed`}
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <h3 className={styles.imageHeading}>Property Images</h3>
            {images.length > 0 ? (
              <div className={styles.imageGrid}>
                {images.map((img) => (
                  <div key={img.id} className={styles.imageWrapper}>
                    <img
                      src={`https://devlokcrmbackend.up.railway.app${img.image}`}
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
