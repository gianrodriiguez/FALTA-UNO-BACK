const express = require('express');
const cors = require('cors');  // Import CORS for cross-origin requests
const mongoose = require('mongoose');  // Import mongoose for MongoDB connection
const bodyParser = require('body-parser');
require('dotenv').config();  // Load environment variables

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());  // Enable CORS
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define Player Schema
const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});

const Player = mongoose.model('Player', PlayerSchema);

// Register player
app.post('/register', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const newPlayer = new Player({ name, email });
    await newPlayer.save();
    res.status(201).json(newPlayer);
  } catch (error) {
    if (error.code === 11000) {  // Duplicate key error (email already exists)
      res.status(400).json({ error: 'Player with this email already exists' });
    } else {
      console.error("Registration error:", error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
});

// Login player
app.post('/login', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required for login" });
  }

  try {
    const player = await Player.findOne({ email });
    if (player) {
      res.json(player);
    } else {
      res.status(401).json({ error: 'Player not found' });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in player" });
  }
});

// Delete player by email
app.delete('/delete-player', async (req, res) => {
  const { email } = req.body;

  try {
    const deletedPlayer = await Player.findOneAndDelete({ email });
    if (deletedPlayer) {
      res.status(200).json({ message: `Player with email ${email} was deleted` });
    } else {
      res.status(404).json({ error: 'Player not found' });
    }
  } catch (error) {
    console.error("Error deleting player:", error);
    res.status(500).json({ error: 'Error deleting player' });
  }
});

// Get all players
app.get('/players', async (req, res) => {
  try {
    const players = await Player.find();  // Fetch all players from MongoDB
    res.json(players);  // Return the players as a JSON response
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: 'Error fetching players' });
  }
});

// Start the server
app.listen(3001, () => console.log('User Service running on port 3001'));