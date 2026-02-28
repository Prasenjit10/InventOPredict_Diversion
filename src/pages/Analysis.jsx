import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const Analysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      setTableData(XLSX.utils.sheet_to_json(sheet, { header: 1 }));
      setSelectedFile(file);
    };
    reader.readAsArrayBuffer(file);
  };

  // ✅ FIX: reset input value
  const removeFile = () => {
    setSelectedFile(null);
    setTableData([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/analysisresult", { state: data });
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to analyze file");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6 flex justify-center">

      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-8">
          Stockout Analysis
        </h1>

        {/* Upload Area */}
<div
  className="relative bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl p-10 text-center transition hover:bg-blue-100"
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  }}
>
  {/* Hidden Input */}
  <input
    ref={fileInputRef}
    type="file"
    accept=".xlsx"
    onChange={handleFileChange}
    className="hidden"
    id="fileUpload"
  />

  {/* Upload Icon */}
  <div className="flex justify-center mb-4">
    <div className="bg-blue-100 p-4 rounded-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16l5-5 5 5M12 11v10M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 16.25"
        />
      </svg>
    </div>
  </div>

  {/* Text */}
  <p className="text-gray-700 font-medium mb-1">
    Drag & Drop Files Here
  </p>
  <p className="text-gray-500 text-sm mb-4">or</p>

  {/* Browse Button */}
  <label
    htmlFor="fileUpload"
    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition font-medium"
  >
    Browse File
  </label>

  <p className="text-xs text-gray-500 mt-3">
    Supported format: .xlsx
  </p>
</div>


        {/* File Info */}
        {selectedFile && (
          <div className="mt-6 flex items-center justify-between bg-gray-100 px-4 py-3 rounded-lg">
            <span
              onClick={() => setShowPreview(true)}
              className="text-blue-600 font-medium cursor-pointer hover:underline"
            >
              {selectedFile.name}
            </span>

            <button
              onClick={removeFile}
              className="text-red-500 font-bold text-xl"
            >
              ✕
            </button>
          </div>
        )}

        {/* Analyze */}
        {selectedFile && (
          <div className="mt-8 text-center">
            <button
              onClick={handleAnalyze}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg text-lg transition"
            >
              Analyze
            </button>
          </div>
        )}
      </div>

      {/* Full-screen Spinner */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center z-150">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-6 text-lg">
            Analyzing your data...
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 max-w-5xl rounded-xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">File Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-red-500 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto border rounded">
              <table className="min-w-full text-sm">
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i} className="border-b">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 border-r">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
