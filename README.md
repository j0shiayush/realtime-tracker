# 🛰️ Realtime Fleet Tracker

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

<img width="1920" height="921" alt="image" src="https://github.com/user-attachments/assets/6081dbc2-5426-4295-90d0-0b69fb63207f" />



## 📖 Overview

**Realtime Fleet Tracker** is a production-ready, full-stack application engineered to provide zero-latency geolocation tracking. Built with a modern microservices-inspired architecture, it leverages bi-directional WebSockets to broadcast live coordinate updates to all connected clients instantly. 

The platform features an enterprise-grade authentication system, seamlessly blending custom JWT/bcrypt security with modern OAuth 2.0 (Google & GitHub SSO), all wrapped in a highly responsive, glassmorphic dark-theme UI.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Visual Tour](#-visual-tour)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

* ⚡ **Zero-Latency Tracking:** Utilizes Socket.io for persistent WebSocket connections, ensuring immediate location broadcasts without HTTP polling overhead.
* 🔐 **Enterprise Authentication:** Multi-provider secure login featuring Google SSO, GitHub SSO, and traditional encrypted password authentication.
* 💾 **Asynchronous Persistence:** Background synchronization of spatial data to MongoDB Atlas, guaranteeing lag-free frontend performance.
* 🎨 **Premium UI/UX:** Responsive, glassmorphic dark-theme interface built with Tailwind CSS and React.
* 🚀 **Cloud-Native Deployment:** Frontend hosted on Vercel's Edge Network, paired with an always-on Render Node.js backend.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React.js, Vite
* **Styling:** Tailwind CSS, Lucide Icons
* **Maps Integration:** Leaflet.js / React-Leaflet
* **State Management:** React Context API & `useReducer`

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Real-time Engine:** Socket.io
* **Security:** JSON Web Tokens (JWT), bcrypt
* **OAuth 2.0:** Google & GitHub APIs

### Database & DevOps
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Hosting:** Vercel (Frontend), Render (Backend)

---

## 📸 Visual Tour

### 1. Secure Authentication Gateway
<img width="1920" height="925" alt="image" src="https://github.com/user-attachments/assets/6540f99a-02a8-4a36-bc11-7809ea36e0cb" />

*Features local JWT login alongside OAuth 2.0 integration for seamless onboarding.*

### 2. Live Tracking Dashboard
<img width="1920" height="925" alt="image" src="https://github.com/user-attachments/assets/1595fc20-e993-459f-8aee-ebddbeb14a39" />

*Real-time bi-directional coordinate syncing via WebSockets with dynamic user presence.*

### 3. Active Session Management
<img width="1920" height="922" alt="image" src="https://github.com/user-attachments/assets/c5561a79-b610-4e41-9195-ff5d315a6c2d" />

*Live active user roster pulling dynamic profile pictures from GitHub/Google integrations.*

---

## ⚙️ System Architecture

1. **Client Emission:** The browser's Geolocation API watches for spatial changes and emits `send-location` events.
2. **Socket Intercept:** The Node.js server receives the payload and immediately broadcasts `receive-location` to all active sockets.
3. **Database Sync:** The server asynchronously pushes the new coordinates to the `TrackingSession` array in MongoDB without blocking the main event loop.
4. **UI Reconciliation:** The React `useReducer` catches the broadcast, calculates the path delta, and smoothly updates the map marker trajectory.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
* Node.js (v18 or higher)
* MongoDB Atlas Cluster (or local MongoDB instance)
* GitHub & Google Cloud Developer Accounts (for OAuth Keys)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/realtime-tracker.git](https://github.com/yourusername/realtime-tracker.git)
   cd realtime-tracker
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the **backend** directory:
```env
PORT=4500
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the **frontend** directory:
```env
VITE_BACKEND_URL=http://localhost:4500
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🏃‍♂️ Running the Application

1. **Start the Backend Server:**
   ```bash
   # Inside the /backend directory
   node app.js
   ```

2. **Start the Frontend Development Server:**
   ```bash
   # Inside the /frontend directory
   npm run dev
   ```

3. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`.

---

## 🌍 Deployment

This project is configured for cloud deployment:
* **Frontend:** Deployed on **Vercel** for optimal global edge caching and fast React builds.
* **Backend:** Deployed on **Render** (Web Service) to support persistent, always-on WebSocket connections.

*Note: Ensure your live `FRONTEND_URL` is updated in your Render environment variables, and your OAuth redirect URIs are updated in your Google/GitHub developer consoles.*

---

## 📄 License

This project is licensed under the MIT License.
