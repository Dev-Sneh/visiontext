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
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto mt-6">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">
        Extracted Text & Analysis History
      </h1>

      {historyData.length === 0 ? (
        <p className="text-center text-gray-500">
          No history found. Please upload and extract text to see records.
        </p>
      ) : (
        historyData.map((item, index) => (
          <div
            key={index}
            className="mb-6 p-6 bg-gray-50 border border-gray-300 rounded-lg shadow-md"
          >
            <div className="text-gray-600 text-sm mb-2">
              Extracted on: {new Date(item.timestamp).toLocaleString()}
            </div>
            <div className="bg-gray-100 p-4 rounded-lg h-40 overflow-y-auto text-sm mb-4">
              <strong>Extracted Text:</strong>
              <p>{item.text}</p>
            </div>

            {/* Check if analysis exists before rendering */}
            {item.analysis ? (
              <div className="bg-gray-100 p-4 rounded-lg h-auto overflow-y-auto text-sm mb-4">
                <strong>Content Analysis:</strong>
                <ul>
                  <li><strong>Sentiment:</strong> {item.analysis.sentiment}</li>
                  <li><strong>Keywords:</strong> {item.analysis.keywords ? item.analysis.keywords.join(', ') : 'No keywords found'}</li>
                  <li><strong>Word Count:</strong> {item.analysis.wordCount}</li>
                  <li><strong>Sentence Count:</strong> {item.analysis.sentenceCount}</li>
                  <li><strong>Suggestions:</strong> {item.analysis.suggestions ? item.analysis.suggestions.join(', ') : 'No suggestions available'}</li>
                </ul>
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg text-sm mb-4">
                <strong>No content analysis available.</strong>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => handleCopy(item.text)}
              >
                Copy Text
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
                onClick={() => handleCopy(JSON.stringify(item.analysis, null, 2))}
              >
                Copy Analysis
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
