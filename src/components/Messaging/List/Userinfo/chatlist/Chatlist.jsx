import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import './chatlist.css';
import web from '../../../../IMG/Home.jpeg'
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../../auth/Firebase/Firebase";
import { useUserStore } from "../../../../auth/Firebase/userStore"
import { useChatStore } from "../../../../auth/Firebase/chatStore";

const Chatlist = () => {
    const [addMode, setAddMode] = useState(false);
    const [chats, setChats] = useState([]);

    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();

    // console.log(chatId);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            try {
                const items = res.data().chats;
                const promises = items.map(async (item) => {
                    const userDocRef = doc(db, "Users", item.receiverId);
                    const userDocSnap = await getDoc(userDocRef);
                    const user = userDocSnap.data();
                    return { ...item, user };
                });

                const chatData = await Promise.all(promises);
                setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
            } catch (error) {
                console.error("Error fetching chat data:", error);
            }
        });

        return () => unSub();
    }, [currentUser.id]);

    const handleSelect = async (chat) => {

        const userChats = chats.map(item => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);
        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);
        try{
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            if (chat && chat.user) {
                changeChat(chat.chatId, chat.user);
            }
        }catch (e) {

        }

        
    }

    return (
        <div className="chatlist">
            <div className="search" style={{height:"2px", background: "black"}}>
                {/* <div className="searchBar">
                    <FontAwesomeIcon icon={faSearch} />
                    <input type="text" placeholder="Search" />
                </div>
                <FontAwesomeIcon
                    icon={addMode ? faMinus : faPlus}
                    className="add"
                    onClick={() => setAddMode((prev) => !prev)}
                /> */}
                <div className="divider"></div>
            </div>

            {chats.map((chat) => (
                <div 
                className="item" 
                key={chat.chatId} 
                onClick={() => handleSelect(chat)}
                style={{
                    backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
                }}>
                    <img src={chat.user.blocked.includes(currentUser.id)? web : chat.user?.imageUrl || web} alt="" />
                    <div className="text">
                        <span style={{color:"black"}}>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.Username}</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Chatlist;

