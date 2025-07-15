import React, { useState, useRef, useEffect, useCallback } from "react";
import { Undo2, Redo2, Type, Download } from "lucide-react";

const CanvaLite = () => {
  const canvasRef = useRef(null);
  const [textContent, setTextContent] = useState("Click to edit text");
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#000000");
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 400;
    drawCanvas();
  }, []);

  // Redraw canvas when text properties change
  useEffect(() => {
    drawCanvas();
  }, [textContent, fontSize, textColor]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = "#e9ecef";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Word wrap logic for long text
    const words = textContent.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 40 && currentLine !== "") {
        lines.push(currentLine);
        currentLine = word + " ";
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);

    // Draw lines
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = (canvas.height - totalHeight) / 2 + fontSize / 2;

    // lines.forEach((line, index) => {
    //   ctx.fillText(line.trim(), canvas.width / 2, startY + index * lineHeight);
    // });
  }, [textContent, fontSize, textColor]);

  const saveToHistory = useCallback(
    (newState) => {
      const newHistory = [...history];

      // Remove any history after current index (for redo functionality)
      if (currentHistoryIndex < history.length - 1) {
        newHistory.splice(currentHistoryIndex + 1);
      }

      // Add new state
      newHistory.push(newState);

      // Keep only last 2 states
      if (newHistory.length > 2) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    },
    [history, currentHistoryIndex]
  );

  const handleTextChange = (newText) => {
    // Save current state to history before changing
    saveToHistory({ textContent, fontSize, textColor });
    setTextContent(newText);
  };

  const handleFontSizeChange = (newSize) => {
    saveToHistory({ textContent, fontSize, textColor });
    setFontSize(newSize);
  };

  const handleColorChange = (newColor) => {
    saveToHistory({ textContent, fontSize, textColor });
    setTextColor(newColor);
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1];
      setTextContent(previousState.textContent);
      setFontSize(previousState.fontSize);
      setTextColor(previousState.textColor);
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const redo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1];
      setTextContent(nextState.textContent);
      setFontSize(nextState.fontSize);
      setTextColor(nextState.textColor);
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  };

  const downloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "canvalite-poster.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Type className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">CanvaLite</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={currentHistoryIndex <= 0}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={currentHistoryIndex >= history.length - 1}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <button
                onClick={downloadPoster}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="w-80 bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Text Properties
            </h2>

            <div className="space-y-4">
              {/* Text Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Enter your text here..."
                />
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>12px</span>
                  <span>72px</span>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{textColor}</span>
                </div>
              </div>

              {/* History Info */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  History
                </h3>
                <div className="text-xs text-gray-500">
                  <p>States saved: {history.length}/2</p>
                  <p>Current position: {currentHistoryIndex + 1}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-center h-full">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 rounded-lg shadow-sm cursor-text"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvaLite;
