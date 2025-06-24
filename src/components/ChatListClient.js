// component này dự tính là cửa sổ matches / all chats, nhưng không dùng tới, tất cả đều có
// trong app/mymatches/page.js rồi!
// src/components/ChatListClient.js
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { io } from "socket.io-client";
import Link from "next/link";

export default function ChatListClient({ userId }) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const chats = {};
  let chatItems = [];
  useEffect(() => {
    const token = window.localStorage.getItem("soulmate_token");
    if (!token) {
      console.error("No token found—cannot connect to chat server.");
      return;
    }

    const socket = io('http://localhost:4000');
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("login", token);
    });

    socket.on("history", (history) => {
      setMessages(history);
      messages.forEach((m) => {
        if (m.sender === userId || m.recipient === userId) {
        const partner = m.sender === userId ? m.recipient : m.sender;
        if (!chats[partner] || chats[partner].timestamp < m.timestamp) {
        chats[partner] = m;
        }
        }
      });
      chatItems = Object.entries(chats);
    });

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageSent", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageSeen", ({ sender, recipient, timestamp }) => {
      setMessages((prev) =>
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

    socket.on("loginError", (msg) => {
      console.error("Login error from socket server:", msg);
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Build map of “most‐recent message per partner”

  return (
    <Box p={2}>
      <Typography variant="h6">All Chats for {/*userId*/}you:</Typography>
      <List>
        {chatItems.map(([partnerId, lastMsg]) => (
          <Link key={partnerId} href={`/${userId}/chat/${partnerId}`} passHref>
            <ListItem button>
              <ListItemAvatar>
                <Avatar src={`/uploads/${partnerId}/avatar.jpg`} />
              </ListItemAvatar>
              <ListItemText
                primary={partnerId}
                secondary={
                  <>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ fontWeight: lastMsg.seen ? "regular" : "bold" }}
                >
                  {lastMsg.content}
                </Typography>
                {" — " /* you can use • or any separator */}
                <Typography component="span" variant="caption" color="textSecondary">
                {timeString}
          </Typography>
        </>
      }
    />
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );
}
