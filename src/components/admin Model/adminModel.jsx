import React, { useEffect, useState } from "react";
import { auth, db } from "../auth/Firebase/Firebase";
import { getDoc, doc } from "firebase/firestore";
import { toast } from 'react-toastify';
import Web1 from "../IMG/admin bj.jpg";
import Loading from '../Loading/LoadingSpinner';
import './Style.css';
import StudentList from './List/StudentsList';
import TutorList from './List/TutorList';
import FeedbackList from './List/feedbackList';
import { ref, getDownloadURL, getStorage } from "firebase/storage";

const storage = getStorage();

const TProfileCard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUri, setImageUri] = useState(null);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserDetails(userData);
          if (userData.imageUrl) {
            const imageRef = ref(storage, userData.imageUrl);
            const imageUrl = await getDownloadURL(imageRef);
            setImageUri(imageUrl);
          }
        } else {
          console.log("User data not found");
        }
        setIsLoading(false);
      } else {
        console.log("User is not logged in");
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/";
      console.log("User logged out successfully!");
    } catch (error) {
      toast.error(`Error logging out: ${error.message}`, { position: 'bottom-center' });
      console.error("Error logging out:", error.message);
    }
  };

  const toggleEdit = () => {
    setShowEdit(!showEdit);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="Tp-main">
      <div className="d-flex align-items-center justify-content-center order-lg-1">
        <div className="card col-10 mx-auto d-flex align-items-center justify-content-center" 
          style={{ margin: '20px auto', paddingTop: '60px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px' }}>
          <div className="card-A col-10">
            <div className="imgBx"> 
              <img src={imageUri || Web1} alt="Profile" />
            </div>
            <div className="content">
              <div className="details">
                <h2>{userDetails.Username}</h2>
                <h2><span>{userDetails.email}</span></h2>
                <br/>
                <div className="CancelBtn">
                  <button onClick={handleLogout}>Log Out</button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <StudentList />
            <TutorList />
            <FeedbackList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TProfileCard;
