import React, { useState, useEffect } from 'react';
import { auth, db } from '../auth/Firebase/Firebase'; 
import ProfileCard from './TProfileCard';
import TutorCard from './Tutor/Profile'; 
import LoadingAnimation from '../Loading/LoadingSpinner'; 
import { getDoc, doc } from "firebase/firestore";

const App = () => {
  const [userType, setUserType] = useState(null); 
  const [userId, setUserId] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchUserData(user);
      } else {
        setUserType(null);
        setUserId(null);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserData = async (user) => {
    try {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserType(docSnap.data().userType || "");
        setUserId(user.uid);
        setIsLoading(false);
      } else {
        console.log("User data not found");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user document:', error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        userType === 'Student' ? <ProfileCard userId={userId} /> : userType === 'Tutor' ? <TutorCard userId={userId} /> : <h2>User type not found</h2>
      )}
    </div>
  );
};

export default App;
