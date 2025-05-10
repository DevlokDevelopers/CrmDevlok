import React, { useState } from "react";
import styles from "./FilterModal.module.css";

const districts = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam",
  "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
  "Thiruvananthapuram", "Thrissur", "Wayanad"
];

const FilterModal = ({ isOpen, onClose, onApply }) => {
  const [filters, setFilters] = useState({
    timestamp: "",
    district: "",
    location: "",
    purpose: "",
    propertyType: "",
    priceMin: "",
    priceMax: "",
    squareFeetMin: "",
    squareFeetMax: "",
    bedrooms: "",
    floors: "",
    locationProposalDistrict: "",
    locationProposalPlace: "",
    follower: "",
    buildingRoof: "",
    numberOfFloorsMin: "",
    numberOfFloorsMax: "",
    buildingBhk: "",
    distanceKm: "",
    lead_category:"",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      timestamp: "",
      district: "",
      location: "",
      purpose: "",
      propertyType: "",
      priceMin: "",
      priceMax: "",
      squareFeetMin: "",
      squareFeetMax: "",
      bedrooms: "",
      floors: "",
      locationProposalDistrict: "",
      locationProposalPlace: "",
      follower: "",
      buildingRoof: "",
      numberOfFloorsMin: "",
      numberOfFloorsMax: "",
      buildingBhk: "",
      distanceKm: "",
      lead_category:"",
    });
  };

  const handleApplyFilters = () => {
    const queryParams = new URLSearchParams();
    const filterMappings = {
      district: "district",
      location: "place",
      purpose: "purpose",
      propertyType: "mode_of_property",
      priceMin: "demand_price_min",
      priceMax: "demand_price_max",
      squareFeetMin: "area_in_sqft_min",
      squareFeetMax: "area_in_sqft_max",
      bedrooms: "building_bhk_min",
      floors: "number_of_floors_min",
      timestamp: "timestamp",
      locationProposalDistrict: "location_proposal_district",
      locationProposalPlace: "location_proposal_place",
      follower: "follower",
      buildingRoof: "building_roof",
      numberOfFloorsMin: "number_of_floors_min",
      numberOfFloorsMax: "number_of_floors_max",
      buildingBhk: "building_bhk",
      distanceKm: "distance_km",
      lead_category:"lead_category",
    
    };

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(filterMappings[key], filters[key]);
      }
    });

    onApply(queryParams.toString());
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Filters</h2>
          <button className={styles.closeBtn} onClick={onClose}>✖</button>
        </div>

        <div className={styles.filtersContainer}>
          {/* Existing Filters */}
          <div className={styles.filterGroup}>
            <label>District</label>
            <select name="district" value={filters.district} onChange={handleChange}>
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Place</label>
            <input type="text" name="location" value={filters.location} onChange={handleChange} />
          </div>
          <div className={styles.filterGroup}>
            <label>Distance Within</label>
            <select name="distanceKm" value={filters.distanceKm} onChange={handleChange}>
              <option value="">Select Distance</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="15">Within 15 km</option>
              <option value="20">Within 20 km</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Lead Category</label>
            <select name="lead_category" value={filters.lead_category} onChange={handleChange}>
              <option value="">Choose Lead Category</option>
              <option value="Marketing data">Marketing data</option>
              <option value="Social Media">Social Media</option>
              <option value="Main data">Main data</option>
              <option value="General Lead">General Lead</option>
            </select>
          </div>



          <div className={styles.filterGroup}>
            <label>Purpose</label>
            <select name="purpose" value={filters.purpose} onChange={handleChange}>
              <option value="">Select Purpose</option>
              <option value="For Buying a Property">For Buying a Property</option>
              <option value="For Selling a Property">For Selling a Property</option>
              <option value="For Rental or Lease">For Rental or Lease</option>
              <option value="Looking to Rent or Lease Property">Looking to Rent or Lease Property</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Type of Property</label>
            <select name="propertyType" value={filters.propertyType} onChange={handleChange}>
              <option value="">Select Type</option>
              <option value="House">House</option>
              <option value="Land">Land</option>
              <option value="Flat">Flat</option>
              <option value="Office">Office</option>
              <option value="Godowns,Companies,Industries">Godowns,Companies,Industries</option>
              <option value="Commercial plots">Commercial plots</option>
            </select>
          </div>

          {/* New Filters */}
          <div className={styles.filterGroup}>
            <label>Location Proposal District</label>
            <input type="text" name="locationProposalDistrict" value={filters.locationProposalDistrict} onChange={handleChange} />
          </div>

          <div className={styles.filterGroup}>
            <label>Location Proposal Place</label>
            <input type="text" name="locationProposalPlace" value={filters.locationProposalPlace} onChange={handleChange} />
          </div>

          <div className={styles.filterGroup}>
            <label>Follower</label>
            <input type="text" name="follower" value={filters.follower} onChange={handleChange} />
          </div>

          <div className={styles.filterGroup}>
            <label>Building Roof</label>
            <input type="text" name="buildingRoof" value={filters.buildingRoof} onChange={handleChange} />
          </div>

          <div className={styles.filterGroup}>
            <label>Number of Floors (Min)</label>
            <input type="number" name="numberOfFloorsMin" value={filters.numberOfFloorsMin} onChange={handleChange} />
          </div>

          <div className={styles.filterGroup}>
            <label>Number of Floors (Max)</label>
            <input type="number" name="numberOfFloorsMax" value={filters.numberOfFloorsMax} onChange={handleChange} />
          </div>

          <div className={styles.filterGroup}>
            <label>Number of Bedrooms</label>
            <input type="number" name="buildingBhk" value={filters.buildingBhkMin} onChange={handleChange} />
          </div>

          
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.resetBtn} onClick={resetFilters}>Reset All</button>
          <button className={styles.applyBtn} onClick={handleApplyFilters}>Apply Filters</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
