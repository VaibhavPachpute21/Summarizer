import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";
import React, { useState } from 'react'
import './App.css'
import axios from "axios";
import 'dotenv/config'

const ChatBot = () => {
    const [typing, setTyping] = useState(false);
    const [allPrompts, setallPrompts] = useState([
        {
            message: "Hello, how can I help you!",
            sender: "ChatBot"
        }
    ])

    const handleSubmit = async (message) => {
        setTyping(true)
        const newMessage = {
            message: message,
            sender: "User",
            direction: 'outgoing'
        }
        const newMessages = [...allPrompts, newMessage]
        setallPrompts(newMessages)

        const url = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        };

        const data = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: "You are a Doctor. You only answers related to healthcare and medicine.don't answer other things.Deny if someone asks other than healthcare." },
                { role: 'user', content: message }
            ]
        };
        try {
            const response = await axios.post(url, data, { headers });
            const newGPTMessage = {
                message: response.data.choices[0].message.content,
                sender: "ChatBot"
            }
            const newMessage1 = [...allPrompts, newGPTMessage]
            setallPrompts(newMessage1)
        } catch (error) {
            console.error(error);
        }
        
        setTyping(false)
        console.log(process.env.OPENAI_API_KEY)

    }

    const getAiResponse = async () => {

        
    }


    return (
        <div className="chatBotContainer">
            <div>
                <MainContainer style={{ padding: "15px", borderRadius: "15px", height: '500px' }}>
                    <ChatContainer>
                        <MessageList
                            typingIndicator={typing ? <TypingIndicator content={"Loading"} /> : null}
                        >
                            {allPrompts.map((message, i) => {
                                return <Message key={i} model={message} />
                            })}
                        </MessageList>
                        <MessageInput placeholder="Type message here" onSend={handleSubmit} />
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    )
}

export default ChatBot
