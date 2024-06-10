import React ,{ useEffect, useState } from "react";
import { auth, db } from "./auth/Firebase/Firebase";
import { getDoc, doc } from "firebase/firestore";
import { toast } from 'react-toastify';
import Loading from '../components/Loading/Loading';

const Profile = () =>{

    const [userDetails, setUserDetails] = useState(null);

    const fetchUserData = async () => {
        auth.onAuthStateChanged(async (user) => {
          if (user) { 
            console.log(user);
            const docRef = doc(db, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserDetails(docSnap.data());
              console.log(docSnap.data());
            } else {
              console.log("User data not found");
            }
          } else {
            console.log("User is not logged in");
          }
        });
      };
    useEffect(() => {
      fetchUserData();
    }, []);
  
    async function handleLogout() {
      try {
        // toast.success("Logging Out!",{position: 'bottom-center',});
        await auth.signOut();
        window.location.href = "/";
        console.log("User logged out successfully!");
        // toast.success("User logged out successfully!",{position: 'bottom-center',});
      } catch (error) {
        toast.success("Error logging out:", error.message,{position: 'bottom-center',});
        console.error("Error logging out:", error.message);
      }
    }

    return (
      <div>
        {userDetails ? (
          <>
            <h3>Welcome {userDetails.Username} 🙏🙏</h3>
            <div>
              <p>Email: {userDetails.email}</p>
            </div>
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Loading />
        )}
      </div>
    );
};

export default Profile;