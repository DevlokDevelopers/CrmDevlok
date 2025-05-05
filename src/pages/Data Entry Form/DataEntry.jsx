import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from './DataEntry.module.css';
import StaffLayout from "../../components/Layouts/SalesMLayout";

const DataEntryForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const leadId = location.state?.leadId || null;

  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonenumber: "",
    district: "",
    place: "",
    address: "",
    purpose: "",
    mode_of_property: "",
    demand_price: "",
    area_in_sqft: "",
    location_proposal_district: "",
    location_proposal_place: "",
    building_roof: "",
    number_of_floors: "",
    building_bhk: "",
    additional_note: "",
    location_link: "",
    lead_category:"",
    image_folder:"",
  });

  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    if (!leadId) {
      console.error("Lead ID is missing.");
      return;
    }

    axios.get(`https://devlokcrm-production.up.railway.app/databank/get_lead_data/${leadId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then((response) => {
      setFormData((prev) => ({
        ...prev,
        ...response.data,
        mode_of_property: response.data.mode_of_purpose || ""
      }));
    })
    .catch((error) => console.error("Error fetching lead data:", error));
  }, [leadId, accessToken]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: [...e.target.files] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leadId) {
      console.error("Cannot submit. Lead ID is missing.");
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "images") {
          formData.images.forEach((image) => formDataToSend.append("photos", image));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post(`https://devlokcrm-production.up.railway.app/databank/datacollection/${leadId}/`, formDataToSend, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      alert("Data submitted successfully!");

      // Update lead stage after successful form submission
      await updateLeadStage();
      navigate(-1);
    } catch (error) {
      console.error("Error submitting data:", error);
      setErrorMessage(error.response?.data?.error || "Failed to submit data.");
    }
  };

  const updateLeadStage = async () => {
    try {
      await axios.put(`https://devlokcrm-production.up.railway.app/leads/update_stage/${leadId}/`, 
        { stage: "Data Saved" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error("Error updating lead stage:", error);
    }
  };

  return (
    <StaffLayout>
    <div className={styles['form-container']}>
        
      <h2 className={styles.header}>
        Step {step}: {step === 1 ? "Personal Details" : "Property Details"}
      </h2>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className={styles['input-field']} />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className={styles['input-field']} />
            <input name="phonenumber" value={formData.phonenumber} onChange={handleChange} placeholder="Phone" className={styles['input-field']} />
            <input name="district" value={formData.district} onChange={handleChange} placeholder="District" className={styles['input-field']} />
            <input name="place" value={formData.place} onChange={handleChange} placeholder="Place" className={styles['input-field']} />
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className={styles['input-field']} />
            <input name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Purpose" className={styles['input-field']} />
            <input name="mode_of_property" value={formData.mode_of_property} onChange={handleChange} placeholder="Property Type" className={styles['input-field']} />
            <button type="button" onClick={() => setStep(2)} className={`${styles['button']} ${styles['button-next']}`}>Next</button>
          </>
        ) : (
          <>
            <select
              name="lead_category"
              value={formData.lead_category}
              onChange={handleChange}
              className={styles['select-field']}
              required
            >
              <option value="">Choose Lead Category</option>
              <option value="Marketing data">Marketing data</option>
              <option value="Social Media">Social Media</option>
              <option value="Main data">Main data</option>
              <option value="General Lead">General Lead</option>
            </select>

            <input name="demand_price" value={formData.demand_price} onChange={handleChange} placeholder="Demand Price*" className={styles['input-field']} required />
            <input name="area_in_sqft" value={formData.area_in_sqft} onChange={handleChange} placeholder="Area in Sqft*" className={styles['input-field']} required/>
            <input name="location_proposal_district" value={formData.location_proposal_district} onChange={handleChange} placeholder="Proposal District" className={styles['input-field']} />
            <input name="location_proposal_place" value={formData.location_proposal_place} onChange={handleChange} placeholder="Proposal Place" className={styles['input-field']} />
            <input name="building_roof" value={formData.building_roof} onChange={handleChange} placeholder="Building Roof" className={styles['input-field']} />
            <input name="number_of_floors" value={formData.number_of_floors} onChange={handleChange} placeholder="Number of Floors" className={styles['input-field']} />
            <input name="building_bhk" value={formData.building_bhk} onChange={handleChange} placeholder="BHK" className={styles['input-field']} />
            <textarea name="additional_note" value={formData.additional_note} onChange={handleChange} placeholder="Additional Notes" className={styles['textarea-field']} />
            <input name="location_link" value={formData.location_link} onChange={handleChange} placeholder="Google Maps Link" className={styles['input-field']} />
            <input name="image_folder" value={formData.image_folder} onChange={handleChange} placeholder="image_folder" className={styles['input-field']} />
            <button type="button" onClick={() => setStep(1)} className={`${styles['button']} ${styles['button-back']}`}>Back</button>
            <button type="submit" className={`${styles['button']} ${styles['button-submit']}`}>Submit</button>
          </>
        )}
      </form>
    </div>
    </StaffLayout>
  );
};

export default DataEntryForm;
