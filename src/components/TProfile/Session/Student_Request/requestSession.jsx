import React, { useState, useEffect } from 'react';
import './rqStyle.css';
import { Helmet } from 'react-helmet';
import Loading from '../../../Loading/Loading';
import Web from "../../../IMG/Home.jpeg";
import { auth } from "../../../auth/Firebase/Firebase";
import { toast } from 'react-toastify';

function RequestSession({ onClose, session, sessionId }) {
    const [closeForm, setCloseForm] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Function to toggle form visibility
    const toggleForm = () => {
        setCloseForm(!closeForm);
        onClose();
    };

    const handleRequest = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Set loading state
    
        let requestsCount;
    
        // Increment request count if user ID not already in the array
        if (session.RequestID && Array.isArray(session.RequestID)) {
            if (!session.RequestID.includes(currentUser?.uid)) {
                session.RequestID.push(currentUser?.uid);
                requestsCount = parseInt(session.RequestCount, 10) + 1;
            } else {
                session.RequestID = [currentUser?.uid];
                requestsCount = 1;
            }
        } else {
            session.RequestID = [currentUser?.uid];
            requestsCount = 1;
        }
        
        // Construct session data object
        const sessionData = {
            description: session.description,
            UserPhoto: session.UserPhoto, 
            Username: session.Username,
            cost: session.cost,
            days: session.days,
            location: session.location,
            sessionType: session.sessionType,
            state: session.state,
            seats: session.seats,
            subject: session.subject,
            time: session.time,
            rating: session.Rating,
            userId: session.userId,
            duration: session.duration,
            RequestCount: requestsCount.toString(),
            RequestID: session.RequestID,
        };           
        
        console.log("sessionId:", sessionId);
    
        const url = `https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/sessions/${sessionId}.json`;
    
        try {
            // Update session data in Firebase Realtime Database
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });
    
            if (response.ok) {
                toast.success("Session Updated!", { position: 'top-center' });
                toggleForm();
            } else {
                toast.error("Error updating Session!", { position: 'top-center' });
            }
        } catch (error) {
            console.error('Error updating session: ', error);
            toast.error("Error updating Session!", { position: 'top-center' });
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };
    

    useEffect(() => {
        setIsLoading(true);
    
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in
                setCurrentUser(user);
            } else {
                // No user is signed in
                setCurrentUser(null);
            }
        });
    
        // Simulating loading for at least 2 seconds
        const loadingTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    
        // Clean up the timeout to avoid memory leaks
        return () => {
            clearTimeout(loadingTimeout);
            unsubscribe(); // Call unsubscribe inside the return function
        };
    }, [session, setIsLoading, auth, setCurrentUser]);
    

    return (
        <>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            </Helmet>
            <div className={`overlay-card ${closeForm ? 'show' : ''}`}>
                {isLoading ? (
                    <Loading />
                ) : (
                    <div className="card_rq">
                        <div className="content_TpEdit">
                            <div className="Hsessionimage hscard text-center">
                            {session.UserPhoto ? (
                                <img src={session.UserPhoto} alt="Session Image" className="hscard-img-top cardhomesessionimg" />
                            ) : (
                                <img src={Web} alt="Default Profile" className="hscard-img-top cardhomesessionimg" />
                            )}
                            </div>
                            <div className="data">
                            
                            <div id="container">
                                <p>
                                <h1 style={{ fontWeight: "600", color: "yellowgreen" }}>{session?.Username}</h1>
                                <p style={{ fontSize: "18px", fontWeight: "600", color: "blue" }}>
                                    {session.sessionType === "group" ? (
                                        <>Group Session <br /><span style={{ color: "red", fontWeight: "400"}}>{session.seats} Seats</span></>
                                    ) : (
                                        "Personal Session"
                                    )}
                                    </p>

                                <strong>Location:</strong> {session?.location}
                                <br />
                                <strong>Subject:</strong> {session?.subject}
                                <br />
                                <strong>Time:</strong> {session?.time}
                                <br />
                                <strong>Duration:</strong> {session?.duration}
                                <br />
                                <strong>Cost:</strong> {session?.cost}
                                <br />
                                <strong>Description:</strong> <br />{session?.description}
                                </p>
                            </div>
                            <div className="actionBtn">
                                <button onClick={toggleForm}>Cancel</button>
                                <button onClick={handleRequest}>Confirm</button>
                            </div>
                            </div>
                        </div>
                        </div>

                )}
            </div>
        </>
    );
}

export default RequestSession;
