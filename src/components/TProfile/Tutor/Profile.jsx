import React, { useEffect, useState } from "react";
import { auth, db } from "../../auth/Firebase/Firebase";
import { getDoc, doc } from "firebase/firestore";
import { toast } from 'react-toastify';
import Web1 from "../../IMG/log.svg";
import TPEdit from "../../TProfile/Edit/Profile/Tutor/TPEdit";
import TPDetails from '../../TProfile/TPDetails';
import Loading from '../../Loading/LoadingSpinner';
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import './Style.css'

const storage = getStorage();

const TProfileCard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [showEdit, setShowEdit] = useState(false); 
  const [DetailReady, setDetailReady] = useState(false); 
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleEdit = () => {
    setShowEdit(!showEdit);
  };

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) { // Check if user is not null
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          if (docSnap.data().imageUrl) {
            const imageRef = ref(storage, docSnap.data().imageUrl);
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

  const refreshUserData = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/";
      console.log("User logged out successfully!");
    } catch (error) {
      toast.success("Error logging out:", error.message,{position: 'bottom-center',});
      console.error("Error logging out:", error.message);
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
          <div className="Xcard-Tp col-10">
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
                <div className="actionBtn">
                  <button onClick={handleLogout}>LogOut!</button>
                  <button onClick={toggleEdit}>Edit</button>
                </div>
              </div>
            </div>
          </div>
          <div className="card-Tp-footer " style={{ marginLeft: 'auto', marginRight: 0 }}>
              {userDetails.userType === "Student" ? (
                <h6>Update Your Student Profile...</h6>
              ) : (
                <h6>Update Your Tutor Profile to Add Sessions...</h6>
              )}
            </div>
          <div>
            <TPDetails contentReady={setDetailReady}/>
          </div>
        </div>
      </div>
      {/* Render TPEdit component based on state */}
      {showEdit && <TPEdit onClose={refreshUserData} />}
    </div>
  );
};

export default TProfileCard;
