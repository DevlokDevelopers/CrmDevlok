import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./EmployeeListing.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { useNavigate } from "react-router-dom"; // ← Import this
import ProfileImage from "../../../assets/ProfileImage.png";
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // ← Add icons for edit and delete

const AdminEmployeeListing = () => {
  const [activeTab, setActiveTab] = useState("SalesManagers");
  const [salesManagers, setSalesManagers] = useState([]);
  const [groundEmployees, setGroundEmployees] = useState([]);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editedData, setEditedData] = useState({
    username: "",
    email: "",
    phonenumber: "",
  });
  const navigate = useNavigate(); // ← Initialize here

  const fetchEmployees = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Authorization token missing. Please login.");
      return;
    }

    try {
      const response = await axios.get("https://devlokcrmbackend.up.railway.app/auth/list_employees/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSalesManagers(response.data?.Salesmanager_Employees?.SalesManagers || []);
      setGroundEmployees(response.data?.GLM_Employees?.GLM_staff || []);
    } catch (err) {
      console.error("Error fetching employee data:", err);
      setError("Failed to load employee data.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddOptionClick = (type) => {
    setDropdownOpen(false);

    if (type === "sales") {
      navigate("/add_salesmanager"); // ← Redirect to Add Sales Manager page
    } else if (type === "ground") {
      navigate("/add_ground_staff"); // ← Update this if you have a separate page
    }
  };

  const currentData = activeTab === "SalesManagers" ? salesManagers : groundEmployees;

  // Handle edit and delete actions for GLM employees
  const handleEdit = (glmId, emp) => {
    setSelectedEmployee(emp); // Store the selected employee
    setEditedData({
      username: emp.username,
      email: emp.email,
      phonenumber: emp.phonenumber,
    });
    setShowEditModal(true); // Show the modal
  };

  const handleDelete = async (glmId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.delete(`https://devlokcrmbackend.up.railway.app/auth/delete_glm/${glmId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Ground Level Employee deleted successfully!");
      fetchEmployees(); // Re-fetch the employee list
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert("Failed to delete Ground Level Employee.");
    }
  };

  const handleUpdateGLM = async () => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.put(`https://devlokcrmbackend.up.railway.app/auth/update_glm/${selectedEmployee.id}/`, editedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Ground Level Employee updated successfully!");
      fetchEmployees(); // Re-fetch the employee list
      setShowEditModal(false); // Close the modal
    } catch (err) {
      console.error("Error updating employee:", err);
      alert("Failed to update Ground Level Employee.");
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${activeTab === "SalesManagers" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("SalesManagers")}
            >
              Sales Managers
            </button>
            <button
              className={`${styles.tab} ${activeTab === "GLM_staff" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("GLM_staff")}
            >
              Ground Level Employees
            </button>
          </div>

          <div className={styles.addContainer}>
            <button
              className={styles.addBtn}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Add Employees ▾
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown}>
                <div onClick={() => handleAddOptionClick("sales")}>Sales Manager</div>
                <div onClick={() => handleAddOptionClick("ground")}>Ground Level Employee</div>
              </div>
            )}
          </div>
        </div>

        {error ? (
          <p className={styles.error}>{error}</p>
        ) : currentData.length === 0 ? (
          <p className={styles.noData}>No employees found.</p>
        ) : (
          <div className={styles.leadContainer}>
            {currentData.map((emp, index) => (
              <div key={index} className={styles.leadCard}>
                <div className={styles.leadInfo}>
                  <div className={styles.infoBlock}>
                    <img
                      src={emp.photo ? `https://devlokcrmbackend.up.railway.app${emp.photo}` : ProfileImage}
                      alt={emp.username}
                      className={styles.profileImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = ProfileImage;
                      }}
                    />
                  </div>
                  <div className={styles.infoBlock}>
                    <p><strong>{emp.username}</strong></p>
                    <p>{emp.email}</p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p>{emp.phonenumber}</p>
                    <p>Role: {activeTab === "SalesManagers" ? "Sales Manager" : "Ground Level Staff"}</p>
                  </div>

                  <div className={styles.actions}>
                    {activeTab === "SalesManagers" ? (
                      <button
                        className={styles.detailsBtn}
                        onClick={() => navigate(`/salesmanager_profile_admin/${emp.id}`)}
                      >
                        View Details
                      </button>
                    ) : (
                      <div className={styles.iconContainer}>
                        <FaEdit
                          className={styles.glmEditicon}
                          onClick={() => handleEdit(emp.id, emp)} // Pass the GLM id for editing
                        />
                        <FaTrashAlt
                          className={styles.glmDeleteicon}
                          onClick={() => handleDelete(emp.id)} // Pass the GLM id for deletion
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Editing GLM */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Edit Ground Level Employee</h2>
            <label>
              Username:
              <input
                type="text"
                value={editedData.username}
                onChange={(e) => setEditedData({ ...editedData, username: e.target.value })}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={editedData.email}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
              />
            </label>
            <label>
              Phone Number:
              <input
                type="text"
                value={editedData.phonenumber}
                onChange={(e) => setEditedData({ ...editedData, phonenumber: e.target.value })}
              />
            </label>
            <button onClick={handleUpdateGLM}>Save</button>
            <button onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEmployeeListing;
