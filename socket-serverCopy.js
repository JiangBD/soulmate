// src/socket-server.js ----> socket.io server with JWT auth
import dotenv from "dotenv";
import { existUserId } from "./src/lib/inmemory.js";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import jwt from "jsonwebtoken";
dotenv.config();
const PORT = 4000;
const HISTORY_FILE = "./chat-history.json";
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret"; // Make sure to set a strong secret in env!

// ————————————————————————————
// 1) Load or initialize chat history
// ————————————————————————————
let chatHistory = [];
try {
  chatHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
} catch {
  chatHistory = [];
}
console.log("JWT_SECRET = " + JWT_SECRET);
function saveHistory() {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(chatHistory, null, 2));
}

// ————————————————————————————
// 2) Create HTTP server (swap to HTTPS later if needed)
// ————————————————————————————
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

io.on("connection", (socket) => {
  let me = null;             // will hold the verified userId after login
//  let heartbeatTimer = null; // for automatic disconnect

  // ————————————————————————————
  // Utility: reset (or start) the 5.7s heartbeat timer
  // ————————————————————————————

  // ————————————————————————————
  // a) LOGIN (now receives a JWT token)
  // ————————————————————————————
  socket.on("login", (token) => {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const userId = payload.user_id;
      if (!token || !userId ) {
      socket.emit("loginError", "No token provided");
      return socket.disconnect(true);
      }
    
      // 1) Verify the token and extract payload
      
      if (!userId) throw new Error("Token missing user_id, token is null!");
      // 2) Mark this connection as “logged in as userId”
      me = userId;
      socket.join(userId);
      console.log(`User ${userId} logged in via JWT`);

      // 3) Send entire chat history to the client
      socket.emit("history", chatHistory);

      // 4) Start the heartbeat timer immediately
      
    } catch (err) {
      console.error("Login failed (invalid token):", err.message + new Date().toISOString());
      socket.emit("loginError", "Invalid token");
      return socket.disconnect(true);
    }
  });

  // ————————————————————————————
  // b) HEARTBEAT
  // ————————————————————————————
  socket.on("heartbeat", (token) => { // Optionally: re-verify token on every heartbeat. If you do:  // try { jwt.verify(token, JWT_SECRET); } catch { /*disconnect*/ }
    if (me) { console.log(`Heartbeat received from ${me}`);  } });
  // ————————————————————————————
  // c) CHAT MESSAGE → { recipient, text }
  // ————————————————————————————
  socket.on("chatMessage", ({ token, recipient, text }) => {
    // 1) Verify token once more (optional but more secure)
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (!payload.user_id || payload.user_id !== me) {
        throw new Error("Token mismatch or expired");
      }
    } catch {
      return socket.emit("error", "Unauthorized. Invalid token.");
    }

    if (!me || !recipient || !text) return;

    // 2) Build message object
    const msg = {
      sender: me,
      recipient,
      content: text,
      timestamp: new Date().toISOString(),
      seen: false,
    };

    // 3) Save to history and disk
    chatHistory.push(msg);
    saveHistory();

    // 4) If recipient is online right now, deliver immediately (unread=false → then mark as read? We actually wait for explicit "messageSeen")
    const room = io.sockets.adapter.rooms.get(recipient);
    if (room && room.size > 0) {
      // Deliver unread message to recipient
      io.to(recipient).emit("chatMessage", msg);
    }
    
    // 5) Always ACK back to sender with the baseline msg (still seen=false until recipient confirms)
    socket.emit("messageSent", msg);
  });

  // ————————————————————————————
  // d) MESSAGE SEEN → { token, sender, recipient, timestamp }
  //    (sent by the recipient once they render/view the incoming message)
  // ————————————————————————————
  socket.on("messageSeen", ({ token, sender, recipient, timestamp }) => {
    // 1) Verify token and ensure it matches the “recipient” field
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (!payload.user_id || payload.user_id !== recipient) {
        throw new Error("Token invalid or not matching recipient");
      }
    } catch {
      return socket.emit("error", "Unauthorized. Invalid token.");
    }

    // 2) Find the message in chatHistory and set seen = true
    for (let m of chatHistory) {
      if (
        m.sender === sender &&
        m.recipient === recipient &&
        m.timestamp === timestamp
      ) {
        m.seen = true;
        break;
      }
    }
    saveHistory(); 

    // 3) Notify the original sender (if online) that their message was seen
    const senderRoom = io.sockets.adapter.rooms.get(sender);
    if (senderRoom && senderRoom.size > 0) {
      io.to(sender).emit("messageSeen", {
        sender,
        recipient,
        timestamp,
      });
    }
  });

  // ————————————————————————————
  // e) DISCONNECT (either manual or heartbeat timeout)
  // ————————————————————————————
  socket.on("disconnect", (reason) => {
    if (me) {
      console.log(`User ${me} disconnected (reason: ${reason})`);
    }
//    if (heartbeatTimer) clearTimeout(heartbeatTimer);
  });
});

httpServer.listen(PORT, () =>
  console.log(`Socket.IO server listening on http://localhost:${PORT}`)
);
/*
const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("path/to/private.key"),
  cert: fs.readFileSync("path/to/certificate.crt"),
};

const httpsServer = https.createServer(options);
const io = new Server(httpsServer, { <SOME CORS OPTIONS> });
*/
// jwtwebtoken, mui, socket.io, dotenv, ngeohash