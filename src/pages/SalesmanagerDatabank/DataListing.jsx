import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./DataListing.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout";
import UploadImageModal from "../../components/Modals/AddImageModal";
import UpdateStageModal from "../../components/Modals/UpdateStage";
import { AlignJustify } from "lucide-react";

const DataDisplay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const databankId = location.state?.databankId || null;
  const accessToken = localStorage.getItem("access_token");

  const [data, setData] = useState(null);
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStageModalOpen, setStageModalOpen] = useState(false);
  const [leadId, setLeadId] = useState(null);

  useEffect(() => {
    if (!databankId) {
      setErrorMessage("Invalid request: No databank ID provided.");
      return;
    }

    axios
      .get(`https://devlokcrm-production.up.railway.app/databank/single_databank/${databankId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          const fetchedData = response.data[0];
          setData(fetchedData);

          // ✅ Set leadId from the response if available
          setLeadId(fetchedData.lead || null);
        } else {
          setErrorMessage("No data found for this record.");
        }
      })
      .catch(() => setErrorMessage("Failed to load data."));

    fetchImages();
  }, [databankId, accessToken]);

  const fetchImages = () => {
    axios
      .get(`https://devlokcrm-production.up.railway.app/databank/view_images/${databankId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => setImages(response.data))
      .catch(() => setImages([]));
  };

  const handleDeleteImage = (imageId) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      axios
        .delete(`https://devlokcrm-production.up.railway.app/databank/delete_image/${databankId}/${imageId}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then(() => {
          setImages(images.filter((img) => img.id !== imageId));
        })
        .catch(() => alert("Failed to delete image."));
    }
  };

  const handleCreateFollower = () => {
    navigate("/follwup_list", { state: { leadId } });
  };

  const handleUpdateStage = () => {
    if (!leadId) {
      alert("Lead ID not found.");
      return;
    }
    setStageModalOpen(true);
  };

  return (
    <StaffLayout>
      <div className={styles.container}>
        {/* Top Bar with Edit Button & Settings Menu */}
        <div className={styles.topBar}>
          <button className={styles.editformBtn} onClick={() => navigate("/data_edit_form", { state: { databankId } })}>
            Edit
          </button>

          {/* Settings Button with Dropdown */}
          <div className={styles.menuWrapper}>
            <button className={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)}>
              <AlignJustify size={20} />
            </button>
            {menuOpen && (
              <div className={styles.menuDropdown}>
                <button onClick={handleCreateFollower}>Followups</button>
                <button onClick={handleUpdateStage}>Update Stage</button>
              </div>
            )}
          </div>
        </div>

        <h1 className={styles.header}>Databank Details</h1>

        {errorMessage ? (
          <p className={styles.error}>{errorMessage}</p>
        ) : data ? (
          <div className={styles.card}>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Phone:</strong> {data.phonenumber}</p>
            <p><strong>District:</strong> {data.district}</p>
            <p><strong>Place:</strong> {data.place}</p>
            <p><strong>Address:</strong> {data.address}</p>
            <p><strong>Purpose:</strong> {data.purpose}</p>
            <p><strong>Property Type:</strong> {data.mode_of_property}</p>
            <p><strong>Demand Price:</strong> ₹{data.demand_price}</p>
            <p><strong>Area:</strong> {data.area_in_sqft} sqft</p>
            <p><strong>Building Roof:</strong> {data.building_roof}</p>
            <p><strong>Floors:</strong> {data.number_of_floors}</p>
            <p><strong>BHK:</strong> {data.building_bhk}</p>
            <p><strong>Additional Notes:</strong> {data.additional_note || "N/A"}</p>
            {data.is_in_project && (
              <p>
                <strong>Project:</strong>{" "}
                <span className={styles.projectName}>{data.project_name}</span>
              </p>
            )}


            <h3 className={styles.imageHeading}>Property Images</h3>
            {images.length > 0 ? (
              <div className={styles.imageGrid}>
                {images.map((img) => (
                  <div key={img.id} className={styles.imageWrapper}>
                    <img src={`https://devlokcrm-production.up.railway.app${img.image}`} alt="Property" className={styles.image} />
                    <span className={styles.deleteIcon} onClick={() => handleDeleteImage(img.id)}>❌</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noImage}>No Images Available</p>
            )}

            <button className={styles.addImageBtn} onClick={() => setModalOpen(true)}>➕ Add Image</button>
          </div>
        ) : (
          <p className={styles.loading}>Loading data...</p>
        )}

        <div className={styles.backButtonWrapper}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>← Back</button>
        </div>

        {modalOpen && (
          <UploadImageModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            databankId={databankId}
            onUploadSuccess={fetchImages}
          />
        )}

        {isStageModalOpen && leadId && (
          <UpdateStageModal
            isOpen={isStageModalOpen}
            onClose={() => setStageModalOpen(false)}
            leadId={leadId} // ✅ Now using leadId from state
            accessToken={accessToken}
          />
        )}
      </div>
    </StaffLayout>
  );
};

export default DataDisplay;
