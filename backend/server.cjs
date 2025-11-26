// Import required modules
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");

const app = express();
const PORT = 5000;

// Minimum allowed size (5MB)
const MIN_SIZE = 5 * 1024 * 1024;

// Upload and temp folders
const UPLOAD_FOLDER = path.join(__dirname, "uploads");
const TEMP_FOLDER = path.join(__dirname, "temp");

// Ensure folders exist
fsExtra.ensureDirSync(UPLOAD_FOLDER);
fsExtra.ensureDirSync(TEMP_FOLDER);

app.use(cors());
app.use(express.json());

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileId = req.body.fileId; // unique file id
    const folderPath = path.join(TEMP_FOLDER, fileId);
    fsExtra.ensureDirSync(folderPath); // make temp folder
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, req.body.chunkIndex); // save chunk by index
  },
});

const upload = multer({ storage });

// Upload single chunk
app.post("/upload/chunk", upload.single("chunk"), (req, res) => {
  res.json({ message: "Chunk uploaded" });
});

// Merge all chunks
app.post("/upload/complete", async (req, res) => {
  try {
    const { fileId, totalChunks, fileName, totalSize } = req.body;

    if (totalSize < MIN_SIZE) {
      await fsExtra.remove(path.join(TEMP_FOLDER, fileId)); // delete temp
      return res.json({ message: "File must be bigger than 5MB" });
    }

    const tempPath = path.join(TEMP_FOLDER, fileId);
    const finalFile = path.join(UPLOAD_FOLDER, `${Date.now()}-${fileName}`);

    const writeStream = fs.createWriteStream(finalFile); // final file

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempPath, `${i}`); // chunk file path
      const chunk = fs.readFileSync(chunkPath); // read chunk
      writeStream.write(chunk); // write chunk
    }

    writeStream.end();

    writeStream.on("finish", async () => {
      await fsExtra.remove(tempPath); // delete temp folder
      res.json({ message: "Upload complete" });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("Backend running on http://localhost:" + PORT);
});
