import React, { useState, useEffect } from "react";
import {
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./SideNav.module.css";
import logo from "../../assets/LOGODEV.jpg";
import projectIcon from "../../assets/inactive.svg";
import DashboardIcon from "../../assets/active.svg";
import leadIcon from "../../assets/Vector.svg";
import dataIcon from "../../assets/data.svg";
import employeeIcon from "../../assets/employees.svg";
import upcomingIcon from "../../assets/upcomingIcon.svg";
import calenderIcon from "../../assets/calender.svg";

const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleOverlayClick = () => {
    if (isOpen && isMobile) setIsOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    }
  };

  return (
    <>
      {isOpen && isMobile && <div className={styles.overlay} onClick={handleOverlayClick}></div>}

      {isMobile && (
        <button className={styles.menuToggleBtn} onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      <div className={`${styles.sidenav} ${isOpen || !isMobile ? styles.open : styles.closed}`}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="DEVLOK Logo" className={styles.logo} />
        </div>

        <nav className={styles.navLinks}>
          <NavItem icon={<img src={DashboardIcon} alt="Dashboard" />} label="Dashboard" to="/adminDash" />
          <NavItem icon={<img src={employeeIcon} alt="Employees" />} label="Employees" to="/employee_listing"
          activePaths={[
            "/salesmanager_profile_admin",
            "/add_salesmanager",
            "/add_ground_staff"
          ]} />
          
          <NavItem icon={<img src={leadIcon} alt="Leads" />} label="Leads" to="/admin_lead_analytics"
          activePaths={[
            "/admin_new_leads",
            "/admin_followed_leads",
            "/admin_unrecorded_leads",
            "/admin_datasaved_leads",
            "/admin_closed_leads",
            "/admin_unsuccess_lead",
            "/admin_pending_leads",
            "/admin_lead_analytics",
            "/admin_manually_enter_lead",
          ]} />
          <NavItem icon={<img src={dataIcon} alt="Datas" />} label="Datas" to="/admin_data_graph"
          activePaths={[
            "/admin_sell_databank",
            "/admin_forrent_databank",
            "/admin_rentseeker_databank",
            "/admin_buy_data",
            "/admin_data_display",
            "/admin_matching_data",
            "/admin_data_graph",
            "/admin_filter_result",
            "/admin_search_result"
          ]} />
          <NavItem icon={<img src={projectIcon} alt="Projects" />} label="Projects" to="/admin_projects"
          activePaths={["/single_admin_project","/data_for_project","/create_project"]} />
          <NavItem icon={<img src={upcomingIcon} alt="Upcoming" />} label="Upcoming Events" to="/adminUpcoming" />
          <NavItem icon={<img src={calenderIcon} alt="Calendar" />} label="Calendar" to="/admin_calender" />
        </nav>

        <div className={styles.socialMedia}>
          <a
            href="https://mail.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.gmailIcon}
          >
            <SiGmail />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=100089846692537"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.facebookIcon}
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.instagram.com/devlokdevelopers/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramIcon}
          >
            <FaInstagram />
          </a>
        </div>


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


export default SideNav;
