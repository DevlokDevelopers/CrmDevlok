import React, { useState } from "react";
import axios from "axios";
import styles from "./UpdateStage.module.css";

const UpdateStageModal = ({ isOpen, onClose, leadId, accessToken }) => {
  const [selectedStage, setSelectedStage] = useState("");

  const stages = ["Closed Successfully", "Closed by Someone", "Dropped Lead"];

  const handleSubmit = async () => {
    if (!selectedStage) {
      alert("Please select a stage.");
      return;
    }

    const confirmClose = window.confirm(
      selectedStage.includes("Closed")
        ? "Warning: Closing this lead will remove it from the databank. Do you want to continue?"
        : "Are you sure you want to update the lead stage?"
    );

    if (!confirmClose) return;

    try {
      await axios.put(
        `https://devlokcrmbackend.up.railway.app/leads/update_stage/${leadId}/`,
        { stage: selectedStage },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      alert("Stage updated successfully!");
      onClose();
    } catch (error) {
      alert("Failed to update stage.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Update Lead Stage</h2>
        <p className={styles.alertNote}>
          <strong>Note:</strong> Closing a lead will remove it from the databank.
        </p>
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className={styles.dropdown}
        >
          <option value="">Select Stage</option>
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <div className={styles.buttonGroup}>
          <button onClick={handleSubmit} className={styles.submitButton}>
            Update
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStageModal;
