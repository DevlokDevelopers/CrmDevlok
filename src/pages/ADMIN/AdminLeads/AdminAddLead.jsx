import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./AddLead.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout"; // Changed to Admin layout
import { Link } from "react-router-dom";

const AdminAddLead = () => {
  const navigate = useNavigate();

  const [leadData, setLeadData] = useState({
    email: "",
    name: "",
    phonenumber: "",
    district: "",
    place: "",
    address: "",
    purpose: "",
    mode_of_purpose: "",
    message: "",
    stage: "Not Opened",
    status: "Followed",
    follower: "",
    staff_id: 0,
  });

  const [salesManagers, setSalesManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  const keralaDistricts = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
    "Wayanad", "Kannur", "Kasargod"
  ];

  useEffect(() => {
    const fetchSalesManagers = async () => {
      try {
        const res = await axios.get("https://devlokcrmbackend.up.railway.app/auth/list_of_salesmangers/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setSalesManagers(res.data);
      } catch (err) {
        console.error("Error fetching Sales Managers:", err);
      }
    };
    fetchSalesManagers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeadData({ ...leadData, [name]: value });
  };

  const handleFollowerChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedManager = salesManagers.find((mgr) => mgr.id === selectedId);
    if (selectedManager) {
      setLeadData({
        ...leadData,
        follower: selectedManager.username,
        staff_id: selectedManager.id,
      });
    }
  };

  const isFormValid = () => {
    return Object.entries(leadData).every(([key, value]) => {
      return String(value).trim() !== "" || key === "closed_date"; // closed_date is nullable
    });
  };

  const handleSave = async () => {
    if (!window.confirm("Are you sure you want to add this lead?")) return;
    setLoading(true); 

    const payload = {
      ...leadData,
      mode_of_purpose:
        leadData.mode_of_purpose === "Others" ? leadData.otherPropertyType : leadData.mode_of_purpose,
    };

    try {
      await axios.post("https://devlokcrmbackend.up.railway.app/leads/admin_manually_enter_lead/", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      alert("Lead successfully added");
      navigate("/admin_followed_leads");
    } catch (error) {
      console.error("Error creating lead:", error.response?.data || error.message);
    }
    finally {
      setLoading(false); // Stop loading whether success or error
    }
  };

  return (
    <AdminLayout>
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
              <input type="email" name="email" value={leadData.email} onChange={handleChange} />
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
                <option value="Looking to Rent or Lease Property">Looking to Rent or Lease Property</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Mode of Purpose</label>
              <select name="mode_of_purpose" value={leadData.mode_of_purpose} onChange={handleChange} required>
                <option value="">Select Mode of Purpose</option>
                <option value="House">House</option>
                <option value="Land">Land</option>
                <option value="Flat">Flats</option>
                <option value="Offices">Offices</option>
                <option value="Godowns,Companies,Industries">Godowns,Companies,Industries</option>
                <option value="Commercial Plots">Commercial Plots</option>
                <option value="Others">Others</option>
              </select>
            </div>
            {leadData.mode_of_purpose === "Others" && (
              <div className={styles.inputGroup}>
                <label>Specify Property Type</label>
                <input
                  type="text"
                  name="otherPropertyType"
                  value={leadData.otherPropertyType || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className={styles.inputGroup}>
              <label>Assign Follower</label>
              <select onChange={handleFollowerChange} required>
                <option value="">Select Sales Manager</option>
                {salesManagers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.username}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroupFull}>
              <label>Message</label>
              <textarea name="message" value={leadData.message} onChange={handleChange} required />
            </div>
          </div>

          <button type="button" className={styles.saveButton} onClick={handleSave} disabled={!isFormValid()}>
          {loading ? "Saving..." : "Save Lead"}
          </button>
        </form>
      </div>
      <div className={styles.backLinkContainer}>
        <Link to="/admin_lead_analytics" className={styles.backLink}>← Back to Leads</Link>
      </div>
    </AdminLayout>
  );
};

export default AdminAddLead;
