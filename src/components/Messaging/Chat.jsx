import React from "react";
import './Style.css';
import Cht from "./Chats/Chat";
import List from "./List/list";
import { useChatStore } from "../auth/Firebase/chatStore";

const Chat = () =>{
    const {chatId} = useChatStore();
    return(
        <>
            <div className="Tp-main">
              <div className="d-flex align-items-center justify-content-center order-lg-1">
                <div className="msgcard col-10 mx-auto">
                    <div className="msgcontainer"> 
                            <List />
                        {chatId && <Cht />}
                    </div>
                </div>
              </div>
            </div>
        </>
    );
};

export default Chat;
