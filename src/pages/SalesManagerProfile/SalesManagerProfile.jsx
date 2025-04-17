import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./SalesManagerProfile.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout";
import ProfileImage from "../../assets/ProfileImage.png"
const SalesManagerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileRes, summaryRes] = await Promise.all([
          axios.get("https://devlokcrm-production.up.railway.app/auth/salesmanager_details/", { headers }),
          axios.get("https://devlokcrm-production.up.railway.app/task/salesmanager_personal_workhistory/", { headers }),
        ]);

        setProfile(profileRes.data);
        setSummary(summaryRes.data["Work Summary"]);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  if (!profile) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  return (
    <StaffLayout>
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.imageSection}>
        <img
            src={profile.photo ? `https://devlokcrm-production.up.railway.app${profile.photo}` : ProfileImage}
            alt={profile.username}
            className={styles.profileImg}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = ProfileImage;
            }}
          />

        </div>
        <div className={styles.detailsSection}>
          <h2 className={styles.name}>{profile.username}</h2>
          <p className={styles.email}>📧 {profile.email}</p>
          <p className={styles.phone}>📞 {profile.phonenumber}</p>
          <p className={styles.joined}>📅 Joined: {profile.joined_by}</p>
        </div>
      </div>

      {summary ? (
        <div className={styles.summarySection}>
          <h2 className={styles.subHeading}>Work Summary</h2>
          <div className={styles.summaryGrid}>
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className={styles.statCard}>
                <p className={styles.statLabel}>{key}</p>
                <p className={styles.statValue}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className={styles.loading}>Loading work summary...</p>
      )}
    </div>
    </StaffLayout>
  );
};

export default SalesManagerProfile;
