import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AdminProfile.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phonenumber: "",
  });

  const [editMode, setEditMode] = useState(true); // Start in edit mode
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const token = localStorage.getItem("access_token");
  if (!token) {
    navigate("/login");
    return;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("https://devlokcrmbackend.up.railway.app/auth/get_admin/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.[0]) {
          const { username, email, phonenumber } = res.data[0];
          setProfile({ username, email, phonenumber });
        }
      } catch (err) {
        setError("Failed to fetch profile. Try again.");
        console.error(err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPasswordError("");

    // Only show confirmation for saving, not for editing
    if (!window.confirm("Are you sure you want to update the profile?")) return;

    if (showPasswordFields) {
      if (!passwords.password || !passwords.confirmPassword) {
        setPasswordError("Please enter and confirm the new password.");
        return;
      }
      if (passwords.password !== passwords.confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }
    }

    const updatePayload = {
      ...profile,
      ...(showPasswordFields && passwords.password
        ? { password: passwords.password }
        : {}),
    };

    setLoading(true);
    try {
      const res = await axios.put(
        "https://devlokcrmbackend.up.railway.app/auth/update-admin/",
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setSuccess("Profile updated successfully.");
        setEditMode(false);
        setShowPasswordFields(false);
        setPasswords({ password: "", confirmPassword: "" });
        navigate("/adminDash");
      }
    } catch (err) {
      setError("Failed to update profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.profile}>ADMIN PROFILE</h1>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        {passwordError && <p className={styles.error}>{passwordError}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              disabled={!editMode || loading}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!editMode || loading}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phonenumber"
              value={profile.phonenumber}
              onChange={handleChange}
              disabled={!editMode || loading}
              required
            />
          </div>

          {editMode && !showPasswordFields && (
            <button
              type="button"
              className={styles.changePasswordBtn}
              onClick={() => setShowPasswordFields(true)}
              disabled={loading}
            >
              Change Password
            </button>
          )}

          {editMode && showPasswordFields && (
            <>
              <div className={styles.field}>
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={passwords.password}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className={styles.buttons}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
