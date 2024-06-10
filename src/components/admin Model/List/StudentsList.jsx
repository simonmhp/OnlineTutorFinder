import React, { useState, useEffect } from 'react';
import { db } from '../../auth/Firebase/Firebase';
import { onSnapshot, collection, query, where, getDoc, doc, deleteDoc } from 'firebase/firestore';
import '../Style.css';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Loading/Loading';
import { toast } from 'react-toastify';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [selectedUserUid, setSelectedUserUid] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'Users'), where('userType', '==', 'Student'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setStudents(studentData);
        });

        return () => unsubscribe(); // Cleanup function
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const handleView = (studentId) => {
    setSelectedUserUid(studentId);
    navigate(`/AStudent/${studentId}`); // Passing studentId to the route
  };

  const handleDelete = async (studentId,) => {
    console.log(`Deleting student with ID: ${studentId}`);
    try {
      toast.info(`${studentId} account deleted successfully`);
      await deleteDoc(doc(db, 'Users', studentId));
      
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleUsernameClick = (studentId) => {
    // Handle clicking on student username
  };

  const filteredStudents = students.filter(student =>
    student.Username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="List-container">
        <h2 className="List-heading">Student List</h2>
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
              {filteredStudents.map(student => (
                <li key={student.id} className="username-row">
                  <span onClick={() => handleUsernameClick(student.id)}>{student.Username}</span>
                  <button
                    style={{
                      padding: '6px 12px',
                      borderRadius: '5px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '1em',
                      fontWeight: '500',
                      cursor: 'pointer',
                      background: '#41e166',
                      color: '#fff',
                    }}
                    onClick={() => handleView(student.id, student.Username)}
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
                      cursor: 'pointer',
                      background: '#e16641',
                      color: '#fff',
                      marginLeft: '10px',
                    }}
                    onClick={() => handleDelete(student.id)}
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
    </>
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

export default StudentList;