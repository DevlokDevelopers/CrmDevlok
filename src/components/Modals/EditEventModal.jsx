import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./EditEventModal.module.css";

const EditEventModal = ({ isOpen, onClose, eventData, onEventUpdated }) => {
  const [eventName, setEventName] = useState("");
  const [eventPriority, setEventPriority] = useState("Medium");
  const [eventNotes, setEventNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventData) {
      setEventName(eventData.event_name);
      setEventPriority(eventData.priority);
      setEventNotes(eventData.notes);
    }
  }, [eventData]);

  if (!isOpen || !eventData) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.put(
        `https://devlokcrmbackend.up.railway.app/task/salesmanager_event_update/${eventData.id}/`,
        {
          event_name: eventName,
          priority: eventPriority,
          notes: eventNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Event updated successfully!");
      onEventUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Edit Event</h3>

        <label>Event Name:</label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />

        <label>Priority:</label>
        <select value={eventPriority} onChange={(e) => setEventPriority(e.target.value)}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <label>Notes:</label>
        <textarea value={eventNotes} onChange={(e) => setEventNotes(e.target.value)} />

        <div className={styles.buttonContainer}>
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
