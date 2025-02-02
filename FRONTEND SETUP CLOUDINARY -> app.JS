
import { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Handle File Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create a preview URL if file is selected (only for images)
    setPreview(selectedFile && selectedFile.type.startsWith("image/") ? URL.createObjectURL(selectedFile) : null);
  };

  // Upload File to Server
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded successfully!");
      // After successful upload, fetch the latest list of uploaded files
      fetchUploadedFiles();
    } catch (error) {
      console.error("Upload failed", error);
      alert("File upload failed!");
    }
  };

  // Fetch Uploaded Files (Image URLs) from MongoDB
  const fetchUploadedFiles = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/files");
      if (Array.isArray(data)) {
        setUploadedFiles(data.map(f => f.fileUrl)); // Extract image URLs from the response
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  // Fetch files when the component mounts
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: "10px" }}>Upload</button>

      {/* Show Preview or Message */}
      <div style={{ marginTop: "10px" }}>
        {preview ? (
          <img 
            src={preview} 
            alt="Image Preview"
            style={{ width: "200px", height: "200px", objectFit: "cover", border: "1px solid #ccc", borderRadius: "8px" }} 
          />
        ) : (
          <p style={{ color: "gray" }}>No preview available</p>
        )}
      </div>

      {/* Display Uploaded Images */}
      <div style={{ marginTop: "20px" }}>
        <h3>Uploaded Images</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {uploadedFiles.map((fileUrl, index) => (
            <div key={index} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
              <img 
                src={fileUrl} 
                alt={`Uploaded ${index + 1}`} 
                style={{ width: "100px", height: "100px", objectFit: "cover" }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
