// // src/components/ChatClient.js
"use client";

import { useEffect, useRef, useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageItem from "./MessageItem";
import { io } from "socket.io-client";

export default function ChatClient({ userId, partnerId }) {
  const socketRef = useRef(null);
  const [allMsgs, setAllMsgs] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("soulmate_token");
    if (!token) {
      console.error("No token found—cannot connect to chat server.");
      return;
    }

    // 1) Connect
    const socket = io('http://localhost:4000',);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("login", token);
    });

    // 2) Receive full history
    socket.on("history", (history) => {
      setAllMsgs(history);
    });

    // 3) Incoming new message
    socket.on("chatMessage", (msg) => {
      setAllMsgs((prev) => [...prev, msg]);
    });

    // 4) Ack that our own sent message was saved
    socket.on("messageSent", (msg) => {
      setAllMsgs((prev) => [...prev, msg]);
    });

    // 5) If one of our sent messages was seen
    socket.on("messageSeen", ({ sender, recipient, timestamp }) => {
      setAllMsgs((prev) =>
        prev.map((m) => {
          if (
            m.sender === sender &&
            m.recipient === recipient &&
            m.timestamp === timestamp
          ) {
            return { ...m, seen: true };
          }
          return m;
        })
      );
    });

    // 6) Login errors
    socket.on("loginError", (msg) => {
      console.error("Login error from socket server:", msg);
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, partnerId]);

  // Only display this one‐on‐one conversation
  const messages = allMsgs.filter(
    (m) =>
      (m.sender === userId && m.recipient === partnerId) ||
      (m.sender === partnerId && m.recipient === userId)
  );

  // Mark incoming as seen
  useEffect(() => {
    const socket = socketRef.current;
    const token = window.localStorage.getItem("soulmate_token");
    if (!socket || !token) return;

    messages.forEach((m) => {
      if (m.recipient === userId && m.sender === partnerId && !m.seen) {
        socket.emit("messageSeen", {
          token,
          sender: partnerId,
          recipient: userId,
          timestamp: m.timestamp,
        });
      }
    });
  }, [messages, userId, partnerId]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const token = window.localStorage.getItem("soulmate_token");
    if (!token) {
      console.error("No token—cannot send chat message.");
      return;
    }
    socketRef.current.emit("chatMessage", {
      token,
      recipient: partnerId,
      text,
    });
    setInput("");
  }

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      p={2}
    >
      <Box width="100%" maxWidth={600} flex={1} overflow="auto" mb={2}>
        {messages.map((msg, i) => (
          <MessageItem key={i} message={msg} self={msg.sender === userId} />
        ))}
      </Box>

      <Box display="flex" width="100%" maxWidth={600} gap={1}>
        <TextField
          fullWidth
          placeholder={`Message ${partnerId}…`}
          value={input}
          slotProps={{ htmlInput: { maxLength: 180 } }}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <IconButton onClick={handleSend} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

