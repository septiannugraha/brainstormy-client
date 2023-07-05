import React, { useState, useEffect, useRef } from 'react';

interface Message {
    role: string;
    content: string;
}

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleSendMessage = async () => {
        setIsLoading(true);
        const newMessages = [...messages, { role: 'human', content: input }];

        // Send the user's message to the /chat endpoint
        const chatResponse = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: newMessages }),
        });

        // Get the bot's response from the /chat endpoint
        const botResponse = await chatResponse.json();

        // Send the bot's response to the /talk endpoint
        const talkResponse = await fetch('http://localhost:5000/talk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: botResponse.result }),
        });

        const audioBlob = await talkResponse.blob();

        let reader = new FileReader();
        reader.onload = () => {
            if (audioRef.current) {
                audioRef.current.src = reader.result as string;
                audioRef.current.play();
            }
        };
        reader.readAsDataURL(audioBlob);

        newMessages.push({ role: 'assistant', content: botResponse.result });
        setMessages(newMessages);
        setInput('');
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <p className='text-2xl text-blue-600 font-bold'>Brainstormy</p>
            <div className="flex flex-col w-full max-w-md p-4 bg-white rounded shadow">
                <div className="overflow-y-auto mb-4 max-h-60">
                    {messages.map((message, index) => (
                        <div key={index} className={`mb-4 ${message.role === 'assistant' ? 'text-blue-500' : 'text-green-500'}`}>
                            <strong>{message.role === 'assistant' ? 'Brainstormy' : 'User'}:</strong> {message.content}
                        </div>
                    ))}
                    {isLoading && <div className="p-4 bg-gray-200 animate-pulse">Thinking...</div>}
                </div>
                <div className="flex">
                    <input className="w-full px-4 py-2 mr-4 text-gray-700 bg-gray-200 rounded" value={input} onChange={handleInputChange} />
                    <button className="px-4 py-2 text-white bg-blue-500 rounded" onClick={handleSendMessage}>Send</button>
                </div>
                <audio ref={audioRef} controls className="w-full mt-4" />
            </div>
        </div>
    );
};

export default Chatbot;