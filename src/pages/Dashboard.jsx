import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from "recharts";
import { TrendingUp, AlertTriangle, CalendarDays } from "lucide-react";

/* ───────── Demo Sales Data ───────── */

const salesData = [
  { date: "1 Nov", quantity: 3, festival_score: 0 },
  { date: "2 Nov", quantity: 4, festival_score: 0 },
  { date: "3 Nov", quantity: 5, festival_score: 0 },
  { date: "4 Nov", quantity: 8, festival_score: 1 },
  { date: "5 Nov", quantity: 9, festival_score: 1 },
  { date: "6 Nov", quantity: 6, festival_score: 0 },
  { date: "7 Nov", quantity: 4, festival_score: 0 },
  { date: "8 Nov", quantity: 5, festival_score: 0 },
  { date: "9 Nov", quantity: 3, festival_score: 0 },
  { date: "10 Nov", quantity: 2, festival_score: 0 },
];

/* ───────── Dashboard Component ───────── */

const Dashboard = () => {

  /* --- 7 Day Moving Average --- */
  const enrichedData = useMemo(() => {
    return salesData.map((item, index, arr) => {
      const slice = arr.slice(Math.max(0, index - 6), index + 1);
      const avg =
        slice.reduce((sum, d) => sum + d.quantity, 0) / slice.length;

      return { ...item, movingAvg: avg.toFixed(2) };
    });
  }, []);

  /* --- KPI Calculations --- */
  const avgDaily =
    enrichedData.reduce((s, d) => s + d.quantity, 0) / enrichedData.length;

  const volatility = Math.sqrt(
    enrichedData.reduce(
      (s, d) => s + Math.pow(d.quantity - avgDaily, 2),
      0
    ) / enrichedData.length
  ).toFixed(2);

  const predictedStockout = "10 Nov 2024";
  const daysLeft = 23;

  /* --- Smart Insight --- */
  const festivalIncrease = (() => {
    const normal = enrichedData.filter(d => d.festival_score === 0);
    const festival = enrichedData.filter(d => d.festival_score > 0);

    const normalAvg =
      normal.reduce((s, d) => s + d.quantity, 0) / normal.length;

    const festAvg =
      festival.reduce((s, d) => s + d.quantity, 0) / festival.length;

    return (((festAvg - normalAvg) / normalAvg) * 100).toFixed(0);
  })();

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* ───────── Header ───────── */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold">
          📊 Inventory Prediction Dashboard
        </h2>
        <p className="text-gray-500 font-mono text-sm mt-1">
          Smart demand forecasting with festival-aware analytics
        </p>
      </div>

      {/* ───────── KPI CARDS ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <KPI icon={TrendingUp} label="Avg Daily Sales" value={avgDaily.toFixed(2)} />
        <KPI icon={AlertTriangle} label="Sales Volatility" value={volatility} />
        <KPI icon={CalendarDays} label="Days Left" value={daysLeft} />
        <KPI icon={CalendarDays} label="Predicted Stockout" value={predictedStockout} small />

      </div>

      {/* ───────── MAIN CHART ───────── */}
      <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">

        <h3 className="font-bold mb-4">Sales Trend & Prediction</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={enrichedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />

            {/* Festival Shaded Area */}
            <ReferenceArea
              x1="4 Nov"
              x2="5 Nov"
              fill="#facc15"
              fillOpacity={0.15}
            />

            {/* Predicted Stockout Line */}
            <ReferenceLine
              x="10 Nov"
              stroke="red"
              strokeDasharray="5 5"
              label="Stockout"
            />

            {/* Daily Quantity */}
            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#6366f1"
              strokeWidth={3}
              dot={({ payload }) => (
                <circle
                  r={5}
                  fill={payload.festival_score > 0 ? "#f59e0b" : "#6366f1"}
                />
              )}
            />

            {/* Moving Average */}
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

      {/* ───────── SMART INSIGHTS ───────── */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-indigo-700 mb-2">
          🧠 Smart Insights
        </h3>

        <p className="text-sm text-gray-700 font-mono">
          Sales increased <strong>{festivalIncrease}%</strong> during festival
          period. Demand volatility is <strong>{volatility}</strong>, which
          indicates {volatility > 2 ? "high variability — restock early." : "stable demand."}
        </p>
      </div>

    </div>
  );
};

/* ───────── KPI CARD COMPONENT ───────── */

const KPI = ({ icon: Icon, label, value, small }) => (
  <div className="bg-white border rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-2 text-gray-600">
      <Icon size={18} />
      <p className="text-xs font-mono">{label}</p>
    </div>
    <h3 className={`font-extrabold ${small ? "text-lg" : "text-2xl"}`}>
      {value}
    </h3>
  </div>
);

export default Dashboard;