import React, { useState, useEffect } from 'react';
import { auth, db } from "../../../auth/Firebase/Firebase";
import './TPadSession.css';
import '../../Style/TPStyle.css';
import Loading from '../../../Loading/Loading';
import { toast } from 'react-toastify';
import { doc, getDoc } from "firebase/firestore";

function AddSession({ onClose }) {
    const [userDetails, setUserDetails] = useState(null);
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('');
    const [sessionType, setSessionType] = useState('');
    const [subject, setSubject] = useState('');
    const [rating, setRating] = useState('');
    const [cost, setCost] = useState('');
    const [description, setDescription] = useState('');
    const [days, setDays] = useState([]);
    const [closeForm, setCloseForm] = useState(true); 
    const [isLoading, setIsLoading] = useState(false); // Set loading state to false initially
    const [userPhoto, setUserPhoto] = useState('');
    const [userLocation, setUserLocation] = useState('');
    const [userState, setUserState] = useState('');
    const [userName, setUserName] = useState('');
    const [seats, setSeats] = useState('');

    const toggleForm = () => {
        setCloseForm(!closeForm);
        onClose(); 
    };

    const validateCredentials = () => {
        if (userDetails.address === "Address?" || userDetails.designation === "Designation?"
            || userDetails.imageUrl === "" || userDetails.location === "Location?" ||
            userDetails.state === "State?") {
            alert('Update Your User Account!');
            return true;
        } else {
            return false;
        }
    };

    const validateForm = () => {
        // Check if required fields are filled
        if (!time || !duration || !sessionType || !subject || !cost || !description || days.length === 0) {
            alert('Please fill in all fields.');
            return false;
        }
    
        // Additional check for Group Session
        if (sessionType === "group" && !seats) {
            alert('Please fill in all fields.');
            return false;
        }
    
        // If all validations pass
        return true;
    };

    const fetchUserData = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const docRef = doc(db, "Users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserDetails(docSnap.data());
                    setUserPhoto(docSnap.data().imageUrl);
                    setUserLocation(docSnap.data().location);
                    setUserState(docSnap.data().state);
                    setUserName(docSnap.data().username);
                    setRating(docSnap.data().Rating);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleAddSession = async (e) => {
        e.preventDefault();
        await fetchUserData(); // Wait for fetchUserData to complete

        if (validateForm() && !validateCredentials()) {
            setIsLoading(true);

            const user = auth.currentUser;
            let updatedSessionData;

            const sessionData = {
                time,
                duration,
                sessionType,
                subject,
                cost,
                description,
                days,
                rating,
                RequestCount: "0",
                RequestID: [],
                location: userLocation,
                state: userState,
                username: userName,
                userId: user.uid,
                userPhoto,
            };


            if (sessionType === "group") {
                updatedSessionData = {
                    ...sessionData,
                    ...(sessionType === "group" ? { seats: seats } : {})
                };
            }else {
                updatedSessionData = sessionData;
            }

            const url = 'https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/sessions.json';

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedSessionData)
                });

                if (response.ok) {
                    toast.success("Session Registered!", { position: 'top-center' });
                    toggleForm(); // Close the form after successful submission
                } else {
                    toast.error("Error adding Session!", { position: 'top-center' });
                }
            } catch (error) {
                console.error('Error adding session: ', error);
                toast.error("Error adding Session!", { position: 'top-center' });
            } finally {
                setIsLoading(false); // Set isLoading to false after fetch request completes
            }
        }
    };

    return (
        <div className="overlay-container">
            {isLoading ? (
                <Loading />
            ) : (
                <div className={`overlay-card ${closeForm ? 'show' : ''}`}>
                    <div className="Xcard_TPadd">
                        <div className="content_TpEdit">
                            <div className="data">
                                <h2> Add Session</h2>
                                <div className="Scontainer">
                                    <div className="input-field">
                                        <i className="fas fa-clock"></i>
                                        <input type="time" placeholder="Time" value={time} onChange={(e) => setTime(e.target.value)} />
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-calendar"></i>
                                        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                                            <option value="">Select Duration</option>
                                            <option value="30">30 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="90">1 hour 30 minutes</option>
                                            <option value="120">2 hours</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-calendar"></i>
                                        <select value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                                            <option value="">Select Session Type</option>
                                            <option value="personal">Personal Session</option>
                                            <option value="group">Group Session</option>
                                        </select>
                                    </div>
                                    {sessionType === 'group' && (
                                        <div className="input-field">
                                            <i className="fas fa-users"></i>
                                            <input type="number" placeholder="Seats" value={seats} onChange={(e) => setSeats(e.target.value)} />
                                        </div>
                                    )}
                                    <div className="input-field">
                                        <i className="fas fa-calendar"></i>
                                        <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-calendar"></i>
                                        <input type="number" placeholder="Cost" value={cost} onChange={(e) => setCost(e.target.value)} />
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-calendar"></i>
                                        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-calendar"></i>
                                        <div className="label-container">
                                            <p style={{fontWeight: "500"}}>Select Days</p><br />
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                <React.Fragment key={day}>
                                                    <input type="checkbox" id={day.toLowerCase()} name="day" value={day} onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setDays(prevDays => checked ? [...prevDays, day] : prevDays.filter(d => d !== day));
                                                    }} />
                                                    <label htmlFor={day.toLowerCase()}>{day}</label>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                                <div className="actionBtn">
                                    <button onClick={toggleForm}>Cancel</button>
                                    <button onClick={handleAddSession}>Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddSession;
