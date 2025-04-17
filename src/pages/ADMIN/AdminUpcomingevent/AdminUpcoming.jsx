import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AdminUpcoming.module.css";
import { FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";

const AdminUpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editEventData, setEditEventData] = useState({
    id: null,
    event_name: "",
    date_time: "",
    priority: "Low",
    notes: "",
    event_status: null,
  });

  const [showStatusFields, setShowStatusFields] = useState(false);
  const [statusData, setStatusData] = useState({
    status: "",
    note: "",
  });

  const navigate = useNavigate();

  const fetchEvents = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("https://devlokcrm-production.up.railway.app/task/list_events/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const formattedEvents = (response.data || []).sort(
        (a, b) => new Date(a.date_time) - new Date(b.date_time)
      );

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(
        error.response?.data?.message || "Error fetching events. Please try again later."
      );
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return styles.highPriority;
      case "Medium":
        return styles.mediumPriority;
      case "Low":
        return styles.lowPriority;
      default:
        return "";
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.delete(`https://devlokcrm-production.up.railway.app/task/event_delete/${eventId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert("Event deleted successfully!");
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    }
  };

  const handleEditClick = (event) => {
    setEditEventData({
      id: event.id,
      event_name: event.event_name,
      date_time: event.date_time.slice(0, 16),
      priority: event.priority,
      notes: event.notes || "",
      event_status: event.event_status,
    });
    setShowStatusFields(false);
    setStatusData({
      status: event.event_status?.status || "",
      note: event.event_status?.note || "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateForBackend = (dateObj) => {
    const pad = (n) => String(n).padStart(2, '0');
    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const handleUpdateEvent = async () => {
    const accessToken = localStorage.getItem("access_token");

    try {
      const rawDate = new Date(editEventData.date_time);
      const formattedDate = formatDateForBackend(rawDate);

      const payload = {
        event_name: editEventData.event_name,
        date_time: formattedDate,
        priority: editEventData.priority,
        notes: editEventData.notes,
      };

      await axios.put(
        `https://devlokcrm-production.up.railway.app/task/event_update/${editEventData.id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Event updated successfully!");
      setShowEditModal(false);
      await fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error.response?.data || error.message);
      alert("Failed to update event.");
    }
  };

  const handleStatusUpdate = async () => {
    const accessToken = localStorage.getItem("access_token");

    if (!statusData.status) {
      alert("Please select a status before saving.");
      return;
    }

    try {
      const statusPayload = {
        status: statusData.status,
        note: statusData.note,
      };

      const method = editEventData.event_status ? "put" : "post";

      await axios[method](
        `https://devlokcrm-production.up.railway.app/task/admin_event_status_entry/${editEventData.id}/`,
        statusPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Status updated successfully!");
      await fetchEvents();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error.message);
      alert("Failed to update status.");
    }
  };

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout>
      <div className={styles.container}>
        <button className={styles.addEventBtn} onClick={() => navigate("/admin_calender")}>
          + Add Event
        </button>

        <h2 className={styles.heading}>Upcoming Admin Events</h2>

        {error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <div className={styles.eventGrid}>
              {currentEvents.length === 0 ? (
                <div className={styles.noEvents}>No upcoming events found.</div>
              ) : (
                currentEvents.map((event) => (
                  <div
                    className={`${styles.card} ${getPriorityColor(event.priority)}`}
                    key={event.id}
                  >
                    <button className={styles.deleteButton} onClick={() => handleDeleteEvent(event.id)}>
                      <Trash2 size={20} />
                    </button>
                    <button className={styles.editButton} onClick={() => handleEditClick(event)}>
                      <Pencil size={20} />
                    </button>
                    <div className={styles.eventDetails}>
                      <div className={styles.iconAndName}>
                        <span className={styles.eventIcon}>📅</span>
                        <h3 className={styles.eventName}>{event.event_name}</h3>
                      </div>
                      <div className={styles.eventTime}>
                        <FaClock className={styles.clockIcon} />
                        {formatDateTime(event.date_time)}
                      </div>
                      <p className={styles.notes}>{event.notes}</p>
                      <div className={styles.priorityLabel}>Priority: {event.priority}</div>
                      <div className={styles.noteBox}>
                        Status: {event.event_status?.status || "Pending"}
                        {event.event_status?.note && (
                          <div>
                            <strong>Status Note:</strong> {event.event_status.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.pagination}>
              {Array.from(
                { length: Math.ceil(events.length / eventsPerPage) },
                (_, i) => (
                  <button
                    key={i}
                    className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ""}`}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          </>
        )}

        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Edit Event</h3>
              <input
                name="event_name"
                value={editEventData.event_name}
                onChange={handleEditChange}
                placeholder="Event Name"
              />
              <input
                type="datetime-local"
                name="date_time"
                value={editEventData.date_time}
                onChange={handleEditChange}
              />
              <select
                name="priority"
                value={editEventData.priority}
                onChange={handleEditChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <textarea
                name="notes"
                value={editEventData.notes}
                onChange={handleEditChange}
                rows={3}
                placeholder="Notes"
              />

              <button
                type="button"
                className={styles.toggleStatus}
                onClick={() => setShowStatusFields((prev) => !prev)}
              >
                {showStatusFields ? "Hide Stage Update" : "Update Stage"}
              </button>

              {showStatusFields && (
                <div className={styles.statusFields}>
                  <select
                    name="status"
                    value={statusData.status}
                    onChange={handleStatusChange}
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                  </select>
                  <textarea
                    name="note"
                    value={statusData.note}
                    onChange={handleStatusChange}
                    rows={2}
                    placeholder="Status Note"
                  />
                  <button className={styles.saveStatusBtn} onClick={handleStatusUpdate}>
                    Save Status
                  </button>
                </div>
              )}

              <div className={styles.modalActions}>
                <button onClick={() => setShowEditModal(false)}>Cancel</button>
                <button onClick={handleUpdateEvent}>Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUpcomingEvents;
