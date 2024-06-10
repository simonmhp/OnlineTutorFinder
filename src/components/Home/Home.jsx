import React, { useState, useEffect } from "react";
import Web from "../IMG/Home.jpeg";
import { Helmet } from 'react-helmet';
import './HomeStyle.css';
import { NavLink } from "react-router-dom";
import '../TProfile/Style/TPStyle.css';
import { auth, db } from '../auth/Firebase/Firebase';
import { getDoc, doc } from "firebase/firestore";
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import LoadingSpinner from '../Loading/LoadingSpinner'; 
import Filter from "./filter/filter";
const storage = getStorage();

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editReviewId, setEditReviewId] = useState(null); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoggedIn(true);
        // Retrieve userType from Firestore
        const fetchUserType = async () => {
          try {
            const docRef = doc(db, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserType(docSnap.data().userType || "");
            } else {
              console.log("User data not found");
            }
          } catch (error) {
            console.error('Error fetching user document:', error);
          }
        };
        fetchUserType();
      } else {
        setIsLoggedIn(false);
        setUserType(null);
      }
    });

    const fetchSessions = async () => {
      try {
        const response = await fetch('https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/sessions.json');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const sessionsData = await response.json();
        if (sessionsData) {
          const sessionsArray = Object.entries(sessionsData).map(([id, data]) => ({ id, ...data }));
          // Initialize an array to store promises for downloading user photos
          const downloadPromises = sessionsArray.map(async (session) => {
            if (session.UserPhoto) {
              try {
                const imageUrl = await getDownloadURL(ref(storage, session.UserPhoto));
                return { ...session, imageUrl }; // Merge the imageUrl with the session object
              } catch (error) {
                console.error('Error downloading image:', error);
                return session;
              }
            } else {
              return session;
            }
          });
          // Wait for all download promises to resolve
          const sessionsWithImages = await Promise.all(downloadPromises);
          setSessions(sessionsWithImages);
          setFilteredSessions(sessionsWithImages); // Initialize filtered sessions with all sessions
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchSessions();

    return unsubscribe;
  }, []);

  // Function to filter sessions based on search query
  const filterSessions = (query) => {
    const lowerQuery = query.toLowerCase();
    const filtered = sessions.filter(session => {
      return (
        (session.sessionType && session.sessionType.toLowerCase().includes(lowerQuery)) ||
        (session.subject && session.subject.toLowerCase().includes(lowerQuery)) ||
        (session.location && session.location.toLowerCase().includes(lowerQuery)) ||
        (session.state && session.state.toLowerCase().includes(lowerQuery)) ||
        (session.Username && session.Username.toLowerCase().includes(lowerQuery)) ||
        false
      );
    });
    setFilteredSessions(filtered); // Update filtered sessions state
  };
  

  const fetchsessionTarget = async (userId) => {
    try {
      const userDocRef = doc(db, "Users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        console.log("User data not found");
        return null;
      }
    } catch (error) {
      console.error('Error fetching user document:', error);
      return null;
    }
  };

  const updateSessionsWithUsernames = async (sessions) => {
    const updatedSessions = await Promise.all(sessions.map(async (session) => {
      const userData = await fetchsessionTarget(session.userId);
      return {
        ...session,
        Username: userData ? userData.Username : session.Username,
        rating: userData ? userData.Rating : "" ,
        imageUrl: userData ? userData.imageUrl : session.imageUrl,
        location: userData ? userData.location : session.location,
        state: userData ? userData.state : session.state,
      };
    }));
    setFilteredSessions(updatedSessions);
  };

  useEffect(() => {
    if (sessions.length > 0) {
      updateSessionsWithUsernames(sessions);
    }
  }, [sessions]);

  if (loading) {
    return <LoadingSpinner />; // Show loading spinner while loading
  }
  
  const handleEditReview = () => {
    setEditReviewId("True"); 
  };

  const handleClose = () => {
    setEditReviewId(null); 
  };

  const handleApplyFilters = (filters) => {
    // Destructure the filter parameters
    const { location, state, subject, cost, rating, days, sessionType } = filters;
  
    // Filter sessions based on the filter criteria
    const filtered = sessions.filter(session => {
      // Check if session matches each filter criteria
      const matchesLocation = location ? session.location.toLowerCase().includes(location.toLowerCase()) : true;
      const matchesState = state ? session.state.toLowerCase().includes(state.toLowerCase()) : true;
      const matchesSubject = subject ? session.subject.toLowerCase().includes(subject.toLowerCase()) : true;
      const matchesCost = cost ? session.cost.toLowerCase().includes(cost.toLowerCase()) : true;
      const matchesRating = rating ? session.rating.toLowerCase().includes(rating.toLowerCase()) : true;
      const matchesSessionType = sessionType ? session.sessionType.toLowerCase() === sessionType.toLowerCase() : true;
      const matchesDays = days.length === 0 ? true : days.some(day => session.days.includes(day));
  
      // Return true if session matches all filter criteria
      return matchesLocation && matchesState && matchesSubject && matchesCost && matchesRating && matchesSessionType && matchesDays;
    });
  
    // Update the filtered sessions state
    setFilteredSessions(filtered);
  };

  return (
    <>
      <Helmet>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"/>
      </Helmet>
      {editReviewId  && (
        <Filter 
        onClose={handleClose} 
        onApplyFilters={handleApplyFilters} 
        />
      )}
      {isLoggedIn && userType === 'Student' && (
        // Student layout
        <div className="student-layout">
          <div className="Tp-main">
            <div className="d-flex align-items-center justify-content-center order-lg-1">
              <div className="card col-10 mx-auto">
                <div className="Hcard-header">
                  <div className="filter">
                    <button onClick={() => handleEditReview()}>Filter</button>
                  </div>
                  <div className="box">
                    <input type="text" placeholder="Search..." onChange={(e) => filterSessions(e.target.value)} />
                    <a href="#">
                      <i className="fas fa-search"></i>
                    </a>
                  </div>
                </div>
                <div className="card-body">
                  <div id="HomeContainer" className="tpcontainer-column">
                    {filteredSessions.map(session => (
                      <NavLink
                        key={session.id}
                        to={{
                          pathname: `/student-session-details/${session.userId}`,
                          state: { sessionData: session }
                        }}
                        style={{ textDecoration: 'none' }}>
                        <div className="HSsession-card">
                          {/* Session details */}
                          <strong>{session.sessionType} Session </strong>
                          <div className="Hsheader">
                            <p>{session.location}, {session.state}</p>
                          </div>
                          <hr className="divider" />
                          <div className="row">
                            <div className="col-md-8">
                              <div className="Hsessionimage hscard text-center"> 
                                {session.imageUrl ? (
                                  <img src={session.imageUrl} alt="Session Image" className="hscard-img-top cardhomesessionimg" />
                                ) : (
                                  <img src={Web} alt="Default Profile" className="hscard-img-top cardhomesessionimg" />
                                )}
                              </div>
                              <p style={{ marginTop: "15px",marginLeft: "10px" }}>
                                  <strong>{session.Username}</strong>
                                  <br />
                                  <span className="review-stars">
                                    {Number.isFinite(parseFloat(session.rating)) ? (
                                      <>
                                        {[...Array(Math.floor(parseFloat(session.rating)))].map((_, index) => (
                                          <i key={index} className="fas fa-star"></i>
                                        ))}
                                        {[...Array(5 - Math.floor(parseFloat(session.rating)))].map((_, index) => (
                                          <i key={index} className="far fa-star"></i>
                                        ))}
                                      </>
                                    ) : (
                                      <span>No rating available</span>
                                    )}
                                  </span>
                                </p>

                            </div>
                            <div className="col-md-4">
                              <div className="hsessiondata">
                                <p><strong>Time:</strong> {session.time} <strong>Duration:</strong> {session.duration}</p>
                                <p><strong>Session Type:</strong> {session.sessionType}</p>
                                <p><strong>Subject:</strong> {session.subject} <strong>Cost:</strong> {session.cost}</p>
                                {(session.seats && session.seats !== "") && <p>Seats: <strong style={{color: "red"}}>{session.seats}</strong></p>}
                                <p><strong>Description:</strong> {session.description}</p>
                              </div>
                            </div>
                          </div>
                          <hr className="divider" />
                          <strong>Days:</strong>
                          <div className="days-row">
                            <p>{session.days.join(', ')}</p> {/* Join days with comma */}
                          </div>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                </div>
                <div className="card-footer">
                  {/* Your card footer content */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isLoggedIn && (userType === 'Tutor' || userType === "admin") && (
        // Tutor layout
        <div className="Tp-main">
          <div className="d-flex align-items-center justify-content-center order-lg-1">
            <div className="card col-10 mx-auto">
              <div className="Hcard-header">
                <div className="filter">
                  <button onClick={() => handleEditReview()}>Filter</button>
                </div>
                <div className="box">
                  <input type="text" placeholder="Search..." onChange={(e) => filterSessions(e.target.value)} />
                  <a href="#">
                    <i className="fas fa-search"></i>
                  </a>
                </div>
              </div>
              <div className="card-body">
                <div id="HomeContainer" className="tpcontainer-column">
                  {filteredSessions.map(session => (
                    <div key={session.id} className="Hsession-card"> 
                      {/* Session details */}
                      <strong>{session.sessionType} Session </strong>
                      <div className="Hsheader">
                        <p>{session.location}, {session.state}</p>
                      </div>
                      <hr className="divider" />
                      <div className="row">
                        <div className="col-md-8">
                          <div className="Hsessionimage hscard text-center"> {/* Add text-center class */}
                            <img src={Web} alt="Session Image" className="hscard-img-top cardhomesessionimg" />
                          </div>
                          <p style={{ marginLeft: "10px" }}><strong>{session.Username}</strong>
                          <br />
                              <span className="review-stars">
                                {Number.isFinite(parseFloat(session.rating)) ? (
                                  <>
                                    {[...Array(Math.floor(parseFloat(session.rating)))].map((_, index) => (
                                      <i key={index} className="fas fa-star"></i>
                                    ))}
                                    {[...Array(5 - Math.floor(parseFloat(session.rating)))].map((_, index) => (
                                      <i key={index} className="far fa-star"></i>
                                    ))}
                                  </>
                                ) : (
                                  <span>No rating available</span>
                                )}
                              </span>
                              </p>
                        </div>
                        <div className="col-md-4">
                          <div className="hsessiondata">
                            <p><strong>Time:</strong> {session.time} <strong>Duration:</strong> {session.duration}</p>
                            <p><strong>Session Type:</strong> {session.sessionType}</p>
                            <p><strong>Subject:</strong> {session.subject} <strong>Cost:</strong> {session.cost}</p>
                            
                            <p><strong>Description:</strong> {session.description}</p>
                          </div>
                        </div>
                      </div>
                      <hr className="divider" />
                      <strong>Days:</strong>
                      <div className="days-row">
                        <p>{session.days.join(', ')}</p> {/* Join days with comma */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer">
                {/* Your card footer content */}
              </div>
            </div>
          </div>
        </div>
      )}
      {!isLoggedIn && (
        // Not logged in layout
        <section id="header" className="d-flex align-items-center">
          <div className="container-fluid nav_bg">
            <div className="row">
              <div className="col-10 mx-auto">
                <div className="row">
                  <div className="col-md-6 pt-5 pt-lg-0 order-2 order-lg-1 d-flex justify-content-center flex-column" >
                    <h1 style={{color: "white"}}>
                      Grow Your Minds with{" "}
                      <strong className="brand-name">OTF</strong>
                    </h1>
                    <h2 className="my-3" style={{color: "white"}}>
                      We are the team of talented Individuals.
                    </h2>
                    <h2 className="mt-3">
                      <NavLink
                        to="/auth"
                        className="btn-get-started "
                      >
                        Get Started
                      </NavLink>
                    </h2>
                  </div>
                  <div className="col-lg-6 order-1 order-lg-2 header-img">
                    <img
                      src={Web}
                      className="img-fluid animated"
                      style={{borderRadius: "10px"}}
                      alt="home.png"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
