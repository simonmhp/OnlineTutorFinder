import React from 'react';
import "./Loading.css"

const Loading = () => {
    return (
        <div className="card_Loading">
            <div className="Load_center">
                <div className="ring"></div>
                <span>Loading...</span>   
            </div>
        </div>
    );
};

export default Loading;