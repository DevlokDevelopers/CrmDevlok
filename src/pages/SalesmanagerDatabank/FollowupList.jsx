import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import styles from "./FollowupList.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout";

const FollowUpList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const leadId = location.state?.leadId;
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFollowup, setEditingFollowup] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    followup_date: "",
    notes: "",
    status: "",
    note: ""
  });

  useEffect(() => {
    if (!leadId) {
      navigate("/salesmanager_followup_calender");
      return;
    }
    fetchFollowUps();
  }, [leadId]);

  const fetchFollowUps = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        `https://devlokcrmbackend.up.railway.app/followups/lead_wise_followup/${leadId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      setFollowups(response.data);
    } catch (err) {
      setError("Failed to fetch follow-ups.");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (followup) => {
    setEditingFollowup(followup.id);
    setUpdatedData({
      followup_date: dayjs(followup.followup_date).format("YYYY-MM-DDTHH:mm"),
      notes: followup.notes || "",
      status: followup.followup_status?.status || "",
      note: followup.followup_status?.note || ""
    });
  };

  const handleUpdateFollowup = async (id) => {
    if (!window.confirm("Update follow-up and stage?")) return;
    setSavingId(id);

    try {
      const accessToken = localStorage.getItem("access_token");

      // Always update followup date and notes
      await axios.put(
        `https://devlokcrmbackend.up.railway.app/followups/edit_followup/${id}/`,
        {
          followup_date: updatedData.followup_date,
          notes: updatedData.notes
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      // Only update follow-up status if status is entered
      if (updatedData.status.trim()) {
        const method = updatedData.status ? "put" : "post";
        const statusURL = `https://devlokcrmbackend.up.railway.app/followups/followup_status_entry/${id}/`;
        await axios[method](
          statusURL,
          {
            status: updatedData.status,
            note: updatedData.note
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }

      alert("Follow-up updated successfully!");
      setEditingFollowup(null);
      setUpdatedData({ followup_date: "", notes: "", status: "", note: "" });
      fetchFollowUps();
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
    finally {
    setSavingId(null); // Stop loading
  }
  };

  const handleDeleteFollowup = async (id) => {
    if (!window.confirm("Are you sure you want to delete this follow-up?")) return;
    setDeletingId(id);
    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.delete(`https://devlokcrmbackend.up.railway.app/followups/cancel_followup/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      alert("Follow-up deleted!");
      fetchFollowUps();
    } catch (err) {
      alert("Failed to delete.");
    }
    finally {
    setDeletingId(null); // Stop loading
  }
  };

  return (
    <StaffLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Follow-Ups for Lead</h2>
          <button
            className={styles.createButton}
            onClick={() => navigate("/salesmanager_followup_calender", { state: { leadId } })}
          >
            Create Follow-Up
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading follow-ups...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : followups.length === 0 ? (
          <div className={styles.noFollowups}>No follow-ups found.</div>
        ) : (
          <div className={styles.responsiveTableWrapper}>
            <table className={styles.followupTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date & Time</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Status Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {followups.map((followup, index) => (
                  <tr key={followup.id}>
                    <td>{index + 1}</td>
                    <td>
                      {editingFollowup === followup.id ? (
                        <input
                          type="datetime-local"
                          value={updatedData.followup_date}
                          onChange={(e) => setUpdatedData({ ...updatedData, followup_date: e.target.value })}
                        />
                      ) : (
                        dayjs(followup.followup_date).format("DD-MM-YYYY hh:mm A")
                      )}
                    </td>
                    <td>
                      {editingFollowup === followup.id ? (
                        <input
                          type="text"
                          value={updatedData.notes}
                          onChange={(e) => setUpdatedData({ ...updatedData, notes: e.target.value })}
                        />
                      ) : (
                        followup.notes
                      )}
                    </td>
                    <td>
                      {editingFollowup === followup.id ? (
                        <select
                        value={updatedData.status}
                        onChange={(e) => setUpdatedData({ ...updatedData, status: e.target.value })}
                      >
                        <option value="">Select status</option>
                        <option value="Pending">Pending</option>
                        <option value="Complete">Complete</option>
                        <option value="Postponed">Postponed</option>
                      </select>
                      ) : (
                        followup.followup_status?.status || "—"
                      )}
                    </td>
                    <td>
                      {editingFollowup === followup.id ? (
                        <input
                          type="text"
                          value={updatedData.note}
                          onChange={(e) => setUpdatedData({ ...updatedData, note: e.target.value })}
                        />
                      ) : (
                        followup.followup_status?.note || "—"
                      )}
                    </td>
                    <td className={styles.followupActions}>
                      {editingFollowup === followup.id ? (
                      <>
                        <button
                          className={styles.followupSaveBtn}
                          onClick={() => handleUpdateFollowup(followup.id)}
                          disabled={savingId === followup.id}
                        >
                          {savingId === followup.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          className={styles.followupDeleteBtn}
                          onClick={() => {
                            setEditingFollowup(null);
                            setUpdatedData({
                              followup_date: "",
                              notes: "",
                              status: "",
                              note: ""
                            });
                          }}
                          disabled={savingId === followup.id}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className={styles.followupEditBtn} onClick={() => handleEditClick(followup)}>Edit</button>
                        <button
                          className={styles.followupDeleteBtn}
                          onClick={() => handleDeleteFollowup(followup.id)}
                          disabled={deletingId === followup.id}
                        >
                          {deletingId === followup.id ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default FollowUpList;
