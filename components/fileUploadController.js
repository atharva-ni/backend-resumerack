require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const multer = require("multer");
const PDFDocument = require("pdfkit");

const UPLOADS_DIR = process.env.UPLOADS_DIR || "uploads";
const JOBDESC_DIR = process.env.JOBDESC_DIR || "jobdesc";

// Ensure directories exist
[UPLOADS_DIR, JOBDESC_DIR].forEach((dir) => {
    const fullPath = path.resolve(__dirname, "../", dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Configure multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, UPLOADS_DIR),
        filename: (req, file, cb) => cb(null, file.originalname),
    }),
});

const router = express.Router();

// Upload Route
router.post("/upload", upload.array("files"), async (req, res) => {
    try {
        const { files, body: { jobDescription = "" } } = req;

        if (!files || !files.length) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        if (jobDescription) {
            const pdfPath = path.resolve(JOBDESC_DIR, "job_description.pdf");
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(pdfPath));
            doc.text(jobDescription, { width: 410, align: "left" });
            doc.end();
        }

        res.json({
            message: "Files uploaded successfully",
            filePaths: files.map((file) => file.path),
        });
    } catch (error) {
        console.error("Error in /upload route:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Script Execution Route
router.post("/run-script", async (req, res) => {
    try {
        exec("python next.py", (error, stdout, stderr) => {
            if (error) {
                console.error("Error executing script:", stderr);
                return res.status(500).json({ message: "Script execution failed", error: stderr });
            }

            clearDirectories();
            res.json({ message: "Script executed successfully", output: stdout });
        });
    } catch (error) {
        console.error("Error in /run-script route:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Utility to clear directories
const clearDirectories = () => {
    [UPLOADS_DIR, JOBDESC_DIR].forEach((folder) => {
        const fullPath = path.resolve(__dirname, "../", folder);
        fs.readdirSync(fullPath).forEach((file) => {
            fs.unlinkSync(path.join(fullPath, file));
        });
    });
};

module.exports = router;
