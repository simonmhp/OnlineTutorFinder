import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { db } from "../auth/Firebase/Firebase";
import Loading from '../Loading/Loading';
import { getDoc, doc } from "firebase/firestore";
import './Edit/Profile/StudentProfile/editSSTyle.css';
import { useNavigate } from 'react-router-dom'; 
import { 
    getDocs, collection, where, query, 
    setDoc, serverTimestamp, updateDoc, arrayUnion, writeBatch 
} from "firebase/firestore";
import { toast } from 'react-toastify';
import { useUserStore } from '../auth/Firebase/userStore';

function ShowNotifications({ onClose, session, sessionId, RequestID, Subject, Time }) {
    const [closeForm, setCloseForm] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [usernames, setUsernames] = useState([]);
    const { currentUser } = useUserStore();
    const [selectedUserUid, setSelectedUserUid] = useState(null);
    const navigate = useNavigate();

    const toggleForm = () => {
        setCloseForm(!closeForm);
        onClose();
    };

    useEffect(() => {
        const fetchUsernames = async () => {
            if (Array.isArray(RequestID) && RequestID.length > 0) {
                const usernamePromises = RequestID.map(async uid => {
                    try {
                        const userDoc = await getDoc(doc(db, "Users", uid));
                        if (userDoc.exists()) {
                            return { uid, Username: userDoc.data().Username };
                        } else {
                            return { uid, Username: "Unknown" };
                        }
                    } catch (error) {
                        console.error(`Error fetching user ${uid}:`, error);
                        return { uid, Username: "Error" };
                    }
                });

                const fetchedUsernames = await Promise.all(usernamePromises);
                setUsernames(fetchedUsernames);
            }
            setIsLoading(false);
        };

        fetchUsernames();
    }, [RequestID]);

    const handleAccept = (uid) => {
        handleChat(uid, "handleAccept");
        HandleRequest(uid);
        
    };

    const handleReject = (uid) => {
        handleChat(uid, "handleReject");
        HandleRequest(uid);
    };

    const HandleRequest = async (uid) => {
        setIsLoading(true); // Set loading state
        let requestsCount = 0;
        console.log("uid:", uid);
    
        // Check if session.RequestID is an array
        if (session.RequestID && Array.isArray(session.RequestID)) {
            // If RequestID exists in the array, remove it and decrement requestsCount
            if (session.RequestID.includes(uid)) {
                session.RequestID = session.RequestID.filter(id => id !== uid);
                requestsCount = parseInt(session.RequestCount, 10) - 1;
            } else {
                // If RequestID doesn't exist in the array
                console.log("RequestID doesn't exist in the array");
            }
        } else {
            // If session.RequestID is not an array
            console.log("RequestID doesn't exist in the array");
        }
    
        // Ensure requestsCount is not negative
        requestsCount = Math.max(requestsCount, 0);
    
        console.log("session.RequestID:", session.RequestID);
        console.log("requestsCount:", requestsCount);
    
        // Construct session data object
        const sessionData = {
            description: session.description,
            UserPhoto: session.UserPhoto,
            Username: session.Username,
            cost: session.cost,
            days: session.days,
            location: session.location,
            sessionType: session.sessionType,
            state: session.state,
            seats: session.seats,
            subject: session.subject,
            time: session.time,
            rating: session.rating,
            userId: session.userId,
            duration: session.duration,
            RequestCount: requestsCount.toString(),
            RequestID: session.RequestID,
        };
    
        console.log("sessionId:", sessionId);
    
        const url = `https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/sessions/${sessionId}.json`;
    
        try {
            // Update session data in Firebase Realtime Database
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });
    
            if (response.ok) {
                toast.success("Session Updated!", { position: 'top-center' });
                toggleForm();
            } else {
                toast.error("Error updating Session!", { position: 'top-center' });
            }
        } catch (error) {
            console.error('Error updating session: ', error);
            toast.error("Error updating Session!", { position: 'top-center' });
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };
    

    const handleChat = async (uid, type) => {
        const chatRef = collection(db, "chats");
        const userChatRef = collection(db, "userchats");

        try {
            // Querying user details
            const userRef = collection(db, "Users");
            const q = query(userRef, where("id", "==", uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                console.log("User data:", userData);

                // Query to check if chat already exists between the users
                const chatExistsQuery = query(
                    chatRef,
                    where("users", "array-contains-any", [currentUser.id, uid])
                );
                const chatExistsSnapshot = await getDocs(chatExistsQuery);

                let chatExists = false;
                let existingChatId = null;
                chatExistsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.users.includes(currentUser.id) && data.users.includes(uid)) {
                        chatExists = true;
                        existingChatId = doc.id;
                    }
                });

                if (chatExists) {
                    console.log("Chat already exists between the users");
                    if (type === "handleAccept")
                        await sendMessage(newChatRef.id, `Your Request For ${Subject} at ${Time} has been Approved. Message me for Further query!`, currentUser.id);
                    else 
                        await sendMessage(newChatRef.id, `Your Request For ${Subject} at ${Time} has been Rejected. Message me for Further query!`, currentUser.id);
                    return;
                }

                // Creating a new chat document
                const newChatRef = doc(chatRef);
                await setDoc(newChatRef, {
                    createdAt: serverTimestamp(),
                    messages: [],
                    users: [currentUser.id, uid], // Store user IDs in the chat document
                });

                // Updating user chat lists
                const currentUserChatRef = doc(userChatRef, currentUser.id);
                const userChatRefToUpdate = doc(userChatRef, uid);

                // Batched writes to ensure atomicity
                const batch = writeBatch(db);
                batch.update(currentUserChatRef, {
                    chats: arrayUnion({
                        chatId: newChatRef.id,
                        lastMessage: "",
                        receiverId: uid,
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

                // console.log("Chat created and user chat lists updated successfully");
                if (type === "handleAccept")
                    await sendMessage(newChatRef.id, `Your Request For ${Subject} at ${Time} has been Approved. Message me for Further query!`, currentUser.id);
                else 
                await sendMessage(newChatRef.id, `Your Request For ${Subject} at ${Time} has been Rejected. Message me for Further query!`, currentUser.id);
            } else {
                console.log("No user found with the provided ID");
            }
        } catch (error) {
            console.error("Error handling chat:", error);
        }
    };

    const sendMessage = async (chatId, text, senderId) => {
        try {
            const chatDocRef = doc(db, "chats", chatId);
            const newMessage = {
                senderId: senderId,
                text: text,
                timestamp: new Date() // Using current date instead of serverTimestamp
            };
            await updateDoc(chatDocRef, {
                messages: arrayUnion(newMessage),
                // Add timestamp separately
                lastUpdated: serverTimestamp(),
            });
            // console.log("Message sent successfully");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleUsernameClick = (uid) => {
        console.log("_uid:", uid);
        setSelectedUserUid(uid);
        navigate(`/SProfile/${uid}`);
    };

    return (
        <>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            </Helmet>
            <div className={`overlay-card ${closeForm ? 'show' : ''}`}>
                {isLoading ? <Loading /> : (
                    <div className="card_show">
                        <div className="content_show">
                            <div className="data">
                                <h1>SESSION</h1>
                                <div className="column">
                                    <h5>{Time}</h5>
                                    <h5>{Subject}</h5>
                                </div>
                                <div id="container">
                                    {usernames.length > 0 ? (
                                        usernames.map(({ uid, Username }) => (
                                            <div key={uid} className="username-row">
                                                <span onClick={() => handleUsernameClick(uid)}>{Username}</span>
                                                <button
                                                    style={{
                                                        padding: '6px 12px', /* Adjusted padding for symmetry */
                                                        borderRadius: '5px',
                                                        border: 'none',
                                                        outline: 'none',
                                                        fontSize: '1em',
                                                        fontWeight: '500',
                                                        background: '#41e166',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                    }}
                                                    className="CancelBtn"
                                                    onClick={() => handleAccept(uid)}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    style={{
                                                        padding: '6px 12px', /* Adjusted padding for symmetry */
                                                        borderRadius: '5px',
                                                        border: 'none',
                                                        outline: 'none',
                                                        fontSize: '1em',
                                                        fontWeight: '500',
                                                        background: '#e16641',
                                                        color: '#fff',
                                                        cursor: 'pointer'
                                                    }}
                                                    className="RejectBtn"
                                                    onClick={() => handleReject(uid)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No requests to display</p>
                                    )}
                                </div>
                                <div className="CancelBtn">
                                    <button onClick={toggleForm} style={{marginTop: '10px'}}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {selectedUserUid && <UserDetailComponent uid={selectedUserUid} onClose={() => setSelectedUserUid(null)} />}
        </>
    );
}

function UserDetailComponent({ uid, onClose }) {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(db, "Users", uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                } else {
                    console.error("User not found");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [uid]);

    return (
        <div className="user-detail-overlay">
            <div className="user-detail-card">
                {userData ? (
                    <div>
                        <h2>{userData.Username}</h2>
                        {/* Display other user details as needed */}
                        <button onClick={onClose}>Close</button>
                    </div>
                ) : (
                    <Loading />
                )}
            </div>
        </div>
    );
}

export default ShowNotifications;
