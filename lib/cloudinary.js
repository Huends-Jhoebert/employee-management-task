const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to Upload Image
const uploadImage = async (imagePath, publicId = null) => {
  try {
    const options = publicId ? { public_id: publicId } : {};
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

module.exports = { uploadImage, cloudinary }; // Export functions and instance
