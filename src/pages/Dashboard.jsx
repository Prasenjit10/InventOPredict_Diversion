import { useState, useMemo } from "react";
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

/* ───────── Calendar Utilities ───────── */

// Change year if needed
const YEAR = 2026; // 2024 is leap year (Feb = 29)

const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* ───────── Generate Real Calendar Data ───────── */

const generateYearData = () => {
  const data = [];

  months.forEach((month, mIndex) => {
    const daysInMonth = getDaysInMonth(YEAR, mIndex);

    for (let day = 1; day <= daysInMonth; day++) {

      // Base seasonal pattern (cyclical yearly demand)
      let baseDemand = 5 + Math.sin((mIndex / 12) * Math.PI * 2) * 2;

      // Festival spikes (Oct + early Nov)
      let festival_score =
        (month === "October" && day >= 10 && day <= 25) ||
        (month === "November" && day >= 1 && day <= 7)
          ? 1
          : 0;

      let quantity =
        baseDemand +
        (festival_score ? 6 : 0) +
        Math.random() * 1.5;

      data.push({
        date: day.toString(),
        month,
        quantity: Number(quantity.toFixed(2)),
        festival_score,
      });
    }
  });

  return data;
};

const seasonalData = generateYearData();

/* ───────── Dashboard Component ───────── */

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("October");

  /* Filter by selected month */
  const filteredData = useMemo(() => {
    return seasonalData.filter((d) => d.month === selectedMonth);
  }, [selectedMonth]);

  /* 7-Day Moving Average */
  const enrichedData = useMemo(() => {
    return filteredData.map((item, index, arr) => {
      const slice = arr.slice(Math.max(0, index - 6), index + 1);
      const avg =
        slice.reduce((sum, d) => sum + d.quantity, 0) / slice.length;

      return { ...item, movingAvg: Number(avg.toFixed(2)) };
    });
  }, [filteredData]);

  /* KPI Metrics */
  const avgDaily =
    enrichedData.reduce((s, d) => s + d.quantity, 0) /
    (enrichedData.length || 1);

  const volatility = Math.sqrt(
    enrichedData.reduce(
      (s, d) => s + Math.pow(d.quantity - avgDaily, 2),
      0
    ) / (enrichedData.length || 1)
  ).toFixed(2);

  const predictedStockout =
    enrichedData.length > 0
      ? enrichedData[enrichedData.length - 1].date
      : "-";

  /* Festival Insight */
  const festivalIncrease = (() => {
    const normal = enrichedData.filter((d) => d.festival_score === 0);
    const festival = enrichedData.filter((d) => d.festival_score > 0);

    if (!festival.length || !normal.length) return 0;

    const normalAvg =
      normal.reduce((s, d) => s + d.quantity, 0) / normal.length;

    const festAvg =
      festival.reduce((s, d) => s + d.quantity, 0) / festival.length;

    return (((festAvg - normalAvg) / normalAvg) * 100).toFixed(0);
  })();

  return (
    <div className=" bg-gray-50 p-8 mt-20">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold">
          📊 Full Calendar Seasonal Dashboard ({YEAR})
        </h2>
        <p className="text-gray-500 font-mono text-sm mt-1">
          Real calendar-based demand visualization
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI icon={TrendingUp} label="Avg Daily Sales" value={avgDaily.toFixed(2)} />
        <KPI icon={AlertTriangle} label="Volatility" value={volatility} />
        <KPI icon={CalendarDays} label="Selected Month" value={selectedMonth} small />
        <KPI icon={CalendarDays} label="Predicted Stockout Day" value={predictedStockout} small />
      </div>

      {/* Chart Section */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">

        <div className="mb-4 flex justify-between items-center">
          <h3 className="font-bold">
            Daily Trend - {selectedMonth}
          </h3>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={enrichedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />

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
              dot={({ payload }) => (
                <circle
                  r={4}
                  fill={payload.festival_score > 0 ? "#f59e0b" : "#6366f1"}
                />
              )}
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

      {/* Smart Insights */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-indigo-700 mb-2">
          🧠 Smart Insights
        </h3>

        <p className="text-sm text-gray-700 font-mono">
          {festivalIncrease > 0
            ? `Sales increased ${festivalIncrease}% during festival period in ${selectedMonth}.`
            : `No major festival spike observed in ${selectedMonth}.`}
          {" "}Demand volatility is {volatility}.
        </p>
      </div>

    </div>
  );
};

/* KPI Card */
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