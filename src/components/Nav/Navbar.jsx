import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { auth, db } from "../auth/Firebase/Firebase";
import { getDoc, doc } from "firebase/firestore";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoggedIn(true);
        fetchUserData(user.uid);
      } else {
        setIsLoggedIn(false);
        setUserDetails(null); // Reset user details when logged out
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const docRef = doc(db, "Users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
      } else {
        console.log("User data not found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  };

  return (
    <div className="container-fluid nav_bg">
      <div className='row'>
        <div className="col-10 mx-auto">
          <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
              <NavLink className="navbar-brand" to="/">Online Tutor Finder</NavLink>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              {isLoggedIn && (
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                  <ul className="navbar-nav ml-auto" style={{ marginLeft: 'auto', marginRight: 0 }}>
                    <li className="nav-item" >
                      <NavLink activeClassName='menu_active' exact={true} className="nav-link" to="/">Home</NavLink>
                    </li>
                    {userDetails && (
                      <li className="nav-item">
                        <NavLink activeClassName='menu_active' className="nav-link" to={userDetails.userType === 'admin' ? "/AProfile" : "/TProfile"}>{userDetails.userType === 'admin' ? 'Admin Profile' : 'Profile'}</NavLink>
                      </li>
                    )}
                      {userDetails && userDetails.userType !== "admin" && (
                        <li className="nav-item">
                          <NavLink activeClassName='menu_active' className="nav-link" to="/Chat">Chat</NavLink>
                        </li>
                      )}
                    {userDetails && userDetails.userType !== 'admin' && (
                      <li className="nav-item">
                        <NavLink activeClassName='menu_active' className="nav-link" to="/About">About</NavLink>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar;