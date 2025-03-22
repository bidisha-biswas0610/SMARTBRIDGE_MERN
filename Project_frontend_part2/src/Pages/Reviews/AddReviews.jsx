import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Footer from "../../Components/Footer/Footer";
import Header from "../../Components/Header/Header";
import { MdClose } from "react-icons/md";
import Loader from "../../Components/Loader/Loader";
import { Rating } from "@mui/lab";
import "./Reviews.css";

const AddReviews = () => {
  const RegisterSuccess = useRef();
  const { loading: userLoading, user } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [ratings, setRatings] = useState(0);
  const [validationError, setValidationError] = useState();
  const [addLoading, setAddLoading] = useState(false);
  const [message, setMessage] = useState(null);

  document.title = `Add Review`;

  // Add Reviews
  const addReviewsHandel = async () => {
    try {
      if (comment.trim().length !== 0 && ratings !== 0) {
        setAddLoading(true);
        const { data } = await axios.post("/api/user/add/review", {
          comment,
          ratings,
        });

        setAddLoading(false);
        setMessage(data.message);
      } else {
        setValidationError("All fields are required.");
      }
    } catch (error) {
      setAddLoading(false);
      setValidationError("An error occurred. Please try again.");
    }
  };

  if (validationError) {
    setTimeout(() => {
      setValidationError(null);
    }, 5000);
  }

  const closeRegisterPop = () => {
    RegisterSuccess.current.style.display = "none";
  };

  return (
    <>
      <Header />
      {addLoading || userLoading ? (
        <Loader LoadingName={"Processing Reviews"} />
      ) : (
        <div className="reviews-container-section">
          <h1 className="Heading regHeading">
            Add <span>Reviews</span>
          </h1>
          {message ? (
            <div className="RegisterSuccess" ref={RegisterSuccess}>
              <div className="pop-card">
                <button id="close-btn" onClick={closeRegisterPop}>
                  <MdClose />
                </button>
                <div className="successLoader">
                  <h3 className="loader-text"></h3>
                </div>
                <h1>{message}</h1>
              </div>
            </div>
          ) : null}
          <div className="add-reviews-box">
            <input
              type="text"
              value={user.firstName + " " + user.lastName}
              readOnly
            />
            <div className="stars add-reviews-star">
              <Rating
                onChange={(e) => setRatings(e.target.value)}
                value={ratings}
                size="large"
              />
            </div>
            <textarea
              value={comment}
              placeholder="Comment..."
              required
              onChange={(e) => setComment(e.target.value)}
            ></textarea>

            {validationError && (
              <h4 className="validError">{validationError}</h4>
            )}

            <button onClick={addReviewsHandel}>Submit</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AddReviews;
