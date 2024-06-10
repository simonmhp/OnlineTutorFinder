import React, { useState, useEffect } from 'react';
import '../../Edit/Profile/Tutor/TPEditStyle.css';
import { Helmet } from 'react-helmet';
import { auth, db } from "../../../auth/Firebase/Firebase";
import { toast } from 'react-toastify';
import Loading from '../../../Loading/Loading';
import StarRatings from 'react-star-ratings';
import { getDoc, doc, updateDoc } from "firebase/firestore";
import '../../Session/add/TPadSession.css';

function EditReview({
    onClose, userId, targetId,
    MyUsername, MyImg, TargetImg, Rating,
    targetUserName, rating: initialRating,
    description: initialDescription, reviewId, onReviewUpdated
}) {
    const [MyProfileImg, setMyProfileImg] = useState(null);
    const [RTotal, setRTotal] = useState("");
    const [RCount, setRCount] = useState("");
    const [rating, setRating] = useState(initialRating);
    const [MyUserName, setMyUserName] = useState('');
    const [description, setDescription] = useState(initialDescription);
    const [closeForm, setCloseForm] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Function to toggle form visibility
    const toggleForm = () => {
        setCloseForm(!closeForm);
        onClose();
    };

    const fetchTarget = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                console.log("User:",targetId );
                const docRef = doc(db, "Users", targetId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setRTotal(data.ReviewTotal);
                    setRCount(data.ReviewCount);
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

    const validateForm = () => {
        if (!description) {
            alert('Please fill in all fields.');
            return false;
        }
        return true;
    };

    const updateRating = async () => {
        try {

            const total = parseInt(RTotal, 10);
            const count = parseInt(RCount, 10);
            const newTotal = total - parseInt(Rating, 10);
            console.log("RTotal:", RTotal);
            console.log("RCount:", RCount);
            console.log("count:", count);
            console.log("total:", total);
            console.log("newTotal:", newTotal);

            const final = ((newTotal + parseInt(rating)) / count).toFixed(2);
            const Rate = parseInt(final, 10).toString();
            console.log("final:", final);
            console.log("Rate:", Rate);

            // Update the user's rating in Firestore (uncomment when ready to use)
            const docRef = doc(db, 'Users', targetId);
            await updateDoc(docRef, {
                Rating: Rate,
                ReviewCount: (count).toString(),
                ReviewTotal: ((newTotal + parseInt(rating))).toString(),
            });
            console.log('Rating updated successfully!');
        } catch (error) {
            console.error('Error updating Rating:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSession = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (validateForm()) {
            const ReviewData = {
                description,
                rating,
                ReviewById: auth.currentUser.uid,
                ReviewToId: targetId,
                ReviewToUserName: targetUserName,
                ReviewByUserName: MyUserName,
                ReviewByImg: MyProfileImg,
                ReviewToProfileImg: TargetImg,
            };


            const url = `https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/reviews/${reviewId}.json`;

            try {
                // Update review data in Firebase Realtime Database (uncomment when ready to use)
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(ReviewData)
                });

                if (response.ok) {
                    toast.success("Review Updated!", { position: 'top-center' });
                    toggleForm();
                    
                } else {
                    toast.error("Error updating Review!", { position: 'top-center' });
                }
            } catch (error) {
                console.error('Error updating review: ', error);
                toast.error("Error Catch updating Review!", { position: 'top-center' });
            } finally {
                await fetchTarget();
                if (RTotal !== "" && RCount !== "") {
                    updateRating();
                }
                onReviewUpdated(); 
            }
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchTarget();
        fetchUserData()
            .then(() => setIsLoading(false))
            .catch((error) => {
                console.error('Error fetching user data:', error);
                setIsLoading(false);
            });
    }, []);

    const fetchUserData = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, "Users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMyUserName(data.Username || "");
                    setMyProfileImg(data.imageUrl || "");
                } else {
                    console.log("User data not found");
                }
            } else {
                console.log("User is not logged in");
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    return (
        <>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            </Helmet>
            <div className={`overlay-card ${closeForm ? 'show' : ''}`}>
                {isLoading ? <Loading /> : (
                    <div className="Xcard_TRadd">
                        <div className="content_TpEdit">
                            <div className="data" style={{ flexDirection: "column", alignItems: "center" }}>
                                <h1>REVIEW</h1>
                                <div id="container">
                                    <h2>{targetUserName}</h2>
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
                                <div className="actionBtn" style={{ justifyContent: "center" }}>
                                    <button onClick={toggleForm}>Cancel</button>
                                    <button onClick={handleUpdateSession}>Update</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
    
}

export default EditReview;
