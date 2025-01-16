import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';


// pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js?v=1.0';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);

  const saveTextToHistory = (text) => {
    const history = JSON.parse(localStorage.getItem('extractedTextHistory')) || [];
    history.push({ text, timestamp: new Date().toISOString() });
    localStorage.setItem('extractedTextHistory', JSON.stringify(history));
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError('');
    setExtractedText('');
    setProgress(0);

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        text = await extractTextFromImage(file);
      } else {
        setError('Invalid file type. Please upload a PDF or an image file.');
        return;
      }

      setExtractedText(text);
      saveTextToHistory(text);
    } catch (err) {
      setError('Error processing file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    let text = '';

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
      setProgress(Math.round((i / totalPages) * 100));
    }

    return text;
  };

  const extractTextFromImage = (file) => {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      })
        .then(({ data: { text } }) => resolve(text))
        .catch(reject);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleFileUpload(acceptedFiles[0]),
    accept: '.pdf,image/*',
  });

  const handleReset = () => {
    setExtractedText('');
    setProgress(0);
    setError('');
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen ">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">Content Analyzer</h1>

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-blue-500 rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 hover:bg-blue-100"
        >
          <input {...getInputProps()} />
          <p className="text-lg text-gray-700">Drag & drop a PDF or image file here</p>
          <p className="text-sm text-gray-500">Or click to select a file</p>
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <p className="text-blue-500 font-bold">Processing file... Please wait.</p>
            <progress value={progress} max="100" className="w-full mt-2" />
            <span>{progress}%</span>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 text-red-800 p-4 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {extractedText && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Extracted Text</h3>
            <textarea
              className="w-full h-48 p-4 border border-gray-300 rounded-lg text-gray-700 bg-gray-50"
              value={extractedText}
              readOnly
            />
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Reset
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(extractedText)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                Copy Text
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
