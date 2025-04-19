import React, { useState } from "react";
import axios from "axios";
import styles from "./AddEventModal.module.css";

const AddEventModal = ({ isOpen, onClose }) => {
  const [eventData, setEventData] = useState({
    eventName: "",
    date: "",
    time: "",
    description: "",
    priority: "Medium",
    selectedDays: [],
    repeatEveryDay: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData({
      ...eventData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDaySelection = (day) => {
    setEventData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  // ✅ Create Event API Call
  const createEventAPI = async (payload) => {
    try {
      const response = await axios.post(
        "https://devlokcrm-production.up.railway.app/task/salesmanager_eventcreate/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("Event Created:", response.data);
    } catch (error) {
      console.error(
        "Error creating event:",
        error.response?.data || error.message
      );
    }
  };

  // ✅ Handle Save Button
  const handleSave = async () => {
    const { eventName, date, time, description, priority, selectedDays, repeatEveryDay } =
      eventData;

    const formattedDateTime = `${date}T${time}`;
    const confirmSave = window.confirm(
      "Are you sure you want to add this event?"
    );
  
    if (!confirmSave) {
      return; // Stop if user cancels
    }
    // Define base payload
    const basePayload = {
      event_name: eventName,
      date_time: formattedDateTime,
      notes: description,
      priority,
    };

    let promises = [];
    if (repeatEveryDay) {
      // ✅ Create event for the next 7 days
      promises = Array.from({ length: 7 }).map((_, index) => {
        const nextDate = getNextDateForEveryDay(date, time, index);
        return createEventAPI({ ...basePayload, date_time: nextDate });
      });
    } else if (selectedDays.length > 0) {
      // ✅ Create event for selected days
      promises = selectedDays.map((day) =>
        createEventAPI({
          ...basePayload,
          date_time: getNextDate(day, date, time),
        })
      );
    } else {
      // ✅ Create event only for the selected date
      promises = [createEventAPI(basePayload)];
    }

    await Promise.all(promises);
    onClose();
  };

  // ✅ Get Next Date for Selected Day (Final Fix)
  const getNextDate = (day, baseDate, time) => {
    const daysMap = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const currentDate = new Date(`${baseDate}T${time}`);
    const currentDay = currentDate.getDay(); // Get current day as number
    const targetDay = daysMap[day]; // Get target day as number

    let daysToAdd = targetDay - currentDay;

    // ✅ If the selected day is the same or after, create on the same date or add required days
    if (daysToAdd < 0) {
      daysToAdd += 7; // Move to the next occurrence
    }

    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() + daysToAdd);

    return `${targetDate.toISOString().split("T")[0]}T${time}`; // Correct date for event creation
  };

  // ✅ Get Date for Every Day for 7 Days
  const getNextDateForEveryDay = (baseDate, time, daysToAdd) => {
    const currentDate = new Date(`${baseDate}T${time}`);
    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() + daysToAdd);
    return `${targetDate.toISOString().split("T")[0]}T${time}`;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ✖
        </button>
        <h3 className={styles.modalTitle}>Add Event</h3>

        <form className={styles.form}>
          <label>Event Name</label>
          <input
            type="text"
            name="eventName"
            value={eventData.eventName}
            onChange={handleChange}
            required
          />

          <div className={styles.row}>
            <div>
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Time</label>
              <input
                type="time"
                name="time"
                value={eventData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label>Description</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleChange}
            required
          />

          <label>Priority</label>
          <select
            name="priority"
            value={eventData.priority}
            onChange={handleChange}
            required
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          {/* Select Days */}
          <div className={styles.daysContainer}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className={`${styles.day} ${
                  eventData.selectedDays.includes(day)
                    ? styles.selected
                    : ""
                }`}
                onClick={() => handleDaySelection(day)}
              >
                {day}
              </div>
            ))}
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="repeatEveryDay"
              checked={eventData.repeatEveryDay}
              onChange={handleChange}
            />
            Repeat Every Day for 7 Days
          </label>

          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
