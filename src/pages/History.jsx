import React, { useState, useEffect } from 'react';

const History = () => {
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('extractedTextHistory')) || [];
    setHistoryData(storedData);
  }, []);

  const handleClearAll = () => {
    localStorage.removeItem('extractedTextHistory');
    setHistoryData([]);
  };

  const handleDelete = (index) => {
    const updatedData = historyData.filter((_, i) => i !== index);
    localStorage.setItem('extractedTextHistory', JSON.stringify(updatedData));
    setHistoryData(updatedData);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Text copied to clipboard!');
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto mt-6">
      <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">
        Extracted Text History
      </h1>

      {historyData.length === 0 ? (
        <p className="text-center text-gray-500">No history found. Please upload and extract text to see records.</p>
      ) : (
        historyData.map((item, index) => (
          <div
            key={index}
            className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm"
          >
            <div className="text-gray-600 mb-2">
              {new Date(item.timestamp).toLocaleString()}
            </div>
            <div
              className="bg-gray-100 p-4 rounded-lg h-40 overflow-y-auto text-sm"
            >
              {item.text}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => handleCopy(item.text)}
              >
                Copy
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={() => handleDelete(index)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {historyData.length > 0 && (
        <button
          className="w-full mt-6 py-2 bg-blue-500 text-white rounded-lg"
          onClick={handleClearAll}
        >
          Clear All History
        </button>
      )}
    </div>
  );
};

export default History;
