import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./DataBank.module.css";
import "./DataAnalytics.css";
import FilterModal from "../../../components/Modals/FilterModal";
import filterIcon from "../../../assets/setting-4.svg";
import AdminLayout from "../../../components/Layouts/AdminLayout";

const AdminDataGraph = () => {
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths = {
    Analytics: "/admin_data_graph",
    Buy: "/admin_buy_data",
    Sell: "/admin_sell_databank",
    "For Rent": "/admin_forrent_databank",
    "Rental Seeker": "/admin_rentseeker_databank",
  };

  const getActiveTab = () => {
    return Object.keys(tabPaths).find((tab) => tabPaths[tab] === location.pathname) || "Analytics";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabChange = (tabName) => {
    navigate(tabPaths[tabName] || "/admin_data_graph");
  };

  const fetchGraphData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("https://devlokcrm-production.up.railway.app/databank/databank_graph/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = response.data;
      const formattedData = [
        { name: "Buy", value: result.buy },
        { name: "Sell", value: result.sell },
        { name: "Rent", value: result.for_rental },
        { name: "Seeker", value: result.rental_seeker },
      ];
      setData(formattedData);
      setTotalData(result.total_collections);
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const handleApplyFilters = (queryString) => {
    setFilterModalOpen(false);
    navigate(`/admin_filter_result?${queryString}`);
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Header with Filter Button */}
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>Data Overview</h2>
          <button className={styles.filterBtn} onClick={() => setFilterModalOpen(true)}>
            <img src={filterIcon} alt="Filter Icon" className={styles.icon} />
          </button>
        </div>

        {/* Tabs Section */}
        <div className={styles.tabContainer}>
          {Object.keys(tabPaths).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Modal */}
        {filterModalOpen && (
          <FilterModal
            isOpen={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            onApply={handleApplyFilters}
          />
        )}

        {/* Graph Section */}
        <div className="graph-container">
          <h3 className="graph-title">Admin Databank Analytics</h3>
          <p className="total-data">Total Collections: {totalData}</p>
          <div className="chart-wrapper">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} barSize={50} margin={{ top: 10, bottom: 10 }}>
                  <XAxis dataKey="name" stroke="#333" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#5766f6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDataGraph;
