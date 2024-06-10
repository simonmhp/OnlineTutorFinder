import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import './Style.css';
import Web1 from "../../IMG/log.svg";
import { db } from "../../auth/Firebase/Firebase";
import Loading from '../../Loading/LoadingSpinner';
import { getDoc, doc } from "firebase/firestore";
// import '../editSSTyle.css';
import { useParams } from 'react-router-dom';
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import TPEdit from "../Edit/Profile/Tutor/TPEdit";
import SDetails from './SDetails';

const storage = getStorage();

function SProfile() {
    const { uid } = useParams(); 
    const [showEdit, setShowEdit] = useState(false); 
    const [userDetails, setUserData] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [DetailReady, setDetailReady] = useState(false); 

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(db, "Users", uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserData(userData);
                    if (userData.imageUrl) {
                        const imageRef = ref(storage, userData.imageUrl);
                        const imageUrl = await getDownloadURL(imageRef);
                        setImageUri(imageUrl);
                    }
                } else {
                    console.error("User not found");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [uid]);

    return (
        <div className="Tp-main">
            <div className="d-flex align-items-center justify-content-center order-lg-1">
                <div className="card col-10 mx-auto d-flex align-items-center justify-content-center" 
                    style={{ margin: '20px auto', paddingTop: '60px', paddingBottom: '20px',paddingLeft: '20px', paddingRight:'20px' }}>
                    <div className="Scard-Tp col-10">
                        <div className="imgBx"> 
                            {imageUri ? (
                                <img src={imageUri} alt="Profile" />
                            ) : (
                                <img src={Web1} alt="Default Profile" />
                            )}
                        </div>
                        <div className="content">
                            <div className="details">
                                <h2>
                                    {userDetails && userDetails.Username}
                                    <br/><span>{userDetails && userDetails.designation}</span><br/><span>{userDetails && userDetails.location}</span>
                                </h2>
                                <div className="data">
                                    <h3>{userDetails && userDetails.experience}<br/><span>Experience</span></h3>
                                    <h3>{userDetails && userDetails.ReviewCount}<br/><span>Reviews</span></h3>
                                    <h3>{userDetails && userDetails.Rating}<br/><span>Rating</span></h3>
                                </div>
                                <h2><span>{userDetails && userDetails.email}</span></h2>
                                {userDetails && userDetails.address === "Address?" ? (
                                    <h2><span>{userDetails.address} <br /> <br /> </span> </h2>
                                ) : (
                                    <h2><span>{userDetails && userDetails.address}</span></h2>
                                )}
                                <br/>
                            </div>
                        </div>
                    </div>
                    <div>
                        <SDetails contentReady={setDetailReady}/>
                    </div>
                </div>
            </div>
            {/* Render TPEdit component based on state */}
            {showEdit && <TPEdit />}
        </div>
    );
}

export default SProfile;
