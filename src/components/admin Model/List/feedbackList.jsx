import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from 'react-helmet';
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import Web from '../../IMG/log.svg';

const storage = getStorage();

const FeedbackList = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    try {
      const feedbackCollection = await fetch('https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/feedback.json');
      if (!feedbackCollection.ok) throw new Error('Failed to fetch feedback');

      const feedbackData = await feedbackCollection.json();
      if (feedbackData) {
        const feedbackArray = Object.entries(feedbackData).map(([id, data]) => ({ id, ...data }));
        setFeedbackList(feedbackArray);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const deleteFeedback = async (id) => {
    try {
      const response = await fetch(`https://onlinetutorfinder-c513d-default-rtdb.firebaseio.com/feedback/${id}.json`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }
      // Remove the deleted feedback from the feedbackList state
      setFeedbackList(feedbackList.filter(feedback => feedback.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const filteredFeedback = feedbackList.filter((feedback) =>
    feedback.Username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </Helmet>
      <div className="card_TPDetails">
        <div className="content_TpDetails">
          <div className="TPdetails">
            <div className="Tp-row">
              <br></br>
              <div id="tpInnerContainer-B" className="tpcontainer-column">
                <div className="container-header">
                  <h2>Feedbacks</h2>
                  <input
                    type="text"
                    placeholder="Search by user name..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
                {loading ? (
                  <p>Loading...</p>
                ) : feedbackList.length === 0 ? (
                  <p>No Feedback</p>
                ) : (
                  filteredFeedback.map((feedback) => (
                    <div key={feedback.id} className="card_rev">
                      {feedback.UserPhoto ? (
                        <img src={feedback.UserPhoto} alt="User Profile" className="revimgBx" />
                      ) : (
                        <img src={Web} alt="Default Profile" className="revimgBx" />
                      )}
                      <div className="content_rev">
                        <div className="revdetails">
                          <form action="#" className="TP-edit">
                            <h5 className="title">{feedback.Username}</h5>
                            <div className="revinput-field">
                              <div className="static-text">
                                {feedback.text}
                              </div>
                            </div>
                          </form>
                          <div className="revactionBtn">
                            <button onClick={() => deleteFeedback(feedback.id)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackList;
