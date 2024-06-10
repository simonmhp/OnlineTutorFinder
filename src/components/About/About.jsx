import React, { useState, useEffect } from 'react';
import "./Style.css";
import { toast } from 'react-toastify';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../auth/Firebase/Firebase";

const About = () => {
    const [inputValue, setInputValue] = useState('');
    const [UserPhoto, setUserPhoto] = useState('');
    const [UserName, setUserName] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        handleAddFeedback();
        setInputValue('');
    };

    const fetchUserData = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const docRef = doc(db, "Users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserPhoto(docSnap.data().imageUrl);
                    setUserName(docSnap.data().Username);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const validateForm = () => {

        if (!inputValue ) {
            alert('Please fill the form.');
            return false;
        }
        return true;
    };

    const handleAddFeedback = async () => {
        await fetchUserData(); // Wait for fetchUserData to complete

        if (validateForm() ) {
            auth.onAuthStateChanged(async (user) => {

                const feedbackData = {
                    Username: UserName,
                    userId: user.uid,
                    UserPhoto: UserPhoto,
                    text: inputValue,
                };

                const url = 'https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/feedback.json';

                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(feedbackData)
                })
                .then(response => {
                    if (response.ok) {
                        toast.success("Feedback Send!", { position: 'top-center' });
                    } else {
                        toast.error("Error Feedback Session!", { position: 'top-center' });
                    }
                })
                .catch(error => {
                    console.error('Error Feedback session: ', error);
                    toast.error("Error Feedback Session!", { position: 'top-center' });
                })
                .finally(() => {
                });
            });
        }
    };

    return (
        <div className="custom-card-main">
            <div className="d-flex align-items-center justify-content-center order-lg-1">
                <div className="custom-card col-10 mx-auto" 
                    style={{ margin: '20px auto', padding: '60px', alignItems: "center"}}>
                    <div className="About-elements" >
                        <p style={{ marginBottom: '10px' }}>                    
                        <h1>
                      Grow Your Minds with{" "}
                      <strong className="brand-name">OTF</strong>
                    </h1>
                    <h2 className="my-3">
                      We are the team of talented Individuals.
                    </h2></p>
                        <p style={{ marginBottom: '10px' }}>Your Feedback is much appreciated:</p>
                        <textarea
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />
                        
                    </div>
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </div>
    );
};

export default About;