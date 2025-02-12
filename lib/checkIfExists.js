const Employee = require("../models/Employee"); // Import the Employee model

// Utility function to check if the username, email, or contact number exists
const checkIfExists = async (
  username,
  email,
  contactNumber,
  excludeId = null
) => {
  let query = {
    $or: [
      { "data.username": username }, // Check if username already exists
      { "data.email": email }, // Check if email already exists
      { "data.contactNumber": contactNumber }, // Check if contact number already exists
    ],
  };

  // Exclude the current employee if updating (skip checking for the current employee's data)
  if (excludeId) {
    query["_id"] = { $ne: excludeId }; // Exclude current employee by ID
  }

  const existingEmployee = await Employee.find(query);
  return existingEmployee;
};

module.exports = checkIfExists; // Export the function
