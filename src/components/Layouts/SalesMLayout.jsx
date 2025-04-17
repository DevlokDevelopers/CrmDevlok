import React from "react";
import "./SalesMLayout.css"; // Import CSS for layout
import StaffSideNav from "../../components/StaffSidenav/StaffSideNav";
import StaffTopNav from "../../components/StaffTopNav/StaffTopNav";

function SalesMLayout({ children }) {
  return (
    <div className="adminContainer">
      {/* Side Navigation */}
      <StaffSideNav />

      {/* Main Content Section with TopNav */}
      <div className="mainContent">
        <StaffTopNav />
        
        {/* Dynamic Page Content */}
        <div className="pageContent">{children}</div>
      </div>
    </div>
  );
}

export default SalesMLayout;
