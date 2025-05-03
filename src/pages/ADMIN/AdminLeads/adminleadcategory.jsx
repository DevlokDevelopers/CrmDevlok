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
      setCategoryData(res.data || []);
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
  };

  return (
    <AdminLayout>
      <h2>Lead Category Graph</h2>
      <div style={{ height: "400px", width: "100%" }}>
        {categoryData.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <p>Loading chart data...</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLeadCategoryGraph;
