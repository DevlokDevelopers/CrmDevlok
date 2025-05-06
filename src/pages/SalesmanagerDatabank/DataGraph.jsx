import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./SalesMData.module.css";
import "./Graphstyles.css"; // Import the separate graph CSS
import FilterModal from "../../components/Modals/FilterModal";
import filterIcon from "../../assets/setting-4.svg";
import StaffLayout from "../../components/Layouts/SalesMLayout";

const SalesMDataGraph = () => {
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths = {
    Analytics: "/data_graph_salesmanager",
    Buy: "/sales_buy_list",
    Sell: "/salesmanager_sell_list",
    "For Rent": "/salesmanger_forrent",
    "Rental Seeker": "/salesmanager_rentseeker",
  };

  const getActiveTab = () => {
    return Object.keys(tabPaths).find((tab) => tabPaths[tab] === location.pathname) || "Analytics";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabChange = (tabName) => {
    navigate(tabPaths[tabName] || "/salesmanager_analytics");
  };

  const fetchGraphData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found!");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("https://devlokcrmbackend.up.railway.app/databank/salesmanager_databank_graph/", {
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
      setTotalData(result.buy + result.sell + result.for_rental + result.rental_seeker);
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
    navigate(`/filter_result?${queryString}`);
  };

  return (
    <StaffLayout>
      <div className={styles.container}>
        {/* Header with Filter Button */}
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>Datas</h2>
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

        {/* Graph Section - Inside a Centered Container */}
        <div className="graph-container">
          <h3 className="graph-title">Sales Data Overview</h3>
          <p className="total-data">Total Data: {totalData}</p>
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
    </StaffLayout>
  );
};

export default SalesMDataGraph;
