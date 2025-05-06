import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./SalesMUpEve.module.css";
import { FaClock } from "react-icons/fa";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/Layouts/SalesMLayout";
import { Trash2, Pencil } from "lucide-react";

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showStatusFields, setShowStatusFields] = useState(false);
  const eventsPerPage = 8;
  const navigate = useNavigate();

  const fetchFollowupsAndEvents = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setError("Authorization token is missing. Please login again.");
      return;
    }

    try {
      const response = await axios.get(
        "https://devlokcrmbackend.up.railway.app/followups/Upcomming_salesmanager_event/",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const { events = [], followups = [] } = response.data;

      const formattedFollowups = followups.map((f) => ({
        id: f.id,
        type: "followup",
        date_time: f.followup_date,
        notes: f.notes,
        customer_name: f.customer_name,
        status: f.followup_status?.status,
        status_note: f.followup_status?.note,
      }));

      const formattedEvents = events.map((e) => ({
        ...e,
        type: "event",
        status: e.event_status?.status,
        status_note: e.event_status?.note,
      }));

      const merged = [...formattedEvents, ...formattedFollowups];
      merged.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
      setEvents(merged);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load data.");
    }
  };

  useEffect(() => {
    fetchFollowupsAndEvents();
  }, []);

  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    const accessToken = localStorage.getItem("access_token");
    const url =
      item.type === "event"
        ? `https://devlokcrmbackend.up.railway.app/task/salesmanager_event_delete/${item.id}/`
        : `https://devlokcrmbackend.up.railway.app/followups/cancel_followup/${item.id}/`;

    try {
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert(`${item.type === "event" ? "Event" : "Follow-up"} deleted!`);
      fetchFollowupsAndEvents();
    } catch (err) {
      alert("Failed to delete.");
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setEditForm({
      event_name: item.event_name || "",
      notes: item.notes || "",
      date_time: item.date_time,
      status: item.status || "",
      note: item.status_note || "",
    });
    setShowStatusFields(false);
  };

  const handleEditSubmit = async () => {
    const accessToken = localStorage.getItem("access_token");
    const formattedDateTime = new Date(editForm.date_time).toISOString();

    const payload =
      editItem.type === "event"
        ? { ...editForm, date_time: formattedDateTime }
        : {
            notes: editForm.notes,
            followup_date: formattedDateTime,
          };

    const url =
      editItem.type === "event"
        ? `https://devlokcrmbackend.up.railway.app/task/salesmanager_event_update/${editItem.id}/`
        : `https://devlokcrmbackend.up.railway.app/followups/edit_followup/${editItem.id}/`;

    try {
      await axios.put(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      alert("Updated successfully!");
      setEditItem(null);
      fetchFollowupsAndEvents();
    } catch (err) {
      alert("Update failed.");
      console.error(err);
    }
  };

  const handleStatusUpdate = async () => {
    const accessToken = localStorage.getItem("access_token");
    const isPending = !editItem.status;
    const url =
      editItem.type === "event"
        ? `https://devlokcrmbackend.up.railway.app/task/sm_event_status_entry/${editItem.id}/`
        : `https://devlokcrmbackend.up.railway.app/followups/followup_status_entry/${editItem.id}/`;

    const method = isPending ? "post" : "put";

    try {
      await axios[method](
        url,
        {
          status: editForm.status,
          note: editForm.note,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Stage updated successfully!");
      fetchFollowupsAndEvents();
      setEditItem(null);
    } catch (err) {
      alert("Stage update failed.");
      console.error(err);
    }
  };

  const formatDateTime = (date) =>
    date ? format(new Date(date), "dd MMM yyyy, hh:mm a") : "N/A";

  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = events.slice(indexOfFirst, indexOfLast);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPriorityIcon = (priority) => {
    if (priority === "High") return "🔥 High";
    if (priority === "Medium") return "⚡ Medium";
    if (priority === "Low") return "🧊 Low";
    return "";
  };

  return (
    <StaffLayout>
      <div className={styles.container}>
        <button
          className={styles.addEventBtn}
          onClick={() => navigate("/salesmanger_calender")}
        >
          + Add Event
        </button>

        <h2 className={styles.heading}>Upcoming Events & Follow-ups</h2>

        {error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <div className={styles.eventGrid}>
              {currentEvents.length === 0 ? (
                <div className={styles.noEvents}>No upcoming items found.</div>
              ) : (
                currentEvents.map((item) => (
                  <div className={styles.card} key={`${item.type}-${item.id}`}>
                    <div
                      className={
                        styles.cardTypeTag +
                        " " +
                        (item.type === "event"
                          ? styles.eventTag
                          : styles.followupTag)
                      }
                    >
                      {item.type === "event" ? "📅 Event" : "📌 Follow-up"}
                      
                    </div>

                    <div className={styles.eventDetails}>
                      <div className={styles.iconAndName}>
                        <h3 className={styles.eventName}>
                          {item.type === "event" ? (
                            <>
                              {item.event_name}{" "}
                              
                            </>
                          ) : (
                            item.customer_name
                          )}
                        </h3>
                        
                        <div className={styles.actions}>
                          <Pencil
                            className={styles.pencilIcon}
                            onClick={() => handleEdit(item)}
                          />
                          <Trash2
                            className={styles.trashIcon}
                            onClick={() => handleDelete(item)}
                          />
                        </div>
                      </div>

                      <div className={styles.eventTime}>
                        <FaClock className={styles.clockIcon} />
                        <span>{formatDateTime(item.date_time)}</span>
                        <span className={styles.priorityIcon}>
                                {renderPriorityIcon(item.priority)}
                              </span>
                      </div>

                      <p className={styles.notes}>
                        📝 {item.notes || "No additional notes."}
                      </p>

                      {(item.status || item.status_note) && (
                        <div className={styles.followupStatusBox}>
                          {item.status && (
                            <p>
                              <strong>Status:</strong> {item.status}
                            </p>
                          )}
                          {item.status_note && (
                            <p>
                              <strong>Note:</strong> {item.status_note}
                            </p>
                          )}
                        </div>
                      )}
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
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`${styles.pageBtn} ${
                      currentPage === i + 1 ? styles.active : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>

      {editItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit {editItem.type === "event" ? "Event" : "Follow-up"}</h3>

            {editItem.type === "event" && (
              <>
                <label>Title</label>
                <input
                  type="text"
                  value={editForm.event_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, event_name: e.target.value })
                  }
                />
              </>
            )}

            <label>Notes</label>
            <textarea
              rows="3"
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
            ></textarea>

            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={editForm.date_time.slice(0, 16)}
              onChange={(e) =>
                setEditForm({ ...editForm, date_time: e.target.value })
              }
            />

            <button
              className={styles.linkButton}
              onClick={() => setShowStatusFields(!showStatusFields)}
            >
              {showStatusFields ? "Hide Stage Fields" : "Update Stage"}
            </button>

            {showStatusFields && (
              <>
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="Completed">Completed</option>
                  <option value="Postponed">Postponed</option>
                </select>

                <label>Note</label>
                <textarea
                  rows="2"
                  value={editForm.note}
                  onChange={(e) =>
                    setEditForm({ ...editForm, note: e.target.value })
                  }
                ></textarea>

                <button className={styles.SaveStageBtn} onClick={handleStatusUpdate}>Save Stage</button>
              </>
            )}

            <div className={styles.modalActions}>
              <button onClick={handleEditSubmit}>Save</button>
              <button onClick={() => setEditItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default UpcomingEvents;
