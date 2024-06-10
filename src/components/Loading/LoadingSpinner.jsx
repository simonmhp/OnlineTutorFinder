import React from 'react';
import "./Loading.css"

const LoadingSpinner  = () => {
    return (<>
        <div className="loading-overlay">
            <div className="card_Loading">
                <div className="Load_center">
                    <div className="ring"></div>
                    <span>Loading...</span>   
                </div>
            </div>
        </div>
        </>
    );
};

export default LoadingSpinner;