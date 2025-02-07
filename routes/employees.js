const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { uploadImage } = require("../lib/cloudinary");

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

// Route to add a new employee
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      contactNumber,
      country,
      accountType,
      photo = "",
    } = req.body;

    let photoUrl = "";

    // Check if the username, email, or contact number already exists
    const existingEmployee = await checkIfExists(
      username,
      email,
      contactNumber
    );
    if (existingEmployee.length > 0) {
      return res
        .status(400)
        .json({ message: "Username, email, or contact number already exists" });
    }

    // Upload the image to Cloudinary if a photo is provided
    if (photo !== "") {
      const uploadResult = await uploadImage(photo); // Upload image
      photoUrl = uploadResult.secure_url; // Get Cloudinary URL
    }

    const newEmployeeData = {
      firstName,
      lastName,
      username,
      email,
      contactNumber,
      country,
      accountType,
      photo: photoUrl,
    };

    const newEmployee = new Employee({
      data: newEmployeeData, // Store employee data without encryption
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json({
      ...savedEmployee.data, // Directly return the stored data
      id: savedEmployee._id,
    });
  } catch (error) {
    console.error("Error saving employee:", error);
    res.status(500).send("Server error");
  }
});

// Route to get all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();

    // No need to decrypt the data anymore
    const employeeList = employees.map((employee) => ({
      ...employee.data, // Directly return the stored data
      id: employee._id,
    }));

    res.status(200).json(employeeList);
  } catch (error) {
    console.error("Error retrieving employees:", error);
    res.status(500).send("Server error");
  }
});

// Route to get a specific employee by ID
// Route to update an employee by ID
router.put("/:id", async (req, res) => {
  const employeeId = req.params.id;
  const {
    firstName,
    lastName,
    username,
    email,
    contactNumber,
    country,
    accountType,
    photo = "",
  } = req.body;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if the username, email, or contact number already exists (excluding the current employee)
    const existingEmployee = await checkIfExists(
      username,
      email,
      contactNumber,
      employeeId
    );
    if (existingEmployee.length > 0) {
      return res
        .status(400)
        .json({ message: "Username, email, or contact number already exists" });
    }

    let photoUrl = "";
    if (photo !== "") {
      const uploadResult = await uploadImage(photo); // Upload image
      photoUrl = uploadResult.secure_url; // Get Cloudinary URL
    }

    const updatedEmployeeData = {
      firstName,
      lastName,
      username,
      email,
      contactNumber,
      country,
      accountType,
      photo: photoUrl,
    };

    // Merge the existing data with the updated data
    const newEmployeeData = {
      ...employee.data,
      ...updatedEmployeeData,
    };

    employee.data = newEmployeeData;

    const updatedEmployee = await employee.save();
    res.status(200).json({
      ...newEmployeeData,
      id: updatedEmployee._id,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).send("Server error");
  }
});

// Route to delete an employee by ID
router.delete("/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;
    const deletedEmployee = await Employee.findByIdAndDelete(employeeId);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
