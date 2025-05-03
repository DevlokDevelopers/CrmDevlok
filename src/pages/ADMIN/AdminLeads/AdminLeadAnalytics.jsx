import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./LeadAnalytics.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
// React Chart.js imports
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const COLORS = ["#6C63FF", "#48CAE4", "#FF6B6B", "#FFA630"];

const AdminLeadAnalytics = () => {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Analytics");
  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths = {
    "Analytics":"/admin_lead_analytics",
    "New": "/admin_new_leads",
    "Followed": "/admin_followed_leads",
    "Unrecorded": "/admin_unrecorded_leads",
    "Data Saved": "/admin_datasaved_leads",
    "Closed": "/admin_closed_leads",
    "Unsuccessfully": "/admin_unsuccess_lead",
    "Pending": "/admin_pending_leads",
    "Category graph":"/adminleadcategorygraph"
  };


  useEffect(() => {
    const matchedTab = Object.keys(tabPaths).find(
      (tab) => tabPaths[tab] === location.pathname
    );
    setActiveTab(matchedTab || "Analytics");
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await axios.get(
          "https://devlokcrm-production.up.railway.app/leads/lead_graph/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && Array.isArray(response.data.graph_data)) {
          setGraphData(response.data.graph_data);
        } else {
          console.error("Unexpected API response format:", response.data);
        }
      } catch (error) {
        console.error(
          "Error fetching graph data:",
          error.response ? error.response.data : error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    navigate(tabPaths[tabName]);
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Lead Analytics</h2>
          <button
            className={styles.addEventBtn}
            onClick={() => navigate("/admin_manually_enter_lead")}
          >
            + Add Lead
          </button>
        </div>

        <div className={styles.tabContainer}>
          {Object.keys(tabPaths).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${
                activeTab === tab ? styles.activeTab : ""
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.graphsContainer}>
          {loading ? (
            <p>Loading data...</p>
          ) : graphData && graphData.length > 0 ? (
            graphData.map((item, index) => (
              <div key={index} className={styles.graphCard}>
                <h3 className={styles.graphTitle}>{item.purpose}</h3>
                <div style={{ width: "250px", height: "250px" }}>
                  <Pie
                    data={{
                      labels: [
                        "Closed Leads",
                        "New Leads",
                        "Data Saved",
                        "Unsuccessfully Closed",
                      ],
                      datasets: [
                        {
                          data: [
                            item.closed_successfully_leads || 0,
                            item.new_leads || 0,
                            item.data_saved_leads || 0,
                            item.unsuccessfully_closed_leads || 0,
                          ],
                          backgroundColor: COLORS,
                          borderColor: "#fff",
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return `${context.label}: ${context.raw}`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noData}>No analytics data available.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLeadAnalytics;
