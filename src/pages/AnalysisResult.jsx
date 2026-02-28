import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { ArrowUp, ArrowDown } from "lucide-react";

const AnalysisResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const data = state?.fields;

  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState(null); // 'asc' | 'desc' | null

  // 🔔 Reminder states
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [email, setEmail] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="pt-24 text-center text-gray-500 text-lg">
        No analysis found
      </div>
    );
  }

  // 🔍 Search filter
  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return data.filter(
      (row) =>
        row.Product_id?.toString().toLowerCase().includes(q) ||
        row.Product_name?.toLowerCase().includes(q) ||
        row.Category?.toLowerCase().includes(q)
    );
  }, [search, data]);

  // 🔽🔼 Sort by Days Left
  const sortedData = useMemo(() => {
    if (!sortOrder) return filteredData;

    return [...filteredData].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.Days_left_to_stockout - b.Days_left_to_stockout;
      }
      if (sortOrder === "desc") {
        return b.Days_left_to_stockout - a.Days_left_to_stockout;
      }
      return 0;
    });
  }, [filteredData, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => {
      if (prev === "asc") return "desc";
      if (prev === "desc") return null;
      return "asc";
    });
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      const worksheet = XLSX.utils.json_to_sheet(sortedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis Result");
      XLSX.writeFile(workbook, "analysis-result.xlsx");
      setDownloading(false);
    }, 800);
  };

  // 🔔 Create reminders (GLOBAL)
  const handleCreateReminder = async () => {
    if (!email) {
      alert("Please enter an email");
      return;
    }

    setSavingReminder(true);

    const payload = {
      email,
      results: sortedData.map((row) => ({
        product_name: row.Product_name,
        stockout_date: new Date(row.Predicted_stockout_date)
  .toISOString()
  .split("T")[0],
        days_left: row.Days_left_to_stockout,
      })),
    };

    try {
      const res = await fetch(
        "http://127.0.0.1:5000/create-stockout-reminders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setShowReminderModal(false);
setEmail("");
setShowSuccessPopup(true);

// auto hide popup after 2.5 seconds
setTimeout(() => {
  setShowSuccessPopup(false);
}, 2500);

      } else {
        alert(data.message || "Failed to create reminders");
      }
    } catch (err) {
      alert("Server error while creating reminders");
    } finally {
      setSavingReminder(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          {/* Left */}
          <div>
            <button
              onClick={() => navigate("/analysis")}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
            >
              ← Analyse Again
            </button>
          </div>

          {/* Center */}
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Stockout Prediction Result
          </h2>

          {/* Right */}
          <div className="flex gap-3 sm:justify-end">
            <button
              onClick={() => setShowReminderModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
            >
              🔔 Remind Me
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition disabled:opacity-70"
            >
              {downloading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {downloading ? "Downloading..." : "Download Excel"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <input
            type="text"
            placeholder="Search by Product ID / Product Name / Category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-180 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="p-6 pt-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-blue-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold">
                      Product ID
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Product Name
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Category
                    </th>

                    <th
                      onClick={toggleSort}
                      className="px-4 py-3 text-center font-semibold cursor-pointer select-none"
                    >
                      <div className="flex items-center justify-center gap-1">
                        Days Left
                        {sortOrder === "asc" && <ArrowUp size={16} />}
                        {sortOrder === "desc" && <ArrowDown size={16} />}
                      </div>
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Stockout Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedData.map((row, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition"
                    >
                      <td className="px-4 py-2 text-center">
                        {row.Product_id}
                      </td>
                      <td className="px-4 py-2">
                        {row.Product_name}
                      </td>
                      <td className="px-4 py-2">
                        {row.Category}
                      </td>
                      <td className="px-4 py-2 text-center font-bold text-red-600">
                        {row.Days_left_to_stockout}
                      </td>
                      <td className="px-4 py-2">
                        {row.Predicted_stockout_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* ✅ Success Popup */}
{showSuccessPopup && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
    <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
      <span className="text-xl">✅</span>
      <div>
        <p className="font-semibold">Reminder Activated</p>
        <p className="text-sm opacity-90">
          You’ll receive emails on stockout dates
        </p>
      </div>
    </div>
  </div>
)}


      {/* 🔔 Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-bold mb-2">
              Get Stockout Reminders
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              You will receive emails on each predicted stockout date.
            </p>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReminderModal(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateReminder}
                disabled={savingReminder}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                {savingReminder ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;