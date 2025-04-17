import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import styles from "../SalesMCalender/SalesMCalender.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout";
import FollowUpModal from "../../components/Modals/CreateFollowup"; // Import FollowUpModal

dayjs.extend(utc);
dayjs.extend(timezone);

const FollowUpCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const leadId = location.state?.leadId || null;

  useEffect(() => {
    fetchEvents();
  }, [location]);

  // Fetch both events and follow-ups
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "https://devlokcrm-production.up.railway.app/followups/salesmanager_all_events/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const eventList = response.data.events || [];
      const followUpList = response.data.followups || [];

      // Format events
      const formattedEvents = eventList.map((event) => ({
        id: event.id,
        type: "event",
        name: event.event_name,
        date: dayjs(event.date_time).tz("UTC").format("YYYY-MM-DD"),
        time: dayjs(event.date_time).format("hh:mm A"),
        priority: event.priority,
        notes: event.notes,
      }));

      // Format follow-ups
      const formattedFollowUps = followUpList.map((followup) => ({
        id: followup.id,
        type: "followup",
        name: followup.customer_name,
        date: dayjs(followup.followup_date).tz("UTC").format("YYYY-MM-DD"),
        time: dayjs(followup.followup_date).format("hh:mm A"),
        priority: "Medium",
        notes: followup.notes,
      }));

      // Merge events and follow-ups
      const allItems = [...formattedEvents, ...formattedFollowUps];

      const eventMap = {};
      allItems.forEach((item) => {
        if (!eventMap[item.date]) {
          eventMap[item.date] = [];
        }
        eventMap[item.date].push(item);
      });

      setEvents(allItems);
      setMarkedDates(eventMap);
    } catch (error) {
      console.error("Error fetching events and follow-ups:", error);
      setError("Failed to fetch events and follow-ups. Please try again.");
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setModalOpen(true);
  };

  const handleCreateFollowUp = () => {
    setFollowUpModalOpen(true);
  };

  const formattedSelectedDate = dayjs(date).format("YYYY-MM-DD");
  const selectedDateEvents = markedDates[formattedSelectedDate] || [];

  return (
    <StaffLayout>
      <div className={styles.calendarContainer}>
        <button className={styles.addEventButton} onClick={handleCreateFollowUp}>
          ➕ Create FollowUp
        </button>
        <h2 className={styles.calendarTitle}>📅 Sales Manager Calendar</h2>

        {loading ? (
          <div className={styles.loading}>Loading events...</div>
        ) : (
          <>
            <div className={styles.calendarWrapper}>
              <Calendar
                onChange={handleDateChange}
                value={date}
                className={styles.customCalendar}
                tileContent={({ date }) => {
                  const formattedDate = dayjs(date).format("YYYY-MM-DD");
                  const dateItems = markedDates[formattedDate] || [];

                  return (
                    <div className={styles.eventList}>
                      {dateItems.slice(0, 2).map((item, index) => (
                        <div
                          key={index}
                          className={`${styles.eventItem} ${
                            item.type === "event"
                              ? item.priority === "High"
                                ? styles.dotHigh
                                : item.priority === "Medium"
                                ? styles.dotMedium
                                : styles.dotLow
                              : styles.dotFollowUp
                          }`}
                        >
                          {item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name}
                        </div>
                      ))}
                      {dateItems.length > 2 && (
                        <div className={styles.moreEvents}>+{dateItems.length - 2} more</div>
                      )}
                    </div>
                  );
                }}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {modalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                  <button className={styles.closeButton} onClick={() => setModalOpen(false)}>
                    ✖
                  </button>
                  <h3 className={styles.modalTitle}>
                    🗓 Items on {dayjs(date).format("MMMM D, YYYY")}
                  </h3>
                  {selectedDateEvents.length === 0 ? (
                    <p className={styles.noEvents}>No events or follow-ups scheduled.</p>
                  ) : (
                    <div className={styles.eventsGrid}>
                      {selectedDateEvents.map((item) => (
                        <div
                          key={item.id}
                          className={`${styles.eventCard} ${
                            item.type === "event"
                              ? item.priority === "High"
                                ? styles.highPriority
                                : item.priority === "Medium"
                                ? styles.mediumPriority
                                : styles.lowPriority
                              : styles.followUpCard
                          }`}
                        >
                          <div className={styles.eventHeader}>
                            <span className={styles.eventTime}>⏰ {item.time}</span>
                            <span className={styles.eventPriority}>
                              {item.type === "event" ? `${item.priority} Priority` : "Follow-up"}
                            </span>
                          </div>
                          <p className={styles.eventNotes}>{item.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {followUpModalOpen && (
              <FollowUpModal
                leadId={leadId}
                onClose={() => {
                  setFollowUpModalOpen(false);
                  fetchEvents();
                }}
                onFollowUpCreated={fetchEvents}
              />
            )}
          </>
        )}
      </div>
    </StaffLayout>
  );
};

export default FollowUpCalendar;
