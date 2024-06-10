import React from "react";
import './list.css';
import Chatlist from "./Userinfo/chatlist/Chatlist";
import Userinfor from "./Userinfo/Userinfo";

const List = () => {
    return (
        <div className="list">
            <Userinfor />
            <Chatlist />
        </div>
    );
};

export default List;
