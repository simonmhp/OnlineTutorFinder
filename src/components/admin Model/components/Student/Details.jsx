import React, { useState, useEffect, useCallback } from 'react';
import '../../../TProfile/Style/TPStyle.css';
import '../../../TProfile/Session/add/TPadSession.css';
import '../../../TProfile/Style/reviewcard.css';
import Web from '../../../IMG/log.svg';
import { auth, db } from '../../../auth/Firebase/Firebase';
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { Helmet } from 'react-helmet';
import { getDownloadURL, getStorage, ref } from "firebase/storage";

const storage = getStorage();

function TPDetails({ contentReady, usid }) {
    const [reviews, setReviews] = useState([]);
    const [userType, setUserType] = useState(null);
    const [userId, setUserId] = useState(null);
    const [editReviewId, setEditReviewId] = useState(null); 
    const [RTotal, setRTotal] = useState("");
    const [RCount, setRCount] = useState("");
    const [TargetId, setTargetId] = useState("");
    const [currentRating, setCurrentRating] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); 



    const fetchReviews = useCallback(async () => {
        try {
            if (!userId) return;
            const reviewsCollection = await fetch('https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/reviews.json');
            if (!reviewsCollection.ok) throw new Error('Failed to fetch reviews');
            const reviewData = await reviewsCollection.json();
            if (reviewData) {
                const reviewArray = Object.entries(reviewData).map(([id, data]) => ({ id, ...data }));
                const filteredReviews = reviewArray.filter(review => 
                    userType === "Student" ? review.ReviewById === userId : review.ReviewToId === userId
                );

                const reviewsWithImages = await Promise.all(filteredReviews.map(async (review) => {
                    if (review.ReviewToProfileImg && review.ReviewByImg) {
                        try {
                            const targetUrl = userType === "Student" 
                                ? await getDownloadURL(ref(storage, review.ReviewToProfileImg)) 
                                : await getDownloadURL(ref(storage, review.ReviewByImg));
                            return { ...review, targetUrl }; 
                        } catch (error) {
                            console.error('Error downloading image:', error);
                        }
                    }
                    return review;
                }));
                setReviews(reviewsWithImages);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    }, [userId, userType]);

    useEffect(() => {
        setUserType("Student");
        setUserId(usid);

        if (userId) {
            fetchReviews();
        }
    }, [userId, fetchReviews]);

    const fetchTarget = async (targetId) => {
        try {
            const docRef = doc(db, "Users", targetId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setRTotal(data.ReviewTotal);
                setRCount(data.ReviewCount);
            } else {
                console.log("User data not found");
            }
        } catch (error) {
            console.error('Error fetching target data:', error);
        }
    };

    const deleteReview = async (ReviewId, rating, targetId) => {
        try {
            setTargetId(targetId);
            setCurrentRating(rating);
            await fetchTarget(targetId);
            await fetch(`https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/reviews/${ReviewId}.json`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setReviews(reviews.filter(review => review.id !== ReviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const handleEditReview = (reviewId) => {
        setEditReviewId(reviewId); 
    };


    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredReviews = reviews.filter(review =>
        review.ReviewToUserName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"/>
            </Helmet>
            <div className="card_TPDetails">
                <div className="content_TpDetails">
                    <div className="TPdetails">
                        <div className="Tp-row">
                            <br></br>
                            <div id="tpInnerContainer-B" className="tpcontainer-column">
                                <div className="container-header">
                                    <h2>Reviews</h2>
                                    <input
                                        type="text"
                                        placeholder="Search by user name..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="search-input"
                                    />
                                </div>
                                {reviews.length === 0 ? (
                                    <p>No Reviews</p>
                                ) : (
                                    filteredReviews.map(review => (
                                        <div key={review.id} className="card_rev">
                                            {review.ReviewToProfileImg ? (
                                                <img src={review.ReviewToProfileImg} alt="Session Image" className="revimgBx" />
                                            ) : (
                                                <img src={Web} alt="Default Profile" className="revimgBx" />
                                            )}
                                            <div className="content_rev">
                                                <div className="revdetails">
                                                    <form action="#" className="TP-edit">
                                                        <h5 className="title">{review.ReviewToUserName}</h5>
                                                        <div className="Rev">
                                                            <span className="review-stars">
                                                                {[...Array(review.rating)].map((_, index) => (
                                                                    <i key={index} className="fas fa-star"></i>
                                                                ))}
                                                                {[...Array(5 - review.rating)].map((_, index) => (
                                                                    <i key={index} className="far fa-star"></i>
                                                                ))}
                                                            </span>
                                                        </div>
                                                        <div className="revinput-field">
                                                            <div className="static-text">
                                                                {review.description}
                                                            </div>
                                                        </div>
                                                    </form>
                                                        <div className="revactionBtn">
                                                            <button onClick={() => handleEditReview(review.id)}>Edit</button>
                                                            <button onClick={() => deleteReview(review.id, review.rating, review.ReviewToId)}>Delete!</button>
                                                        </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default TPDetails;
