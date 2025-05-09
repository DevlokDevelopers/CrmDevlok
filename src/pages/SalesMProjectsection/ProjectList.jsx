import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ProjectList.module.css"; // Using same styles as BuyList
import StaffLayout from "../../components/Layouts/SalesMLayout";
import { FaFire, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import defaultProjectIcon from "../../assets/ProjectIcon.png"; // Adjust path as needed
import FancySpinner from "../../components/Loader/Loader";
const priorityIcons = {
  High: <FaFire className={styles.priorityIcon} style={{ color: "#dc2626" }} />, // 🔥 Red
  Medium: <FaExclamationTriangle className={styles.priorityIcon} style={{ color: "#f59e0b" }} />, // ⚠️ Orange
  Low: <FaCheckCircle className={styles.priorityIcon} style={{ color: "#22c55e" }} />, // ✅ Green
};

const SalesManagerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const fetchProjects = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Authorization token is missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("https://devlokcrmbackend.up.railway.app/project/sales_manager_projects/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to fetch projects.");
    } finally {
      setLoading(false); // Set loading to false in both success and error
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle Click on Project Card
  const handleCardClick = (project) => {
    navigate(`/salesmanager_project_details/${project.project_id}`); // Pass ID in URL
  };
  
  return (
    <StaffLayout>
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>My Projects</h2>
        </div>

         {loading ? (
          <div className={styles.loaderWrapper}><FancySpinner /></div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : projects.length === 0 ? (
          <p className={styles.noData}>No projects available.</p>
        ) : (
          <div className={styles.leadContainer}>
            {projects.map((project) => (
              <div
                key={project.project_id}
                className={styles.leadCard}
                onClick={() => handleCardClick(project)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.leadInfo}>
                  <div className={styles.infoBlock}>
                    <img
                      src={project.project_icon ? project.project_icon : defaultProjectIcon}
                      onError={(e) => (e.target.src = defaultProjectIcon)}
                      alt="Project Icon"
                      className={styles.projectIcon}
                    />
                    <p>{project.project_name}</p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>Data Collection:</strong> {project.total_databank_count}</p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>Closed:</strong> {project.closed_leads_count}</p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>Progress:</strong> {project.progress_percentage}%</p>
                  </div>
                  <div className={styles.infoBlock}>
                    {priorityIcons[project.priority]}
                    <span className={styles.priorityText}>{project.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default SalesManagerProjects;
