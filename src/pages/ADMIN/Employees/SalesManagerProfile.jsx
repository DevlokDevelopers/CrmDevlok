import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./SalesManagerProfile.module.css";
import { useParams } from "react-router-dom";
import ProfileImage from "../../../assets/ProfileImage.png";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { X, Camera } from "lucide-react";

const AdminSalesManagerProfile = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "", phone: "", photo: null });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate(); // ✅ make sure this exists and is not missing


  const fetchProfileData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(`https://devlokcrmbackend.up.railway.app/task/admin_salesmanager_workhistory/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetails(res.data);
      const data = res.data["Sales Manager"];
      setEditData({ name: data.name, email: data.email, phone: data.phone, photo: null });
    } catch (err) {
      setError("Failed to load profile details.");
    }
  };

  const fetchProjectData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(`https://devlokcrmbackend.up.railway.app/project/salesmanager_project_admin/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchProjectData();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    if (!window.confirm("Are you sure you want to update this Sales Manager?")) {
      return;
    }
  
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("username", editData.name);
    formData.append("email", editData.email);
    formData.append("phonenumber", editData.phone);
    if (editData.photo) formData.append("photo", editData.photo);
  
    try {
      setUpdating(true);
  
      await axios.put(`https://devlokcrmbackend.up.railway.app/auth/update_salesmanager/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (showPasswordFields) {
        if (newPassword !== verifyPassword) {
          alert("Passwords do not match.");
          setUpdating(false);
          return;
        }
  
        await axios.patch(
          `https://devlokcrmbackend.up.railway.app/auth/update_salesmanager_password/${id}/`,
          { password: newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      alert("Sales Manager updated successfully.");
      setShowModal(false);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update Sales Manager.");
    } finally {
      setUpdating(false);
    }
  };


  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Sales Manager?");
    if (!confirmDelete) return;
  
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`https://devlokcrmbackend.up.railway.app/auth/delete_salesmanager/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      alert("Sales Manager deleted successfully.");
  
      
      navigate("/employee_listing");
      
    } catch (error) {
      console.error("Delete failed:", error);
  
      // Only show error if response indicates an error
      if (error.response) {
        alert("Failed to delete Sales Manager.");
      }
    }
  };
  
  

  if (error) return <p className={styles.error}>{error}</p>;
  if (!details) return <p className={styles.loading}>Loading...</p>;

  const { photo, name, email, phone, joined_date } = details["Sales Manager"];
  const workSummary = details["Work Summary"];
  const correctedPhoto = photo?.startsWith('/media/')
  ? photo
  : `/media${photo}`;

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Sales Manager Profile</h2>
          <button type="button" className={styles.editBtn} onClick={() => setShowModal(true)}>
            Edit
          </button>
        </div>

        <div className={styles.profileCard}>
        <img
            src={photo ? `https://devlokcrmbackend.up.railway.app${correctedPhoto}` : ProfileImage}
            alt={name}
            className={styles.profileImage}
            onError={(e) => { e.target.src = ProfileImage }}
          />
          <div className={styles.profileInfo}>
            <h3>{name}</h3>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Joined Date:</strong> {joined_date}</p>
          </div>
        </div>

        <div className={styles.summarySection}>
          <h3>Work Summary</h3>
          <div className={styles.summaryGrid}>
            {Object.entries(workSummary).map(([key, value]) => (
              <div className={styles.summaryCard} key={key}>
                <p className={styles.metricLabel}>{key}</p>
                <p className={styles.metricValue}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.projectSection}>
          <h3>Projects Involved</h3>
          {projects.length === 0 ? (
            <p>No project data available.</p>
          ) : (
            <div className={styles.projectGrid}>
              {projects.map((project) => (
                <div key={project.project_id} className={styles.projectCard}>
                  <h4>{project.project_name}</h4>
                  <p>Total DataBank: {project.total_databank_count}</p>
                  <p>Closed Leads: {project.closed_leads_count}</p>
                  <div className={styles.progressBarWrapper}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${project.progress_percentage}%` }}
                    />
                    <span>{project.progress_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.deleteWrapper}>
        <button className={styles.deleteBtn} onClick={handleDelete}>
          Delete Sales Manager
        </button>
      </div>


        {showModal && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modalBox} role="dialog" aria-modal="true">
              <div className={styles.modalHeader}>
                <h3>Edit Sales Manager</h3>
                <button type="button" onClick={() => setShowModal(false)}>
                  <X />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.imageUploadWrapper}>
                    <img
                      src={
                        editData.photo
                          ? URL.createObjectURL(editData.photo)
                          : (photo ? `https://devlokcrmbackend.up.railway.app${photo}` : ProfileImage)
                      }
                      alt="Preview"
                      className={styles.previewImage}
                      onError={(e) => (e.target.src = ProfileImage)}
                    />
                    <label htmlFor="photoInput" className={styles.cameraIcon}>
                      <Camera size={18} />
                    </label>
                    <input
                      type="file"
                      id="photoInput"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        setEditData({ ...editData, photo: e.target.files[0] })
                      }
                    />
                  </div>

                  <label>Name</label>
                  <p className={styles.readOnlyField}>{editData.name}</p>

                  <label>Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />

                  <label>Phone</label>
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />

                  <button
                    type="button"
                    className={styles.togglePasswordBtn}
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                  >
                    {showPasswordFields ? "Cancel Password Change" : "Change Password"}
                  </button>

                  {showPasswordFields && (
                    <>
                      <label>New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />

                      <label>Verify Password</label>
                      <input
                        type="password"
                        value={verifyPassword}
                        onChange={(e) => setVerifyPassword(e.target.value)}
                      />
                    </>
                  )}
                </div>

                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" disabled={updating}>
                    {updating ? "Updating..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSalesManagerProfile;
