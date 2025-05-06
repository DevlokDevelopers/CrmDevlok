import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./AddLead.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout";
import { Link } from "react-router-dom";

const AddLead = () => {
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState({
    email: "",
    name: "",
    phonenumber: "", // Changed from whatsappNumber to phonenumber
    district: "",
    place: "",
    address: "",
    purpose: "",
    mode_of_purpose: "", // Changed from propertyType to mode_of_purpose
    message: "", // Changed from note to message
    stage: "Not Opened", // Default stage
    status: "Pending", // Default status
  });

  const keralaDistricts = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
    "Wayanad", "Kannur", "Kasargod"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeadData({ ...leadData, [name]: value });
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return Object.entries(leadData).every(([key, value]) => {
      // Ensure the value is a string before calling trim
      return String(value).trim() !== "";
    });
  };

  const handleSave = async () => {
    if (!window.confirm("Are you sure you want to add this lead?")) return;

    const payload = {
      ...leadData,
      mode_of_purpose: leadData.mode_of_purpose === "Others" ? leadData.otherPropertyType : leadData.mode_of_purpose, // Fix for "mode_of_purpose"
    };

    try {
      await axios.post("https://devlokcrmbackend.up.railway.app/leads/enter_leads/", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      alert("Lead successfully added");
      navigate("/salesmanager_followed_leads");
    } catch (error) {
      console.error("Error creating lead:", error.response?.data || error.message);
    }
  };

  return (
    <StaffLayout>
      <div className={styles.container}>
        <h2 className={styles.title}>Add Lead</h2>
        <form className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Name</label>
              <input type="text" name="name" value={leadData.name} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>WhatsApp Number</label>
              <input type="text" name="phonenumber" value={leadData.phonenumber} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" name="email" value={leadData.email} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>District</label>
              <select name="district" value={leadData.district} onChange={handleChange} required>
                <option value="">Select District</option>
                {keralaDistricts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Place</label>
              <input type="text" name="place" value={leadData.place} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Address</label>
              <textarea name="address" value={leadData.address} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Purpose</label>
              <select name="purpose" value={leadData.purpose} onChange={handleChange} required>
                <option value="">Select Purpose</option>
                <option value="For Buying a Property">For Buying a Property</option>
                <option value="For Selling a Property">For Selling a Property</option>
                <option value="For Rental or Lease">For Rental or Lease</option>
                <option value="Looking to rent or Lease a Property">Looking to rent or Lease a property</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Mode of Purpose</label>
              <select name="mode_of_purpose" value={leadData.mode_of_purpose} onChange={handleChange} required>
                <option value="">Select Mode of Purpose</option>
                <option value="Houes">House</option>
                <option value="Land">Land</option>
                <option value="Flat">Flates</option>
                <option value="Offices">Offices</option>
                <option value="Godowns,Companies,Industries">Godowns,Companies,Industries etc</option>
                <option value="Commercial Plots">Commercial Plots</option>
                <option value="Others">Others</option>
              </select>
            </div>
            {leadData.mode_of_purpose === "Others" && (
              <div className={styles.inputGroup}>
                <label>Specify Property Type</label>
                <input type="text" name="otherPropertyType" value={leadData.otherPropertyType} onChange={handleChange} required />
              </div>
            )}
            <div className={styles.inputGroupFull}>
              <label>Message</label>
              <textarea name="message" value={leadData.message} onChange={handleChange} required />
            </div>
          </div>

          {/* Save button disabled if form is incomplete */}
          <button type="button" className={styles.saveButton} onClick={handleSave} disabled={!isFormValid()}>
            Save Lead
          </button>
        </form>
      </div>
      <div className={styles.backLinkContainer}>
        <Link to="/salesmanager_lead_analytics" className={styles.backLink}>← Back to Leads</Link>
      </div>
    </StaffLayout>
  );
};

export default AddLead;
