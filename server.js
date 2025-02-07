const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const employeesRoutes = require("./routes/employees");
const countiesRoutes = require("./routes/countries");

const app = express();

// Load environment variables
require("dotenv").config();

// Connect to MongoDB
connectDB();

const corsOptions = {
  origin:
    "https://67a5de99d8039fcf3e6870cf--employee-management-task.netlify.app",
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/employees", employeesRoutes);
app.use("/countries", countiesRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
