import React, { useState, useEffect } from 'react';
import { db } from '../../auth/Firebase/Firebase';
import { onSnapshot, collection, query, where, getDoc, doc, deleteDoc } from 'firebase/firestore';
import '../Style.css';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Loading/Loading';
import { toast } from 'react-toastify';

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserUid, setSelectedUserUid] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const q = query(collection(db, 'Users'), where('userType', '==', 'Tutor'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const tutorData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTutors(tutorData);
          setFilteredTutors(tutorData); // Initialize filteredTutors with all tutors
        });
        
        return () => unsubscribe(); // Cleanup function
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };

    fetchTutors();
  }, []);

  useEffect(() => {
    // Filter tutors based on search query
    const filtered = tutors.filter(tutor =>
      tutor.Username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTutors(filtered);
  }, [searchQuery, tutors]);

  const handleView = (tutorId) => {
    setSelectedUserUid(tutorId);
    navigate(`/ATutor/${tutorId}`);
  };

  const handleDelete = async (tutorId) => {
    console.log(`Deleting tutor with ID: ${tutorId}`);
    try {
      await deleteDoc(doc(db, 'Users', tutorId));
      toast.info(`${tutorId} account deleted successfully`);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleUsernameClick = (tutorId) => {
    // Implement your logic for handling username click
  };

  return (
    <div>
      <div className="List-container">
        <h2 className="List-heading">Tutor List</h2>
        <div>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="List-card">
          <div className="List-scroll" style={{ display: "flex", justifyContent: "center" }}>
            <ul>
              {filteredTutors.map(tutor => (
                <li key={tutor.id} className="username-row">
                  <span onClick={() => handleUsernameClick(tutor.id)}>{tutor.Username}</span>
                  <button
                    style={{
                      padding: '6px 12px',
                      borderRadius: '5px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '1em',
                      fontWeight: '500',
                      background: '#41e166',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                    className="TutorViewBtn"
                    onClick={() => handleView(tutor.id)}
                  >
                    View
                  </button>
                  <button
                    style={{
                      padding: '6px 12px',
                      borderRadius: '5px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '1em',
                      fontWeight: '500',
                      background: '#e16641',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                    className="TutorDeleteBtn"
                    onClick={() => handleDelete(tutor.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {selectedUserUid && <UserDetailComponent uid={selectedUserUid} onClose={() => setSelectedUserUid(null)} />}
    </div>
  );
};

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

export default TutorList;