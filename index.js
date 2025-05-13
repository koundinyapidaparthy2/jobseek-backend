const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080; // Updated for Cloud Run

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const routes = require("./routes");
app.use("/", routes);

// Basic Health Check
app.get("/", (req, res) => {
  res.send("AI Backend with Firestore is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
