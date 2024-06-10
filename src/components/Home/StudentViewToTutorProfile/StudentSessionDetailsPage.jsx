import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { auth, db } from "../../auth/Firebase/Firebase";
import { 
  getDocs, getDoc, doc, collection, where, query, 
  setDoc, serverTimestamp, updateDoc, arrayUnion, writeBatch 
} from "firebase/firestore";
import { ref, getDownloadURL, getStorage } from "firebase/storage"; 
import Web from "../../IMG/log.svg";
// import '../TProfile/TPStyle.css';
import TPshow from '../../TProfile/TPshow';
import AddReview from "../../TProfile/Review/Add/AddReview";
import { useUserStore } from "../../auth/Firebase/userStore";
import '../Style/Style.css';

const storage = getStorage();

const StudentSessionDetailsPage = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();
  const location = useLocation();
  const sessionData = location.state?.sessionData;
  const { userId } = useParams();
  const [imageUri, setImageUri] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [showReview, setshowAddReview] = useState(false);
  const [refreshTPshow, setRefreshTPshow] = useState(false);  // State variable to trigger refresh

  const toggleEdit = () => {
    setshowAddReview(!showReview);
  };

  const handleChat = async (e) => {
    e.preventDefault();
  
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");
  
    try {
      // Querying user details
      const userRef = collection(db, "Users");
      const q = query(userRef, where("id", "==", userDetails.id));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log("User data:", userData);
  
        // Query to check if chat already exists between the users
        const chatExistsQuery = query(
          chatRef,
          where("users", "array-contains-any", [currentUser.id, userDetails.id])
        );
        const chatExistsSnapshot = await getDocs(chatExistsQuery);
  
        let chatExists = false;
        chatExistsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.users.includes(currentUser.id) && data.users.includes(userDetails.id)) {
            chatExists = true;
          }
        });
  
        if (chatExists) {
          alert("Chat link Create... Navigate to your chat section.");
          console.log("Chat already exists between the users");
          return;
        }
  
        // Creating a new chat document
        const newChatRef = doc(chatRef);
        await setDoc(newChatRef, {
          createdAt: serverTimestamp(),
          messages: [],
          users: [currentUser.id, userDetails.id], // Store user IDs in the chat document
        });
  
        // Updating user chat lists
        const currentUserChatRef = doc(userChatRef, currentUser.id);
        const userChatRefToUpdate = doc(userChatRef, userDetails.id);
  
        // Batched writes to ensure atomicity
        const batch = writeBatch(db);
        batch.update(currentUserChatRef, {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: userDetails.id,
            updatedAt: Date.now(),
          }),
        });
        batch.update(userChatRefToUpdate, {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: currentUser.id,
            updatedAt: Date.now(),
          }),
        });
        await batch.commit();
  
        console.log("Chat created and user chat lists updated successfully");
        alert("Chat link Create... Navigate to your chat section.");
      } else {
        console.log("No user found with the provided ID");
      }
    } catch (error) {
      console.error("Error handling chat:", error);
    }
  };
  

  const handleClose = () => {
    fetchUserData();
    setshowAddReview(false);
    setRefreshTPshow(!refreshTPshow);  // Trigger TPshow refresh
  };

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      setAuthenticatedUser(user);
      if (user) {
        const docRef = doc(db, "Users", userId);
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
      } else {
        console.log("User is not logged in");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (userDetails) {
      console.log("userid:", userDetails.id);
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchUserData();
    });

    return () => {
      unsubscribe();
      setAuthenticatedUser(null);
    };
  }, [userId]);

  useEffect(() => {
    // Refresh TPshow when refreshTPshow state changes
  }, [refreshTPshow, userDetails]);

  return (
    <div>
      {userDetails ? (
        <div className="Tp-main">
          <div className="d-flex align-items-center justify-content-center order-lg-1">
            <div className="card col-10 mx-auto d-flex align-items-center justify-content-center" 
              style={{ margin: '20px auto', paddingTop: '60px', paddingBottom: '20px',paddingLeft: '20px', paddingRight:'20px' }}>
                
              <div className="Ocard-Tp col-10">
                <div className="imgBx"> 
                  {imageUri ? (
                    <img src={imageUri} alt="Profile" />
                  ) : (
                    <img src={Web} alt="Default Profile" />
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
                    <div className="SactionBtn">
                      <button onClick={handleChat}>Message Me</button>
                      <button onClick={toggleEdit}>Add Review</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="Ocard-Tp-footer " style={{ marginLeft: 'auto', marginRight: 0 }}>
                <h6>Update Your Profile to attract Students...</h6>
              </div>
              <div>
                {authenticatedUser && userDetails && authenticatedUser.uid !== userId && 
                  <TPshow key={refreshTPshow} targetId={userDetails.id} />
                }
              </div>
            </div>
          </div>

          {showReview && <AddReview onClose={handleClose} userId={userId} username={userDetails.Username} targetProfileImg={userDetails.imageUrl}
                          targetId={userDetails.id} RTotal = {userDetails.ReviewTotal} RCount = {userDetails.ReviewCount}/>}
        </div>
      ) : (
        <p>Loading session details...</p>
      )}
    </div>
  );
};

export default StudentSessionDetailsPage;
