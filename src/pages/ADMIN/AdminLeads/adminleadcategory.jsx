import { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminLeadCategoryGraph = () => {
  const [categoryData, setCategoryData] = useState([]);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");

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
  

  const predefinedCategories = [
    "General Lead",
    "Marketing data",
    "Social Media",
    "Main data",
  ];

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }
    fetchLeadCategoryGraph();
  }, []);

  const fetchLeadCategoryGraph = async () => {
    try {
      const res = await axios.get("https://devlokcrm-production.up.railway.app/leads/lead_category_graph_admin/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const apiData = res.data || [];
      const categoryMap = {};
      apiData.forEach((item) => {
        categoryMap[item.category] = item.count;
      });

      // Fill in 0 for any missing category
      const fullData = predefinedCategories.map((category) => ({
        category,
        count: categoryMap[category] || 0,
      }));

      setCategoryData(fullData);
    } catch (error) {
      console.error("Error fetching lead category graph:", error);
    }
  };

  const chartData = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        label: "Leads",
        data: categoryData.map((item) => item.count),
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#dc3545",
          "#ffc107",
          "#6f42c1",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Lead Categories Overview" },
    },
    scales: {
      y: {
        beginAtZero: true,
        precision: 0,
      },
    },
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>Lead Category Graph</h2>
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            height: "400px",
          }}
        >
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLeadCategoryGraph;
