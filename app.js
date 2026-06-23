require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors"); // For API cross-origin requests
const bcrypt = require("bcrypt"); // For password hashing
const jwt = require("jsonwebtoken"); // For authentication tokens

const TrackingSession = require("./models/TrackingSession");
const User = require("./models/User"); // Import your User model

const app = express();
const server = http.createServer(app);

// Middleware to parse JSON bodies and handle CORS for standard API requests
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/realtimeTracker";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


// ==========================================
//        AUTHENTICATION API ROUTES
// ==========================================

// 1. REGISTER: Create a new user
app.post("/register", async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    if (!fullName?.trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists. Try another." });
    }

    // Hash the password (scramble it so it is secure in the database)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to MongoDB
    await User.create({
      username,
      fullName: fullName.trim(),
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. LOGIN: Verify user and give them a JWT Token
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Check if the password matches the hashed version
    // Added safety check in case a GitHub-only user tries to log in via standard form
    if (!user.password) {
      return res.status(400).json({ error: "Please log in using GitHub." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      username: user.username,
      fullName: user.fullName,
      profilePicture: user.profilePicture // Ensure standard users get their avatar (even if it's default)
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. GITHUB OAUTH LOGIN
app.post("/auth/github", async (req, res) => {
  try {
    const { code } = req.body;
    
    // Trade the code for an Access Token from GitHub
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) return res.status(400).json({ error: "GitHub login failed" });

    // Fetch the user's profile info using the token
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const githubUser = await userResponse.json();

    // Check if user exists in our DB
    let user = await User.findOne({ githubId: githubUser.id.toString() });
    
    if (!user) {
      // Create a new user if they don't exist
      user = await User.create({
        username: githubUser.login, // GitHub username
        fullName: githubUser.name || githubUser.login, // Real name
        profilePicture: githubUser.avatar_url, // Profile picture URL
        githubId: githubUser.id.toString(),
      });
    }

    // Give them our JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ 
      message: "GitHub Login successful", 
      token, 
      user: { 
        username: user.username, 
        fullName: user.fullName, 
        profilePicture: user.profilePicture 
      } 
    });
  } catch (error) {
    console.error("GitHub Auth Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. GOOGLE OAUTH LOGIN
app.post("/auth/google", async (req, res) => {
  try {
    const { code } = req.body;
    
    // Trade the code for an Access Token from Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:5173" // Must match exact URI in Google Console
      })
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) return res.status(400).json({ error: "Google login failed" });

    // Fetch the user's profile info using the token
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const googleUser = await userResponse.json();

    // Check if user exists in our DB
    let user = await User.findOne({ googleId: googleUser.id });
    
    if (!user) {
      // Create a new user if they don't exist. Google emails are unique, so we use the prefix as username
      const baseUsername = googleUser.email.split("@")[0];
      user = await User.create({
        username: baseUsername, 
        fullName: googleUser.name, 
        profilePicture: googleUser.picture, 
        googleId: googleUser.id,
      });
    }

    // Give them our JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ 
      message: "Google Login successful", 
      token, 
      user: { username: user.username, fullName: user.fullName, profilePicture: user.profilePicture } 
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
//          SOCKET.IO TRACKING LOGIC
// ==========================================

const io = socketio(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New connection: ", socket.id);

  // Initialize a new tracking session in the database
  TrackingSession.create({ sessionId: socket.id, pathHistory: [] })
    .then(() => console.log(`Session initialized in DB for: ${socket.id}`))
    .catch((err) => console.error("Error creating database session:", err));

  // Listen for real-time location updates from the frontend
  socket.on("send-location", async (data) => {
    io.emit("receive-location", { id: socket.id, ...data });

    // Persist the coordinates to MongoDB in the background
    try {
      await TrackingSession.findOneAndUpdate(
        { sessionId: socket.id },
        { 
          $push: { 
            pathHistory: { 
              latitude: data.latitude, 
              longitude: data.longitude 
            } 
          } 
        }
      );
    } catch (error) {
      console.error("Error updating path history in DB:", error);
    }
  });

  socket.on("disconnect", async () => {
    io.emit("user-disconnected", socket.id);
    console.log("User disconnected: ", socket.id);

    try {
      await TrackingSession.findOneAndUpdate(
        { sessionId: socket.id },
        { isActive: false }
      );
      console.log(`Session marked inactive in DB for: ${socket.id}`);
    } catch (error) {
      console.error("Error updating disconnect status in DB:", error);
    }
  });
});

server.listen(4500, () => {
  console.log("Socket server running on http://localhost:4500");
});