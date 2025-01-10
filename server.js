const express = require("express");
const cors = require("cors");
const fileUploadController = require("./components/fileUploadController");

const app = express();
const PORT = 5000;

app.use(cors({
    origin : "*"
}));
app.use(express.json()); // To handle JSON data in requests

// Routes
app.use("/api", fileUploadController);

app.get("/", (req, res) => {
    res.send("Hello atharva from backend")
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
 