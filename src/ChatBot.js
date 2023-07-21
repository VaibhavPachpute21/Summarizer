import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";
import React, { useState } from 'react'
import './App.css'
import axios from "axios";
import { OPENAI_API_KEY } from './CONSTANTS'

const ChatBot = () => {
    const [typing, setTyping] = useState(false);
    const [allPrompts, setallPrompts] = useState([
        {
            message: "Hello, how can I help you!",
            sender: "ChatBot",
            sentTime: "just now"
        }
    ])

    const handleSubmit = async (message) => {
        const newMessage = {
            message: message,
            sender: "user",
            direction: 'outgoing'
        }
        const newMessages = [...allPrompts, newMessage]
        setallPrompts(newMessages)
        
        setTyping(true)
        await getGPTResponse(newMessages)

    }

    async function getGPTResponse(chatMessages) {

        let apiMessages = chatMessages.map((msgObj) => {
            let role = '';
            if (msgObj.sender === "ChatBot") {
                role = "assistant"
            } else {
                role = "user"
            }

            return { role: role, content: msgObj.message }
        })

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        };

        const systemMsg = {
            role: 'system',
            // content: "You are a Doctor. You only answers related to healthcare and medicine.don't answer other things.Deny if someone asks other than healthcare."
            content:"You are a helpfull assitant"
        }

        const data = {
            model: 'gpt-3.5-turbo',
            messages: [
                systemMsg,
                ...apiMessages
            ]
        };
        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", data, { headers });
            console.log(allPrompts)
            setallPrompts([...chatMessages, {
                message: response.data.choices[0].message.content,
                sender: "ChatBot"
            }])
            console.log(allPrompts)
            setTyping(false)

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="chatBotContainer">
            <div>
                <MainContainer style={{ padding: "15px", borderRadius: "15px", height: '90vh' }}>
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
