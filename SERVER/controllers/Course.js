const User=require("../models/User");
const Category = require("../models/Category");
const Course=require("../models/Course");
const {uplaodImageToCloudinary}=require("../utils/imageUploader")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const mongoose = require("mongoose");
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")



//createcourse handler function
exports.createCourse=async (req,res) => {
    try{
        //fetch data
        let {courseName,courseDescription,whatYouWillLearn,price,status,tag,category,instructions}=req.body;

        //get thumbnail
        const thumbNail=req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !price || !tag || !thumbNail || !category ||!whatYouWillLearn){
            return res.status(400).json({
                success:false,
                message:"All field are required",
            })
        }

        if (!status || status === undefined) {
			status = "Draft";
		}

        //check for instructor
        const userId=req.user.id;
        const instructorDetails=await User.findById(userId);
        console.log("Instructor Details ", instructorDetails);
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found",
            })
        }

        //check given tag is valid or not
        const categoryDetails=await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category details not found",
            })
        }

        //upload image to cloudinary
        const thumbnailImage=await uplaodImageToCloudinary(thumbNail,process.env.FOLDER_NAME);
        console.log("THUMBNAIL IMAGE URL CHECK:", thumbnailImage.secure_url);


        //create an entry for new course
        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tag,
            category: categoryDetails._id,
            thumbNail:thumbnailImage.secure_url,
            status: status,
			instructions: instructions,
        });

        //add the newcourse to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    course:newCourse._id,
                }
            },
            {new:true},
        );

        // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
                {
                    $push: {
                        course: newCourse._id,
                    },
                },
            { new: true }
        )
        console.log("HEREEEEEEEE", categoryDetails2);
        
        // Return the new course and a success message

        return res.status(200).json({
            success:true,
            message:"Course created successsfully",
            data:newCourse,
        })
    }


    catch(err){
        console.error(err);
        
        return res.status(500).json({
            success:false,
            message:"failed to create course",
            error:err.message,
        })
    }

}



//getAllCourses handler function

exports.showAllCourses=async (req,res) => {
    try{
        const allCourses=await Course.find({},{courseName:true,
                                               price:true,
                                               thumbNail:true,
                                               instructor:true,
                                               ratingAndReview:true,
                                               studentsEnrolled:true})
                                               .populate("instructor")
                                               .exec();

        res.status(200).json({
            success:true,
            message:"All courses returned successfully",
            data:allCourses,
        })
    }
    catch(error){
        console.error(err);
        
        return res.status(500).json({
            success:false,
            message:"cannot fetch course data",
            error:error.message,
        })
    }
}


//getCoursesDetails

