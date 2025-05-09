import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AdminProjectList.module.css"; // Reuse existing styles
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { FaFire, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import defaultProjectIcon from "../../../assets/ProjectIcon.png";
import FancySpinner from "../../../components/Loader/Loader";
const priorityIcons = {
  High: <FaFire className={styles.priorityIcon} style={{ color: "#dc2626" }} />,
  Medium: <FaExclamationTriangle className={styles.priorityIcon} style={{ color: "#f59e0b" }} />,
  Low: <FaCheckCircle className={styles.priorityIcon} style={{ color: "#22c55e" }} />,
};

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const fetchProjects = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.get("https://devlokcrmbackend.up.railway.app/project/list_projects/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data.projects); // Use 'projects' key from response
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to fetch projects.");
    }
    finally {
      setLoading(false); // stop spinner
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCardClick = (project) => {
    navigate(`/single_admin_project/${project.id}`);
  };

  const handleCreateProject = () => {
    navigate("/create_project");
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>All Projects</h2>
          <button className={styles.createBtn} onClick={handleCreateProject}>
            + Create Project
          </button>
        </div>

        {loading ? (
          <div className={styles.loaderWrapper}>
            <FancySpinner />
          </div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : currentData.length === 0 ? (
          <p className={styles.noData}>No employees found.</p>
        ) : (
          <div className={styles.leadContainer}>
            {projects
              .sort((a, b) => {
                const priorityOrder = { High: 1, Medium: 2, Low: 3 };
                return priorityOrder[a.importance] - priorityOrder[b.importance];
              })
              .map((project) => (
                <div
                  key={project.id}
                  className={styles.leadCard}
                  onClick={() => handleCardClick(project)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.leadInfo}>
                    <div className={styles.infoBlock}>
                      <img
                        src={project.project_icon || defaultProjectIcon}
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
                      {priorityIcons[project.importance]}
                      <span className={styles.priorityText}>{project.importance}</span>
                    </div>
                  </div>
                </div>
            ))}

          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;
