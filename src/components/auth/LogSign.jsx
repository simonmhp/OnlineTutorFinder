import React, { useState, useEffect } from 'react';
import Web1 from "../IMG/log.svg";
import Web2 from "../IMG/register.svg";
import { Helmet } from "react-helmet";
import "../auth/style.css";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from "./Firebase/Firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { toast } from 'react-toastify';

const Card = ({ children }) => {
  return (
    <div className="card col-10 mx-auto" style={{ borderRadius: '10px', padding: '10px'}}>
      {children}
    </div>
  );
};

const LogSign = () => {
  const [email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [userType, setUserType] = useState("");

  const handleLogin = async (e) =>{
    e.preventDefault();
    try {
      toast.info("Logging in...", { position: 'top-center', autoClose: 1000 });
      await signInWithEmailAndPassword(auth, email, Password);
      toast.success("Login Successful!", { position: 'top-center' });
      fetchUserData();
    } catch (error) {
      toast.error("Login Unsuccessful!", { position: 'bottom-center' });
    }
  };

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserType(userData.userType);
          window.location.href = (userData.userType === "admin") ? "/AProfile" : "/TProfile";
        } else {
          console.log("User data not found");
        }
      } else {
        console.log("User is not logged in");
      }
    });
  };

  const handleRegister = async (e) =>{
    e.preventDefault();
    try {
      toast.info("Registering...", { position: 'top-center', autoClose: 1000 });
      await createUserWithEmailAndPassword(auth, email, Password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          Username: username,
          designation: userType === "Student" ? "Student":"Designation?",
          location: "Location?",
          ReviewCount: 0,
          reviewTotal: 0,
          experience: "0 Yr",
          Rating: 0,
          state: "State?",
          address: "Address?",
          imageUrl: "",
          userType: userType,
          id: user.uid,
          blocked: [],
        });
        await setDoc(doc(db, "userchats", user.uid), {
          chats:[],
        });
      }
      toast.success("Registration Successful!", { position: 'top-center' });
    } catch(error) {
      console.log(error.message);
      toast.error(error.message, { position: 'bottom-center' });
    }
  };

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
    setEmail("");
    setPassword("");
    setUsername("");
  };

  const handleSignInClick = () => {
    setIsSignUpMode(false);
    setEmail("");
    setPassword("");
    setUsername("");
  };

  return (
    <>      
      <Helmet>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"/>
      </Helmet>
      
      <Card className="card col-10">
        <div className={`Zcontainer ${isSignUpMode ? 'sign-up-mode' : ''}`} style={{ borderRadius: '10px', padding: '5px' }}>
          <div className="forms-Zcontainer">
            <div className="signin-signup">
              <form action="#" className="Zsign-in-form">
                <h2 className="title">Sign in</h2>
                <div className="input-field">
                  <i className="fas fa-envelope"></i>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
  
                <div className="input-field">
                  <i className="fas fa-lock"></i>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={Password} 
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <input type="submit" value="Login" className="btn solid" onClick={handleLogin}/>
                {/* Social media icons */}
              </form>
              <form action="#" className="Zsign-up-form">
                <h2 className="title">Sign up</h2>
                <div className="input-field">
                  <i className="fas fa-user"></i>
                  <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <i className="fas fa-envelope"></i>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                <div className="input-field">
                  <i className="fas fa-lock"></i>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={Password} 
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <i className="fas fa-user"></i>
                  <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                    <option value="">Select User Type</option>
                    <option value="Student">Student</option>
                    <option value="Tutor">Tutor</option>
                  </select>
                </div>
                <input type="submit" className="btn" value="Sign up" onClick={handleRegister} />
                {/* Social media icons */}
              </form>
            </div>
          </div>
  
          <div className="panels-Zcontainer">
            <div className="panel left-panel">
              <div className="pcontent">
                <h3>New here ?</h3>
                <p>
                We believe in the power of personalized learning to unlock each student's full potential. 
                </p>
                <button className="btn transparent" id="sign-up-btn" onClick={handleSignUpClick}>
                  Sign up
                </button>
              </div>
              <img src={Web1} className="image" alt="" />
            </div>
            <div className="panel right-panel">
              <div className="pcontent">
                <h3>One of us ?</h3>
                <p>
                Empowering minds, one lesson at a time.
                </p>
                <button className="btn transparent" id="sign-in-btn" onClick={handleSignInClick}>
                  Sign in
                </button>
              </div>
              <img src={Web2} className="image" alt="" />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
  
}

export default LogSign;
