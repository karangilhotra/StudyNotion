const express=require("express");
const router=express.Router();

//imports the controllers
const {
    createCourse,
    showAllCourses,
    getCourseDetails,
    getInstructorCourses,
    deleteCourse,
    getFullCourseDetails,
    editCourse,
}=require("../controllers/Course");

const {
    createCategory,
    showAllCategories,
    categoryPageDetails,
}=require("../controllers/Category");

const {
    createSection,
    updateSection,
    deleteSection,
}=require("../controllers/Section");

const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
}=require("../controllers/Subsection");

const{
    createRating,
    getAverageRating,
    getAllRating
}=require("../controllers/RatingAndReview");

const {
    updateCourseProgress,
}=require("../controllers/courseProgress");

const {
    auth,
    isStudent,
    isInstructor,
    isAdmin
}=require("../middlewares/auth");

//course Routes only bu Instructor

// course only created by instructor
router.post("/createCourse",auth,isInstructor,createCourse);

// add a section to a course
router.post("/addSection",auth,isInstructor,createSection);

//update a section
router.post("/updateSection",auth,isInstructor,updateSection);

//delete a section
router.delete("/deleteSection",auth,isInstructor,deleteSection);

// add a subsection to a section
router.post("/addSubSection",auth,isInstructor,createSubSection);

//edit a sub section
router.post("/updateSubSection",auth,isInstructor,updateSubSection);

//delete a sub section
router.delete("/deleteSubSection",auth,isInstructor,deleteSubSection);

// Get all Registered Courses
router.get("/getAllCourses", showAllCourses);

// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails);
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse);
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
// Delete a Course
router.delete("/deleteCourse", deleteCourse);



router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// category route only by Admin
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);


//routes for rating and review

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router
