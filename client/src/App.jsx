import { useState } from "react";
import "./App.css"; // import CSS

function App() {
  const [file, setFile] = useState(null); // selected file
  const [progress, setProgress] = useState(0); // upload progress
  const [msg, setMsg] = useState(""); // status message

  const MIN_SIZE = 5 * 1024 * 1024; // 5MB
  const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

  // When file dropped
  function handleDrop(e) {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
    setProgress(0);
    setMsg("");
  }

  // Allow drag over
  function handleDragOver(e) {
    e.preventDefault();
  }

  // File select input
  function handleSelect(e) {
    setFile(e.target.files[0]);
    setProgress(0);
    setMsg("");
  }

  // Upload one chunk
  async function uploadChunk(
    chunk,
    index,
    fileId,
    totalChunks,
    fileName,
    totalSize
  ) {
    const form = new FormData();

    form.append("fileId", fileId);
    form.append("chunkIndex", index);
    form.append("totalChunks", totalChunks);
    form.append("originalFileName", fileName);
    form.append("totalSize", totalSize);
    form.append("chunk", chunk); // file must be last

    await fetch("http://localhost:5000/upload/chunk", {
      method: "POST",
      body: form,
    });
  }

  // Full upload function
  async function uploadFile() {
    if (!file) return setMsg("Select a file first");
    if (file.size < MIN_SIZE) return setMsg("File must be larger than 5MB");

    const fileId = Date.now().toString();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    setMsg("Uploading...");

    let uploaded = 0;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;
      const chunk = file.slice(start, end);

      await uploadChunk(chunk, i, fileId, totalChunks, file.name, file.size);

      uploaded++;
      setProgress(Math.floor((uploaded / totalChunks) * 100));
    }

    // Tell server to merge
    const res = await fetch("http://localhost:5000/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId,
        totalChunks,
        fileName: file.name,
        totalSize: file.size,
      }),
    });

    const data = await res.json();
    setMsg(data.message);
  }

  return (
    <div className="wrapper">
      <h2>Large File Upload</h2>

      {/* Drag Drop Area */}
      <div className="drop-box" onDrop={handleDrop} onDragOver={handleDragOver}>
        <p>Drag & drop file here</p>
        <p>OR</p>
        <input type="file" onChange={handleSelect} />
      </div>

      {/* File Info */}
      {file && (
        <p className="file-info">
          {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      )}

      {/* Upload Button */}
      <button className="upload-btn" onClick={uploadFile}>
        Upload
      </button>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="progress-box">
          <div
            className="progress-fill"
            style={{ width: progress + "%" }}
          ></div>
        </div>
      )}

      {/* Status Message */}
      <p className="status-text">{msg}</p>
    </div>
  );
}

export default App;
