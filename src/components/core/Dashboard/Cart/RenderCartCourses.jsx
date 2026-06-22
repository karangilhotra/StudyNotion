// import { FaStar } from "react-icons/fa";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import ReactStars from "react-rating-stars-component";
// import { useDispatch, useSelector } from "react-redux";

// import { removeFromCart } from "../../../../slices/cartSlice";

// export default function RenderCartCourses() {
//   const { cart } = useSelector((state) => state.cart);
//   const dispatch = useDispatch();
//   console.log("Cart item:", cart)
//   return (
//     <div className="flex flex-1 flex-col">
//       {cart.map((course, indx) => (
//         <div
//           key={course._id}
//           className={`flex w-full flex-wrap items-start justify-between gap-6 ${
//             indx !== cart.length - 1 && "border-b border-b-richblack-400 pb-6"
//           } ${indx !== 0 && "mt-6"} `}
//         >
//           <div className="flex flex-1 flex-col gap-4 xl:flex-row">
//             <img
//               src={course?.courseId?.thumbNail}
//               alt={course?.courseId?.courseName}
//               className="h-[148px] w-[220px] rounded-lg object-cover"
//             />
//             <div className="flex flex-col space-y-1">
//               <p className="text-lg font-medium text-richblack-5">
//                 {course?.courseId?.courseName}
//               </p>
//               <p className="text-sm text-richblack-300">
//                 {course?.courseId?.category?.name}
//               </p>
//               <div className="flex items-center gap-2">
//                 <span className="text-yellow-5">4.5</span>
//                 <ReactStars
//                   count={5}
//                   value={course?.courseId?.ratingAndReviews?.length}
//                   size={20}
//                   edit={false}
//                   activeColor="#ffd700"
//                   emptyIcon={<FaStar />}
//                   fullIcon={<FaStar />}
//                 />
//                 <span className="text-richblack-400">
//                   {course?.courseId?.ratingAndReviews?.length} Ratings
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col space-y-1">
//               <p className="text-lg font-medium text-richblack-5">
//                 {course?.courseName}
//               </p>
//               <p className="text-sm text-richblack-300">
//                 {course?.category?.name}
//               </p>
//               <div className="flex items-center gap-2">
//                 <span className="text-yellow-5">4.5</span>
//                 <ReactStars
//                   count={5}
//                   value={course?.ratingAndReviews?.length}
//                   size={20}
//                   edit={false}
//                   activeColor="#ffd700"
//                   emptyIcon={<FaStar />}
//                   fullIcon={<FaStar />}
//                 />
//                 <span className="text-richblack-400">
//                   {course?.ratingAndReview?.length} Ratings
//                 </span>
//               </div>
//             </div>
//           </div>
//           <div className="flex flex-col items-end space-y-2">
//             <button
//               onClick={() => dispatch(removeFromCart(course._id))}
//               className="flex items-center gap-x-1 rounded-md border border-richblack-600 bg-richblack-700 py-3 px-[12px] text-pink-200"
//             >
//               <RiDeleteBin6Line />
//               <span>Remove</span>
//             </button>
//             <p className="mb-6 text-3xl font-medium text-yellow-100">
//               ₹ {course?.price}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import { useSelector, useDispatch } from "react-redux";
import { RiDeleteBin6Line } from "react-icons/ri";
import { removeFromCart } from "../../../../slices/cartSlice";

export default function RenderCartCourses() {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  if (!Array.isArray(cart) || cart.length === 0) {
    return <p className="text-richblack-100">No courses to display</p>;
  }

  return (
    <div className="flex flex-1 flex-col">
      {cart.map((course, indx) => {
        // Safe guards
        const courseName =
          typeof course?.courseName === "string"
            ? course.courseName
            : course?.courseId?.courseName || "Untitled";

        const thumb =
          course?.thumbNail || course?.thumbnail || course?.courseId?.thumbNail || "";

        const categoryName =
          typeof course?.category?.name === "string"
            ? course.category.name
            : course?.courseId?.category?.name || "";

        // Ratings: average + count
        let avgRating = 0;
        let ratingCount = 0;
        if (Array.isArray(course?.ratingAndReview) && course.ratingAndReview.length > 0) {
          const sum = course.ratingAndReview.reduce(
            (acc, review) => acc + (review?.rating || 0),
            0
          );
          avgRating = (sum / course.ratingAndReview.length).toFixed(1);
          ratingCount = course.ratingAndReview.length;
        }

        const price =
          typeof course?.price === "number"
            ? course.price
            : course?.courseId?.price || 0;

        return (
          <div
            key={course._id || indx}
            className="flex w-full flex-wrap items-start justify-between gap-6 mb-6"
          >
            <div className="flex flex-1 flex-col gap-4 xl:flex-row">
              <img
                src={thumb}
                alt={courseName}
                className="h-[148px] w-[220px] rounded-lg object-cover"
              />
              <div className="flex flex-col space-y-1">
                <p className="text-lg font-medium text-richblack-5">
                  {courseName}
                </p>
                <p className="text-sm text-richblack-300">{categoryName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-5">{avgRating}</span>
                  <span className="text-richblack-400">
                    {ratingCount} Ratings
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={() => dispatch(removeFromCart(course._id))}
                className="flex items-center gap-x-1 rounded-md border border-richblack-600 bg-richblack-700 py-3 px-[12px] text-pink-200"
              >
                <RiDeleteBin6Line />
                <span>Remove</span>
              </button>
              <p className="mb-6 text-3xl font-medium text-yellow-100">
                ₹ {price}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

