import React, { useState, useEffect } from 'react';
import './SEditStyle.css';
import { Helmet } from 'react-helmet';
import { auth, db } from "../../../../auth/Firebase/Firebase";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { toast } from 'react-toastify';
import Loading from '../../../../Loading/Loading';
import { imageDb } from '../../../../auth/Firebase/Firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import Web1 from "../../../../IMG/log.svg";
import { getStorage } from "firebase/storage";

const storage = getStorage();

const TPSEdit = ({ onClose }) => {
    const [userDetails, setUserDetails] = useState(null);
    const [experience, setExperience] = useState("");
    const [location, setLocation] = useState("");
    const [state, setState] = useState("");
    const [address, setAddress] = useState("");
    const [designation , setDesignation] = useState("");
    const [closeForm, setCloseForm] = useState(true); 
    const [isLoading, setIsLoading] = useState(true);
    const [img, setImg] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    // Function to toggle form visibility
    const toggleForm = () => {
        setCloseForm(!closeForm);
        onClose();
    };

    const handleUpdate = async () => {
            try {
                console.log("check2: Pass:",state);
                const user = auth.currentUser;
                setIsLoading(true);
        
                if (user) {
                    // First, handle the image upload and get the download URL
                    const downloadURL = await handleImgClick();
        
                    // Once the image upload is successful, update the user profile information along with the image reference
                    const userDocRef = doc(db, "Users", user.uid);
                    await setDoc(userDocRef, {
                        designation: designation,
                        location: location,
                        address: address,
                        experience: experience,
                        state: state,
                        imageUrl: downloadURL || "",
                    }, { merge: true });
        
                    console.log("User Profile Updated!");
                    toast.success("User Profile Updated!", { position: 'top-center' });
                }
            } catch (error) {
                console.error(error.message);
                toast.error(error.message, { position: "bottom-center" });
            } finally {
                setIsLoading(false); // Hide loading overlay
            }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Set loading state to true initially
            
            try {
                const user = auth.currentUser;
                if (user) {
                    const docRef = doc(db, "Users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserDetails(docSnap.data());
                        setExperience(docSnap.data().experience || "");
                        setLocation(docSnap.data().location || "");
                        setState(docSnap.data().state || "");
                        setAddress(docSnap.data().address || "");
                        setDesignation(docSnap.data().designation || "");
                        if (docSnap.data().imageUrl) {
                            const imageRef = ref(storage, docSnap.data().imageUrl);
                            const imageUrl = await getDownloadURL(imageRef);
                            setImageUri(imageUrl);
                        }
                    } else {
                        console.log("User data not found");
                        throw new Error("User data not found");
                    }
                } else {
                    console.log("User is not logged in");
                    throw new Error("User is not logged in");
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error("Error fetching user data", { position: "bottom-center" });
            } finally {
                setIsLoading(false); // Set isLoading to false after fetching data
            }
        };
    
        fetchData();
    }, []);

    const fetchUserData = async () => {
        return new Promise((resolve, reject) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const docRef = doc(db, "Users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserDetails(docSnap.data());
                        // Set state with user details
                        setExperience(docSnap.data().experience || ""); // Set experience state with userDetails.experience
                        setLocation(docSnap.data().location || "");
                        setState(docSnap.data().state || "");
                        setAddress(docSnap.data().address || "");
                        setDesignation(docSnap.data().designation || "");
                        if (docSnap.data().imageUrl) {
                            const imageRef = ref(storage, docSnap.data().imageUrl);
                            const imageUrl = await getDownloadURL(imageRef);
                            setImageUri(imageUrl);
                          }
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

    if (!userDetails) {
        return <h2>Error...</h2>; // Display loading message until user details are fetched
    }

    const handleImgChange = (e) => {
        setImg(e.target.files[0]); // Update the img state with the selected image file
    };

    const handleImgClick = async () => {
        if (!img) return; // Do nothing if no image is selected
        const imgRef = ref(imageDb, `files/${v4()}`);
        await uploadBytes(imgRef, img);
        const downloadURL = await getDownloadURL(imgRef); // Get the download URL of the uploaded image
        return downloadURL;
    };

    return (
        <>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"/>
            </Helmet>
            
            <div className={`overlay-card ${closeForm ? 'show' : ''}`}>
                {isLoading ? <Loading /> : (
                    <div className="card_TPEdit">
                        <div className="imgBx">
                            {/* Render the image preview based on the selected file */}
                            {img ? (
                                <img src={URL.createObjectURL(img)} alt="Home" />
                            ) : imageUri ? (
                                <img src={imageUri} alt="Home" />
                            ) : (
                                <img src={Web1} alt="Home" />
                            )}
                        </div>
                        <div className="content_TpEdit">
                        <div className="details">
                            <div className="ImgBtn">
                                <input type="file" onChange={(e)=> setImg(e.target.files[0])} />
                                {/* <button onClick={handleImgClick}>Img?</button> */}
                            </div>
                            <form action="#" className="TP-edit">
                                <i className="fas fa-times-circle cancel-icon" onClick={toggleForm}></i> {/* Cancel icon */}
                                <h2 className="title">Update Details</h2>
                                <div className="input-field">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <select value={location} onChange={(e) => setLocation(e.target.value)}>
                                        <option value="" disabled selected>Location?</option>
                                        <option value="Allahabad">Allahabad</option>
                                        <option value="New Delhi">New Delhi</option>
                                        <option value="Old Delhi">Old Delhi</option>
                                        <option value="Deheradun">Deheradun</option>
                                        <option value="Greater Noida">Greater Noida</option>
                                        <option value="Varanasi">Varanasi</option>
                                        <option value="Jaipur">Jaipur</option>
                                    </select>
                                </div>

                                <div className="input-field">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <select value={state} onChange={(e) => setState(e.target.value)}>
                                        <option value="" disabled selected>State?</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Uttrakhand">Uttrakhand</option>
                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                        <option value="Rajasthan">Rajasthan</option>
                                    </select>
                                </div>
                                <div className="input-field">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <textarea
                                        placeholder="Address?"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)} />
                                </div>
                            </form>
                            <div className="SubmitBtn" style={{ paddingTop: '10px' }}>
                                <button onClick={handleUpdate}>Confirm?</button>
                            </div>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </>
    );
    
};

export default TPSEdit;
