const express = require("express");
const router = express.Router();
const { auth, isInstructor } = require("../middlewares/auth");
const {
  deleteAccount,
  getAllUserDetails,
  updateProfile,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard
} = require("../controllers/Profile");

//Profile Routes
router.delete("/deleteProfile", auth, deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports = router;
