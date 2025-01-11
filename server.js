const express = require("express");
const cors = require("cors");
const fileUploadController = require("./components/fileUploadController");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api", fileUploadController);

// Default route
app.get("/", (req, res) => {
    res.send("Hello Atharva from Backend!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
