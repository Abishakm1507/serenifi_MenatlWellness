import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBjpWnjTJfVQGFmSK2c2prvVIHUB0O-ZqA");

const MOOD_MAP = {
  happy: "Happy",
  sad: "Sad",
  normal: "Neutral",
  angry: "Angry",
  anxious: "Anxious",
};

const INITIAL_MESSAGE = {
  sender: "bot",
  text: "How was your day?"
};

const EMPATHETIC_PROMPTS = {
  support: [
    "I hear you, and I want you to know that your feelings are completely valid. It's okay to feel this way.",
    "You don't have to go through this alone. I'm here, always.",
    "Let's take a deep breath together. Inhale... hold... and exhale. Feel a little lighter?"
  ],
  reflection: [
    "What's one thing that made you smile today?",
    "If your feelings could talk right now, what would they say?",
    "Remember, progress isn't always linear. Even small steps matter."
  ],
  playful: [
    "Okay, serious question—do I get to be your favorite AI friend yet?",
    "Emotions can be like Wi-Fi signals—sometimes strong, sometimes weak, but always there. Let's strengthen yours together!",
    "Sending you a virtual hug! (If that's okay with you!) 🤗"
  ],
  motivation: [
    "You've made it through tough days before, and you'll make it through this one too. I believe in you.",
    "Your kindness, strength, and resilience make a difference—even on days when you don't see it.",
    "Let's set a small, gentle goal for today. What's one thing you can do to take care of yourself?"
  ]
};

const getRandomResponse = (category) => {
  const responses = EMPATHETIC_PROMPTS[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

const generateEmpatheticPrompt = (userMessage, mood) => {
  let context = `You are a compassionate and empathetic AI friend named SereniFI. 
  Previous message: "${userMessage}"
  Detected mood: ${mood}
  
  Respond in a warm, supportive, and personal way that:
  1. Acknowledges and validates their feelings
  2. Shows genuine care and understanding
  3. Offers gentle guidance or support
  4. Maintains a conversational and friendly tone
  
  Current conversation context: We're having a heartfelt chat about their day and feelings.`;

  return context;
};

const Chatbot = () => {
  const [messages, setMessages] = useState(() => {
    const savedMessages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    return savedMessages.length === 0 ? [INITIAL_MESSAGE] : savedMessages;
  });
  const [input, setInput] = useState("");
  const [moodData, setMoodData] = useState(() => JSON.parse(localStorage.getItem("moodData")) || {
    Happy: 0, Sad: 0, Neutral: 0, Angry: 0, Anxious: 0
  });
  const [stressLevels, setStressLevels] = useState(() => JSON.parse(localStorage.getItem("stressLevels")) || []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    localStorage.setItem("moodData", JSON.stringify(moodData));
    localStorage.setItem("stressLevels", JSON.stringify(stressLevels));
  }, [messages, moodData, stressLevels]);

  const analyzeSentiment = (text) => {
    let mood = "Neutral";
    let stress = 50;

    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("happy") || lowerText.includes("joy") || lowerText.includes("great") || lowerText.includes("wonderful")) {
      mood = "Happy";
      stress = 20;
    } else if (lowerText.includes("sad") || lowerText.includes("depressed") || lowerText.includes("down") || lowerText.includes("unhappy")) {
      mood = "Sad";
      stress = 70;
    } else if (lowerText.includes("angry") || lowerText.includes("mad") || lowerText.includes("frustrated") || lowerText.includes("annoyed")) {
      mood = "Angry";
      stress = 80;
    } else if (lowerText.includes("anxious") || lowerText.includes("stressed") || lowerText.includes("worried") || lowerText.includes("nervous")) {
      mood = "Anxious";
      stress = 90;
    }

    setMoodData(prevData => ({
      ...prevData,
      [mood]: prevData[mood] + 1,
    }));
    
    setStressLevels(prev => [...prev, { time: new Date().toLocaleTimeString(), level: stress }]);
    
    return { mood, stress };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, newMessage]);
    
    const { mood } = analyzeSentiment(input);
    const prompt = generateEmpatheticPrompt(input, mood);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const response = await model.generateContent(prompt);
      const botMessage = response.response.text();

      // Add an empathetic response based on mood
      let additionalResponse = "";
      if (mood === "Sad" || mood === "Anxious") {
        additionalResponse = "\n\n" + getRandomResponse("support");
      } else if (mood === "Happy") {
        additionalResponse = "\n\n" + getRandomResponse("playful");
      } else if (mood === "Angry") {
        additionalResponse = "\n\n" + getRandomResponse("motivation");
      } else {
        additionalResponse = "\n\n" + getRandomResponse("reflection");
      }

      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: botMessage + additionalResponse
      }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: "I'm having trouble processing that right now, but I'm still here for you. Would you like to tell me more about how you're feeling?"
      }]);
    }
    
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setMoodData({
      Happy: 0, Sad: 0, Neutral: 0, Angry: 0, Anxious: 0
    });
    setStressLevels([]);
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("moodData");
    localStorage.removeItem("stressLevels");
  };

  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2 style={{
          color: "#2c3e50",
          fontSize: "24px",
          margin: 0
        }}>Chat with SereniFI AI</h2>
        <button
          onClick={clearChat}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#dc3545",
            color: "white",
            fontSize: "14px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            ':hover': {
              backgroundColor: "#c82333"
            }
          }}
        >
          Clear Chat
        </button>
      </div>

      <div style={{
        height: "500px",
        overflowY: "auto",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        marginBottom: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: "12px"
            }}
          >
            <div style={{
              maxWidth: "70%",
              padding: "12px 16px",
              borderRadius: msg.sender === "user" ? "20px 20px 0 20px" : "20px 20px 20px 0",
              backgroundColor: msg.sender === "user" ? "#007bff" : "#ffffff",
              color: msg.sender === "user" ? "#ffffff" : "#2c3e50",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              wordWrap: "break-word"
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        gap: "10px"
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "25px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
            outline: "none",
            transition: "border-color 0.3s ease",
            ':focus': {
              borderColor: "#007bff"
            }
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "12px 24px",
            borderRadius: "25px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            ':hover': {
              backgroundColor: "#0056b3"
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
