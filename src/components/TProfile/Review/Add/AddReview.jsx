import React, { useState, useEffect } from 'react';
import '../../Edit/Profile/Tutor/TPEditStyle.css';
import { Helmet } from 'react-helmet';
import '../../Style/TPStyle.css';
import { auth, db } from "../../../auth/Firebase/Firebase";
import { toast } from 'react-toastify';
import Loading from '../../../Loading/Loading';
import StarRatings from 'react-star-ratings';
import { getDoc, doc, updateDoc } from "firebase/firestore";
import '../../Session/add/TPadSession.css';

function AddReview({ onClose, userId, username, targetProfileImg, RCount, RTotal , targetId}) {
    const [MyProfileImg, setMyProfileImg] = useState(null);
    const [rating, setRating] = useState(0);
    const [MyUserName, setMyUserName] = useState(0);
    const [description, setDescription] = useState('');
    const [closeForm, setCloseForm] = useState(true);
    const [isLoading, setIsLoading] = useState(false);


    // Function to toggle form visibility
    const toggleForm = () => {
        setCloseForm(!closeForm);
        onClose();
    };

    const validateForm = () => {
        if (!description) {
            alert('Please fill in all fields.');
            return false;
        }
        return true;
    };
    const updateRating = async (e) => {
        const total = parseInt(RTotal, 10);
        const count = parseInt(RCount, 10);
        const final = ((total + rating) / (count + 1));
        const Rate = parseInt(final, 10).toString();
        console.log("final:",final);
        console.log("RTotal:",RTotal);
        console.log("RCount:",RCount);
    
        // Assuming you have the document reference and field name
        try {
            const docRef = doc(db, 'Users', targetId);
            await updateDoc(docRef, {
                Rating: Rate,
                ReviewCount: (count+1).toString(),
                ReviewTotal: (total+rating).toString(),
            });
            console.log('Rating updated successfully!');
        } catch (error) {
            console.error('Error updating Rating:', error);
        }
    }


    const handleAddSession = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        if (validateForm()) {
            const ReviewData = {
                description,
                ReviewById: auth.currentUser.uid,
                ReviewToId: userId,
                ReviewToUserName: username,
                ReviewByUserName: MyUserName,
                ReviewByImg: MyProfileImg,
                ReviewToProfileImg: targetProfileImg,
                rating: rating, 
            };

            const url = 'https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/reviews.json';
    
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(ReviewData)
                });
    
                if (response.ok) {
                    toast.success("Review Added!", { position: 'top-center' });
                    toggleForm(); 
                } else {
                    toast.error("Error adding Review!", { position: 'top-center' });
                }
            } catch (error) {
                console.error('Error adding review: ', error);
                toast.error("Error Catch adding Review!", { position: 'top-center' });
            } finally {
                updateRating();
                setIsLoading(false); 
            }
        }
        onClose();
    };

    useEffect(() => {
        // console.log(`Fetching user data for userImg: ${}`);
        console.log(`Fetching user data for userImg: ${targetProfileImg}`);
        setIsLoading(true); // Set loading state to true initially
    
        // Call fetchUserData function
        fetchUserData()
          .then(() => {
            // If fetchUserData resolves successfully, set isLoading to false after 5 seconds
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 2000);
    
            // Cleanup the timeout on component unmount
            return () => clearTimeout(timer);
          })
          .catch((error) => {
            // If there's an error, handle it here
            console.error('Error fetching user data:', error);
            setIsLoading(false); // Set isLoading to false regardless of error
          });
    }, []);

    const fetchUserData = async () => {
        return new Promise((resolve, reject) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const docRef = doc(db, "Users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setMyUserName(docSnap.data().Username || ""); 
                        setMyProfileImg(docSnap.data().imageUrl || "")
                        resolve();
                    } else {
                        console.log("User data not found");
                        reject(new Error("User data not found"));
                    }
                } else {
                    console.log("User is not logged in");
                    reject(new Error("User is not logged in"));
                }
            });
        });
    };

    return (
        
        <>
        <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"/>
            </Helmet>
            <div className={`overlay-card ${closeForm ? 'show' : ''}`}>
                {isLoading ? <Loading /> : (
                    <div className="Xcard_TRadd">
                        <div className="content_TpEdit">
                            <div className="data" style={{flexDirection: "column", alignItems: "center" }}>
                                <h1>REVIEW</h1>
                                <div id="container">
                                    <h2>{username}</h2>
                                    <div className="input-field">
                                        <i className="fas fa-calendar"></i>
                                        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                    </div>
                                    {/* Star rating component */}
                                    <StarRatings
                                        rating={rating}
                                        starRatedColor="gold"
                                        changeRating={(newRating) => setRating(newRating)}
                                        numberOfStars={5}
                                        name='rating'
                                    />
                                </div>
                                <div className="actionBtn">
                                    <button onClick={toggleForm}>Cancel</button>
                                    <button onClick={handleAddSession}>Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default AddReview;
