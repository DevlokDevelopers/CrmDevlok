import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import styles from "./AddImageModal.module.css";

Modal.setAppElement("#root");

const UploadImageModal = ({ isOpen, onClose, databankId, onUploadSuccess }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    return () => {
      // Cleanup object URLs to prevent memory leaks
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const fileObjects = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(fileObjects);
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      alert("Please select images to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    images.forEach(({ file }) => formData.append("photos", file));

    try {
      const response = await axios.post(
        `https://devlokcrm-production.up.railway.app/databank/add_image_into_db/${databankId}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Upload Success:", response.data);
      alert("Images uploaded successfully!");
      setImages([]);
      onUploadSuccess(); // Refresh images in the parent component
      onClose();
    } catch (error) {
      console.error("❌ Upload Failed:", error.response?.data || error.message);
      alert("Failed to upload images. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Upload Images</h2>
        <input type="file" multiple onChange={handleImageChange} accept="image/*" />

        {images.length > 0 && (
          <div className={styles.previewGrid}>
            {images.map((img, index) => (
              <img key={index} src={img.preview} alt="Preview" className={styles.previewImage} />
            ))}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadImageModal;
