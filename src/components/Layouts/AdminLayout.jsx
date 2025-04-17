import React from "react";
import "./SalesMLayout.css"; // Import CSS for layout
import SideNav from "../SideNav/SideNav";
import TopNav from "../TopNav/TopNav";

function AdminLayout({ children }) {
  return (
    <div className="adminContainer">
      {/* Side Navigation */}
      <SideNav/>

      {/* Main Content Section with TopNav */}
      <div className="mainContent">
        <TopNav />
        
        {/* Dynamic Page Content */}
        <div className="pageContent">{children}</div>
      </div>
    </div>
  );
}

export default AdminLayout;
