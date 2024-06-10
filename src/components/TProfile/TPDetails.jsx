import React, { useState, useEffect, useCallback } from 'react';
import './Style/TPStyle.css';
import './Session/add/TPadSession.css';
import './Style/reviewcard.css';
import Web from '../IMG/Home.jpeg';
import AddSession from './Session/add/TPaddSession';
import { auth, db } from '../auth/Firebase/Firebase';
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { Helmet } from 'react-helmet';
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import EditReview from "./Review/Edit/Reviewedit";
import Session from './ShowNotification';

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
    const [currentRating, setCurrentRating] = useState("");
    const [editSessionId, setEditSessionId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); 

    const handleClose = () => {
        setEditReviewId(null); 
    };

    const closeEditSession = () => {
        setEditSessionId(null);
    };

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
        const fetchUserData = async (user) => {
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
        };

        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) fetchUserData(user);
            else setUserType(null);
        });

        const fetchSessions = async () => {
            try {
                const response = await fetch('https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/sessions.json');
                if (!response.ok) throw new Error('Failed to fetch sessions');
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

        if (userId) {
            fetchSessions();
            fetchReviews();
        }

        return unsubscribe;
    }, [userId, fetchReviews]);

    const deleteSession = async (sessionId) => {
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

    const updateDelete = async (Rating, targetId) => {
        try {
            const total = parseInt(RTotal, 10);
            const count = parseInt(RCount, 10) - 1;
            let newTotal = count !== 0 ? total - parseInt(Rating, 10) : 0;
            let Rate = count !== 0 ? (newTotal / count).toFixed(2).toString() : "0";
    
            await updateDoc(doc(db, 'Users', targetId), {
                Rating: Rate,
                ReviewCount: count.toString(),
                ReviewTotal: newTotal.toString(),
            });
        } catch (error) {
            console.error('Error updating Rating:', error);
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
                            {userType !== "Student" && (
                                <div id="tpcontainer-A" className="tpcontainer-column">
                                    <div className="container-header">
                                        <h2>Session</h2>
                                        <div className='addBtn'>
                                            <button onClick={toggleAddSession}>Add</button>
                                        </div>
                                    </div>
                                    <hr className="divider" />
                                    <div id="tpInnerContainer-A" className="tpcontainer-column">
                                        {sessions.length === 0 ? (
                                            <p>No Sessions</p>
                                        ) : (
                                            sessions.map(session => (
                                                <div key={session.id} 
                                                    className={`session-card ${session.sessionType === "group" && session.seats === "0" ? "unavailable" : ""}`}
                                                    onClick={() => {
                                                        if (session.sessionType !== "group" || (session.seats !== "0" && session.RequestID !== null)) {
                                                            handleSessionClick(session.id);
                                                        }
                                                    }}
                                                >
                                                    {/* Notification count section */}
                                                    {session.RequestID && session.RequestID.length > 0 && (
                                                        <div className="notification-count">
                                                            <p>{session.RequestID.length}</p>
                                                        </div>
                                                    )}

                                                    <p>Time: {session.time}</p>
                                                    <p>Duration: {session.duration}</p>
                                                    <p>Session Type: {session.sessionType}</p>
                                                    <p>Subject: {session.subject}</p>
                                                    <p>Cost: {session.cost}</p>
                                                    {session.seats && <p>Seats: <strong style={{color: "red"}}>{session.seats}</strong></p>}
                                                    <p>{session.description}</p>
                                                    <hr className="divider" />
                                                    <div className="days-row">
                                                        {session.days.includes("Wednesday") && (
                                                            <div>
                                                                <p>Wednesday</p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            {session.days.filter(day => day !== "Wednesday").slice(0, 2).join(', ')}
                                                        </div>
                                                        <div>
                                                            {session.days.filter(day => day !== "Wednesday").slice(2).join(', ')}
                                                        </div>
                                                    </div>
                                                    <div className='closeBtn' style={{marginTop: "10px"}}>
                                                        <div className='addBtn'>
                                                            <button onClick={() => deleteSession(session.id)}>Delete</button>
                                                        </div>
                                                    </div>
                                                    {session.sessionType === "group" && session.seats === "0" && (
                                                        <div className="unavailable-message" style={{color: "#ff5f95"}}>
                                                            <p>Session Unavailable</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>


                                </div>
                            )}

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
                    targetId ={reviews.find(review => review.id === editReviewId)?.ReviewToId}
                    onReviewUpdated={fetchReviews}
                />
            )}
        </>
    );
}

export default TPDetails;
