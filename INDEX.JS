STEP 1 -> START BY INSTALLING THE FOLLOWING PACKAGES AND SETTING UP YOUR CLOUDINARY ACCOUNT AND GETTING THE CREDENTIALS  -> npm install multer multer-storage-cloudinary cloudinary dotenv express mongoose cors

STEP 2 -> 
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage (Uploads to Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Cloudinary folder
    allowedFormats: ["jpg", "png", "jpeg", "pdf", "mp4", "zip"], // Allowed file types
  },
});

const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());


// MongoDB Model
mongoose.connect(process.env.MONGO_URI);

const FileSchema = new mongoose.Schema({ fileUrl: String });
const File = mongoose.model("File", FileSchema);

// Upload Endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
    console.log("File received:", req.file); // Debugging log
  
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
  
    try {
      const newFile = new File({ fileUrl: req.file.path }); // Store Cloudinary URL
      await newFile.save();
      res.json({ fileUrl: req.file.path });
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

// Get All Uploaded Files
app.get("/files", async (req, res) => {
    try {
      const files = await File.find();  // Fetch all files
      res.json(files);  // Ensure response is an array
    } catch (error) {
      res.status(500).json({ message: "Error fetching files", error });
    }
  });

app.listen(5000, () => console.log("Server running on port 5000"));
