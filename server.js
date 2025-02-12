const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const employeesRoutes = require("./routes/employees");
const countiesRoutes = require("./routes/countries");
const rateLimit = require("express-rate-limit");

const app = express();

// Load environment variables
require("dotenv").config();

// Connect to MongoDB
connectDB();

// Define allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

const isLocal = process.env.NODE_ENV === "development";

if (isLocal) {
  allowedOrigins.push("http://localhost:5173"); // Allow localhost in development
}

// Create a rate limit rule
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter); // Apply to all routes globally

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies/auth headers
  })
);

app.use(express.json());

// Routes
app.use("/api/v1/employees", employeesRoutes);
app.use("/api/v1/countries", countiesRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
