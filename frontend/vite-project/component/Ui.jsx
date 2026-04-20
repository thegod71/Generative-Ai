import React, { useState, useEffect, useRef } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getTime = () => {
    const d = new Date();
    return (
      d.getHours().toString().padStart(2, "0") +
      ":" +
      d.getMinutes().toString().padStart(2, "0")
    );
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    const threadId = 1; // You can generate or manage thread IDs as needed
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput, threadId }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: data.response,
          sender: "bot",
          time: getTime(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Error. Try again.",
          sender: "bot",
          time: getTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0b141a",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#1f2c34",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #2a3942",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#25d366",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          AI
        </div>
        <div>
          <div style={{ color: "#e9edef", fontWeight: 500 }}>AI Assistant</div>
          <div style={{ color: "#25d366", fontSize: 12 }}>● online</div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-start" : "flex-end",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                background: msg.sender === "user" ? "#202c33" : "#005c4b",
                color: "#e9edef",
                padding: "8px 12px",
                borderRadius: 10,
                borderTopLeftRadius: msg.sender === "user" ? 2 : 10,
                borderTopRightRadius: msg.sender === "bot" ? 2 : 10,
                fontSize: 14,
                lineHeight: 1.5,
                position: "relative",
                paddingBottom: 20,
              }}
            >
              {msg.text}
              <span
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 10,
                  fontSize: 10,
                  color: "#8696a0",
                }}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {/* Typing dots */}
        {isTyping && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                background: "#202c33",
                padding: "10px 14px",
                borderRadius: 10,
                borderTopLeftRadius: 2,
                display: "flex",
                gap: 4,
              }}
            >
              {[0, 0.2, 0.4].map((d, i) => (
                <span
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#8696a0",
                    display: "inline-block",
                    animation: `bounce 1.2s ${d}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div
        style={{
          background: "#1f2c34",
          padding: "10px 12px",
          display: "flex",
          gap: 10,
          borderTop: "1px solid #2a3942",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(e)}
          placeholder="Message"
          style={{
            flex: 1,
            background: "#2a3942",
            border: "none",
            outline: "none",
            borderRadius: 24,
            padding: "10px 16px",
            color: "#e9edef",
            fontSize: 14,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#00a884",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: 18,
          }}
        >
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
