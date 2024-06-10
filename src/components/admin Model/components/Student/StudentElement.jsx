import React, { useEffect, useState } from "react";
import { db } from "../../../auth/Firebase/Firebase";
import { getDoc, doc } from "firebase/firestore";
import { toast } from 'react-toastify';
import Web1 from "../../../IMG/log.svg";
import '../../../TProfile/Style/TPStyle.css';
import TPEdit from "../../../TProfile/Edit/Profile/Tutor/TPEdit";
import TPDetails from './Details';
import Loading from '../../../Loading/LoadingSpinner';
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import { useParams } from "react-router-dom";
import './Style.css'

const storage = getStorage();

const StudentComponent = () => {
  const { studentId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [showEdit, setShowEdit] = useState(false); 
  const [DetailReady, setDetailReady] = useState(false); 
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleEdit = () => {
    setShowEdit(!showEdit);
  };

  const fetchUserData = async () => {
    console.log("studentId:",studentId)
    try {
      const userDoc = await getDoc(doc(db, "Users", studentId));
      if (userDoc.exists()) {
        setUserDetails(userDoc.data());
        if (userDoc.data().imageUrl) {
          const imageRef = ref(storage, userDoc.data().imageUrl);
          const imageUrl = await getDownloadURL(imageRef);
          setImageUri(imageUrl);
        }
      } else {
        console.log("User data not found");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error fetching user data: " + error.message);
    }
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, [studentId]);

  async function handleLogout() {
    try {
      // Handle logout logic
    } catch (error) {
      // Handle error
    }
  }

  if (isLoading || DetailReady){
    return <Loading />;
  }

  return (
    <div className="Tp-main">
      <div className="d-flex align-items-center justify-content-center order-lg-1">
        <div className="card col-10 mx-auto d-flex align-items-center justify-content-center" 
          style={{ margin: '20px auto', paddingTop: '60px', paddingBottom: '20px',paddingLeft: '20px', paddingRight:'20px' }}>
          <div className="card-Tp col-10">
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
                  {userDetails.Username}
                  <br/><span>{userDetails.designation}</span><br/><span>{userDetails.location}</span>
                </h2>
                <div className="data">
                  <h3>{userDetails.experience}<br/><span>Experience</span></h3>
                  <h3>{userDetails.ReviewCount}<br/><span>Reviews</span></h3>
                  <h3>{userDetails.Rating}<br/><span>Rating</span></h3>
                </div>
                <h2><span>{userDetails.email}</span></h2>
                {userDetails.address === "Address?" ? (
                <h2><span>{userDetails.address} <br /> <br /> </span> </h2>
                
                ) : (
                <h2><span>{userDetails.address}</span></h2>
              )}
                <br/>
              </div>
            </div>
          </div>
          <div>
            <TPDetails contentReady={setDetailReady} usid={studentId}/>
          </div>
        </div>
      </div>
      {/* Render TPEdit component based on state */}
      {showEdit && <TPEdit onClose={refreshUserData} />}
    </div>
  );
};

export default StudentComponent;
