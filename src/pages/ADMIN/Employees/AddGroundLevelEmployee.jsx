import React, { useState } from 'react';
import AdminLayout from "../../../components/Layouts/AdminLayout";
import axios from 'axios';
import styles from './Addemployee.module.css';

const AddGroundEmployee = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phonenumber: '',
    photo: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmSubmit = window.confirm("Are you sure you want to add this Ground Level Employee?");
    if (!confirmSubmit) return;

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      navigate("/login");
      return;
    }
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('phonenumber', formData.phonenumber);
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      await axios.post(
        'https://devlokcrm-production.up.railway.app/auth/add_glm/',
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setSuccessMsg('Ground Level Employee added successfully!');
      setFormData({
        username: '',
        email: '',
        phonenumber: '',
        photo: null,
      });
      setPreviewImage(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to add Ground Level Employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h2 className={styles.heading}>Add Ground Level Employee</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input
                type="number"
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Upload Photo (optional)</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
            {previewImage && (
              <div className={styles.previewBox}>
                <img src={previewImage} alt="Preview" className={styles.previewImage} />
              </div>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Adding...' : 'Add Ground Level Employee'}
          </button>

          {successMsg && <p className={styles.success}>{successMsg}</p>}
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddGroundEmployee;
