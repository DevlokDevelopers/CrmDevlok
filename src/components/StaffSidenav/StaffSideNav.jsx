import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./StaffSideNav.module.css";
import logo from "../../assets/LOGODEV.jpg";
import projectIcon from "../../assets/inactive.svg";
import DashboardIcon from "../../assets/active.svg";
import leadIcon from "../../assets/Vector.svg";
import dataIcon from "../../assets/data.svg";
import upcomingIcon from "../../assets/upcomingIcon.svg";
import calenderIcon from "../../assets/calender.svg";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const StaffSideNav = () => {
  const location = useLocation(); // Use location to track the current route
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [successPercentage, setSuccessPercentage] = useState(0);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(""); // ✅ State for Current Month

  // Fetch Monthly Performance Data using axios
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://devlokcrmbackend.up.railway.app/leads/salesmanager_monthly_performance/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setSuccessPercentage(response.data.success_percentage || 0);
      } catch (error) {
        console.error("Error fetching performance data:", error);
        if (error.response?.status === 403) {
          navigate("/login");
        } else {
          setError("Error fetching performance data");
        }
      }
    };

    // Get current month dynamically
    const monthName = new Date().toLocaleString("en-US", { month: "long" });
    setCurrentMonth(monthName);

    // Handle Window Resize for Mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    fetchPerformanceData();

    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  // Toggle Sidebar for Mobile
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close Menu if Clicking Outside
  const handleOverlayClick = () => {
    if (isOpen && isMobile) {
      setIsOpen(false);
    }
  };

  // Handle Logout with confirmation dialog
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        navigate("/login");
      }
    }
  };

  return (
    <>
      {isOpen && isMobile && (
        <div className={styles.overlay} onClick={handleOverlayClick}></div>
      )}

      {isMobile && (
        <button className={styles.menuToggleBtn} onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      <div
        className={`${styles.sidenav} ${
          isOpen || !isMobile ? styles.open : styles.closed
        }`}
      >
        <div className={styles.logoContainer}>
          <img src={logo} alt="DEVLOK Logo" className={styles.logo} />
        </div>

        <nav className={styles.navLinks}>
          <NavItem
            icon={<img src={DashboardIcon} alt="Dashboard" />}
            label="Dashboard"
            active={location.pathname === "/salesmanagerDashboard"} // Dynamically set active based on path
            to="/salesmanagerDashboard"
          />
          
          <NavItem
            icon={<img src={leadIcon} alt="Leads" />}
            label="Leads"
            active={location.pathname === "/salesmanager_lead_analytics"}
            to="/salesmanager_lead_analytics"
            activePaths={[
              "/salesmanager_lead_analytics",
              "/salesmanager_newleads",
              "/salesmanager_followed_leads",
              "/Salesmanager_closed_leads",
              "/salesmanager_unrecordedLeads",
              "/Salesmanager_unsuccess_leads",
              "/salesmanger_pending_leads",
              "/addlead_salesman",
              "/Salesmanager_Datasaved"
            ]}
          />
          <NavItem
            icon={<img src={dataIcon} alt="Datas" />}
            label="Datas"
            active={location.pathname === "/data_graph_salesmanager"}
            to="/data_graph_salesmanager"
            activePaths={[
              "/salesmanager_sell_list",
              "/salesmanger_forrent",
              "/salesmanager_rentseeker",
              "/sales_buy_list",
              "/data_list",
              "/data_edit_form",
              "/matching_data",
              "/salesmsearch_result",
              "/filter_result",
            
            ]}
          />
          <NavItem
            icon={<img src={projectIcon} alt="Projects" />}
            label="Projects"
            active={location.pathname === "/salesmanager_projects"}
            to="/salesmanager_projects"
            activePaths={["/salesmanager_projects", "/salesmanager_project_details"]}
          />
          <NavItem
            icon={<img src={upcomingIcon} alt="Upcoming" />}
            label="Upcoming Events"
            active={location.pathname === "/upcoming_events"}
            to="/upcoming_events"
          />
          <NavItem
            icon={<img src={calenderIcon} alt="Calendar" />}
            label="Calendar"
            active={location.pathname === "/salesmanger_calender"}
            to="/salesmanger_calender"
            activePaths={["/salesmanager_followup_calender"]}
          />
        </nav>

        {/* ✅ Updated Progress Bar Section */}
        <div className={styles.progressWrapper}>
          <CircularProgressbar
            value={successPercentage}
            text={`${successPercentage.toFixed(1)}%`}
            styles={buildStyles({
              textSize: "20px",
              pathColor: "url(#gradientBluePurple)",
              textColor: "#1E3A8A",
              trailColor: "#E0E7FF",
              strokeLinecap: "round",
            })}
          />
          <svg style={{ height: 0 }}>
            <defs>
              <linearGradient id="gradientBluePurple" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#4C1D95" />
              </linearGradient>
            </defs>
          </svg>

          <div className={styles.progressLabel}>
            <span className={styles.progressText}>{currentMonth}</span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.sidenavFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

const NavItem = ({ icon, label, to, activePaths = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive =
    location.pathname === to ||
    activePaths.some((path) => location.pathname.startsWith(path));

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <div className={`${styles.navItem} ${isActive ? styles.active : ""}`} onClick={handleClick}>
      <span className={styles.navIcon}>{icon}</span>
      <span className={styles.navLabel}>{label}</span>
    </div>
  );
};

export default StaffSideNav;
