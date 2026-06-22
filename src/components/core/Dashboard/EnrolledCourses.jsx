// import { useEffect, useState } from "react";
// import ProgressBar from "@ramonak/react-progress-bar";
// import { BiDotsVerticalRounded } from "react-icons/bi";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";

// export default function EnrolledCourses() {
//   const { token } = useSelector((state) => state.auth);
//   const navigate = useNavigate();

//   const [enrolledCourses, setEnrolledCourses] = useState([]);
//   const getEnrolledCourses = async () => {
//     try {
//       const courses = await getUserEnrolledCourses(token);

//       setEnrolledCourses(courses);
//       console.log("Course data:", enrolledCourses);
//     } catch (error) {
//       console.log("Could not fetch enrolled courses.");
//     }
//   };
//   useEffect(() => {
//     getEnrolledCourses();
//   }, []);

//   useEffect(() => {
//     console.log("enrolledCourses updated:", enrolledCourses);
//   }, [enrolledCourses]);

//   return (
//     <>
//       <div className="text-3xl text-richblack-50">Enrolled Courses</div>
//       {!enrolledCourses ? (
//         <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
//           <div className="spinner"></div>
//         </div>
//       ) : !enrolledCourses.length ? (
//         <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
//           You have not enrolled in any course yet.
//           {/* TODO: Modify this Empty State */}
//         </p>
//       ) : (
//         <div className="my-8 text-richblack-5">
//           {/* Headings */}
//           <div className="flex rounded-t-lg bg-richblack-500 ">
//             <p className="w-[45%] px-5 py-3">Course Name</p>
//             <p className="w-1/4 px-2 py-3">Duration</p>
//             <p className="flex-1 px-2 py-3">Progress</p>
//           </div>
//           {/* Course Names */}
//           {enrolledCourses.map((course, i, arr) => (
//             <div
//               className={`flex items-center border border-richblack-700 ${
//                 i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
//               }`}
//               key={i}
//             >
//               <div
//                 className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
//                 onClick={() => {
//                   if (
//                     course.courseContent?.length &&
//                     course.courseContent[0]?.subSection?.length
//                   ) {
//                     if (course.courseContent?.[0]?.subSection?.[0]) {
//                       navigate(
//                         `/view-course/${course._id}/section/${course.courseContent[0]._id}/sub-section/${course.courseContent[0].subSection[0]._id}`,
//                       );
//                     } else {
//                       toast.error("Course content not available yet");
//                     }
//                   } else {
//                     toast.error("Course content not available yet");
//                   }
//                 }}
//               >
//                 <img
//                   src={course.thumbNail}
//                   alt="course_img"
//                   className="h-14 w-14 rounded-lg object-cover"
//                 />
//                 <div className="flex max-w-xs flex-col gap-2">
//                   <p className="font-semibold">{course.courseName}</p>
//                   <p className="text-xs text-richblack-300">
//                     {typeof course.courseDescription === "string"
//                       ? course.courseDescription.length > 50
//                         ? `${course.courseDescription.slice(0, 50)}...`
//                         : course.courseDescription
//                       : ""}
//                   </p>
//                 </div>
//               </div>
//               <div className="w-1/4 px-2 py-3">{course?.totalDuration}</div>
//               <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
//                 <p>Progress: {course.progressPercentage ?? 0}%</p>
//                 <ProgressBar
//                   completed={course.progressPercentage ?? 0}
//                   height="8px"
//                   isLabelVisible={false}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );
// }

import { useEffect, useState } from "react";
import { ProgressBar, Step } from "react-step-progress-bar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getUserEnrolledCourses(token);
        console.log("courses:", courses);
        setEnrolledCourses(courses);
      } catch (error) {
        console.log("Could not fetch enrolled courses.", error);
        toast.error("Could not fetch enrolled courses.");
      }
    };
    fetchCourses();
  }, [token]);

  return (
    <>
      <div className="text-3xl text-richblack-50">Enrolled Courses</div>

      {!Array.isArray(enrolledCourses) ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You have not enrolled in any course yet.
        </p>
      ) : (
        <div className="my-8 text-richblack-5">
          {/* Headings */}
          <div className="flex rounded-t-lg bg-richblack-500">
            <p className="w-[45%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>

          {/* Course list */}
          {enrolledCourses.map((course, i, arr) => (
            <div
              className={`flex items-center border border-richblack-700 ${
                i === arr.length - 1 ? "rounded-b-lg" : ""
              }`}
              key={course._id}
            >
              {/* Left side: thumbnail + name + description */}
              <div
                className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                onClick={() => {
                  if (course.courseContent?.[0]?.subSection?.[0]) {
                    navigate(
                      `/view-course/${course._id}/section/${course.courseContent[0]._id}/sub-section/${course.courseContent[0].subSection[0]._id}`,
                    );
                  } else {
                    toast.error("Course content not available yet");
                  }
                }}
              >
                <img
                  src={course.thumbNail}
                  alt="course_img"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="font-semibold">{course.courseName}</p>
                  <p className="text-xs text-richblack-300">
                    {typeof course.courseDescription === "string"
                      ? course.courseDescription.length > 50
                        ? `${course.courseDescription.slice(0, 50)}...`
                        : course.courseDescription
                      : ""}
                  </p>
                </div>
              </div>

              {/* Middle: duration */}
              <div className="w-1/4 px-2 py-3">
                {course?.totalDuration || "N/A"}
              </div>

              {/* Right side: progress */}
              <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                <p>Progress: {course.progressPercentage ?? 0}%</p>
                <ProgressBar percent={Number(course.progressPercentage) || 0}>
                  <Step>
                    {({ accomplished }) => (
                      <div
                        className={accomplished ? "step accomplished" : "step"}
                      />
                    )}
                  </Step>
                </ProgressBar>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
