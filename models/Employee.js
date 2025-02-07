const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  data: { type: Object, required: true }, // Store employee data without encryption
});

// Model
const Employee = mongoose.model("Employee", EmployeeSchema);

module.exports = Employee;