exports.getCourseDetails=async (req,res) => {
    try{
        //get id
        const {courseId}=req.body;
        //find course details
        const courseDetails= await Course.findOne(
                                {_id:courseId})
                                .populate(
                                    {
                                        path:"instructor",
                                        populate:{
                                            path:"additionalDetails"
                                        },
                                    }
                                )
                                .populate("category")
                                .populate("ratingAndReview")
                                .populate({
                                    path:"courseContent",
                                    populate:{
                                        path:"subSection",
                                    }
                                })
                                .exec();
        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`could not find the course with ${courseId}`
            })
        }
        console.log(courseDetails.courseContent);
        

        //return a response
        return res.status(200).json({
            success:true,
            message:"Course fetched successfully",
            data:courseDetails
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}



// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}

// delete a course
exports.deleteCourse = async (req, res) => {
  try {
    console.log("DELETE COURSE BODY:", req.body)
    const { courseId } = req.body
    

    if (!courseId) {
      return res.status(400).json({ success: false, message: "CourseId is required" })
    }

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    // Unenroll students
    const studentsEnrolled = course.studentsEnrolled || []
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent || []
    for (const sectionId of courseSections) {
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection || []
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course itself
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}



// exports.editCourse = async (req, res) => {
//   try {
//     const { courseId , status} = req.body
//     if (!courseId || !status) {
//       return res.status(400).json({ success: false, message: "Missing fields" })
//     }
//     const updates = req.body
//     const course = await Course.findById(courseId)

//     if (!course) {
//       return res.status(404).json({ error: "Course not found" })
//     }

//     // update status directly
//     course.status = status

//     // If Thumbnail Image is found, update it
//     // if (req.files) {
//     //   console.log("thumbnail update")
//     //   const thumbnail = req.files.thumbnailImage
//     //   const thumbnailImage = await uplaodImageToCloudinary(
//     //     thumbnail,
//     //     process.env.FOLDER_NAME
//     //   )
//     //   course.thumbnail = thumbnailImage.secure_url
//     // }

//     // if thumbnail present, update it
//     if (req.files?.thumbnailImage) {
//       const thumbnailImage = await uplaodImageToCloudinary(
//         req.files.thumbnailImage,
//         process.env.FOLDER_NAME
//       )
//       course.thumbNail = thumbnailImage.secure_url
//     }

//     // Update only the fields that are present in the request body
//     // for (const key in updates) {
//     //   if (updates.hasOwnProperty(key)) {
//     //     if (key === "tag" || key === "instructions") {
//     //       course[key] = JSON.parse(updates[key])
//     //     } else {
//     //       course[key] = updates[key]
//     //     }
//     //   }
//     // }

//     await course.save()

//     // const updatedCourse = await Course.findOne({
//     //   _id: courseId,
//     // })
//     //   .populate({
//     //     path: "instructor",
//     //     populate: {
//     //       path: "additionalDetails",
//     //     },
//     //   })
//     //   .populate("category")
//     //   .populate("ratingAndReviews")
//     //   .populate({
//     //     path: "courseContent",
//     //     populate: {
//     //       path: "subSection",
//     //     },
//     //   })
//     //   .exec()

//     // res.json({
//     //   success: true,
//     //   message: "Course updated successfully",
//     //   data: updatedCourse,
//     // })

//     return res.json({
//       success: true,
//       message: "Course updated successfully",
//       data: course,
//     })
    
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     })
//   }
// }

// EDIT COURSE
// exports.editCourse = async (req, res) => {
//   try {
//     const { courseId, courseName, courseDescription, price, category, status, tag, whatYouWillLearn, instructions } = req.body;

//     if (!courseId || !courseName || !courseDescription || !price || !category) {
//       return res.status(400).json({ success: false, message: "Missing fields" });
//     }

//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     // Update fields
//     course.courseName = courseName;
//     course.courseDescription = courseDescription;
//     course.price = price;
//     course.category = category;
//     course.status = status || course.status;
//     course.whatYouWillLearn = whatYouWillLearn;
//     course.tag = tag ? JSON.parse(tag) : course.tag;
//     course.instructions = instructions ? JSON.parse(instructions) : course.instructions;

//     // Thumbnail update
//     if (req.files?.thumbNail || req.files?.thumbnailImage) {
//       const thumbnailFile = req.files.thumbNail || req.files.thumbnailImage;
//       const thumbnailImage = await uplaodImageToCloudinary(thumbnailFile, process.env.FOLDER_NAME);
//       course.thumbNail = thumbnailImage.secure_url;
//     }

//     await course.save();

//     return res.json({
//       success: true,
//       message: "Course updated successfully",
//       data: course,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbNail,
        process.env.FOLDER_NAME
      )
      course.thumbNail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReview")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}


// exports.editCourse = async (req, res) => {
//   try {
//     const { courseId, status } = req.body
//     if (!courseId || !status) {
//       return res.status(400).json({ success: false, message: "Missing fields" })
//     }

//     const course = await Course.findById(courseId)
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" })
//     }

//     course.status = status

//     if (req.files?.thumbnailImage) {
//       const thumbnailImage = await uplaodImageToCloudinary(
//         req.files.thumbnailImage,
//         process.env.FOLDER_NAME
//       )
//       course.thumbNail = thumbnailImage.secure_url
//     }

//     await course.save()

//     return res.json({
//       success: true,
//       message: "Course updated successfully",
//       data: course,
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     })
//   }
// }



exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReview")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
    console.log("getFullCourseDetails body:", req.body);
    console.log("getFullCourseDetails user:", req.user);
    console.log(req.body.courseId)

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
