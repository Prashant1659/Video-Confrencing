🎥 Video Conferencing Web Application
A real-time 1-to-1 video conferencing web application built using WebRTC for peer-to-peer media streaming and a signaling server for connection setup.
The project focuses on understanding real-time communication, media streams, and WebRTC internals, not just UI cloning.

🔗 Live Demo: https://video-confrencing-1-p8cq.onrender.com/

🚀 Features
✅ Real-time audio & video communication

✅ Peer-to-peer connection using WebRTC

✅ Camera and microphone access via browser

✅ Room-based connection (users join the same room)

✅ Works across different devices/browsers

✅ Deployed and publicly accessible

🧠 Tech Stack
Frontend
HTML / CSS / JavaScript

WebRTC APIs (getUserMedia, RTCPeerConnection)

Backend (Signaling Server)
Node.js

Express

Socket.io (for signaling)

Deployment
Render (Frontend + Backend)

🏗️ Architecture Overview
WebRTC does not use a server to stream video/audio.
The server is used only for signaling.

High-level flow:
User opens the app and joins a room

Browser requests camera & microphone access

One peer creates an offer

Offer is sent to the signaling server via Socket.io

Other peer responds with an answer

ICE candidates are exchanged

A direct peer-to-peer connection is established

Audio/video streams flow directly between peers

User A Browser  <-- WebRTC -->  User B Browser
        |                          |
        |------ Socket.io ---------|
              (Signaling Server)
🔁 WebRTC Concepts Used
navigator.mediaDevices.getUserMedia() – capture audio/video

RTCPeerConnection – manage peer connections

SDP Offer / Answer exchange

ICE Candidates for NAT traversal

Socket.io for signaling (NOT media transfer)

📸 Demo
A short screen recording is available showing:

Two users joining the same room

Successful audio & video communication

Real peer-to-peer streaming

(Demo video can be added here for better presentation)

⚠️ Limitations (Being Honest)
Currently supports 1-to-1 video calls only

No TURN server configured (may fail under strict NATs)

Limited UI/UX polish

No chat or screen-sharing yet

Minimal error handling

These limitations are intentional to focus on core WebRTC understanding.

🛠️ How to Run Locally
1️⃣ Clone the repository
git clone https://github.com/Prashant1659/Video-Confrencing.git
cd Video-Confrencing
2️⃣ Install dependencies
npm install
3️⃣ Start the server
npm start
4️⃣ Open in browser
http://localhost:PORT
Open the same room in two different browsers or devices to test.

📈 Future Improvements
🔹 Multi-user (group calls)

🔹 Mute / unmute & video toggle

🔹 Screen sharing

🔹 Chat support

🔹 TURN server integration

🔹 Better UI and user feedback

🔹 Authentication & room security

🎯 What This Project Demonstrates
Strong understanding of WebRTC fundamentals

Knowledge of real-time communication

Hands-on experience with signaling servers

Ability to deploy and debug real-time apps

Awareness of system limitations and trade-offs

👤 Author
Prashant
Aspiring Full-Stack Developer
Focused on building real-world, non-trivial applications
