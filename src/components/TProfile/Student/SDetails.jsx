import React, { useState, useEffect } from 'react';
import '../Session/add/TPadSession.css';
import '../Style/reviewcard.css';
import Web from '../../IMG/Home.jpeg';
import AddSession from '../Session/add/TPaddSession';
import { auth, db } from '../../auth/Firebase/Firebase';
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { Helmet } from 'react-helmet';
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import EditReview from "../Review/Edit/Reviewedit";
import Session from '../ShowNotification';

const storage = getStorage();

function TPDetails({ contentReady }) {
    const [showAddSession, setShowAddSession] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [userType, setUserType] = useState(null);
    const [userId, setUserId] = useState(null);
    const [editReviewId, setEditReviewId] = useState(null); 
    const [RTotal, setRTotal] = useState("");
    const [RCount, setRCount] = useState("");
    const [TargetId, setTargetId] = useState("");
    const [currentRating, setcurrentRating] = useState("");
    const [editSessionId, setEditSessionId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); 

    const handleClose = () => {
        setEditReviewId(null); 
    };

    const closeEditSession = () => {
        setEditSessionId(null);
    };

    const fetchReviews = async () => {
        try {
            if (!userId) {
                return;
            }
            
            const reviewsCollection = await fetch('https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/reviews.json');
            if (!reviewsCollection.ok) {
                throw new Error('Failed to fetch sessions');
            }
            const reviewData = await reviewsCollection.json();
            if (reviewData) {
                const reviewArray = Object.entries(reviewData).map(([id, data]) => ({ id, ...data }));
                
                let filteredReviews;
                if (userType === "Student") {
                    filteredReviews = reviewArray.filter(review => review.ReviewById === userId);
                } else {
                    filteredReviews = reviewArray.filter(review => review.ReviewToId === userId);
                }
    
                const downloadtarget = filteredReviews.map(async (review) => {
                    if (review.ReviewToProfileImg && review.ReviewByImg) {
                        try {
                            let targetUrl;
                            if (userType === "Student") {
                                targetUrl = await getDownloadURL(ref(storage, review.ReviewToProfileImg));
                            } else {
                                targetUrl = await getDownloadURL(ref(storage, review.ReviewByImg));
                            }
                            
                            return { ...review, targetUrl }; 
                        } catch (error) {
                            console.error('Error downloading image:', error);
                            return review;
                        }
                    } else {
                        return review;
                    }
                });
    
                const reviewsWithImages = await Promise.all(downloadtarget);
                setReviews(reviewsWithImages);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    useEffect(() => {
        if (RTotal !== "" && RCount !== "") {
            updateDelete(currentRating, TargetId);
        }
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, "Users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserType(docSnap.data().userType || "");
                        setUserId(user.uid);
                        fetchReviews(); 
                    } else {
                        console.log("User data not found");
                    }
                } catch (error) {
                    console.error('Error fetching user document:', error);
                }
            } else {
                setUserType(null);
            }
        });
        const fetchSessions = async () => {
            try {
                const response = await fetch('https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/sessions.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch sessions');
                }
                const sessionsData = await response.json();
                if (sessionsData) {
                    const sessionsArray = Object.entries(sessionsData).map(([id, data]) => ({ id, ...data }));
                    const filteredSessions = sessionsArray.filter(session => session.userId === userId);
                    setSessions(filteredSessions);
                }
            } catch (error) {
                console.error('Error fetching sessions:', error);
            }
        };

        if (sessions.length > 0 && reviews.length > 0) {
            contentReady(true); // Call the contentReady function to indicate content is ready
        }
    
        fetchSessions();
    
        return unsubscribe;
    }, [userId, contentReady, RTotal, RCount]);

    const deleteSession = async (sessionId) => {
        console.error('Check:', sessionId);
        try {
            await fetch(`https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/sessions/${sessionId}.json`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setSessions(sessions.filter(session => session.id !== sessionId));
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    const fetchTarget = async (targetId) => {
        try {
            const user = auth.currentUser;
            if (user) {
                console.log("targetId:", targetId);
                const docRef = doc(db, "Users", targetId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setRTotal(data.ReviewTotal);
                    setRCount(data.ReviewCount);
                    console.log("Fetched RTotal:", data.ReviewTotal);
                    console.log("Fetched RCount:", data.ReviewCount);
                } else {
                    console.log("User data not found");
                }
            } else {
                console.log("User is not logged in");
            }
        } catch (error) {
            console.error('Error fetching target data:', error);
        }
    };
    

    const updateDelete = async (Rating, targetId) => {
        try {
            const total = parseInt(RTotal, 10);
            const count = parseInt(RCount, 10) - 1;
            let newTotal;
            let Rate;
    
            if (count !== 0) {
                newTotal = total - parseInt(Rating, 10);
                const final = (newTotal / count).toFixed(2);
                Rate = parseInt(final, 10).toString();
                console.log("final RTotal:", newTotal);
                console.log("final RCount:", count);
                console.log("final Rate:", Rate);
            } else {
                newTotal = "0";
                Rate = "0";
                console.log("No reviews left. Setting values to zero.");
            }
    
            // Update the user's rating in Firestore
            const docRef = doc(db, 'Users', targetId);
            await updateDoc(docRef, {
                Rating: Rate,
                ReviewCount: count.toString(),
                ReviewTotal: newTotal.toString(),
            });
            console.log('Rating updated successfully!');
        } catch (error) {
            console.error('Error updating Rating:', error);
        }
    };
    

    const deleteReview = async (ReviewId, rating, targetId) => {
        try {
            setTargetId(targetId);
            setcurrentRating(rating);
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

    const toggleAddSession = () => {
        setShowAddSession(!showAddSession);
    };

    const closeAddSession = () => {
        setShowAddSession(false);
    };

    const handleSessionClick = (sessionId) => {
        setEditSessionId(sessionId);
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
            {showAddSession && <AddSession onClose={closeAddSession} />}
            {editSessionId && (
                <Session
                    onClose={closeEditSession}
                    session={sessions.find(session => session.id === editSessionId)}
                    sessionId={editSessionId}
                    RequestID={sessions.find(session => session.id === editSessionId)?.RequestID}
                    Subject={sessions.find(session => session.id === editSessionId)?.subject}
                    Time={sessions.find(session => session.id === editSessionId)?.time}
                />
            )}
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
                                {filteredReviews.length === 0 ? (
                                    <p>No Reviews</p>
                                ) : (
                                    filteredReviews.map(review => (
                                        <div key={review.id} className="card_rev">
                                            {review.ReviewToProfileImg ? (
                                                <img src={review.targetUrl || Web} alt="Session Image" className="revimgBx" />
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
                                                    {userType === "Student" && (
                                                        <div className="revactionBtn">
                                                            <button onClick={() => handleEditReview(review.id)}>Edit</button>
                                                            <button onClick={() => deleteReview(review.id, review.rating, review.ReviewToId)}>Delete!</button>
                                                        </div>
                                                    )}
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
            {editReviewId && (
                <EditReview
                    onClose={handleClose}
                    userId={userId}
                    reviewId={editReviewId}
                    rating={reviews.find(review => review.id === editReviewId)?.rating}
                    description={reviews.find(review => review.id === editReviewId)?.description}
                    targetUserName={reviews.find(review => review.id === editReviewId)?.ReviewToUserName}
                    MyImg={reviews.find(review => review.id === editReviewId)?.ReviewByImg}
                    TargetImg={reviews.find(review => review.id === editReviewId)?.ReviewToProfileImg}
                    MyUsername={reviews.find(review => review.id === editReviewId)?.ReviewByUserName}
                    Rating={reviews.find(review => review.id === editReviewId)?.rating}
                    targetId={reviews.find(review => review.id === editReviewId)?.ReviewToId}
                    onReviewUpdated={fetchReviews}
                />
            )}
            {sessions.length === 0 && (
                <style>{`
                    #tpInnerContainer-A:hover {
                        height: auto;
                    }
                `}</style>
            )}
        </>
    );
}

export default TPDetails;
