const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { uploadImage } = require("../lib/cloudinary");

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

    // ✅ Upload the image to Cloudinary if a photo is provided
    if (photo != "") {
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
    res.status(201).json(savedEmployee);
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
router.get("/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      ...employee.data, // Return the stored data
      id: employee._id,
    });
  } catch (error) {
    console.error("Error retrieving employee:", error);
    res.status(500).send("Server error");
  }
});

// Route to update an employee by ID
router.put("/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedData = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Merge the existing data with the updated data
    const newEmployeeData = {
      ...employee.data,
      ...updatedData,
    };

    employee.data = newEmployeeData;

    const updatedEmployee = await employee.save();
    res.status(200).json(updatedEmployee);
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

// const express = require("express");
// const router = express.Router();
// const Employee = require("../models/Employee");
// const mongoose = require("mongoose");

// // ✅ Route to add a new employee (with Transactions)
// router.post("/", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction(); // Start a transaction

//   try {
//     const {
//       firstName,
//       lastName,
//       username,
//       email,
//       contactNumber,
//       country,
//       accountType,
//       photo,
//     } = req.body;

//     const newEmployee = new Employee({
//       firstName,
//       lastName,
//       username,
//       email,
//       contactNumber,
//       country,
//       accountType,
//       photo,
//     });

//     // ✅ Save employee within a transaction
//     const savedEmployee = await newEmployee.save({ session });

//     await session.commitTransaction(); // ✅ Commit the transaction
//     session.endSession();

//     res.status(201).json(savedEmployee);
//   } catch (error) {
//     await session.abortTransaction(); // ❌ Rollback in case of failure
//     session.endSession();

//     console.error("Transaction failed:", error);
//     res.status(500).send("Server error");
//   }
// });

// // Route to get all employees
// router.get("/", async (req, res) => {
//   try {
//     const employees = await Employee.find();

//     // No need to decrypt the data anymore
//     const employeeList = employees.map((employee) => ({
//       ...employee.data, // Directly return the stored data
//       id: employee._id,
//     }));

//     res.status(200).json(employeeList);
//   } catch (error) {
//     console.error("Error retrieving employees:", error);
//     res.status(500).send("Server error");
//   }
// });

// // ✅ Route to update an employee (ACID compliant)
// router.put("/:id", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const employeeId = req.params.id;
//     const updatedData = req.body;

//     const employee = await Employee.findById(employeeId).session(session);
//     if (!employee) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // Merge existing data with new data
//     Object.assign(employee, updatedData);

//     const updatedEmployee = await employee.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json(updatedEmployee);
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error("Transaction failed:", error);
//     res.status(500).send("Server error");
//   }
// });

// // ✅ Route to delete an employee (ACID compliant)
// router.delete("/:id", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const employeeId = req.params.id;
//     const deletedEmployee = await Employee.findByIdAndDelete(
//       employeeId
//     ).session(session);

//     if (!deletedEmployee) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({ message: "Employee deleted successfully" });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error("Transaction failed:", error);
//     res.status(500).send("Server error");
//   }
// });

// // module.exports = router;
