// src/socket-server.js ----> socket.io server with JWT auth
import dotenv from "dotenv";
import { getUser } from "./src/lib/inmemory.js";
import { getNewMatches, deleteNewMatch } from "./src/lib/newmatch.js";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import jwt from "jsonwebtoken";
import { clearInterval } from "timers";
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

// ————————————————————————————
// 3) Main Socket.IO logic (unchanged except server)
// ————————————————————————————
io.on("connection", (socket) => {
  let me = null;
    let newMatchCheckInterval;

  socket.on("login", (token) => {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const userId = payload.user_id;
      if (!token || !userId) {
        socket.emit("loginError", "No token provided");
        return socket.disconnect(true);
      }

      me = userId;
      socket.join(userId);
      console.log(`User ${userId} logged in via JWT`);
      socket.emit("history", chatHistory);


    } catch (err) {
      console.error("Login failed:", err.message);
      socket.emit("loginError", "Invalid token");
      return socket.disconnect(true);
    }
  });

   socket.on("chatMessage", ({ token, recipient, text }) => {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (!payload.user_id || payload.user_id !== me) throw new Error("Token mismatch");
    } catch {
      return socket.emit("error", "Unauthorized. Invalid token.");
    }

    if (!me || !recipient || !text) return;
    const msg = {
      sender: me,
      recipient,
      content: text,
      timestamp: new Date().toISOString(),
      seen: false,
    };
    chatHistory.push(msg);
    saveHistory();

    if (io.sockets.adapter.rooms.get(recipient)?.size > 0) {
      io.to(recipient).emit("chatMessage", msg);
    }
    socket.emit("messageSent", msg);
  });

  socket.on("messageSeen", ({ token, sender, recipient, timestamp }) => {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (!payload.user_id || payload.user_id !== recipient) throw new Error("Invalid");
    } catch {
      return socket.emit("error", "Unauthorized");
    }

    for (let m of chatHistory) {
      if (m.sender === sender && m.recipient === recipient && m.timestamp === timestamp) {
        m.seen = true;
        break;
      }
    }
    saveHistory();

    if (io.sockets.adapter.rooms.get(sender)?.size > 0) {
      io.to(sender).emit("messageSeen", { sender, recipient, timestamp });
    }
  });
      newMatchCheckInterval = setInterval(() => {
  try {
    console.log("🔁 Checking new matches for", me);
    const myNewMatches = getNewMatches(me);
    console.log("Found matches:", myNewMatches);

    myNewMatches.forEach((newmatchid) => {
//        let partnerId;
//         const partnerIdWith_ = newmatchid.replace(me, '')
//         if (partnerIdWith_.startsWith('_')) partnerId = partnerIdWith_.substring(1); // Remove leading underscore
//         else partnerId = partnerIdWith_.substring(0,partnerIdWith_.length - 1); // No trailing underscore
// //        const partnerFullName = getUser(partnerId).full_name;
      console.log(`→ Emitting new-match event of user ${me}`);
      socket.emit("new-match", {});

    });
  } catch (err) {
    console.error("🔥 Error inside new-match interval:", err);
  }
}, 900);

  socket.on("disconnect", (reason) => {
    if (newMatchCheckInterval) clearInterval(newMatchCheckInterval);
    if (me) console.log(`User ${me} disconnected (${reason})`);
  });
  


});

// ————————————————————————————
// 4) Start the HTTP server
// ————————————————————————————
httpServer.listen(PORT, () =>
  console.log(` Socket.IO server running at http://localhost:${PORT}`)
);
