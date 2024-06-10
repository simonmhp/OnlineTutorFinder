import React, { useEffect, useState } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Chat from "./components/Messaging/Chat";
import Navbar from "./components/Nav/Navbar"
import Profile from "./components/Profile"
import Auth from "./components/auth/LogSign"
import TProfile from "./components/TProfile/Profile"
import AProfile from "./components/admin Model/adminModel"
import SProfile from "./components/TProfile/Student/SProfile"
import ATutor from "./components/admin Model/components/Tutor/Tutor"
import TutorProfile from "./components/TProfile/Tutor/Profile"
import StudentSDPage from "./components/Home/StudentViewToTutorProfile/StudentSessionDetailsPage"
import AStudent from "./components/admin Model/components/Student/StudentElement"
import 'react-toastify/dist/ReactToastify.css';
import { auth } from "./components/auth/Firebase/Firebase";


import { ToastContainer } from "react-toastify";
import { useUserStore } from "./components/auth/Firebase/userStore";
import { useChatStore } from "./components/auth/Firebase/chatStore";

const App = () => {
    
    const [user, setUser] = useState();
    const {currentUser, isLoading, fetchUserInfo} = useUserStore();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        setUser(user);
        if (user) {
          fetchUserInfo(user.uid);
        }
      });
      return () => unsubscribe();
    }, [fetchUserInfo]);

    // console.log("current User:", user);

    // if (isLoading) return <div className="loading">Loading...</div>

    return (
      <>
        <Navbar />
        <div className="App">
          <div className="auth-wrapper">
            <div className="auth-inner">
              <Routes>
                {/* to stay logged in  */}
                {/* <Route exact="true" path="/" element={user ? <Navigate to = "Home /" /> : <LogSign />} /> */}
                <Route exact="true" path="/" element={<Home />} />
                <Route exact="true" path="/" element={<Home />} />
                <Route exact="true" path="/Profile" element={<Profile />} />
                <Route exact="true" path="/chat" element={<Chat />} />
                <Route exact="true" path="/about" element={<About />} />
                <Route exact="true" path="/auth" element={<Auth />} />
                <Route exact="true" path="/TProfile" element={<TProfile />} />
                <Route exact="true" path="/TutorProfile" element={<TutorProfile />} />
                <Route exact="true" path="/AStudent/:studentId" element={<AStudent />} />
                <Route exact="true" path="/AProfile" element={<AProfile />} />
                <Route path="/SProfile/:uid" element={<SProfile />} />
                <Route path="/ATutor/:uid" element={<ATutor />} />
                <Route path="/student-session-details/:userId" element={<StudentSDPage />} />
              </Routes>
              <ToastContainer position="top-center" />
            </div>
          </div>
        </div>
      </>
    );
  };

export default App;
