import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js?v=1.0';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const saveToHistory = (text, analysis) => {
    const history = JSON.parse(localStorage.getItem('extractedTextHistory')) || [];
    history.push({
      text,
      analysis,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('extractedTextHistory', JSON.stringify(history));
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError('');
    setExtractedText('');
    setProgress(0);
    setAnalysisResult(null);

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

      // Perform content analysis
      const analysis = await analyzeContent(text);
      setAnalysisResult(analysis);

      // Save to history
      saveToHistory(text, analysis);
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
      text += content.items.map((item) => item.str).join(' ') + '\n';
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
        },
      })
        .then(({ data: { text } }) => resolve(text))
        .catch(reject);
    });
  };

  const analyzeContent = async (text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const wordCount = text.split(/\s+/).filter((word) => word).length;
        const sentenceCount = text.split(/[.!?]/).filter((sentence) => sentence).length;

        const keywords = extractKeywords(text);
        const suggestions = generateSuggestions(keywords, wordCount);

        resolve({
          sentiment: 'Positive',
          keywords,
          wordCount,
          sentenceCount,
          suggestions,
        });
      }, 1500);
    });
  };

  const extractKeywords = (text) => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = ['the', 'is', 'and', 'a', 'of', 'to', 'in', 'it', 'on', 'for', 'with'];
    const filteredWords = words.filter((word) => !stopWords.includes(word));
    const frequency = {};

    filteredWords.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  };

  const generateSuggestions = (keywords, wordCount) => {
    return [
      `Consider focusing on the top keywords: ${keywords.slice(0, 5).join(', ')}.`,
      wordCount > 500
        ? 'The content is lengthy; consider summarizing it for better readability.'
        : 'The content length is appropriate for detailed explanations.',
      'Use headings or bullet points to structure the content for clarity.',
      'Include more examples or case studies to support your main ideas.',
    ];
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleFileUpload(acceptedFiles[0]),
    accept: '.pdf,image/*',
  });

  const handleReset = () => {
    setExtractedText('');
    setProgress(0);
    setError('');
    setAnalysisResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText)
      .then(() => alert('Text copied to clipboard'))
      .catch(() => alert('Failed to copy text'));
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen">
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
          </div>
        )}

        {analysisResult && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Content Analysis</h3>
            <div className="bg-gray-50 p-4 border border-gray-300 rounded-lg text-gray-700">
              <p><strong>Sentiment:</strong> {analysisResult.sentiment}</p>
              <p><strong>Word Count:</strong> {analysisResult.wordCount}</p>
              <p><strong>Sentence Count:</strong> {analysisResult.sentenceCount}</p>
              <p><strong>Keywords:</strong> {analysisResult.keywords.join(', ')}</p>
              <p><strong>Suggestions:</strong></p>
              <ul className="list-disc list-inside">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {(extractedText || error || analysisResult) && (
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Copy
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
