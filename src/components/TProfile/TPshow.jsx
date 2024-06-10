import React, { useState, useEffect } from 'react';
import '../TProfile/Style/TPStyle.css';
import '../TProfile/Session/add/TPadSession.css';
import { auth, db } from '../auth/Firebase/Firebase';
import { getDoc, doc } from "firebase/firestore";
import Web from "../IMG/Home.jpeg";
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import { Helmet } from 'react-helmet';
import RequestSession from './Session/Student_Request/requestSession';

const storage = getStorage();

const TPshow = ({ targetId }) => {
    const [sessions, setSessions] = useState([]);
    const [userType, setUserType] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [userId, setUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); 
    const [editSessionId, setEditSessionId] = useState(null);

    const closeEditSession = () => {
        setEditSessionId(null);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, "Users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserType(docSnap.data().userType || "");
                        setUserId(user.uid);
                        if(userId){
                            fetchReviews(); 
                        }
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
                    const filteredSessions = sessionsArray.filter(session => session.userId === targetId);
                    setSessions(filteredSessions);
                }
            } catch (error) {
                console.error('Error fetching sessions:', error);
            }
        };
        
        const fetchReviews = async () => {
            try {
                if (!userId) {
                    console.log('User ID not available yet');
                    return;
                }
                const reviewsCollection = await fetch('https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/reviews.json');
                if (!reviewsCollection.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                const reviewData = await reviewsCollection.json();
                if (reviewData) {
                    const reviewArray = Object.entries(reviewData).map(([id, data]) => ({ id, ...data }));
                    const filteredReviews = reviewArray.filter(review => review.ReviewToId === targetId);
                    const downloadTargets = filteredReviews.map(async (review) => {
                        if (review.ReviewByImg) {
                            try {
                                const targetUrl = await getDownloadURL(ref(storage, review.ReviewByImg));
                                return { ...review, targetUrl };
                            } catch (error) {
                                console.error('Error downloading image:', error);
                                return review;
                            }
                        } else {
                            return review;
                        }
                    });
                    const reviewsWithImages = await Promise.all(downloadTargets);
                    setReviews(reviewsWithImages);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };
        
        fetchSessions();
    
        return unsubscribe;
    }, [userId, userType, targetId]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSessionClick = (sessionId) => {
        setEditSessionId(sessionId);
    };

    const filteredReviews = reviews.filter(review =>
        review.ReviewByUserName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"/>
            </Helmet>
            {editSessionId && (
                <RequestSession
                    onClose={closeEditSession}
                    session={sessions.find(session => session.id === editSessionId)}
                    sessionId={editSessionId}
                />
            )}
            <div className="card_TPDetails">
                <div className="content_TpDetails">
                    <div className="TPdetails">
                        <div className="Tp-row">
                            <div id="tpcontainer-A" className="tpcontainer-column">
                                <div className="container-header">
                                    <h2>Title</h2>
                                </div>
                                <hr className="divider" />
                                
                                <div id="tpInnerContainer-A" className="tpcontainer-column">
                                    {sessions.map(session => (
                                        <div
                                            key={session.id}
                                            className={`session-card ${session.sessionType === "group" && session.seats === "0" ? "unavailable" : ""}`}
                                            onClick={() => {
                                                if (session.sessionType !== "group" || session.seats !== "0") {
                                                    handleSessionClick(session.id);
                                                }
                                            }}
                                        >
                                            <p>Time: {session.time}</p>
                                            <p>Duration: {session.duration}</p>
                                            <p>Session Type: {session.sessionType}</p>
                                            <p>Subject: {session.subject}</p>
                                            <p>Cost: {session.cost}</p>
                                            {session.seats !== "" && <p>Seats: <strong style={{color: "#ff5f95"}}>{session.seats}</strong></p>}
                                            <p>{session.description}</p>
                                            <div className="days-row">
                                                <hr className="divider" />
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
                                            {session.sessionType === "group" && session.seats === "0" && (
                                                <div className="unavailable-message" style={{color: "#ff5f95"}}>
                                                    <p>Session Unavailable</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <br />
                            <div id="tpcontainer-B" className="tpcontainer-column">
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
                                
                                <hr className="divider" />
                                <div id="tpInnerContainer-B" className="tpcontainer-column">
                                    {filteredReviews.map(review => (
                                        <div key={review.id} className="card_rev">
                                            {review.ReviewByImg ? (
                                                <img src={review.ReviewByImg} alt="Session Image" className="revimgBx" />
                                            ) : (
                                                <img src={Web} alt="Default Profile" className="revimgBx" />
                                            )}
                                            <div className="content_rev">
                                                <div className="revdetails">
                                                    <form action="#" className="TP-edit">
                                                        <h5 className="title">{review.ReviewByUserName}</h5>
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
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
    
};

export default TPshow;
