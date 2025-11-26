# Large File Upload Backend (Node.js + Express)

This backend handles **large file uploads** by receiving files in multiple **chunks**.  
Each chunk is stored temporarily, and once all chunks are uploaded, the backend merges them into a single final file.  
Files smaller than **5MB** are not accepted.

---

## 📌 Features

- Uploads large files in **chunks**
- Stores each chunk using **multer**
- Merges all chunks in correct order
- Deletes temporary chunk folders after merging
- Validates minimum file size (**5MB**)
- Uses `fs` and `fs-extra` for file operations
- CORS enabled

---

## 🛠 Technologies Used

- **ReactJs**
- **Node.js**
- **Express.js**
- **CSS**
- **Multer** (to handle chunk uploads)
- **fs (File System)** module
- **fs-extra** (for folder handling)
- **CORS**
