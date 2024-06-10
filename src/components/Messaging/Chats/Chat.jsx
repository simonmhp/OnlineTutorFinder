import React, { useEffect, useRef, useState } from "react";
import EmojiPicker  from 'emoji-picker-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faPaperclip , faInfoCircle } from '@fortawesome/free-solid-svg-icons'; 
import './chat.css';
import Web from '../../IMG/Home.jpeg';
import { arrayRemove, arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db, imageDb } from "../../auth/Firebase/Firebase";
import { useChatStore } from "../../auth/Firebase/chatStore";
import { ref, update } from "firebase/database";
import { useUserStore } from "../../auth/Firebase/userStore";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import upload from "../../auth/Firebase/Upload";

const Chat = () => {
    const [open, setopen] = useState(false);
    const [chat, setChat] = useState();
    const [text, settext] = useState("");
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock  } = useChatStore();
    const { currentUser } = useUserStore();
    const [img, setImg] = useState({
        file:null,
        url:"",
    });

    const endRef = useRef(null);

    useEffect( () => {
        endRef.current?.scrollIntoView({behavior: "smooth"});
    }, []);

    useEffect(() =>{
        const unSub = onSnapshot(doc(db,"chats", chatId), 
        (res) =>{
            setChat(res.data());
        });
        if (img.file){
            handleSend();
        }
        return () => {
            unSub();
        };
    },[chatId,img.file]);

    const handleImg = (e) => {
        if(!isCurrentUserBlocked && !isReceiverBlocked){
            if (e.target.files[0]) {
                setImg({
                    file: e.target.files[0],
                    url: URL.createObjectURL(e.target.files[0]),
                }); 
            }  
        }
    };
    const handleBlock = async () =>{
        if(!user) return;
        const userDocRef = doc(db, "Users", currentUser.id);
        try{
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });
            changeBlock();
        }catch (e) {
            console.log("handleBlock:",e);
        }
    };

    const handleEmoji = e =>{
        if(!isCurrentUserBlocked && !isReceiverBlocked){
        settext((prev) => prev + e.emoji);
    }
        setopen(false);
        
    };

    const handleSend = async () => {
        if (text === "" && !img.file) {
            return;
            }else {
                if(img.file){
                    let imgUrl = null;
                    try {
                        if(img.file){
                            imgUrl = await upload(img.file);
                            await updateDoc(doc(db,"chats",chatId), {
                                messages: arrayUnion({
                                    senderId: currentUser.id,
                                    createdAt: new Date(),
                                    ...(imgUrl && {img: imgUrl}),
                                }),
                            });
                            console.log("imgUrl:",imgUrl);
                        }
                    }catch {
    
                    }
                }else {
                    await updateDoc(doc(db,"chats",chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        text,
                        createdAt: new Date(),
                    }),
                    });
                }
            }

            try{
            const userIDs = [currentUser.id, user.id];
        
        
            userIDs.forEach(async (id) => {
            const userChatsRef = doc(db,"userchats",id);
            const userChatSnapshot = await getDoc(userChatsRef);
        
            if(userChatSnapshot.exists()){
            const userChatsData = userChatSnapshot.data();
            const chatIndex = userChatsData.chats.findIndex(
                             (c) => c.chatId === chatId
                        );
                        userChatsData.chats[chatIndex].lastMessage = text;
                        userChatsData.chats[chatIndex].isSeen = 
                            id === currentUser.id ? true : false;
                        userChatsData.chats[chatIndex].updatedAt = Date.now();
        
                        await updateDoc(userChatsRef, {
                            chats: userChatsData.chats,
                        })
                    }
                })
        
                }catch (e){
                    console.log("error:", e);
                }
        
                setImg({
                    file: null,
                    url: "",
                });
                settext("");


    }


    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.imageUrl || Web} alt="" />
                    <div className="texts">
                        <span>{user?.Username}</span>
                        <p style={{color: "black"}}>{user?.designation}</p>
                    </div>
                </div>
                <div className="icons">
                    <FontAwesomeIcon icon={faInfoCircle} className="info" />
                    <button className="blockButton" onClick={handleBlock}>
                        {isCurrentUserBlocked 
                        ? "Your are Blocked!" 
                        : isReceiverBlocked 
                        ? "user Blocked" 
                        : "Block User"}
                    </button>
                </div>
            </div>

            <div className="center">
            {chat?.messages?.map((message) => (
                // Only render if message.text is not empty
                <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message.createdAt}>
                    <div className="texts">
                        {message.img && <img src={message.img} alt={Web} />}
                        {message.text && (
                            <p>
                                {message.text}
                            </p>
                        )}
                        {/* <span> 1 min ago</span> */}
                    </div>
                </div>
            ))}

                {img.url && (<div className="message own">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>)}

            <div ref={endRef}></div>
            </div>

            <div className="bottom">

                <div className="bottomcon">

                <div className="emoji">
                    {/* Use the FontAwesomeIcon component for the emoji icon */}
                    <FontAwesomeIcon icon={faSmile} 
                    className="emoji-icon"  
                    onClick={() => setopen((prev) => !prev)}/>
                    <div className="picker">
                        <EmojiPicker  open={open} onEmojiClick={handleEmoji}/>
                    </div>
                </div>
                
                
                <input type="text" 
                value={text}
                placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a Message!" : "Type a Message..." }
                onChange={(e) => settext(e.target.value)}
                disabled = {isCurrentUserBlocked || isReceiverBlocked}/>
                <div className="icons">
                    <label htmlFor="file">
                    <FontAwesomeIcon icon={faPaperclip} style={{ cursor: 'pointer' }} />
                    </label>
                    <input type="file" 
                    id="file" 
                    style={{display: "none"}}
                    onChange={handleImg}/>
                </div>
                
                 </div>
                
                
                <button 
                className="sendButton" 
                onClick={handleSend}
                disabled = {isCurrentUserBlocked || isReceiverBlocked}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
