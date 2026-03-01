import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, AlertTriangle, CalendarDays } from "lucide-react";

const Dashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const productId = state?.product_id;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    fetch(`http://127.0.0.1:5000/product-dashboard/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("📥 Dashboard API Response:", data); // DEBUG
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      });
  }, [productId]);

  // Moving average (safe hook order)
  const enrichedData = useMemo(() => {
    if (!dashboardData?.historical_data) return [];

    return dashboardData.historical_data.map((item, index, arr) => {
      const slice = arr.slice(Math.max(0, index - 6), index + 1);
      const avg =
        slice.reduce((sum, d) => sum + d.quantity, 0) / slice.length;

      return { ...item, movingAvg: Number(avg.toFixed(2)) };
    });
  }, [dashboardData]);

  // ✅ USE BACKEND PREDICTED DATE (NOT last chart date)
  const predictedStockout =
    dashboardData?.predicted_stockout_date || "-";

  if (loading) {
    return (
      <div className="pt-24 text-center text-gray-500 text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="pt-24 text-center text-gray-500 text-lg">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8 mt-20">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        ← Back
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-extrabold">
          📊 {dashboardData.product_name || "Product"} Dashboard
        </h2>
        <p className="text-gray-500 font-mono text-sm mt-1">
          Category: {dashboardData.category || "N/A"}
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">

        <KPI
          icon={TrendingUp}
          label="Avg Daily Sales"
          value={
            dashboardData.avg_daily_sales
              ? dashboardData.avg_daily_sales.toFixed(2)
              : "0"
          }
        />

        <KPI
          icon={CalendarDays}
          label="Days Left"
          value={dashboardData.days_left}
        />

        <KPI
          icon={AlertTriangle}
          label="Stock Status"
          value={dashboardData.stock_status}
          small
        />

        <KPI
          icon={CalendarDays}
          label="Predicted Stockout Date"
          value={predictedStockout}
          small
        />

      </div>

      {/* Chart */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={enrichedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />

            {/* Correct reference line */}
            <ReferenceLine
              x={predictedStockout}
              stroke="red"
              strokeDasharray="5 5"
              label="Stockout"
            />

            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#6366f1"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const KPI = ({ icon: Icon, label, value, small }) => (
  <div className="bg-white border rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-2 text-gray-600">
      <Icon size={18} />
      <p className="text-xs font-mono">{label}</p>
    </div>
    <h3
      className={`font-extrabold ${
        small ? "text-lg" : "text-2xl"
      } ${
        label === "Stock Status"
          ? value === "Understock"
            ? "text-red-600"
            : value === "Overstock"
            ? "text-yellow-600"
            : "text-green-600"
          : ""
      }`}
    >
      {value}
    </h3>
  </div>
);

export default Dashboard;