const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
require('dotenv').config();  // Load environment variables

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Define Match schema and model
const MatchSchema = new mongoose.Schema({
  teams: [String],  // Expecting an array of team names or IDs
  date: String,
  time: String
});

const Match = mongoose.model('Match', MatchSchema);  // Create the model

// Route to create a match
app.post('/create-match', async (req, res) => {
  const { teams, date, time } = req.body;
  
  // Validation: there must be exactly 2 teams
  if (teams.length !== 2) {
    return res.status(400).send('There must be two teams');
  }
  
  try {
    // Create and save new match to MongoDB
    const newMatch = new Match({ teams, date, time });
    await newMatch.save();
    res.status(201).json(newMatch);  // Return the created match
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).send('Error creating match');
  }
});

// Start the server
app.listen(3003, () => console.log('Match Service running on port 3003'));
