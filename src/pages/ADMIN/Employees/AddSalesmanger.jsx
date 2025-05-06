import React, { useState } from 'react';
import AdminLayout from "../../../components/Layouts/AdminLayout";
import axios from 'axios';
import styles from './Addemployee.module.css';

const AddSalesManager = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phonenumber: '',
    password: '',
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
  
    const confirmSubmit = window.confirm("Are you sure you want to add this Sales Manager?");
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
    data.append('password', formData.password);
    if (formData.photo) {
      data.append('photo', formData.photo);
    }
  
    try {
      await axios.post(
        'https://devlokcrmbackend.up.railway.app/auth/add_salesmanager/',
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setSuccessMsg('Sales Manager added successfully!');
      setFormData({
        username: '',
        email: '',
        phonenumber: '',
        password: '',
        photo: null,
      });
      setPreviewImage(null);
    } catch (err) {
      console.error("Add SalesManager Error:", err.response?.data || err.message);
  
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setErrorMsg(data);
        } else if (data.detail) {
          setErrorMsg(data.detail);
        } else if (typeof data === 'object') {
          const messages = Object.entries(data)
            .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
            .join(' | ');
          setErrorMsg(messages);
        } else {
          setErrorMsg('Failed to add Sales Manager.');
        }
      } else {
        setErrorMsg('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className={styles.container}>
        <h2 className={styles.heading}>Add Sales Manager</h2>
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

            <div className={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Upload Photo</label>
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
            {loading ? 'Adding...' : 'Add Sales Manager'}
          </button>

          {successMsg && <p className={styles.success}>{successMsg}</p>}
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddSalesManager;
