import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { ArrowUp, ArrowDown } from "lucide-react";

const AnalysisResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const data = state?.fields || [];

  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState(null);

  // 🔔 Reminder states
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [email, setEmail] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="pt-24 text-center text-gray-500 text-lg">
        No analysis found
      </div>
    );
  }

  // 🔍 Search
  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      (row) =>
        row.product_id?.toString().toLowerCase().includes(q) ||
        row.product_name?.toLowerCase().includes(q) ||
        row.category?.toLowerCase().includes(q)
    );
  }, [search, data]);

  // 🔽 Sort
  const sortedData = useMemo(() => {
    if (!sortOrder) return filteredData;
    return [...filteredData].sort((a, b) =>
      sortOrder === "asc"
        ? a.days_left - b.days_left
        : b.days_left - a.days_left
    );
  }, [filteredData, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) =>
      prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
    );
  };

  // 📥 Download
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

  // 🔔 Create reminders
  const handleCreateReminder = async () => {
    if (!email) {
      alert("Please enter an email");
      return;
    }

    setSavingReminder(true);

    const payload = {
      email,
      results: sortedData.map((row) => ({
        product_name: row.product_name,
        stockout_date: row.stockout_date,
        days_left: row.days_left,
      })),
    };

    try {
      const res = await fetch(
        "https://inventopredict-diversion.onrender.com/create-stockout-reminders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await res.json();

      if (res.ok) {
        setShowReminderModal(false);
        setEmail("");
        setShowSuccessPopup(true);

        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 2500);
      } else {
        alert(responseData.message || "Failed to create reminders");
      }
    } catch {
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
          <button
            onClick={() => navigate("/analysis")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            ← Analyse Again
          </button>

          <h2 className="text-2xl font-bold text-center">
            Stockout Prediction Result
          </h2>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowReminderModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
            >
              🔔 Remind Me
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              {downloading ? "Downloading..." : "Download Excel"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Table */}
        <div className="p-6 pt-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[60vh] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-center">Product ID</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th
                      onClick={toggleSort}
                      className="px-4 py-3 text-center cursor-pointer"
                    >
                      Days Left
                      {sortOrder === "asc" && <ArrowUp size={14} />}
                      {sortOrder === "desc" && <ArrowDown size={14} />}
                    </th>
                    <th className="px-4 py-3">Stockout Date</th>
                    <th className="px-4 py-3 text-center">Dashboard</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedData.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 text-center">{row.product_id}</td>
                      <td className="px-4 py-2">{row.product_name}</td>
                      <td className="px-4 py-2">{row.category}</td>
                      <td className="px-4 py-2 text-center text-red-600 font-bold">
                        {row.days_left}
                      </td>
                      <td className="px-4 py-2">{row.stockout_date}</td>

                      {/* Dashboard Button */}
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() =>
                        navigate("/dashboard", {
                          state: {
                            product_id: row.product_id,
                            product_name: row.product_name,
                            category: row.category,
                            days_left: row.days_left,
                            stockout_date: row.stockout_date,
                          },
                        })
                      }
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg">
            ✅ Reminder Activated Successfully
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-bold mb-4">
              Get Stockout Reminders
            </h3>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
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