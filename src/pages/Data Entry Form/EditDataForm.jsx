import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from './DataEntry.module.css';
import StaffLayout from "../../components/Layouts/SalesMLayout";

const DataEditForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const databankId = location.state?.databankId || null;
  const accessToken = localStorage.getItem("access_token");

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
    lead_category: "" // Add lead_category to state
  });

  const predefinedCategories = [
    "General Lead",
    "Marketing data",
    "Social Media",
    "Main data"
  ];

  useEffect(() => {
    if (!databankId) {
      console.error("❌ Databank ID is missing.");
      return;
    }

    console.log(`📥 Fetching databank data for ID: ${databankId}`);

    axios.get(`https://devlokcrm-production.up.railway.app/databank/single_databank/${databankId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => {
      console.log("✅ Databank data received:", response.data);

      // Ensure response is an array and extract the first object
      if (Array.isArray(response.data) && response.data.length > 0) {
        const rawData = response.data[0];
        const cleanedData = Object.fromEntries(
          Object.entries(rawData).map(([key, value]) => [key, value === null ? "" : value])
        );
        
        // Set the form data, including lead_category
        setFormData((prev) => ({
          ...prev,
          ...cleanedData,
          lead_category: rawData.lead_category || ""  // Set lead_category from response
        }));
      } else {
        console.error("❌ Unexpected API response format", response.data);
      }
    })
    .catch((error) => {
      console.error("❌ Error fetching databank data:", error.response?.data || error.message);
      setErrorMessage("Failed to fetch databank data.");
    });
  }, [databankId, accessToken]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!databankId) {
      console.error("❌ Cannot submit. Databank ID is missing.");
      return;
    }

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null) {
          if (key === "images" && formData.images.length > 0) {
            formData.images.forEach((image) => formDataToSend.append("photos", image));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      console.log("📤 Submitting data:", Object.fromEntries(formDataToSend.entries()));

      await axios.patch(
        `https://devlokcrm-production.up.railway.app/databank/editdata_Databank/${databankId}/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Data edited successfully!");
      alert("Data Edited successfully!");
      navigate(-1);
    } catch (error) {
      console.error("❌ Error submitting data:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.error || "Failed to submit data.");
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
              <input name="demand_price" value={formData.demand_price} onChange={handleChange} placeholder="Demand Price" className={styles['input-field']} />
              <input name="area_in_sqft" value={formData.area_in_sqft} onChange={handleChange} placeholder="Area in Sqft" className={styles['input-field']} />
              <input name="location_proposal_district" value={formData.location_proposal_district} onChange={handleChange} placeholder="Proposal District" className={styles['input-field']} />
              <input name="location_proposal_place" value={formData.location_proposal_place} onChange={handleChange} placeholder="Proposal Place" className={styles['input-field']} />
              <input name="building_roof" value={formData.building_roof} onChange={handleChange} placeholder="Building Roof" className={styles['input-field']} />
              <input name="number_of_floors" value={formData.number_of_floors} onChange={handleChange} placeholder="Number of Floors" className={styles['input-field']} />
              <input name="building_bhk" value={formData.building_bhk} onChange={handleChange} placeholder="BHK" className={styles['input-field']} />
              <textarea name="additional_note" value={formData.additional_note} onChange={handleChange} placeholder="Additional Notes" className={styles['textarea-field']} />
              <input name="location_link" value={formData.location_link} onChange={handleChange} placeholder="Google Maps Link" className={styles['input-field']} />

              {/* Lead Category Dropdown */}
              <select
                name="lead_category"
                value={formData.lead_category}
                onChange={handleChange}
                className={styles['select-field']}
                required
              >
                <option value="">Choose Lead Category</option>
                {predefinedCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button type="button" onClick={() => setStep(1)} className={`${styles['button']} ${styles['button-back']}`}>Back</button>
              <button type="submit" className={`${styles['button']} ${styles['button-submit']}`}>Submit</button>
            </>
          )}
        </form>
      </div>
    </StaffLayout>
  );
};

export default DataEditForm;
