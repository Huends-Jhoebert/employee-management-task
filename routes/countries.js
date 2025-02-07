const express = require("express");
const router = express.Router();

// Route to fetch countries
router.get("/", async (req, res) => {
  try {
    const response = await fetch("https://api.first.org/data/v1/countries");
    const data = await response.json();

    // Extract country names from the "data" object and sort them A-Z
    const countries = Object.values(data.data)
      .map((country) => country.country)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

module.exports = router;
