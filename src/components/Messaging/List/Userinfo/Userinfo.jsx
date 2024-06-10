import React from "react";
import './Userinfo.css';
import web from '../../../IMG/Home.jpeg';
import { useUserStore } from "../../../auth/Firebase/userStore";

const Userinfo = () =>{
    const { currentUser } = useUserStore();

    return(
        <div className="Userinfo">
            <div className="user">
                <img src={currentUser.imageUrl || web} alt="" className="img"/>
                <h2>{currentUser.Username}</h2>
            </div>

        </div>
    );
};

export default Userinfo;
