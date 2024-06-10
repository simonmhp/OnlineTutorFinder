import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import Loading from '../../Loading/Loading';
import './Style.css';

function Filter({ onClose, onApplyFilters }) {
    const [isFormVisible, setIsFormVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState('');
    const [state, setState] = useState('');
    const [subject, setSubject] = useState('');
    const [cost, setCost] = useState('');
    const [rating, setRating] = useState('');
    const [days, setDays] = useState([]);
    const [sessionType, setSessionType] = useState('');

    // Function to toggle form visibility
    const toggleForm = () => {
        setIsFormVisible(!isFormVisible);
        onClose();
    };

    const handleApplyFilters = () => {
        // Collect filter data
        const filters = {
            location: location.trim(),
            state: state.trim(),
            subject: subject.trim(),
            cost: cost.trim(),
            rating: rating.trim(),
            days,
            sessionType,
        };

        // Pass filters to parent component
        onApplyFilters(filters);

        toast.success('Filters applied successfully!', { position: 'top-center' });
        toggleForm();
    };

    const handleDayChange = (day, isChecked) => {
        setDays(prevDays => isChecked ? [...prevDays, day] : prevDays.filter(d => d !== day));
    };

    return (
        <>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            </Helmet>
            <div className={`overlay-card ${isFormVisible ? 'show' : ''}`}>
                {isLoading ? <Loading /> : (
                    <div className="card_TRadd">
                        <div className="content_TpEdit">
                            <div className="data">
                                <h1>Filter Options</h1>
                                <div className="Xcontainer">
                                    <div className="input-field">
                                        <i className="fas fa-calendar"></i>
                                        <select value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                                            <option value="">Select Session Type</option>
                                            <option value="personal">Personal Session</option>
                                            <option value="group">Group Session</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <select value={location} onChange={(e) => setLocation(e.target.value)}>
                                            <option value="" disabled>Select Location</option>
                                            <option value="Allahabad">Allahabad</option>
                                            <option value="New Delhi">New Delhi</option>
                                            <option value="Old Delhi">Old Delhi</option>
                                            <option value="Dehradun">Dehradun</option>
                                            <option value="Greater Noida">Greater Noida</option>
                                            <option value="Varanasi">Varanasi</option>
                                            <option value="Jaipur">Jaipur</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-map"></i>
                                        <select value={state} onChange={(e) => setState(e.target.value)}>
                                            <option value="" disabled>Select State</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Uttarakhand">Uttarakhand</option>
                                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                                            <option value="Rajasthan">Rajasthan</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-book"></i>
                                        <input
                                            type="text"
                                            placeholder="Subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-dollar-sign"></i>
                                        <input
                                            type="text"
                                            placeholder="Cost"
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <i className="fas fa-star"></i>
                                        <select value={rating} onChange={(e) => setRating(e.target.value)}>
                                            <option value="" disabled>Select Rating</option>
                                            <option value="1">1 Star</option>
                                            <option value="2">2 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="5">5 Stars</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="actionBtn">
                                    <button onClick={toggleForm}>Cancel</button>
                                    <button onClick={handleApplyFilters}>Apply Filters</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Filter;
